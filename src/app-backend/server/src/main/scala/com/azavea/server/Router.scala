package com.azavea.server

import com.azavea.server.mapalgebra.focal._

import geotrellis.raster._
import geotrellis.raster.io._
import geotrellis.raster.histogram.{Histogram, StreamingHistogram}
import geotrellis.raster.render._
import geotrellis.spark._
import geotrellis.spark.buffer.{BufferedTile, Direction}
import geotrellis.pointcloud.spark._
import geotrellis.pointcloud.spark.io._
import geotrellis.pointcloud.spark.io.hadoop._
import geotrellis.spark.io._
import geotrellis.spark.io.hadoop._
import geotrellis.spark.summary._
import geotrellis.spark.tiling.FloatingLayoutScheme
import geotrellis.spark.mapalgebra._
import geotrellis.spark.mapalgebra.focal._
import geotrellis.spark.mapalgebra.focal.hillshade._
import geotrellis.proj4._
import geotrellis.raster.io.geotiff.GeoTiff
import geotrellis.raster.io.geotiff.writer.GeoTiffWriter
import geotrellis.raster.mapalgebra.focal.{Square, TargetCell}
import geotrellis.raster.mapalgebra.focal.hillshade.Hillshade
import geotrellis.raster.rasterize._
import geotrellis.raster.rasterize.polygon._
import geotrellis.raster.summary.polygonal._
import geotrellis.spark.io.AttributeStore
import geotrellis.spark.io.avro.AvroRecordCodec
import geotrellis.util._
import geotrellis.vector._
import geotrellis.vector.io._

import org.apache.hadoop.fs.Path
//import org.apache.spark.{SparkConf, SparkContext}
import akka.http.scaladsl.model.StatusCodes._
import akka.http.scaladsl.model.headers._
import akka.http.scaladsl.server._
import akka.actor.ActorRef
import akka.http.scaladsl.model.{ContentType, HttpEntity, HttpResponse, MediaTypes}
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._
import ch.megard.akka.http.cors.CorsDirectives._
import spray.json._
import spray.json.DefaultJsonProtocol._
import spire.syntax.cfor._

import scala.concurrent._
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.reflect.ClassTag

trait Router extends Directives with CacheSupport with AkkaSystem.LoggerExecutor {
  // val conf: SparkConf
  val tileReader: ValueReader[LayerId]
//  val layerReader: FilteringLayerReader[LayerId]
  val collectionReader: CollectionLayerReader[LayerId]
  val attributeStore: AttributeStore
  val staticPath: String

  // implicit val sc: SparkContext

  import AkkaSystem.materializer

  implicit def rejectionHandler =
    RejectionHandler.newBuilder().handleAll[MethodRejection] { rejections =>
      val methods = rejections map (_.supported)
      lazy val names = methods map (_.name) mkString ", "

      respondWithHeader(Allow(methods)) {
        options {
          complete(s"Supported methods : $names.")
        } ~
        complete(MethodNotAllowed, s"HTTP method not allowed, supported methods: $names!")
      }
    }
      .result()

  def printAnyException[T](f: => T): T= {
    try {
      f
    } catch {
      case e: Throwable =>
        import java.io._
        val sw = new StringWriter
        e.printStackTrace(new PrintWriter(sw))
        println(sw.toString)
        throw e
    }
  }

  def colorWithHillshade(elevation: Tile, hillshade: Tile, cm: ColorMap): Tile =
    elevation.color(cm).combine(hillshade) { (rgba, z) =>
      if(rgba == 0) { 0 }
      else {
        // Convert to HSB, replace the brightness with the hillshade value, convert back to RGBA
        val (r, g, b, a) = rgba.unzipRGBA
        val hsbArr = java.awt.Color.RGBtoHSB(r, g, b, null)
        val (newR, newG, newB) = (java.awt.Color.HSBtoRGB(hsbArr(0), hsbArr(1), math.min(z, 160).toFloat / 160.0f) << 8).unzipRGB
        RGBA(newR, newG, newB, a)
      }
    }

  def getTile(layerId: LayerId, key: SpatialKey): Tile =
    getCachedTile(layerId, key) { tileReader.reader[SpatialKey, Tile](layerId).read(key) }

  def getBufferedTile[K: SpatialComponent: AvroRecordCodec: JsonFormat: ClassTag](layerId: LayerId, key: K, layerBounds: GridBounds, tileDimensions: (Int, Int)): Future[BufferedTile[Tile]] = {
    val futures: Vector[Future[Option[(Direction, Tile)]]] =
      getNeighboringKeys(key)
        .map { case (direction, key) =>
          val sk = key.getComponent[SpatialKey]
          if(!layerBounds.contains(sk.col, sk.row)) Future { None }
          else {
            (Future {
              try {
                val tile =
                  getCachedTile(layerId, sk) { tileReader.reader[SpatialKey, Tile](layerId).read(sk) }

                Some(direction -> tile)
              } catch {
                case e: ValueNotFoundError => None
              }
            })
          }
      }

    Future.sequence(futures)
      .map { tileOpts =>
        import Direction._

        val flattened = tileOpts.flatten
        val tileSeq =
          flattened
            .map(_._2)

        // TODO: Handle the case where there a corner but no side,
        // e.g. TopLeft but no Left
        val ((centerCol, centerRow),(layoutCols, layoutRows)) =
          flattened
            .map(_._1)
            .foldLeft(((0, 0), (1, 1))) { case (acc @ ((centerCol, centerRow), (totalCol, totalRow)), direction) =>
                direction match {
                  case Left        =>
                    val newTotalCol =
                      if(totalCol == 1) { 2 }
                      else if(totalCol == 2) { 3 }
                      else { totalCol }
                    ((1, centerRow), (newTotalCol, totalRow))
                  case Right       =>
                    val newTotalCol =
                      if(totalCol == 1) { 2 }
                      else if(totalCol == 2) { 3 }
                      else { totalCol }
                    ((centerCol, centerRow), (newTotalCol, totalRow))
                  case Top         =>
                    val newTotalRow =
                      if(totalRow == 1) { 2 }
                      else if(totalRow == 2) { 3 }
                      else { totalRow }
                    ((centerCol, 1), (totalCol, newTotalRow))
                  case Bottom      =>
                    val newTotalRow =
                      if(totalRow == 1) { 2 }
                      else if(totalRow == 2) { 3 }
                      else { totalRow }
                    ((centerCol, centerRow), (totalCol, newTotalRow))
                  case _ => acc
                }

          }

      val tileLayout =
        TileLayout(layoutCols, layoutRows, tileDimensions._1, tileDimensions._2)

      val gridBounds = {
        val (colMin, colMax) =
          if(centerCol == 0) {
            (0, tileDimensions._1 - 1)
          } else {
            (tileDimensions._1, tileDimensions._1 * 2 - 1)
          }

        val (rowMin, rowMax) =
          if(centerRow == 0) {
            (0, tileDimensions._2 - 1)
          } else {
            (tileDimensions._2, tileDimensions._2 * 2 - 1)
          }
        GridBounds(colMin, rowMin, colMax, rowMax)
      }

      val tile =
        CompositeTile(tiles = tileSeq, tileLayout)

      println(tileLayout)
      println(gridBounds)
      println(s"DIRECTIONS: ${flattened.map(_._1).toSeq}")
      println(s"TILE DIMS: ${tile.cols} ${tile.rows}")
      println(s"TILES DIMS: ${flattened.map(_._2.dimensions).toSeq}")

      BufferedTile(tile, gridBounds)
    }
  }

  def seqFutures[T, U](items: TraversableOnce[T])(func: T => Future[U]): Future[List[U]] = {
    items.foldLeft(Future.successful[List[U]](Nil)) {
      (f, item) => f.flatMap {
        x => func(item).map(_ :: x)
      }
    } map (_.reverse)
  }

  def populateKeys[K: SpatialComponent](key: K): Vector[K] =
    getNeighboringKeys(key).map(_._2)

  def getNeighboringKeys[K: SpatialComponent](key: K): Vector[(Direction, K)] = {
    import Direction._
    val SpatialKey(c, r) = key.getComponent[SpatialKey]

    Vector(
      (TopLeft, key.setComponent(SpatialKey(c - 1, r - 1))),
      (Top, key.setComponent(SpatialKey(c, r - 1))),
      (TopRight, key.setComponent(SpatialKey(c + 1, r - 1))),
      (Left, key.setComponent(SpatialKey(c - 1, r))),
      (Center, key.setComponent(SpatialKey(c, r))),
      (Right, key.setComponent(SpatialKey(c + 1, r))),
      (BottomLeft, key.setComponent(SpatialKey(c - 1, r + 1))),
      (Bottom, key.setComponent(SpatialKey(c, r + 1))),
      (BottomRight, key.setComponent(SpatialKey(c + 1, r + 1)))
    )
  }

  def keyToBounds[K: SpatialComponent](key: K): KeyBounds[K] = {
    val SpatialKey(c, r) = key.getComponent[SpatialKey]

    KeyBounds(
      key.setComponent(SpatialKey(c - 1, r - 1)),
      key.setComponent(SpatialKey(c + 1, r + 1))
    )
  }

  def readTileNeighbours[K: SpatialComponent: AvroRecordCodec: JsonFormat: ClassTag](layerId: LayerId, key: K): Future[Seq[(K, Tile)]] = {
    Future.sequence(populateKeys(key).map { k => Future {
        try {
          Some(k -> getCachedTile(layerId, k.getComponent[SpatialKey]) { tileReader.reader[K, Tile](layerId).read(k) })
        } catch {
          case e: ValueNotFoundError => None
        }
    } }) map (_.flatten)
  }

  def focalCompositeTileApply[
    K: SpatialComponent: AvroRecordCodec: JsonFormat: ClassTag
  ](layerId: LayerId, key: K, colorRamp: String)(f: Seq[(K, Tile)] => Tile) =
    readTileNeighbours(layerId, key) map { tileSeq => f(tileSeq) }

  def DIMRender(tile: Tile, layerId: LayerId, colorRamp: String): HttpResponse = {
    val breaks =
      attributeStore
        .read[Histogram[Double]](LayerId(layerId.name, 0), "histogram")
        .asInstanceOf[StreamingHistogram]
        .quantileBreaks(50)

    val ramp =
      ColorRampMap
        .getOrElse(colorRamp, ColorRamps.BlueToRed)

    val colorMap =
      ramp
        .toColorMap(breaks, ColorMap.Options(fallbackColor = ramp.colors.last))

    val bytes = tile.renderPng(colorMap)

    HttpResponse(entity = HttpEntity(ContentType(MediaTypes.`image/png`), bytes))
  }

  def index(i: Option[Int] = None) = i match {
    case Some(n) if n > 1 && n < 6 => s"/index${n}.html"
    case _ => "/index.html"
  }

  case class VolumeStats(mean: Double, min: Double, max: Double, volume: Double) {
    def toJson: JsObject =
      JsObject(
        "mean" -> mean.toInt.toJson,
        "min" -> min.toInt.toJson,
        "max" -> max.toInt.toJson,
        "volume" -> volume.toInt.toJson
      )
  }

  object VolumeStats {
    def apply(layer: Seq[(SpatialKey, Tile)] with Metadata[TileLayerMetadata[SpatialKey]], geom: MultiPolygon, cellArea: Double): VolumeStats = {
      val (zTotal, count, min, max, volume) =
        layer
          .polygonalSummary(geom, (0.0, 0L, Double.MaxValue, Double.MinValue, 0.0), new TilePolygonalSummaryHandler[(Double, Long, Double, Double, Double)] {
            def handlePartialTile(raster: Raster[Tile], intersection: Polygon): (Double, Long, Double, Double, Double) = {
              var volume = 0.0
              var min = Double.MaxValue
              var max = Double.MinValue
              var zTotal = 0.0
              var count = 0L
              val tile = raster.tile

              FractionalRasterizer.foreachCellByPolygon(intersection, raster.rasterExtent)(
                new FractionCallback {
                  def callback(col: Int, row: Int, fraction: Double): Unit = {
                    val z = tile.getDouble(col, row)
                    if(isData(z)) {
                      volume += z * cellArea * fraction
                      zTotal += z
                      count += 1
                      if(z < min) { min = z }
                      if(max < z) { max = z }
                    }
                  }
                }
              )

              (zTotal, count, min, max, volume)
            }

            def handleFullTile(tile: Tile): (Double, Long, Double, Double, Double) = {
              var volume = 0.0
              var min = Double.MaxValue
              var max = Double.MinValue
              var zTotal = 0.0
              var count = 0L

              tile.foreachDouble { z =>
                if(isData(z)) {
                  volume +=  z * cellArea
                  zTotal += z
                  count += 1
                  if(z < min) { min = z }
                  if(max < z) { max = z }
                }
              }

              (zTotal, count, min, max, volume)
            }

            def combineResults(values: Seq[(Double, Long, Double, Double, Double)]): (Double, Long, Double, Double, Double) =
              values
                .foldLeft((0.0, 0L, Double.MaxValue, Double.MinValue, 0.0)) { case ((accZTotal, accCount, accMin, accMax, accVolume), (zTotal, count, min, max, volume)) =>
                  (
                    zTotal + accZTotal,
                    count + accCount,
                    math.min(min, accMin),
                    math.max(max, accMax),
                    volume + accVolume
                  )
                }
          })

      VolumeStats(zTotal / count, min, max, volume)
    }
  }

  def routes =
    pathPrefix("ping") {
      get {
        complete { "pong" }
      }
    } ~
    pathPrefix("api") {
      pathPrefix("stats") {
        import spray.json._
        import DefaultJsonProtocol._

        pathPrefix("poly") {
          pathPrefix("single") {
            pathPrefix(Segment / IntNumber) { (layerName, zoom) =>
              // post {
              //   entity(as[String]) { poly =>
              parameters('poly) { (poly) =>
                  val layerId = LayerId(layerName, zoom)
                  val md = attributeStore.readMetadata[TileLayerMetadata[SpatialKey]](layerId)

                  val cellArea = md.cellSize.width * md.cellSize.height

                  val rawGeometry = try {
                    poly.parseJson.convertTo[Geometry]
                  } catch {
                    case e: Exception => sys.error("THAT PROBABLY WASN'T GEOMETRY")
                  }

                  val geometry = rawGeometry match {
                    case p: Polygon => MultiPolygon(p.reproject(LatLng, md.crs))
                    case mp: MultiPolygon => mp.reproject(LatLng, md.crs)
                    case _ => sys.error(s"BAD GEOMETRY")
                  }

                  val result =
                    collectionReader
                      .query[SpatialKey, Tile, TileLayerMetadata[SpatialKey]](layerId)
                      .where(Intersects(geometry))
                      .result

                  val stats = VolumeStats(result, geometry, cellArea)

                  // Mean, Min, Max, Volume
                  cors() {
                    complete {
                      Future {
                        JsObject(
                          "mean" -> stats.mean.toInt.toJson,
                          "min" -> stats.min.toInt.toJson,
                          "max" -> stats.max.toInt.toJson
                        )
                      }
                    }
                  }
  //              }
              }
            }
          } ~
          pathPrefix("diff") {
            pathPrefix(Segment / Segment / IntNumber) { (layer1Name, layer2Name, zoom) =>
              // post {
              //   entity(as[String]) { poly =>
              parameters('poly) { (poly) =>
                  val layer1Id = LayerId(layer1Name, zoom)
                  val layer2Id = LayerId(layer2Name, zoom)
                  val md = attributeStore.readMetadata[TileLayerMetadata[SpatialKey]](layer1Id)

                  val cellArea = md.cellSize.width * md.cellSize.height

                  val rawGeometry = try {
                    poly.parseJson.convertTo[Geometry]
                  } catch {
                    case e: Exception => sys.error("THAT PROBABLY WASN'T GEOMETRY")
                  }

                  val geometry = rawGeometry match {
                    case p: Polygon => MultiPolygon(p.reproject(LatLng, md.crs))
                    case mp: MultiPolygon => mp.reproject(LatLng, md.crs)
                    case _ => sys.error(s"BAD GEOMETRY")
                  }

                  val result1 =
                    collectionReader
                      .query[SpatialKey, Tile, TileLayerMetadata[SpatialKey]](layer1Id)
                      .where(Intersects(geometry))
                      .result

                  val result2 =
                    collectionReader
                      .query[SpatialKey, Tile, TileLayerMetadata[SpatialKey]](layer2Id)
                      .where(Intersects(geometry))
                      .result

                  val result = result1.withContext(_ - result2)

                  val stats = VolumeStats(result, geometry, cellArea)

                  cors() {
                    complete {
                      Future {
                        stats.toJson
                      }
                    }
                  }
                }
              }
    //        }
          }
        } ~
        pathPrefix("point") {
          pathPrefix("single") {
            pathPrefix(Segment / IntNumber) { (layerName, zoom) =>
              get {
                parameters('lat.as[Double], 'lng.as[Double]) { (lat, lng) =>

                  val layerId = LayerId(layerName, zoom)
                  val md = attributeStore.readMetadata[TileLayerMetadata[SpatialKey]](layerId)

                  val point = Point(lng, lat).reproject(LatLng, md.crs)

                  val key = md.layout.mapTransform(point)
                  val extent = md.layout.mapTransform(key)

                  val elevationTile =
                    Future {
                      getTile(layerId, key)
                    }

                  val value =
                    elevationTile.map { tile =>
                      Raster(tile, extent).getDoubleValueAtPoint(point.x, point.y)
                    }

                  cors() {
                    complete {
                      value.map { v =>
                        JsObject(
                          "value" -> v.toInt.toJson
                        )
                      }
                    }
                  }
                }
              }
            }
          } ~
          pathPrefix("diff") {
            pathPrefix(Segment / Segment / IntNumber) { (layer1Name, layer2Name, zoom) =>
              get {
                parameters('lat.as[Double], 'lng.as[Double]) { (lat, lng) =>

                  val layer1Id = LayerId(layer1Name, zoom)
                  val layer2Id = LayerId(layer2Name, zoom)
                  val md = attributeStore.readMetadata[TileLayerMetadata[SpatialKey]](layer1Id)

                  val point = Point(lng, lat).reproject(LatLng, md.crs)

                  val key = md.layout.mapTransform(point)
                  val extent = md.layout.mapTransform(key)

                  val layer1Tile =
                    Future {
                      getTile(layer1Id, key)
                    }

                  val layer2Tile =
                    Future {
                      getTile(layer2Id, key)
                    }

                  val values =
                    for(
                      t1 <- layer1Tile;
                      t2 <- layer2Tile
                    ) yield {
                      (
                        Raster(t1, extent).getDoubleValueAtPoint(point.x, point.y),
                        Raster(t2, extent).getDoubleValueAtPoint(point.x, point.y)
                      )
                    }

                  cors() {
                    complete {
                      Future {
                        values.map { case (v1, v2) =>
                          JsObject(
                            "value1" -> v1.toInt.toJson,
                            "value2" -> v2.toInt.toJson
                          )
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } ~
    pathPrefix("tms") {
      pathPrefix("hillshade") {
        pathPrefix(Segment / IntNumber / IntNumber / IntNumber) { (layerName, zoom, x, y) =>
          parameters(
            'colorRamp ? "blue-to-red",
            'azimuth.as[Double] ? 315,
            'altitude.as[Double] ? 45,
            'zFactor.as[Double] ? 1,
            'targetCell ? "all",
            'poly ? ""
          ) { (colorRamp, azimuth, altitude, zFactor, targetCell, poly) =>
            val target = targetCell match {
              case "nodata" => TargetCell.NoData
              case "data" => TargetCell.Data
              case _ => TargetCell.All
            }
            val layerId = LayerId(layerName, zoom)
            val key = SpatialKey(x, y)
            val keys = populateKeys(key)
            val kb = keyToBounds(key)
            val md = attributeStore.readMetadata[TileLayerMetadata[SpatialKey]](layerId)
            val extent = md.mapTransform(key)
            val polygon =
              if(poly.isEmpty) None
              else Some(poly.parseGeoJson[Polygon].reproject(LatLng, md.crs))

            complete {
              val layerGridBounds =
                md.bounds match {
                  case k: KeyBounds[SpatialKey] => k.toGridBounds
                  case _ => sys.error("Layer does not contain valid keybounds")
                }
              val tileDimensions =
                md.layout.tileLayout.tileDimensions

              val result: Future[Option[HttpResponse]] =
                if(!layerGridBounds.contains(key.col, key.row)) { Future { None } }
                else {
                  val elevationTile =
                    Future {
                      getTile(layerId, key)
                    }

                  val hillshadeTile =
                    getBufferedTile(layerId, key, layerGridBounds, tileDimensions)
                      .map { case BufferedTile(tile, bounds) =>
                        printAnyException {
                          Hillshade(
                            tile,
                            Square(1),
                            Some(bounds),
                            md.cellSize,
                            azimuth,
                            altitude,
                            zFactor,
                            target
                          )
                        }
                    }

                  val breaks =
                    attributeStore
                      .read[Histogram[Double]](LayerId(layerId.name, 0), "histogram")
                      .asInstanceOf[StreamingHistogram]
                      .quantileBreaks(50)

                  val ramp =
                    ColorRampMap
                      .getOrElse(colorRamp, ColorRamps.BlueToRed)

                  val colorMap =
                    ramp
                      .toColorMap(breaks, ColorMap.Options(fallbackColor = ramp.colors.last))

                  for(
                    e <- elevationTile;
                    h <- hillshadeTile
                  ) yield {
                    val bytes =
                      colorWithHillshade(e, h, colorMap)
                        .renderPng
                        .bytes

                    Some(HttpResponse(entity = HttpEntity(ContentType(MediaTypes.`image/png`), bytes)))
                  }
                }
              result
            }
          }
        }
      } ~
      pathPrefix("png") {
        pathPrefix(Segment / IntNumber / IntNumber / IntNumber) { (layerName, zoom, x, y) =>
          parameters('colorRamp ? "blue-to-red", 'poly ? "") { (colorRamp, poly) =>
            val layerId = LayerId(layerName, zoom)
            val key = SpatialKey(x, y)
            val md = attributeStore.readMetadata[TileLayerMetadata[SpatialKey]](layerId)
            val extent = md.mapTransform(key)
            val polygon =
              if(poly.isEmpty) None
              else Some(poly.parseGeoJson[Polygon].reproject(LatLng, md.crs))

            complete {
              Future {
                val tileOpt =
                  try {
                    Some(getTile(layerId, key))
                  } catch {
                    case e: ValueNotFoundError =>
                      None
                  }
                tileOpt.map { tile =>
                  DIMRender(polygon.fold(tile) { p => tile.mask(extent, p.geom) }, layerId, colorRamp)
                }
              }
            }
          }
        }
      } ~
      pathPrefix("diff-tms") {
        pathPrefix("png") {
          pathPrefix(Segment / Segment / IntNumber / IntNumber / IntNumber) { (layerName1, layerName2, zoom, x, y) =>
            parameters(
              'colorRamp ? "green-to-red",
              'breaks ? "-11,-10,-3,-4,-5,-6,-2,-1,-0.1,-0.06,-0.041,-0.035,-0.03,-0.025,-0.02,-0.019,-0.017,-0.015,-0.01,-0.008,-0.002,0.002,0.004,0.006,0.009,0.01,0.013,0.015,0.027,0.04,0.054,0.067,0.1,0.12,0.15,0.23,0.29,0.44,0.66,0.7,1,1.2,1.4,1.6,1.7,2,3,4,5,50,60,70,80,90,150,200",
              'poly ? ""
            ) { (colorRamp, pbreaks, poly) =>
              val (layerId1, layerId2) = LayerId(layerName1, zoom) -> LayerId(layerName2, zoom)
              val key = SpatialKey(x, y)
              val (md1, md2) = attributeStore.readMetadata[TileLayerMetadata[SpatialKey]](layerId1) -> attributeStore.readMetadata[TileLayerMetadata[SpatialKey]](layerId2)
              val extent = md1.mapTransform(key)
              val polygon =
                if(poly.isEmpty) None
                else Some(poly.parseGeoJson[Polygon].reproject(LatLng, md1.crs))

              complete {
                Future {
                  val tileOpt =
                    try {
                      val tile1 = getTile(layerId1, key)
                      val tile2 = getTile(layerId2, key)

                      val diff = tile1 - tile2

                      Some(diff)
                    } catch {
                      case e: ValueNotFoundError =>
                        None
                    }
                  tileOpt.map { t =>
                    val tile = polygon.fold(t) { p => t.mask(extent, p.geom) }
                    println(s"tile.findMinMaxDouble: ${tile.findMinMaxDouble}")

                    println(s"pbreaks: ${pbreaks}")

                    val breaks = pbreaks match {
                      case "none" => {
                        tile
                          .histogramDouble
                          .asInstanceOf[StreamingHistogram]
                          .quantileBreaks(50)
                      }
                      case s => s.split(",").map(_.toDouble)
                    }

                    println(s"breaks: ${breaks.toList}")

                    val ramp =
                      ColorRampMap
                        .getOrElse(colorRamp, ColorRamps.BlueToRed)
                    val colorMap =
                      ramp
                        .toColorMap(breaks, ColorMap.Options(fallbackColor = ramp.colors.last))

                    //val bytes = tile.renderPng(colorMap)
                    val bytes = tile.renderPng(ColorRampMap.gr)

                    HttpResponse(entity = HttpEntity(ContentType(MediaTypes.`image/png`), bytes))
                  }
                }
              }
            }
          }
        }
      }
  }

  def time[T](msg: String)(f: => T): (T, JsObject) = {
    val s = System.currentTimeMillis
    val result = f
    val e = System.currentTimeMillis
    val t = "%,d".format(e - s)
    val obj = JsObject(
      "TIMING RESULT" -> JsObject(
        "msg"          -> msg.toJson,
        "time (in ms)" -> t.toJson
      )
    )

    println(obj.toString)

    result -> obj
  }
}

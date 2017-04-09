package com.azavea.pointcloud.ingest

import com.azavea.pointcloud.ingest.conf.IngestConf

import geotrellis.pointcloud.spark._
import geotrellis.pointcloud.spark.dem.{PointCloudToDem, PointToGrid}
import geotrellis.pointcloud.spark.tiling.CutPointCloud
import geotrellis.proj4.{CRS, LatLng}
import geotrellis.raster.io._
import geotrellis.raster.io.geotiff.GeoTiff
import geotrellis.raster._
import geotrellis.raster.resample.Bilinear
import geotrellis.spark._
import geotrellis.spark.io._
import geotrellis.spark.io.hadoop._
import geotrellis.spark.io.index.ZCurveKeyIndexMethod
import geotrellis.spark.io.kryo.KryoRegistrator
import geotrellis.spark.pyramid.Pyramid
import geotrellis.spark.tiling._
import geotrellis.util._
import geotrellis.vector._

import org.apache.hadoop.fs.Path
import org.apache.spark.serializer.KryoSerializer
import org.apache.spark.{SparkConf, SparkContext}

object IngestIDWPyramid extends Ingest {
  def main(args: Array[String]): Unit = {
    implicit val opts = IngestConf.parse(args)
    println(s":::opts: ${opts}")

    // val chunkPath = System.getProperty("user.dir") + "/chunks/"

    val conf = new SparkConf()
      .setIfMissing("spark.master", "local[*]")
      .setAppName("PointCloudCount")
      //.set("spark.local.dir", "/data/spark")
      .set("spark.serializer", classOf[KryoSerializer].getName)
      .set("spark.kryo.registrator", classOf[KryoRegistrator].getName)

    implicit val sc = new SparkContext(conf)

    try {
      val source = getSource

      val (extent, crs) =
        source
          .map { case (header, _) => (header.projectedExtent3D.extent3d.toExtent, header.crs) }
          .reduce { case ((e1, c), (e2, _)) => (e1.combine(e2), c) }

      val targetCrs = CRS.fromName(opts.destCrs)

      val targetExtent =
        opts.extent match {
          case Some(e) => if (crs.epsgCode != targetCrs.epsgCode) e.reproject(crs, targetCrs) else e
          case _ =>  if (crs.epsgCode != targetCrs.epsgCode) extent.reproject(crs, targetCrs) else extent
        }

      println(s":::targetExtent.reproject(targetCrs, LatLng): ${targetExtent.reproject(targetCrs, LatLng)}")

      val layoutScheme = if (opts.pyramid || opts.zoomed) ZoomedLayoutScheme(targetCrs) else FloatingLayoutScheme(512)

      val (zoom, layout) = opts.maxZoom match {
        case Some(z) => z -> ZoomedLayoutScheme.layoutForZoom(z, targetExtent)
        case _ => {
          val LayoutLevel(z, l) = layoutScheme.levelFor(targetExtent, opts.cellSize)
          z -> l
        }
      }
      val kb = KeyBounds(layout.mapTransform(targetExtent))
      val md = TileLayerMetadata[SpatialKey](FloatConstantNoDataCellType, layout, targetExtent, targetCrs, kb)

      /*val pointsCount = source.flatMap(_._2).map { _.length.toLong } reduce (_ + _)
      println(s":::pointsCount: ${pointsCount}")*/

      val tiled =
        CutPointCloud(
          source.flatMap(_._2),
          layout
        ).withContext {
          _.reduceByKey({ (p1, p2) => p1 union p2 }, opts.numPartitions)
        }

      /*tiled.foreach { case (k, v) =>
        println(s":::perTileDensity: ${k} -> ${v.length}")
      }*/

      val tiles =
        PointCloudToDem(
          tiled, 256 -> 256,
          PointToGrid.Options(cellType = FloatConstantNoDataCellType)
        )

      val layer = ContextRDD(tiles, md)

      // layer.cache()

      def buildPyramid(zoom: Int, rdd: TileLayerRDD[SpatialKey])
                      (sink: (TileLayerRDD[SpatialKey], Int) => Unit): List[(Int, TileLayerRDD[SpatialKey])] = {
        println(s":::buildPyramid: $zoom")
        if (zoom >= opts.minZoom) {
          // rdd.cache()
          sink(rdd, zoom)
          val pyramidLevel @ (nextZoom, nextRdd) = Pyramid.up(rdd, layoutScheme, zoom, Pyramid.Options(Bilinear))
          pyramidLevel :: buildPyramid(nextZoom, nextRdd)(sink)
        } else {
          sink(rdd, zoom)
          List((zoom, rdd))
        }
      }

      if(opts.persist) {
        val writer = getWriter
        val attributeStore = writer.attributeStore

        var savedHisto = false
        if (opts.pyramid) {
          buildPyramid(zoom, layer) { (rdd, zoom) =>
            writer
              .write[SpatialKey, Tile, TileLayerMetadata[SpatialKey]](
              LayerId(opts.layerName, zoom),
              rdd,
              ZCurveKeyIndexMethod
            )

            println(s"=============================INGEST ZOOM LVL: $zoom=================================")

            if (!savedHisto) {
              savedHisto = true
              val histogram = rdd.histogram(512)
              attributeStore.write(
                LayerId(opts.layerName, 0),
                "histogram",
                histogram
              )
            }
          }.foreach { case (z, rdd) => rdd.unpersist(true) }
        } else {
          writer
            .write[SpatialKey, Tile, TileLayerMetadata[SpatialKey]](
            LayerId(opts.layerName, 0),
            layer,
            ZCurveKeyIndexMethod
          )

          if (!savedHisto) {
            savedHisto = true
            val histogram = layer.histogram(512)
            attributeStore.write(
              LayerId(opts.layerName, 0),
              "histogram",
              histogram
            )
          }
        }
      }

      opts.testOutput match {
        case Some(to) => {
          println(s":::layer.count(): ${layer.count()}")

          GeoTiff(layer.stitch, crs).write(to)
          HdfsUtils.copyPath(new Path(s"file://$to"), new Path(s"${to.split("/").last}"), sc.hadoopConfiguration)
        }
        case _ => if(!opts.persist) println(s":::layer.count: ${layer.count}")
      }

      layer.unpersist(blocking = false)
      source.unpersist(blocking = false)

    } finally sc.stop()
  }
}

package rastervision.viz.ingest

import geotrellis.proj4._
import geotrellis.raster._
import geotrellis.raster.io._
import geotrellis.raster.resample._
import geotrellis.raster.reproject.Reproject
import geotrellis.spark._
import geotrellis.spark.io._
import geotrellis.spark.tiling._
import geotrellis.vector._

import org.apache.spark._
import org.apache.spark.rdd._

object ModelResultIngest {
  def apply(
    source: RDD[(ProjectedExtent, MultibandTile)],
    sink: LayerSink,
    layerPrefix: String
  )(implicit sc: SparkContext): Unit = {
    val (_, md) = source.collectMetadata[SpatialKey](FloatingLayoutScheme(256))
    val md1 = md.copy(cellType = FloatConstantNoDataCellType)
    val tilerOptions =
      Tiler.Options(resampleMethod = Bilinear, partitioner = new HashPartitioner(source.partitions.length))

    val tiled = ContextRDD(source.tileToLayout[SpatialKey](md1, tilerOptions), md1)
    val (zoom, tiles) =
      tiled.reproject(
        WebMercator,
        Ingest.scheme,
        bufferSize = Ingest.bufferSize,
        Reproject.Options(
          method = Bilinear
        )
      )

    sink[MultibandTile](zoom, layerPrefix + s"-probabilities", tiles)

    // Create prediction raster
    val predictions: TileLayerRDD[SpatialKey] =
      tiles.withContext(_.mapValues { tile: MultibandTile =>
        tile.delayedConversion(ByteConstantNoDataCellType).combineDouble(0, 1, 2, 3, 4, 5) { (p1, p2, p3, p4, p5, p6) =>
          if(isNoData(p1)) { Double.NaN }
          else {
            var i = 0
            var max = p1
            if(p2 > max) { i = 1 ; max = p2 }
            if(p3 > max) { i = 2 ; max = p3 }
            if(p4 > max) { i = 3 ; max = p4 }
            if(p5 > max) { i = 4 ; max = p5 }
            if(p6 > max) { i = 5 ; max = p6 }
            i
          }
        }
      })

    sink[Tile](zoom, layerPrefix + s"-predictions", predictions)
  }
}

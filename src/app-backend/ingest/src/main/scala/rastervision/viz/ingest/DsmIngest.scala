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

object DsmIngest {
  def apply(
    source: RDD[(ProjectedExtent, MultibandTile)],
    sink: LayerSink,
    layerPrefix: String
  )(implicit sc: SparkContext): Unit = {
    val sb = source.mapValues(_.band(0))
    val (_, md) = sb.collectMetadata[SpatialKey](FloatingLayoutScheme(256))
    val md1 = md.copy(cellType = ShortConstantNoDataCellType)
    val tilerOptions =
      Tiler.Options(resampleMethod = Bilinear, partitioner = new HashPartitioner(source.partitions.length))
    val tiled = ContextRDD(sb.tileToLayout[SpatialKey](md1, tilerOptions), md1)
    val (zoom, tiles) =
      tiled.reproject(
        WebMercator,
        Ingest.scheme,
        bufferSize = Ingest.bufferSize,
          Reproject.Options(
            method = Bilinear
          )
      )

    sink[Tile](zoom, layerPrefix, tiles, hook = { (id, layer, as) =>
      if(id.zoom == 19) {
        val histogram = layer.histogram(100)
        as.write(
          id.copy(zoom = 0),
          "histogram",
          histogram
        )
      }
    })
  }
}

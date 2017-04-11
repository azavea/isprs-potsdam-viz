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

object ImageryIngest {
  def apply(
    source: RDD[(ProjectedExtent, MultibandTile)],
    sink: LayerSink,
    layerPrefix: String
  )(implicit sc: SparkContext): Unit = {

    val layers =
      List(
        ("rgb", source.mapValues(_.subsetBands(0, 1, 2))),
        ("irrg", source.mapValues(_.subsetBands(3, 1, 2))),
        ("rir", source.mapValues(_.subsetBands(0, 3)))
      )

      val (_, md1) = source.collectMetadata[SpatialKey](FloatingLayoutScheme(256))
      val tilerOptions =
        Tiler.Options(resampleMethod = Bilinear, partitioner = new HashPartitioner(source.partitions.length))

    for((name, subset) <- layers) {
      val tiled = ContextRDD(subset.tileToLayout[SpatialKey](md1, tilerOptions), md1)
      val (zoom, tiles) =
        tiled.reproject(
          WebMercator,
          Ingest.scheme,
          bufferSize = Ingest.bufferSize,
          Reproject.Options(
            method = Bilinear
          )
        )

      sink[MultibandTile](zoom, layerPrefix + s"-${name}", tiles)
    }
  }
}

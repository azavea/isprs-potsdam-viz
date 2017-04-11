package rastervision.viz.ingest

import rastervision.viz.ingest.conf._

import geotrellis.vector._
import geotrellis.proj4._
import geotrellis.raster._
import geotrellis.raster.resample._
import geotrellis.raster.merge._
import geotrellis.raster.prototype._
import geotrellis.spark._
import geotrellis.spark.io._
import geotrellis.spark.io.avro._
import geotrellis.spark.io.index._
import geotrellis.spark.io.s3._
import geotrellis.spark.io.hadoop._
import geotrellis.spark.io.file._
import geotrellis.spark.io.kryo.KryoRegistrator
import geotrellis.spark.pyramid._
import geotrellis.spark.tiling._
import org.apache.spark._
import org.apache.spark.rdd._
import org.apache.spark.serializer.KryoSerializer

import scala.reflect._
import scala.reflect.runtime.universe._

object Ingest {
  val scheme = ZoomedLayoutScheme(WebMercator)
  val bufferSize = 20

  def time[T](msg: String)(f: => T): T = {
    val s = System.currentTimeMillis
    val result = f
    val e = System.currentTimeMillis
    val t = "%,d".format(e - s)
    println("=================TIMING RESULT=================")
    println(s"$msg (in $t ms)")
    println("==============================================")
    result
  }

  def main(args: Array[String]): Unit = {
    implicit val opts = IngestConf.parse(args)
    println(s":::opts: ${opts}")

    val conf = new SparkConf()
      .setIfMissing("spark.master", "local[*]")
      .setAppName(s"Raster Vision Ingest: ${opts.ingestType.key}")
      .set("spark.serializer", classOf[KryoSerializer].getName)
      .set("spark.kryo.registrator", classOf[KryoRegistrator].getName)

    implicit val sc = new SparkContext(conf)

    try {

      val source: RDD[(ProjectedExtent, MultibandTile)]=
        if(opts.isS3Input) {
          val (bucket, key) = opts.s3InputPath
          S3GeoTiffRDD.spatialMultiband(bucket, key,
            S3GeoTiffRDD.Options(
              maxTileSize = Some(512),
              numPartitions = opts.numPartitions
            )
          )
        } else {
          HadoopGeoTiffRDD.spatialMultiband(opts.inputPath,
            HadoopGeoTiffRDD.Options(
              maxTileSize = Some(512),
              numPartitions = opts.numPartitions
            )
          )
        }

      val sink: LayerSink = {
        if(opts.isS3Catalog) {
          new S3LayerSink(opts.s3CatalogPath._1, opts.s3CatalogPath._2)
        } else {
          new FileLayerSink(opts.catalogPath)
        }
      }

      opts.ingestType match {
        case DSMIngestType =>
          DsmIngest(source, sink, opts.layerPrefix)
        case RGBIRIngestType =>
          ImageryIngest(source, sink, opts.layerPrefix)
        case LabelIngestType =>
          LabelIngest(source, sink, opts.layerPrefix)
        case ModelResultIngestType =>
          ModelResultIngest(source, sink, opts.layerPrefix)
      }
    } finally {
      sc.stop
    }
  }
}

trait LayerSink {
  type HookFunc[V] =
    (LayerId, RDD[(SpatialKey, V)] with Metadata[TileLayerMetadata[SpatialKey]], AttributeStore) => Unit
  object HookFunc {
    def NOOP[V] =
      (x: LayerId, y: RDD[(SpatialKey, V)] with Metadata[TileLayerMetadata[SpatialKey]], z: AttributeStore) => ()
  }

  private def savePyramid[
    V <: CellGrid: TypeTag: ? => TileMergeMethods[V]: ? => TilePrototypeMethods[V]: AvroRecordCodec: ClassTag
  ](layerName: String, zoom: Int, rdd: RDD[(SpatialKey, V)] with Metadata[TileLayerMetadata[SpatialKey]], method: ResampleMethod)(hook: HookFunc[V]): Unit = {
    val layerId = LayerId(layerName, zoom)
    saveLayer(layerId, rdd)(hook)

    if(zoom >= 1) {
      val (nextLevel, nextRdd) =
        Pyramid.up(rdd, Ingest.scheme, zoom, method)
      savePyramid(layerName, nextLevel, nextRdd, method)(hook)
    }
  }

  def apply[
    V <: CellGrid: TypeTag: ? => TileMergeMethods[V]: ? => TilePrototypeMethods[V]: AvroRecordCodec: ClassTag
  ](
    zoom: Int,
    layerName: String,
    tileLayer: RDD[(SpatialKey, V)] with Metadata[TileLayerMetadata[SpatialKey]],
    method: ResampleMethod = Bilinear,
    hook: HookFunc[V] = HookFunc.NOOP[V]
  ): Unit = {
    savePyramid(layerName, zoom, tileLayer, method)(hook)
  }

  protected def saveLayer[
    V <: CellGrid: TypeTag: ? => TileMergeMethods[V]: ? => TilePrototypeMethods[V]: AvroRecordCodec: ClassTag
  ](layerId: LayerId, tileLayer: RDD[(SpatialKey, V)] with Metadata[TileLayerMetadata[SpatialKey]])(hook: HookFunc[V]): Unit

}

class FileLayerSink(catalogPath: String)(implicit sc: SparkContext) extends LayerSink {
  val as = FileAttributeStore(catalogPath)
  val writer = FileLayerWriter(as)
  val deleter = FileLayerDeleter(as)

  protected def saveLayer[
    V <: CellGrid: TypeTag: ? => TileMergeMethods[V]: ? => TilePrototypeMethods[V]: AvroRecordCodec: ClassTag
  ](layerId: LayerId, tileLayer: RDD[(SpatialKey, V)] with Metadata[TileLayerMetadata[SpatialKey]])(hook: HookFunc[V]): Unit = {
    // Clobber
    if(as.layerExists(layerId)) {
      deleter.delete(layerId)
    }

    writer.write(layerId, tileLayer, ZCurveKeyIndexMethod)
    hook(layerId, tileLayer, as)
  }
}

class S3LayerSink(bucket: String, prefix: String) extends LayerSink {
  val as = S3AttributeStore(bucket, prefix)
  val writer = S3LayerWriter(as)
  val deleter = S3LayerDeleter(as)

  protected def saveLayer[
    V <: CellGrid: TypeTag: ? => TileMergeMethods[V]: ? => TilePrototypeMethods[V]: AvroRecordCodec: ClassTag
  ](layerId: LayerId, tileLayer: RDD[(SpatialKey, V)] with Metadata[TileLayerMetadata[SpatialKey]])(hook: HookFunc[V]): Unit = {
    // Clobber
    if(as.layerExists(layerId)) {
      deleter.delete(layerId)
    }

    writer.write(layerId, tileLayer, ZCurveKeyIndexMethod)
    hook(layerId, tileLayer, as)
  }
}

package com.azavea.server

import geotrellis.spark.io.kryo.KryoRegistrator
import geotrellis.spark.io.hadoop._
import geotrellis.spark.io.file._
import geotrellis.spark.io.s3._

import akka.actor.ActorSystem
import akka.event.Logging
import akka.http.scaladsl.Http
import akka.stream.ActorMaterializer
import org.apache.hadoop.conf.Configuration
import org.apache.spark.{SparkConf, SparkContext}
import org.apache.spark.serializer.KryoSerializer

import scala.concurrent.ExecutionContext.Implicits.global

object AkkaSystem {
  implicit val system = ActorSystem("rastervision-viz-server")
  implicit val materializer = ActorMaterializer()

  trait LoggerExecutor {
    protected implicit val log = Logging(system, "app")
  }
}

object Main extends Router with Config {
  import AkkaSystem._

  lazy val (attributeStore, tileReader, /*layerReader,*/ collectionReader) =
    if(isS3Catalog) {
      val as = S3AttributeStore(S3CatalogPath._1, S3CatalogPath._2)
      println(s"#### S3 as.layerIds: ${as.layerIds}")
      val vr = new S3ValueReader(as)
      val cr = S3CollectionLayerReader(as)

      (as, vr, cr)
    } else if(catalogPath.startsWith("file") || catalogPath.startsWith("hdfs")) {
      val conf = new SparkConf().setIfMissing("spark.master", "local[*]") .setAppName("RasterVision Viz Server")
      implicit val sc = new SparkContext(conf)

      val as = HadoopAttributeStore(catalogPath)
      val vr = HadoopValueReader(as)
      val cr = HadoopCollectionLayerReader(as)

      sc.stop

      println(s"#### HADOOP as.layerIds: ${as.layerIds}")

      (as, vr, cr)
    } else {
      val as = FileAttributeStore(catalogPath)
      val vr = FileValueReader(as)
      val cr = FileCollectionLayerReader(as)

      println(s"#### FILE as.layerIds: ${as.layerIds}")

      (as, vr, cr)
    }

  def main(args: Array[String]): Unit = {
    Http().bindAndHandle(routes, httpConfig.interface, httpConfig.port)
  }
}

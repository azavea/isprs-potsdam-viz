package com.azavea.server

import geotrellis.spark.io.kryo.KryoRegistrator
import geotrellis.spark.io.hadoop._
import geotrellis.spark.io.s3._

import akka.actor.ActorSystem
import akka.event.Logging
import akka.http.scaladsl.Http
import akka.stream.ActorMaterializer
import org.apache.hadoop.conf.Configuration
// import org.apache.spark.{SparkConf, SparkContext}
// import org.apache.spark.serializer.KryoSerializer

import scala.concurrent.ExecutionContext.Implicits.global

object AkkaSystem {
  implicit val system = ActorSystem("geotrellis-pointcloud-demo")
  implicit val materializer = ActorMaterializer()

  trait LoggerExecutor {
    protected implicit val log = Logging(system, "app")
  }
}

object Main extends Router with Config {
  import AkkaSystem._

  // val conf = new SparkConf()
  //   .setIfMissing("spark.master", "local[*]")
  //   .setAppName("GeoTrellis PointCloud Server")
  //   .set("spark.serializer", classOf[KryoSerializer].getName)
  //   .set("spark.kryo.registrator", classOf[KryoRegistrator].getName)
  //   .set("spark.kryoserializer.buffer.max", "1g")
  //   .set("spark.kryoserializer.buffer", "1g")

  // implicit val sc = new SparkContext(conf)

  lazy val (attributeStore, tileReader, /*layerReader,*/ collectionReader) =
    if(isS3Catalog) {
      val as = S3AttributeStore(S3CatalogPath._1, S3CatalogPath._2)
      println(s"#### as.layerIds: ${as.layerIds}")
      val vr = new S3ValueReader(as)
      // val lr = S3LayerReader(as)
      val cr = S3CollectionLayerReader(as)
      //      (as, vr, lr, cr)
      (as, vr, cr)
    } else {
      val as = HadoopAttributeStore(catalogPath, new Configuration(true))//, sc.hadoopConfiguration)
      val vr = HadoopValueReader(as)
      // val lr = HadoopLayerReader(as)
      val cr = HadoopCollectionLayerReader(as)
      //      (as, vr, lr, cr)
      (as, vr, cr)
    }

  def main(args: Array[String]): Unit = {
    Http().bindAndHandle(routes, httpConfig.interface, httpConfig.port)
  }
}

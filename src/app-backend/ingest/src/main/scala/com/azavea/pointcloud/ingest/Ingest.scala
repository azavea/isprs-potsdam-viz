package com.azavea.pointcloud.ingest

import com.azavea.pointcloud.ingest.conf.IngestConf
import io.pdal._

import geotrellis.pointcloud.pipeline.{RangeFilter, Read, ReprojectionFilter}
import geotrellis.pointcloud.spark.io.PointCloudHeader
import geotrellis.pointcloud.spark.io.hadoop.HadoopPointCloudRDD
import geotrellis.pointcloud.spark.io.s3.S3PointCloudRDD
import geotrellis.spark.LayerId
import geotrellis.spark.io.LayerWriter
import geotrellis.spark.io.hadoop.HadoopLayerWriter
import geotrellis.spark.io.s3.S3LayerWriter

import org.apache.hadoop.fs.Path
import org.apache.spark.SparkContext
import org.apache.spark.rdd.RDD

trait Ingest {
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

  def getSource(implicit opts: IngestConf.Options, sc: SparkContext): RDD[(PointCloudHeader, Iterator[PointCloud])] = {
    val pipeline = Read("", opts.inputCrs) ~
      ReprojectionFilter(opts.destCrs) ~
      opts.maxValue.map { v => RangeFilter(Some(s"Z[0:$v]")) }

    if(opts.nonS3Input)
      HadoopPointCloudRDD(
        new Path(opts.inputPath),
        HadoopPointCloudRDD.Options.DEFAULT.copy(pipeline = pipeline, dimTypes = Option(List("X", "Y", "Z")))
      ).map { case (header, pc) => (header: PointCloudHeader, pc) } //.cache()
    else
      S3PointCloudRDD(
        bucket = opts.S3InputPath._1,
        prefix = opts.S3InputPath._2,
        S3PointCloudRDD.Options.DEFAULT.copy(pipeline = pipeline, dimTypes = Option(List("X", "Y", "Z")))
      ).map { case (header, pc) => (header: PointCloudHeader, pc) } //.cache
  }

  def getWriter(implicit opts: IngestConf.Options, sc: SparkContext): LayerWriter[LayerId] = {
    if(opts.nonS3Catalog) HadoopLayerWriter(new Path(opts.catalogPath))
    else S3LayerWriter(opts.S3CatalogPath._1, opts.S3CatalogPath._2)
  }

}

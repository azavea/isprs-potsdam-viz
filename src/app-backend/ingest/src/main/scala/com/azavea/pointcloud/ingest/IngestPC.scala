package com.azavea.pointcloud.ingest

import com.azavea.pointcloud.ingest.conf.IngestConf

import io.pdal._
import geotrellis.pointcloud.spark.io._
import geotrellis.pointcloud.spark.tiling.Implicits.{withTilerMethods => withPCTilerMethods}
import geotrellis.proj4.CRS
import geotrellis.raster._
import geotrellis.spark._
import geotrellis.spark.io._
import geotrellis.spark.io.index.ZCurveKeyIndexMethod
import geotrellis.spark.io.kryo.KryoRegistrator
import geotrellis.spark.tiling._
import geotrellis.util._
import geotrellis.vector._

import org.apache.spark.serializer.KryoSerializer
import org.apache.spark.{SparkConf, SparkContext}

object IngestPC extends Ingest {
  def main(args: Array[String]): Unit = {
    implicit val opts = IngestConf.parse(args)
    // val chunkPath = System.getProperty("user.dir") + "/chunks/"

    val conf = new SparkConf()
      .setIfMissing("spark.master", "local[*]")
      .setAppName("PointCloudCount")
      .set("spark.local.dir", "/data/spark")
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

      val layoutScheme = if (opts.pyramid || opts.zoomed) ZoomedLayoutScheme(targetCrs) else FloatingLayoutScheme(512)

      val LayoutLevel(zoom, layout) = layoutScheme.levelFor(targetExtent, opts.cellSize)
      val kb = KeyBounds(layout.mapTransform(targetExtent))
      val md = TileLayerMetadata[SpatialKey](FloatConstantNoDataCellType, layout, targetExtent, targetCrs, kb)

      val rdd = source.flatMap(_._2)
      val tiled = withPCTilerMethods(rdd).tileToLayout(layout)
      val layer = ContextRDD(tiled, md)

      layer.cache()

      if(opts.persist) {
        val writer = getWriter

        writer
          .write[SpatialKey, PointCloud, TileLayerMetadata[SpatialKey]](
            LayerId(opts.layerName, 0),
            layer,
            ZCurveKeyIndexMethod
          )
      } else layer.count()

      layer.unpersist(blocking = false)
      source.unpersist(blocking = false)

    } finally sc.stop()
  }
}

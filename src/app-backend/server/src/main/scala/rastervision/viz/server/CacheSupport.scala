package com.azavea.server

import geotrellis.raster.Tile
import geotrellis.spark.{SpatialKey, LayerId}
import com.typesafe.config.ConfigFactory
import com.github.blemale.scaffeine._

import scala.concurrent.duration._

object Cache {
  // Guess: tiler stalling when cache gets full and then purges.
  // All tile requests hang on that moment.
  // Put this behind an actor that will apply backpressure/queueing.
  private val _cache: Cache[(LayerId, SpatialKey), Object] =
    Scaffeine()
      .expireAfterWrite(30.minutes)
      .maximumSize(50)
      .build[(LayerId, SpatialKey), Object]()

  trait CacheSupport {
    def getCached[V <: AnyRef](layerId: LayerId, spatialKey: SpatialKey)(create: => V): V = {
      // Debuggin tiler problems, seeing if cache is the issue
      create
      // val k = (layerId, spatialKey)
      // _cache.getIfPresent(k) match {
      //   case Some(tile) => tile.asInstanceOf[V]
      //   case None =>
      //     val tile = create
      //     _cache.put(k, tile)
      //     tile
      // }
    }
  }
}

package com.azavea.server

import geotrellis.raster.Tile
import geotrellis.spark.{SpatialKey, LayerId}
import com.typesafe.config.ConfigFactory
import com.github.blemale.scaffeine._

import scala.concurrent.duration._

trait CacheSupport {
  private val _cache: Cache[(LayerId, SpatialKey), Tile] =
    Scaffeine()
      .expireAfterWrite(30.minutes)
      .maximumSize(50)
      .build[(LayerId, SpatialKey), Tile]()

  def getCachedTile(layerId: LayerId, spatialKey: SpatialKey)(create: => Tile) = {
    val k = (layerId, spatialKey)
    _cache.getIfPresent(k) match {
      case Some(tile) => tile
      case None =>
        val tile = create
        _cache.put(k, tile)
        tile
    }
  }
}

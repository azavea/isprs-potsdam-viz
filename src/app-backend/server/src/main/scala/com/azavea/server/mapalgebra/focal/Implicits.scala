package com.azavea.server.mapalgebra.focal

import geotrellis.raster.{CompositeTile, GridBounds, Tile}
import geotrellis.spark.{KeyBounds, SpatialComponent, TileLayerMetadata}

object Implicits extends Implicits

trait Implicits {
  implicit class withSeqTileComposite(seq: Seq[Tile]) {
    def runOnSeq[K: SpatialComponent](key: K, metadata: TileLayerMetadata[K])(calc: (Tile, Option[GridBounds]) => Tile) =
      calc(CompositeTile(tiles = seq, tileLayout = metadata.tileLayout), Some(KeyBounds(key, key).toGridBounds()))
  }

  implicit class withKeyedSeqTileComposite[K: SpatialComponent](seq: Seq[(K, Tile)]) {
    def runOnSeq(key: K, metadata: TileLayerMetadata[K])(calc: (Tile, Option[GridBounds]) => Tile) =
      seq.map(_._2).runOnSeq(key, metadata)(calc)
  }
}

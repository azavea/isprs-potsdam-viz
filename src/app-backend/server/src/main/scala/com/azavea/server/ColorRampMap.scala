/*
 * Copyright (c) 2016 Azavea.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.azavea.server

import geotrellis.raster.render._


/**
  * Provides a string keyed map to predefined color ramps to be used
  * for coloring rendered rasters.
  */

object ColorRampMap {
  final def greenToRed =
    ColorRamp(
      0x00BD12FF, 0x2AC239FF, 0x55C760FF, 0x80CC87FF,
      0xABD1AEFF, 0xD6D6D6FF, 0xD2ABABFF, 0xCE8180FF,
      0xCA5755FF, 0xC62D2AFF, 0xC20300FF
    )

  final def greenToRed51Map =
    ColorMap((-50 to 50) zip Array(
      0x00BD12FF, 0x03BD15FF, 0x07BD19FF, 0x0BBE1CFF, 0x0FBE20FF, 0x13BF23FF,
      0x17BF27FF, 0x1AC02AFF, 0x1EC02EFF, 0x22C031FF, 0x26C135FF, 0x2AC138FF,
      0x2EC23CFF, 0x31C23FFF, 0x35C343FF, 0x39C346FF, 0x3DC44AFF, 0x41C44DFF,
      0x45C451FF, 0x48C554FF, 0x4CC558FF, 0x50C65BFF, 0x54C65FFF, 0x58C762FF,
      0x5CC766FF, 0x60C86AFF, 0x63C86DFF, 0x67C871FF, 0x6BC974FF, 0x6FC978FF,
      0x73CA7BFF, 0x77CA7FFF, 0x7ACB82FF, 0x7ECB86FF, 0x82CB89FF, 0x86CC8DFF,
      0x8ACC90FF, 0x8ECD94FF, 0x91CD97FF, 0x95CE9BFF, 0x99CE9EFF, 0x9DCFA2FF,
      0xA1CFA5FF, 0xA5CFA9FF, 0xA8D0ACFF, 0xACD0B0FF, 0xB0D1B3FF, 0xB4D1B7FF,
      0xB8D2BAFF, 0xBCD2BEFF, 0xC0D3C2FF, 0xC0CEBEFF, 0xC0CABAFF, 0xC0C6B6FF,
      0xC0C2B2FF, 0xC0BEAEFF, 0xC0BAAAFF, 0xC0B5A6FF, 0xC0B1A2FF, 0xC0AD9FFF,
      0xC0A99BFF, 0xC0A597FF, 0xC0A193FF, 0xC09C8FFF, 0xC0988BFF, 0xC09487FF,
      0xC09083FF, 0xC08C80FF, 0xC0887CFF, 0xC08378FF, 0xC07F74FF, 0xC07B70FF,
      0xC0776CFF, 0xC07368FF, 0xC06F64FF, 0xC16B61FF, 0xC1665DFF, 0xC16259FF,
      0xC15E55FF, 0xC15A51FF, 0xC1564DFF, 0xC15249FF, 0xC14D45FF, 0xC14941FF,
      0xC1453EFF, 0xC1413AFF, 0xC13D36FF, 0xC13932FF, 0xC1342EFF, 0xC1302AFF,
      0xC12C26FF, 0xC12822FF, 0xC1241FFF, 0xC1201BFF, 0xC11B17FF, 0xC11713FF,
      0xC1130FFF, 0xC10F0BFF, 0xC10B07FF, 0xC10703FF, 0xC20300FF
    ) map { case (k, v) => k.toDouble -> v } toMap)


  final def greenToRed26Map =
    ColorMap((-25 to 25) zip Array(
      0x00BD12FF, 0x07BD19FF, 0x0FBE20FF, 0x17BF27FF, 0x1EC02EFF, 0x26C135FF,
      0x2EC23CFF, 0x35C343FF, 0x3DC44AFF, 0x45C451FF, 0x4CC558FF, 0x54C65FFF,
      0x5CC766FF, 0x63C86DFF, 0x6BC974FF, 0x73CA7BFF, 0x7ACB82FF, 0x82CB89FF,
      0x8ACC90FF, 0x91CD97FF, 0x99CE9EFF, 0xA1CFA5FF, 0xA8D0ACFF, 0xB0D1B3FF,
      0xB8D2BAFF, 0xC0D3C2FF, 0xC0CABAFF, 0xC0C2B2FF, 0xC0BAAAFF, 0xC0B1A2FF,
      0xC0A99BFF, 0xC0A193FF, 0xC0988BFF, 0xC09083FF, 0xC0887CFF, 0xC07F74FF,
      0xC0776CFF, 0xC06F64FF, 0xC1665DFF, 0xC15E55FF, 0xC1564DFF, 0xC14D45FF,
      0xC1453EFF, 0xC13D36FF, 0xC1342EFF, 0xC12C26FF, 0xC1241FFF, 0xC11B17FF,
      0xC1130FFF, 0xC10B07FF, 0xC20300FF
    ) map { case (k, v) => k.toDouble -> v } toMap)

  final def greenToRed6b15Map =
    ColorMap((-6 to 15) zip Array(
      0x00BD12FF, 0x1BC02BFF, 0x36C344FF, 0x52C65DFF, 0x6DC976FF, 0x89CC8FFF,
      0xA4CFA8FF, 0xC0D3C2FF, 0xC0C6B5FF, 0xC0B9A9FF, 0xC0AC9DFF, 0xC09F91FF,
      0xC09285FF, 0xC08579FF, 0xC0786DFF, 0xC16B61FF, 0xC15E54FF, 0xC15148FF,
      0xC1443CFF, 0xC13730FF, 0xC12A24FF, 0xC11D18FF, 0xC1100CFF, 0xC20300FF
    ) map { case (k, v) => k.toDouble -> v } toMap)

  final def gr =
    ColorMap(Map[Double, Int](
      -7d -> 0x00BD12FF,
      -5d -> 0x18BF28FF,
      -2d -> 0x78CA80FF,
      -1d -> 0xA8D0ACFF,
      0d -> 0xC0B0A1FF,
      0.1 -> 0xC08D81FF,
      1.5 -> 0xC16B61FF,
      2d -> 0xC14840FF,
      6d -> 0xC12520FF,
      9d -> 0xC20300FF,
      30d -> 0xC20300FF)
    )

  val rampMap: Map[String, ColorRamp] =
    Map(
      "blue-to-orange" -> ColorRamps.BlueToOrange,
      "green-to-orange" -> ColorRamps.LightYellowToOrange,
      "blue-to-red" -> ColorRamps.BlueToRed,
      "green-to-red-orange" -> ColorRamps.GreenToRedOrange,
      "light-to-dark-sunset" -> ColorRamps.LightToDarkSunset,
      "light-to-dark-green" -> ColorRamps.LightToDarkGreen,
      "yellow-to-red-heatmap" -> ColorRamps.HeatmapYellowToRed,
      "blue-to-yellow-to-red-heatmap" -> ColorRamps.HeatmapBlueToYellowToRedSpectrum,
      "dark-red-to-yellow-heatmap" -> ColorRamps.HeatmapDarkRedToYellowWhite,
      "purple-to-dark-purple-to-white-heatmap" -> ColorRamps.HeatmapLightPurpleToDarkPurpleToWhite,
      "bold-land-use-qualitative" -> ColorRamps.ClassificationBoldLandUse,
      "muted-terrain-qualitative" -> ColorRamps.ClassificationMutedTerrain,
      "green-to-red" -> greenToRed
    )

  def get(s:String): Option[ColorRamp] = rampMap.get(s)
  def getOrElse(s:String, cr:ColorRamp): ColorRamp = rampMap.getOrElse(s,cr)

  def getJson = {
    val c = for(key <- rampMap.keys) yield {
      s"""{ "key": "$key", "image": "img/ramps/${key}.png" }"""
    }
    val arr = "[" + c.mkString(",") + "]"
    s"""{ "colors": $arr }"""
  }
}

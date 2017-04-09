package com.azavea.server

import com.typesafe.config.ConfigFactory
import geotrellis.spark.io.s3.S3InputFormat
import net.ceedubs.ficus.Ficus
import net.ceedubs.ficus.readers.ArbitraryTypeReader

trait Config {
  import ArbitraryTypeReader._
  import Ficus._

  protected case class HttpConfig(interface: String, port: Int)

  private val config = ConfigFactory.load()
  protected val httpConfig = config.as[HttpConfig]("http")
  val staticPath = config.as[String]("server.static-path")
  val catalogPath = config.as[String]("server.catalog")

  lazy val isS3Catalog = try {
    val S3InputFormat.S3UrlRx(_, _, _, _) = catalogPath
    true
  } catch { case _: Exception => false }

  lazy val S3CatalogPath = {
    val S3InputFormat.S3UrlRx(_, _, bucket, prefix) = catalogPath
    bucket -> prefix
  }
}

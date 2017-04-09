package com.azavea.pointcloud.ingest.conf

import geotrellis.raster.CellSize
import geotrellis.spark.io.s3.S3InputFormat
import geotrellis.vector.Extent

object IngestConf {
  case class Options(
    inputPath: String = "/data/test/",
    catalogPath: String = "/data/catalog",
    layerName: String = "elevation",
    persist: Boolean = true,
    pyramid: Boolean = true,
    zoomed: Boolean = true,
    cellSize: CellSize = CellSize(0.5, 0.5),
    numPartitions: Int = 5000,
    minZoom: Int = 7,
    maxZoom: Option[Int] = None,
    maxValue: Option[Int] = None,
    destCrs: String = "EPSG:3857",
    extent: Option[Extent] = None,
    inputCrs: Option[String] = None,
    testOutput: Option[String] = None,
    outputBackend: String = "hadoop",
    inputBackend: String = "hadoop",
    decimation: Double = 0.75
  ) {
    lazy val isS3Input = try {
      val S3InputFormat.S3UrlRx(_, _, _, _) = inputPath
      true
    } catch { case _: Exception => false }

    lazy val nonS3Input = !isS3Input

    lazy val isS3Catalog = try {
      val S3InputFormat.S3UrlRx(_, _, _, _) = catalogPath
      true
    } catch { case _: Exception => false }

    lazy val nonS3Catalog = !isS3Catalog

    lazy val S3InputPath = {
      val S3InputFormat.S3UrlRx(_, _, bucket, prefix) = inputPath
      bucket -> prefix
    }

    lazy val S3CatalogPath = {
      val S3InputFormat.S3UrlRx(_, _, bucket, prefix) = catalogPath
      bucket -> prefix
    }
  }

  val help = """
               |geotrellis-pointcloud-ingest
               |
               |Usage: geotrellis-pointcloud-ingest [options]
               |
               |  --inputPath <value>
               |        inputPath is a non-empty String property [default: file:///data/test/]
               |  --catalogPath <value>
               |        catalogPath is a non-empty String property [default: file:///data/catalog2]
               |  --layerName <value>
               |        layerName is a non-empty String property [default: elevation]
               |  --extent <value>
               |        extent is a non-empty String in LatLng
               |  --inputCrs <value>
               |        inputCrs is a non-empty String
               |  --destCrs <value>
               |        destCrs is a non-empty String [default: EPSG:3857]
               |  --persist <value>
               |        persist is a a boolean option [default: false]
               |  --pyramid <value>
               |        pyramid is a boolean option [default: false]
               |  --zoomed <value>
               |        zoomed is a boolean option [default: false]
               |  --cellSize <value>
               |        cellSize is a non-empty String [default: 0.5,0.5]
               |  --numPartitions <value>
               |        numPatition is an integer value [default: 5000]
               |  --minZoom <value>
               |        minZoom is an integer value [default: 7]
               |  --maxZoom <value>
               |        maxZoom is an integer value
               |  --maxValue <value>
               |        maxValue is an integer value [default: 400]
               |  --testOutput <value>
               |        testOutput is a non-empty String
               | --decimation <value>
               |        decimation is a double value [default: 0.75]
               |  --help
               |        prints this usage text
             """.stripMargin

  def nextOption(opts: Options, list: Seq[String]): Options = {
    list.toList match {
      case Nil => opts
      case "--inputPath" :: value :: tail =>
        nextOption(opts.copy(inputPath = value), tail)
      case "--catalogPath" :: value :: tail =>
        nextOption(opts.copy(catalogPath = value), tail)
      case "--layerName" :: value :: tail =>
        nextOption(opts.copy(layerName = value), tail)
      case "--extent" :: value :: tail =>
        nextOption(opts.copy(extent = Some(Extent.fromString(value))), tail)
      case "--inputCrs" :: value :: tail =>
        nextOption(opts.copy(inputCrs = Some(value)), tail)
      case "--destCrs" :: value :: tail =>
        nextOption(opts.copy(destCrs = value), tail)
      case "--persist" :: value :: tail =>
        nextOption(opts.copy(persist = value.toBoolean), tail)
      case "--pyramid" :: value :: tail =>
        nextOption(opts.copy(pyramid = value.toBoolean), tail)
      case "--zoomed" :: value :: tail =>
        nextOption(opts.copy(zoomed = value.toBoolean), tail)
      case "--cellSize" :: value :: tail =>
        nextOption(opts.copy(cellSize = CellSize.fromString(value)), tail)
      case "--numPartitions" :: value :: tail =>
        nextOption(opts.copy(numPartitions = value.toInt), tail)
      case "--minZoom" :: value :: tail =>
        nextOption(opts.copy(minZoom = value.toInt), tail)
      case "--maxZoom" :: value :: tail =>
        nextOption(opts.copy(maxZoom = Option(value.toInt)), tail)
      case "--maxValue" :: value :: tail =>
        nextOption(opts.copy(maxValue = Some(value.toInt)), tail)
      case "--testOutput" :: value :: tail =>
        nextOption(opts.copy(testOutput = Some(value)), tail)
      case "--decimation" :: value :: tail =>
        nextOption(opts.copy(decimation = value.toDouble), tail)
      case "--help" :: tail => {
        println(help)
        sys.exit(1)
      }
      case option :: tail => {
        println(s"Unknown option ${option}")
        println(help)
        sys.exit(1)
      }
    }
  }

  def parse(args: Seq[String]) = nextOption(Options(), args)

  def apply(args: Seq[String]): Options = parse(args)
}

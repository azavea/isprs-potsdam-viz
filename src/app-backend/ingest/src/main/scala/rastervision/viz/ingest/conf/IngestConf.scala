package rastervision.viz.ingest.conf

import geotrellis.spark.io.s3.S3InputFormat

sealed trait IngestType { def key: String }
case object DSMIngestType extends IngestType { def key = "DSM" }
case object RGBIRIngestType extends IngestType { def key = "RGBIR" }
case object LabelIngestType extends IngestType { def key = "LABEL" }
case object ModelResultIngestType extends IngestType { def key = "MODELRESULT" }

object IngestType {
  def fromKey(key: String) =
    key match {
      case k if k == DSMIngestType.key => DSMIngestType
      case k if k == RGBIRIngestType.key => RGBIRIngestType
      case k if k == LabelIngestType.key => LabelIngestType
      case k if k == ModelResultIngestType.key => ModelResultIngestType
    }
}

object IngestConf {
  case class Options(
    inputPath: String = "unset",
    catalogPath: String = "unset",
    layerPrefix: String = "isprs-potsdam-labels",
    ingestType: IngestType = LabelIngestType,
    numPartitions: Option[Int] = None
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

    lazy val s3InputPath = {
      val S3InputFormat.S3UrlRx(_, _, bucket, prefix) = inputPath
      bucket -> prefix
    }

    lazy val s3CatalogPath = {
      val S3InputFormat.S3UrlRx(_, _, bucket, prefix) = catalogPath
      bucket -> prefix
    }
  }

  val help = """
               |rastervision-ingest
               |
               |Usage:
               |
               |  --inputPath <value>
               |        inputPath is a non-empty String property [default: file:///data/test/]
               |  --catalogPath <value>
               |        catalogPath is a non-empty String property [default: file:///data/catalog2]
               |  --layerPrefix <value>
               |        layerPrefix is a non-empty String property [default: elevation]
               |  --type <value>
               |        one of DEM, RGBIR, LABEL, or MODELRESULT
               |  --numPartitions
               |        number of partitions in the source RDD
               |  --help
               |        prints this usage text
             """.stripMargin

  def nextOption(opts: Options, list: Seq[String]): Options = {
    println(list.mkString("|"))
    list.toList match {
      case Nil => opts
      case "--inputPath" :: value :: tail =>
        nextOption(opts.copy(inputPath = value), tail)
      case "--catalogPath" :: value :: tail =>
        nextOption(opts.copy(catalogPath = value), tail)
      case "--layerPrefix" :: value :: tail =>
        nextOption(opts.copy(layerPrefix = value), tail)
      case "--type" :: value :: tail =>
        nextOption(opts.copy(ingestType = IngestType.fromKey(value.toUpperCase)), tail)
      case "--numPartitions" :: value :: tail =>
        nextOption(opts.copy(numPartitions = Some(value.toInt)), tail)
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

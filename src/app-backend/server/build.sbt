name := "pointcloud-server"

assemblyJarName in assembly := "pointcloud-server.jar"

libraryDependencies ++= Seq(
  "org.locationtech.geotrellis" %% "geotrellis-spark"      % Version.geotrellis,
  "org.locationtech.geotrellis" %% "geotrellis-s3"         % Version.geotrellis,
  "org.locationtech.geotrellis" %% "geotrellis-pointcloud" % Version.geotrellis,
  "com.github.blemale" %% "scaffeine" % "2.0.0",
  "com.typesafe.akka" %% "akka-actor"           % Version.akkaActor,
  "com.typesafe.akka" %% "akka-http-core"       % Version.akkaHttp,
  "com.typesafe.akka" %% "akka-http"            % Version.akkaHttp,
  "com.typesafe.akka" %% "akka-http-spray-json" % Version.akkaHttp,
  "ch.megard" %% "akka-http-cors" % "0.1.10",
  "org.apache.spark" %% "spark-core"    % Version.spark,
  "org.apache.hadoop" % "hadoop-client" % Version.hadoop,
  "org.scalatest"    %% "scalatest"     % Version.scalaTest % "test",
  "com.iheart"       %% "ficus"         % Version.ficus
)

fork in run := true

javaOptions in run += "-Xmx3G"

Revolver.settings

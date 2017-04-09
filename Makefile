include config-aws.mk # Vars related to AWS credentials and services used
include config-emr.mk # Vars related to type and size of EMR cluster
include config-run.mk # Vars related to ingest step and spark parameters

POINTCLOUD_INGEST_ASSEMBLY := src/app-backend/ingest/target/scala-2.11/pointcloud-ingest-assembly-0.1.0-SNAPHOST.jar
POINTCLOUD_SERVER_ASSEMBLY := src/app-backend/server/target/scala-2.11/pointcloud-server-assembly-0.1.0-SNAPHOST.jar
SCRIPT_RUNNER := s3://elasticmapreduce/libs/script-runner/script-runner.jar
STATIC := ./static

ifeq ($(USE_SPOT),true)
MASTER_BID_PRICE:=BidPrice=${MASTER_PRICE},
WORKER_BID_PRICE:=BidPrice=${WORKER_PRICE},
BACKEND=accumulo
endif

ifdef COLOR
COLOR_TAG=--tags Color=${COLOR}
endif

ifndef CLUSTER_ID
CLUSTER_ID=$(shell if [ -e "cluster-id-${EMR_TAG}.txt" ]; then cat cluster-id-${EMR_TAG}.txt; fi)
endif

rwildcard=$(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2) $(filter $(subst *,%,$2),$d))

${POINTCLOUD_INGEST_ASSEMBLY}: $(call rwildcard, src/app-backend/ingest/src, *.scala) src/app-backend/build.sbt
	cd src/app-backend && ./sbt ingest/assembly -no-colors
	@touch -m ${POINTCLOUD_INGEST_ASSEMBLY}

${POINTCLOUD_SERVER_ASSEMBLY}: $(call rwildcard, src/app-backend/server/src, *.scala) src/app-backend/build.sbt
	cd src/app-backend && ./sbt server/assembly -no-colors
	@touch -m ${POINTCLOUD_SERVER_ASSEMBLY}

upload-code: ${POINTCLOUD_INGEST_ASSEMBLY} ${POINTCLOUD_SERVER_ASSEMBLY} deployment/emr/*
	@aws s3 cp deployment/emr/bootstrap-pdal.sh ${S3_URI}/
	@aws s3 cp ${POINTCLOUD_INGEST_ASSEMBLY} ${S3_URI}/
	@aws s3 cp ${POINTCLOUD_SERVER_ASSEMBLY} ${S3_URI}/

load-hdfs:
	aws emr put --cluster-id ${CLUSTER_ID} --key-pair-file "${HOME}/${EC2_KEY}.pem" \
	--src scripts/load-hdfs.sh --dest /home/hadoop
	aws emr ssh --cluster-id ${CLUSTER_ID} --key-pair-file "${HOME}/${EC2_KEY}.pem" \
	--command /home/hadoop/load-hdfs.sh

load-local:
	scripts/load-local.sh

create-cluster:
	aws emr create-cluster --name "${NAME}" ${COLOR_TAG} \
--release-label emr-5.2.0 \
--output text \
--use-default-roles \
--configurations "file://$(CURDIR)/scripts/configurations.json" \
--log-uri ${S3_URI}/logs \
--ec2-attributes KeyName=${EC2_KEY},SubnetId=${SUBNET_ID} \
--applications Name=Ganglia Name=Hadoop Name=Hue Name=Spark Name=Zeppelin \
--instance-groups \
'Name=Master,${MASTER_BID_PRICE}InstanceCount=1,InstanceGroupType=MASTER,InstanceType=${MASTER_INSTANCE}' \
'Name=Workers,${WORKER_BID_PRICE}InstanceCount=${WORKER_COUNT},InstanceGroupType=CORE,InstanceType=${WORKER_INSTANCE}' \
--bootstrap-actions \
Name=BootstrapPDAL,Path=${S3_URI}/bootstrap-pdal.sh \
| tee cluster-id-${EMR_TAG}.txt

ingest-idw:
	aws emr add-steps --output text --cluster-id ${CLUSTER_ID} \
--steps Type=CUSTOM_JAR,Name="IngestIDWPyramid",Jar=command-runner.jar,Args=[\
spark-submit,--master,yarn-cluster,\
--class,com.azavea.pointcloud.ingest.IngestIDWPyramid,\
--driver-memory,${DRIVER_MEMORY},\
--driver-cores,${DRIVER_CORES},\
--executor-memory,${EXECUTOR_MEMORY},\
--executor-cores,${EXECUTOR_CORES},\
--conf,spark.driver.maxResultSize=3g,\
--conf,spark.dynamicAllocation.enabled=true,\
--conf,spark.yarn.executor.memoryOverhead=${YARN_OVERHEAD},\
--conf,spark.yarn.driver.memoryOverhead=${YARN_OVERHEAD},\
${S3_URI}/pointcloud-ingest-assembly-0.1.0-SNAPHOST.jar,\
--inputPath,/data/test/SHCZO_Jul10/,\
--inputCrs,'+proj=utm +zone=18 +datum=NAD83 +units=m +no_defs',\
--numPartitions,50000,\
--persist,false,\
--pyramid,false,\
--zoomed,false\
] | cut -f2 | tee last-step-id.txt

ingest-idw-jul10:
	aws emr add-steps --output text --cluster-id ${CLUSTER_ID} \
--steps Type=CUSTOM_JAR,Name="IngestIDWPyramid",Jar=command-runner.jar,Args=[\
spark-submit,--master,yarn-cluster,\
--class,com.azavea.pointcloud.ingest.IngestIDWPyramid,\
--driver-memory,${DRIVER_MEMORY},\
--driver-cores,${DRIVER_CORES},\
--executor-memory,${EXECUTOR_MEMORY},\
--executor-cores,${EXECUTOR_CORES},\
--conf,spark.driver.maxResultSize=3g,\
--conf,spark.dynamicAllocation.enabled=true,\
--conf,spark.yarn.executor.memoryOverhead=${YARN_OVERHEAD},\
--conf,spark.yarn.driver.memoryOverhead=${YARN_OVERHEAD},\
${S3_URI}/pointcloud-ingest-assembly-0.1.0-SNAPHOST.jar,\
--inputPath,${S3_POINTCLOUD_PATH}/JRB_10_Jul_subset/,\
--catalogPath,${S3_CATALOG},\
--inputCrs,'+proj=utm +zone=13 +datum=NAD83 +units=m +no_defs',\
--layerName,jul10idw,\
--numPartitions,5000,\
--persist,true,\
--pyramid,true,\
--zoomed,true\
] | cut -f2 | tee last-step-id.txt

ingest-idw-mar10:
	aws emr add-steps --output text --cluster-id ${CLUSTER_ID} \
--steps Type=CUSTOM_JAR,Name="IngestIDWPyramid",Jar=command-runner.jar,Args=[\
spark-submit,--master,yarn-cluster,\
--class,com.azavea.pointcloud.ingest.IngestIDWPyramid,\
--driver-memory,${DRIVER_MEMORY},\
--driver-cores,${DRIVER_CORES},\
--executor-memory,${EXECUTOR_MEMORY},\
--executor-cores,${EXECUTOR_CORES},\
--conf,spark.driver.maxResultSize=3g,\
--conf,spark.dynamicAllocation.enabled=true,\
--conf,spark.yarn.executor.memoryOverhead=${YARN_OVERHEAD},\
--conf,spark.yarn.driver.memoryOverhead=${YARN_OVERHEAD},\
${S3_URI}/pointcloud-ingest-assembly-0.1.0-SNAPHOST.jar,\
--inputPath,${S3_POINTCLOUD_PATH}/JRB_10_Mar_subset/,\
--catalogPath,${S3_CATALOG},\
--inputCrs,'+proj=utm +zone=13 +datum=NAD83 +units=m +no_defs',\
--layerName,mar10idw,\
--numPartitions,5000,\
--persist,true,\
--pyramid,true,\
--zoomed,true\
] | cut -f2 | tee last-step-id.txt

ingest-tin:
	aws emr add-steps --output text --cluster-id ${CLUSTER_ID} \
--steps Type=CUSTOM_JAR,Name="IngestTINPyramid",Jar=command-runner.jar,Args=[\
spark-submit,--master,yarn-cluster,\
--class,com.azavea.pointcloud.ingest.IngestTINPyramid,\
--driver-memory,${DRIVER_MEMORY},\
--driver-cores,${DRIVER_CORES},\
--executor-memory,${EXECUTOR_MEMORY},\
--executor-cores,${EXECUTOR_CORES},\
--conf,spark.dynamicAllocation.enabled=true,\
--conf,spark.yarn.executor.memoryOverhead=${YARN_OVERHEAD},\
--conf,spark.yarn.driver.memoryOverhead=${YARN_OVERHEAD},\
${S3_URI}/pointcloud-ingest-assembly-0.1.0-SNAPHOST.jar,\
--inputPath,${POINTCLOUD_PATH},\
--inputCrs,'EPSG:20255',\
--maxValue,400\
] | cut -f2 | tee last-step-id.txt

ingest-tin-jul10:
	aws emr add-steps --output text --cluster-id ${CLUSTER_ID} \
--steps Type=CUSTOM_JAR,Name="IngestTINPyramid",Jar=command-runner.jar,Args=[\
spark-submit,--master,yarn-cluster,\
--class,com.azavea.pointcloud.ingest.IngestTINPyramid,\
--driver-memory,${DRIVER_MEMORY},\
--driver-cores,${DRIVER_CORES},\
--executor-memory,${EXECUTOR_MEMORY},\
--executor-cores,${EXECUTOR_CORES},\
--conf,spark.dynamicAllocation.enabled=false,\
--conf,spark.executor.instances=${EXECUTOR_COUNT},\
--conf,spark.yarn.executor.memoryOverhead=${YARN_OVERHEAD},\
--conf,spark.yarn.driver.memoryOverhead=${YARN_OVERHEAD},\
${S3_URI}/pointcloud-ingest-assembly-0.1.0-SNAPHOST.jar,\
--inputPath,${S3_POINTCLOUD_PATH}/JRB_10_Jul_subset/,\
--catalogPath,${S3_CATALOG},\
--inputCrs,'+proj=utm +zone=13 +datum=NAD83 +units=m +no_defs',\
--layerName,jul10tin,\
--numPartitions,${PARTITION_COUNT},\
--persist,true,\
--pyramid,true,\
--zoomed,true\
] | cut -f2 | tee last-step-id.txt

ingest-tin-mar10:
	aws emr add-steps --output text --cluster-id ${CLUSTER_ID} \
--steps Type=CUSTOM_JAR,Name="IngestTINPyramid",Jar=command-runner.jar,Args=[\
spark-submit,--master,yarn-cluster,\
--class,com.azavea.pointcloud.ingest.IngestTINPyramid,\
--driver-memory,${DRIVER_MEMORY},\
--driver-cores,${DRIVER_CORES},\
--executor-memory,${EXECUTOR_MEMORY},\
--executor-cores,${EXECUTOR_CORES},\
--conf,spark.dynamicAllocation.enabled=false,\
--conf,spark.executor.instances=${EXECUTOR_COUNT},\
--conf,spark.yarn.executor.memoryOverhead=${YARN_OVERHEAD},\
--conf,spark.yarn.driver.memoryOverhead=${YARN_OVERHEAD},\
${S3_URI}/pointcloud-ingest-assembly-0.1.0-SNAPHOST.jar,\
--inputPath,${S3_POINTCLOUD_PATH}/JRB_10_Mar_subset/,\
--catalogPath,${S3_CATALOG},\
--inputCrs,'+proj=utm +zone=13 +datum=NAD83 +units=m +no_defs',\
--layerName,mar10tin,\
--numPartitions,${PARTITION_COUNT},\
--persist,true,\
--pyramid,true,\
--zoomed,true\
] | cut -f2 | tee last-step-id.txt

ingest-tin-to-file:
	aws emr add-steps --output text --cluster-id ${CLUSTER_ID} \
--steps Type=CUSTOM_JAR,Name="IngestTINPyramid",Jar=command-runner.jar,Args=[\
spark-submit,--master,yarn-cluster,\
--class,com.azavea.pointcloud.ingest.IngestTINPyramid,\
--driver-memory,${DRIVER_MEMORY},\
--driver-cores,${DRIVER_CORES},\
--executor-memory,${EXECUTOR_MEMORY},\
--executor-cores,${EXECUTOR_CORES},\
--conf,spark.dynamicAllocation.enabled=true,\
--conf,spark.yarn.executor.memoryOverhead=${YARN_OVERHEAD},\
--conf,spark.yarn.driver.memoryOverhead=${YARN_OVERHEAD},\
${S3_URI}/pointcloud-ingest-assembly-0.1.0-SNAPHOST.jar,\
--inputPath,${POINTCLOUD_PATH},\
--inputCrs,'EPSG:20255',\
--persist,false,\
--pyramid,false,\
--zoomed,false,\
--testOutput,/tmp/test33.tif,\
--maxValue,400\
] | cut -f2 | tee last-step-id.txt

ingest-pc:
	aws emr add-steps --output text --cluster-id ${CLUSTER_ID} \
--steps Type=CUSTOM_JAR,Name="IngestPC",Jar=command-runner.jar,Args=[\
spark-submit,--master,yarn-cluster,\
--class,com.azavea.pointcloud.ingest.IngestPC,\
--driver-memory,${DRIVER_MEMORY},\
--driver-cores,${DRIVER_CORES},\
--executor-memory,${EXECUTOR_MEMORY},\
--executor-cores,${EXECUTOR_CORES},\
--conf,spark.dynamicAllocation.enabled=true,\
--conf,spark.yarn.executor.memoryOverhead=${YARN_OVERHEAD},\
--conf,spark.yarn.driver.memoryOverhead=${YARN_OVERHEAD},\
${S3_URI}/pointcloud-ingest-assembly-0.1.0-SNAPHOST.jar,\
--inputPath,${POINTCLOUD_PATH},\
--inputCrs,'+proj=utm +zone=13 +datum=NAD83 +units=m +no_defs'\
] | cut -f2 | tee last-step-id.txt

ingest-pc-mar10:
	aws emr add-steps --output text --cluster-id ${CLUSTER_ID} \
--steps Type=CUSTOM_JAR,Name="IngestPC",Jar=command-runner.jar,Args=[\
spark-submit,--master,yarn-cluster,\
--class,com.azavea.pointcloud.ingest.IngestPC,\
--driver-memory,${DRIVER_MEMORY},\
--driver-cores,${DRIVER_CORES},\
--executor-memory,${EXECUTOR_MEMORY},\
--executor-cores,${EXECUTOR_CORES},\
--conf,spark.dynamicAllocation.enabled=true,\
--conf,spark.yarn.executor.memoryOverhead=${YARN_OVERHEAD},\
--conf,spark.yarn.driver.memoryOverhead=${YARN_OVERHEAD},\
${S3_URI}/pointcloud-ingest-assembly-0.1.0-SNAPHOST.jar,\
--inputPath,${S3_POINTCLOUD_PATH}/JRB_10_Mar_subset/,\
--catalogPath,${S3_CATALOG},\
--inputCrs,'+proj=utm +zone=13 +datum=NAD83 +units=m +no_defs',\
--layerName,mar10pc,\
--numPartitions,5000\
] | cut -f2 | tee last-step-id.txt

ingest-pc-jul10:
	aws emr add-steps --output text --cluster-id ${CLUSTER_ID} \
--steps Type=CUSTOM_JAR,Name="IngestPC",Jar=command-runner.jar,Args=[\
spark-submit,--master,yarn-cluster,\
--class,com.azavea.pointcloud.ingest.IngestPC,\
--driver-memory,${DRIVER_MEMORY},\
--driver-cores,${DRIVER_CORES},\
--executor-memory,${EXECUTOR_MEMORY},\
--executor-cores,${EXECUTOR_CORES},\
--conf,spark.dynamicAllocation.enabled=true,\
--conf,spark.yarn.executor.memoryOverhead=${YARN_OVERHEAD},\
--conf,spark.yarn.driver.memoryOverhead=${YARN_OVERHEAD},\
${S3_URI}/pointcloud-ingest-assembly-0.1.0-SNAPHOST.jar,\
--inputPath,${S3_POINTCLOUD_PATH}/JRB_10_Jul_subset/,\
--catalogPath,${S3_CATALOG},\
--inputCrs,'+proj=utm +zone=13 +datum=NAD83 +units=m +no_defs',\
--layerName,jul10pc,\
--numPartitions,5000\
] | cut -f2 | tee last-step-id.txt

ingest-pc-mar10-pyramid:
	aws emr add-steps --output text --cluster-id ${CLUSTER_ID} \
--steps Type=CUSTOM_JAR,Name="IngestPCPyramid",Jar=command-runner.jar,Args=[\
spark-submit,--master,yarn-cluster,\
--class,com.azavea.pointcloud.ingest.IngestPCPyramid,\
--driver-memory,${DRIVER_MEMORY},\
--driver-cores,${DRIVER_CORES},\
--executor-memory,${EXECUTOR_MEMORY},\
--executor-cores,${EXECUTOR_CORES},\
--conf,spark.dynamicAllocation.enabled=true,\
--conf,spark.yarn.executor.memoryOverhead=${YARN_OVERHEAD},\
--conf,spark.yarn.driver.memoryOverhead=${YARN_OVERHEAD},\
--conf,spark.driver.extraJavaOptions='-XX:MaxJavaStackTraceDepth=-1',\
--conf,spark.executor.extraJavaOptions='-XX:MaxJavaStackTraceDepth=-1',\
${S3_URI}/pointcloud-ingest-assembly-0.1.0-SNAPHOST.jar,\
--inputPath,${S3_POINTCLOUD_PATH}/JRB_10_Mar_subset/,\
--catalogPath,${S3_CATALOG},\
--inputCrs,'+proj=utm +zone=13 +datum=NAD83 +units=m +no_defs',\
--layerName,mar10pcpyr,\
--numPartitions,50000,\
--persist,true,\
--pyramid,true,\
--zoomed,true\
] | cut -f2 | tee last-step-id.txt

ingest-pc-jul10-pyramid:
	aws emr add-steps --output text --cluster-id ${CLUSTER_ID} \
--steps Type=CUSTOM_JAR,Name="IngestPCPyramid",Jar=command-runner.jar,Args=[\
spark-submit,--master,yarn-cluster,\
--class,com.azavea.pointcloud.ingest.IngestPCPyramid,\
--driver-memory,${DRIVER_MEMORY},\
--driver-cores,${DRIVER_CORES},\
--executor-memory,${EXECUTOR_MEMORY},\
--executor-cores,${EXECUTOR_CORES},\
--conf,spark.dynamicAllocation.enabled=true,\
--conf,spark.yarn.executor.memoryOverhead=${YARN_OVERHEAD},\
--conf,spark.yarn.driver.memoryOverhead=${YARN_OVERHEAD},\
${S3_URI}/pointcloud-ingest-assembly-0.1.0-SNAPHOST.jar,\
--inputPath,${S3_POINTCLOUD_PATH}/JRB_10_Jul_subset/,\
--catalogPath,${S3_CATALOG},\
--inputCrs,'+proj=utm +zone=13 +datum=NAD83 +units=m +no_defs',\
--layerName,jul10pcpyr,\
--numPartitions,50000,\
--persist,true,\
--pyramid,true,\
--zoomed,true\
] | cut -f2 | tee last-step-id.txt

run-server: ${POINTCLOUD_SERVER_ASSEMBLY}
	aws emr put --cluster-id ${CLUSTER_ID} --key-pair-file "${HOME}/${EC2_KEY}.pem" \
	--src ${STATIC} --dest /tmp
	aws emr put --cluster-id ${CLUSTER_ID} --key-pair-file "${HOME}/${EC2_KEY}.pem" \
	--src ${POINTCLOUD_SERVER_ASSEMBLY} --dest /tmp
	aws emr put --cluster-id ${CLUSTER_ID} --key-pair-file "${HOME}/${EC2_KEY}.pem" \
	--src scripts/run-server.sh --dest /tmp
	aws emr ssh --cluster-id ${CLUSTER_ID} --key-pair-file "${HOME}/${EC2_KEY}.pem" \
	--command /tmp/run-server.sh

wait: INTERVAL:=60
wait: STEP_ID=$(shell cat last-step-id.txt)
wait:
	@while (true); do \
	OUT=$$(aws emr describe-step --cluster-id ${CLUSTER_ID} --step-id ${STEP_ID}); \
	[[ $$OUT =~ (\"State\": \"([A-Z]+)\") ]]; \
	echo $${BASH_REMATCH[2]}; \
	case $${BASH_REMATCH[2]} in \
			PENDING | RUNNING) sleep ${INTERVAL};; \
			COMPLETED) exit 0;; \
			*) exit 1;; \
	esac; \
	done

terminate-cluster:
	aws emr terminate-clusters --cluster-ids ${CLUSTER_ID}
	rm -f cluster-id.txt
	rm -f last-step-id.txt

clean:
	./sbt clean -no-colors

proxy:
	aws emr socks --cluster-id ${CLUSTER_ID} --key-pair-file "${HOME}/${EC2_KEY}.pem"

ssh:
	aws emr ssh --cluster-id ${CLUSTER_ID} --key-pair-file "${HOME}/${EC2_KEY}.pem"

local-ingest-idw: ${POINTCLOUD_INGEST_ASSEMBLY}
	spark-submit --name "IDW Ingest ${NAME}" --master "local[4]" --driver-memory 4G --class com.azavea.pointcloud.ingest.IngestIDWPyramid \
	--conf spark.driver.extraJavaOptions="-Djava.library.path=/usr/local/lib" \
	--conf spark.executor.extraJavaOptions="-Djava.library.path=/usr/local/lib" \
	${POINTCLOUD_INGEST_ASSEMBLY} \
	--inputPath ${LOCAL_POINTCLOUD_PATH} \
	--catalogPath ${LOCAL_CATALOG} \
	--inputCrs '+proj=utm +zone=13 +datum=NAD83 +units=m +no_defs'

local-ingest-tin: ${POINTCLOUD_INGEST_ASSEMBLY}
	spark-submit --name "TIN Ingest ${NAME}" --master "local[4]" --driver-memory 4G --class com.azavea.pointcloud.ingest.IngestTINPyramid \
	--conf spark.driver.extraJavaOptions="-Djava.library.path=/usr/local/lib" \
	--conf spark.executor.extraJavaOptions="-Djava.library.path=/usr/local/lib" \
	${POINTCLOUD_INGEST_ASSEMBLY} \
	--inputPath ${LOCAL_POINTCLOUD_PATH} \
	--catalogPath ${LOCAL_CATALOG} \
	--inputCrs '+proj=utm +zone=13 +datum=NAD83 +units=m +no_defs'

local-webui-py3:
	cd static; python -m http.server 8000

local-webui-py2:
	cd static; python -m SimpleHTTPServer 8000

local-run-server: ${POINTCLOUD_SERVER_ASSEMBLY}
	spark-submit --name "IDW Ingest ${NAME}" --master "local[4]" --driver-memory 4G --class com.azavea.server.Main \
	${POINTCLOUD_SERVER_ASSEMBLY}

get-logs:
	@aws emr ssh --cluster-id $(CLUSTER_ID) --key-pair-file "${HOME}/${EC2_KEY}.pem" \
		--command "rm -rf /tmp/spark-logs && hdfs dfs -copyToLocal /var/log/spark/apps /tmp/spark-logs"
	@mkdir -p  logs/$(CLUSTER_ID)
	@aws emr get --cluster-id $(CLUSTER_ID) --key-pair-file "${HOME}/${EC2_KEY}.pem" --src "/tmp/spark-logs/" --dest logs/$(CLUSTER_ID)

.PHONY: local-ingest ingest local-tile-server update-route53 get-logs

include config-aws.mk # Vars related to AWS credentials and services used
include config-emr.mk # Vars related to type and size of EMR cluster
include config-run.mk # Vars related to ingest step and spark parameters

RVVIZ_INGEST_ASSEMBLY_NAME := rv-ingest.jar
RVVIZ_INGEST_ASSEMBLY := src/app-backend/ingest/target/scala-2.11/${RVVIZ_INGEST_ASSEMBLY_NAME}

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

${RVVIZ_INGEST_ASSEMBLY}: $(call rwildcard, src/app-backend/ingest/src, *.scala) src/app-backend/build.sbt
	cd src/app-backend && ./sbt ingest/assembly -no-colors
	@touch -m ${RVVIZ_INGEST_ASSEMBLY}

upload-code: ${RVVIZ_INGEST_ASSEMBLY} ${RVVIZ_SERVER_ASSEMBLY} deployment/emr/*
	@aws s3 cp ${RVVIZ_INGEST_ASSEMBLY} ${S3_URI}/

load-local:
	scripts/load_development_data.sh

create-cluster:
	aws emr create-cluster --name "${NAME}" ${COLOR_TAG} \
--release-label emr-5.4.0 \
--output text \
--use-default-roles \
--configurations "file://$(CURDIR)/deployment/emr/configurations.json" \
--log-uri ${S3_URI}/logs \
--ec2-attributes KeyName=${EC2_KEY},SubnetId=${SUBNET_ID} \
--applications Name=Ganglia Name=Hadoop Name=Hue Name=Spark Name=Zeppelin \
--instance-groups \
'Name=Master,${MASTER_BID_PRICE}InstanceCount=1,InstanceGroupType=MASTER,InstanceType=${MASTER_INSTANCE}' \
'Name=Workers,${WORKER_BID_PRICE}InstanceCount=${WORKER_COUNT},InstanceGroupType=CORE,InstanceType=${WORKER_INSTANCE}' \
| tee cluster-id-${EMR_TAG}.txt

ingest-dsm:
	aws emr add-steps --output text --cluster-id ${CLUSTER_ID} \
--steps Type=CUSTOM_JAR,Name="IngestDEM",Jar=command-runner.jar,Args=[\
spark-submit,--master,yarn-cluster,\
--class,rastervision.viz.ingest.Ingest,\
--driver-memory,${DRIVER_MEMORY},\
--driver-cores,${DRIVER_CORES},\
--executor-memory,${EXECUTOR_MEMORY},\
--executor-cores,${EXECUTOR_CORES},\
--conf,spark.driver.maxResultSize=3g,\
--conf,spark.dynamicAllocation.enabled=true,\
--conf,spark.yarn.executor.memoryOverhead=${YARN_OVERHEAD},\
--conf,spark.yarn.driver.memoryOverhead=${YARN_OVERHEAD},\
${S3_URI}/${RVVIZ_INGEST_ASSEMBLY_NAME},\
--inputPath,${INPUT_DSM},\
--catalogPath,${S3_CATALOG},\
--layerPrefix,"isprs-potsdam-dsm",\
--type,"DSM",\
--numPartitions,2000\
] | cut -f2 | tee last-step-id.txt

ingest-dsm-gt:
	aws emr add-steps --output text --cluster-id ${CLUSTER_ID} \
--steps Type=CUSTOM_JAR,Name="IngestDEM",Jar=command-runner.jar,Args=[\
spark-submit,--master,yarn-cluster,\
--class,rastervision.viz.ingest.Ingest,\
--driver-memory,${DRIVER_MEMORY},\
--driver-cores,${DRIVER_CORES},\
--executor-memory,${EXECUTOR_MEMORY},\
--executor-cores,${EXECUTOR_CORES},\
--conf,spark.driver.maxResultSize=3g,\
--conf,spark.dynamicAllocation.enabled=true,\
--conf,spark.yarn.executor.memoryOverhead=${YARN_OVERHEAD},\
--conf,spark.yarn.driver.memoryOverhead=${YARN_OVERHEAD},\
${S3_URI}/${RVVIZ_INGEST_ASSEMBLY_NAME},\
--inputPath,${INPUT_DSMGT},\
--catalogPath,${S3_CATALOG},\
--layerPrefix,"isprs-potsdam-dsm-gt",\
--type,"DSM",\
--numPartitions,2000\
] | cut -f2 | tee last-step-id.txt

ingest-dsm-gtn:
	aws emr add-steps --output text --cluster-id ${CLUSTER_ID} \
--steps Type=CUSTOM_JAR,Name="IngestDEM",Jar=command-runner.jar,Args=[\
spark-submit,--master,yarn-cluster,\
--class,rastervision.viz.ingest.Ingest,\
--driver-memory,${DRIVER_MEMORY},\
--driver-cores,${DRIVER_CORES},\
--executor-memory,${EXECUTOR_MEMORY},\
--executor-cores,${EXECUTOR_CORES},\
--conf,spark.driver.maxResultSize=3g,\
--conf,spark.dynamicAllocation.enabled=true,\
--conf,spark.yarn.executor.memoryOverhead=${YARN_OVERHEAD},\
--conf,spark.yarn.driver.memoryOverhead=${YARN_OVERHEAD},\
${S3_URI}/${RVVIZ_INGEST_ASSEMBLY_NAME},\
--inputPath,${INPUT_DSMGTN},\
--catalogPath,${S3_CATALOG},\
--layerPrefix,"isprs-potsdam-dsm-gtn",\
--type,"DSM",\
--numPartitions,2000\
] | cut -f2 | tee last-step-id.txt

ingest-dsm-v2:
	aws emr add-steps --output text --cluster-id ${CLUSTER_ID} \
--steps Type=CUSTOM_JAR,Name="IngestDEM",Jar=command-runner.jar,Args=[\
spark-submit,--master,yarn-cluster,\
--class,rastervision.viz.ingest.Ingest,\
--driver-memory,${DRIVER_MEMORY},\
--driver-cores,${DRIVER_CORES},\
--executor-memory,${EXECUTOR_MEMORY},\
--executor-cores,${EXECUTOR_CORES},\
--conf,spark.driver.maxResultSize=3g,\
--conf,spark.dynamicAllocation.enabled=true,\
--conf,spark.yarn.executor.memoryOverhead=${YARN_OVERHEAD},\
--conf,spark.yarn.driver.memoryOverhead=${YARN_OVERHEAD},\
${S3_URI}/${RVVIZ_INGEST_ASSEMBLY_NAME},\
--inputPath,${INPUT_DSMV2},\
--catalogPath,${S3_CATALOG},\
--layerPrefix,"isprs-potsdam-dsm-v2",\
--type,"DSM",\
--numPartitions,2000\
] | cut -f2 | tee last-step-id.txt


ingest-rgbir:
	aws emr add-steps --output text --cluster-id ${CLUSTER_ID} \
--steps Type=CUSTOM_JAR,Name="IngestRGBIR",Jar=command-runner.jar,Args=[\
spark-submit,--master,yarn-cluster,\
--class,rastervision.viz.ingest.Ingest,\
--driver-memory,${DRIVER_MEMORY},\
--driver-cores,${DRIVER_CORES},\
--executor-memory,${EXECUTOR_MEMORY},\
--executor-cores,${EXECUTOR_CORES},\
--conf,spark.driver.maxResultSize=3g,\
--conf,spark.dynamicAllocation.enabled=true,\
--conf,spark.yarn.executor.memoryOverhead=${YARN_OVERHEAD},\
--conf,spark.yarn.driver.memoryOverhead=${YARN_OVERHEAD},\
${S3_URI}/${RVVIZ_INGEST_ASSEMBLY_NAME},\
--inputPath,${INPUT_RGBIR},\
--catalogPath,${S3_CATALOG},\
--layerPrefix,"isprs-potsdam-imagery",\
--type,"RGBIR",\
--numPartitions,2000\
] | cut -f2 | tee last-step-id.txt

ingest-labels:
	aws emr add-steps --output text --cluster-id ${CLUSTER_ID} \
--steps Type=CUSTOM_JAR,Name="IngestLabels",Jar=command-runner.jar,Args=[\
spark-submit,--master,yarn-cluster,\
--class,rastervision.viz.ingest.Ingest,\
--driver-memory,${DRIVER_MEMORY},\
--driver-cores,${DRIVER_CORES},\
--executor-memory,${EXECUTOR_MEMORY},\
--executor-cores,${EXECUTOR_CORES},\
--conf,spark.driver.maxResultSize=3g,\
--conf,spark.dynamicAllocation.enabled=true,\
--conf,spark.yarn.executor.memoryOverhead=${YARN_OVERHEAD},\
--conf,spark.yarn.driver.memoryOverhead=${YARN_OVERHEAD},\
${S3_URI}/${RVVIZ_INGEST_ASSEMBLY_NAME},\
--inputPath,${INPUT_LABEL},\
--catalogPath,${S3_CATALOG},\
--layerPrefix,"isprs-potsdam-labels",\
--type,"LABEL",\
--numPartitions,2000\
] | cut -f2 | tee last-step-id.txt

ingest-fcn:
	aws emr add-steps --output text --cluster-id ${CLUSTER_ID} \
--steps Type=CUSTOM_JAR,Name="IngestFCN",Jar=command-runner.jar,Args=[\
spark-submit,--master,yarn-cluster,\
--class,rastervision.viz.ingest.Ingest,\
--driver-memory,${DRIVER_MEMORY},\
--driver-cores,${DRIVER_CORES},\
--executor-memory,${EXECUTOR_MEMORY},\
--executor-cores,${EXECUTOR_CORES},\
--conf,spark.driver.maxResultSize=3g,\
--conf,spark.dynamicAllocation.enabled=true,\
--conf,spark.yarn.executor.memoryOverhead=${YARN_OVERHEAD},\
--conf,spark.yarn.driver.memoryOverhead=${YARN_OVERHEAD},\
${S3_URI}/${RVVIZ_INGEST_ASSEMBLY_NAME},\
--inputPath,${INPUT_RESULT_FCN},\
--catalogPath,${S3_CATALOG},\
--layerPrefix,"isprs-potsdam-fcn",\
--type,"MODELRESULT",\
--numPartitions,5000\
] | cut -f2 | tee last-step-id.txt

ingest-unet:
	aws emr add-steps --output text --cluster-id ${CLUSTER_ID} \
--steps Type=CUSTOM_JAR,Name="IngestUNET",Jar=command-runner.jar,Args=[\
spark-submit,--master,yarn-cluster,\
--class,rastervision.viz.ingest.Ingest,\
--driver-memory,${DRIVER_MEMORY},\
--driver-cores,${DRIVER_CORES},\
--executor-memory,${EXECUTOR_MEMORY},\
--executor-cores,${EXECUTOR_CORES},\
--conf,spark.driver.maxResultSize=3g,\
--conf,spark.dynamicAllocation.enabled=true,\
--conf,spark.yarn.executor.memoryOverhead=${YARN_OVERHEAD},\
--conf,spark.yarn.driver.memoryOverhead=${YARN_OVERHEAD},\
${S3_URI}/${RVVIZ_INGEST_ASSEMBLY_NAME},\
--inputPath,${INPUT_RESULT_UNET},\
--catalogPath,${S3_CATALOG},\
--layerPrefix,"isprs-potsdam-unet",\
--type,"MODELRESULT",\
--numPartitions,5000\
] | cut -f2 | tee last-step-id.txt

ingest-fcndsm:
	aws emr add-steps --output text --cluster-id ${CLUSTER_ID} \
--steps Type=CUSTOM_JAR,Name="IngestFCN",Jar=command-runner.jar,Args=[\
spark-submit,--master,yarn-cluster,\
--class,rastervision.viz.ingest.Ingest,\
--driver-memory,${DRIVER_MEMORY},\
--driver-cores,${DRIVER_CORES},\
--executor-memory,${EXECUTOR_MEMORY},\
--executor-cores,${EXECUTOR_CORES},\
--conf,spark.driver.maxResultSize=3g,\
--conf,spark.dynamicAllocation.enabled=true,\
--conf,spark.yarn.executor.memoryOverhead=${YARN_OVERHEAD},\
--conf,spark.yarn.driver.memoryOverhead=${YARN_OVERHEAD},\
${S3_URI}/${RVVIZ_INGEST_ASSEMBLY_NAME},\
--inputPath,${INPUT_RESULT_FCNDSM},\
--catalogPath,${S3_CATALOG},\
--layerPrefix,"isprs-potsdam-fcndsm",\
--type,"MODELRESULT",\
--numPartitions,5000\
] | cut -f2 | tee last-step-id.txt

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

local-ingest-all: local-ingest-dsm local-ingest-dsm-gt local-ingest-rgbir local-ingest-labels local-ingest-fcn local-ingest-unet
	@echo ${LOCAL_CATALOG}

local-ingest-dsm: ${RVVIZ_INGEST_ASSEMBLY}
	spark-submit --name "DEM Ingest ${NAME}" --master "local[4]" --driver-memory 4G --class rastervision.viz.ingest.Ingest \
	--conf spark.driver.extraJavaOptions="-Djava.library.path=/usr/local/lib" \
	--conf spark.executor.extraJavaOptions="-Djava.library.path=/usr/local/lib" \
	${RVVIZ_INGEST_ASSEMBLY} \
	--inputPath ${LOCAL_DSM_PATH} \
	--catalogPath ${LOCAL_CATALOG} \
	--layerPrefix "isprs-potsdam-dsm" \
	--numPartitions 50 \
	--type "DSM"

local-ingest-dsm-gt: ${RVVIZ_INGEST_ASSEMBLY}
	spark-submit --name "DEM Ingest ${NAME}" --master "local[4]" --driver-memory 4G --class rastervision.viz.ingest.Ingest \
	--conf spark.driver.extraJavaOptions="-Djava.library.path=/usr/local/lib" \
	--conf spark.executor.extraJavaOptions="-Djava.library.path=/usr/local/lib" \
	${RVVIZ_INGEST_ASSEMBLY} \
	--inputPath ${LOCAL_DSMGT_PATH} \
	--catalogPath ${LOCAL_CATALOG} \
	--layerPrefix "isprs-potsdam-dsm-gt" \
	--numPartitions 50 \
	--type "DSM"

local-ingest-dsm-gtn: ${RVVIZ_INGEST_ASSEMBLY}
	spark-submit --name "DEM Ingest ${NAME}" --master "local[4]" --driver-memory 4G --class rastervision.viz.ingest.Ingest \
	--conf spark.driver.extraJavaOptions="-Djava.library.path=/usr/local/lib" \
	--conf spark.executor.extraJavaOptions="-Djava.library.path=/usr/local/lib" \
	${RVVIZ_INGEST_ASSEMBLY} \
	--inputPath ${LOCAL_DSMGTN_PATH} \
	--catalogPath ${LOCAL_CATALOG} \
	--layerPrefix "isprs-potsdam-dsm-gtn" \
	--numPartitions 50 \
	--type "DSM"

local-ingest-rgbir: ${RVVIZ_INGEST_ASSEMBLY}
	spark-submit --name "RGBIR Ingest ${NAME}" --master "local[4]" --driver-memory 4G --class rastervision.viz.ingest.Ingest \
	--conf spark.driver.extraJavaOptions="-Djava.library.path=/usr/local/lib" \
	--conf spark.executor.extraJavaOptions="-Djava.library.path=/usr/local/lib" \
	${RVVIZ_INGEST_ASSEMBLY} \
	--inputPath ${LOCAL_RGBIR_PATH} \
	--catalogPath ${LOCAL_CATALOG} \
	--layerPrefix "isprs-potsdam-imagery" \
	--numPartitions 50 \
	--type "RGBIR"

local-ingest-labels: ${RVVIZ_INGEST_ASSEMBLY}
	spark-submit --name "Label Ingest ${NAME}" --master "local[4]" --driver-memory 4G --class rastervision.viz.ingest.Ingest \
	--conf spark.driver.extraJavaOptions="-Djava.library.path=/usr/local/lib" \
	--conf spark.executor.extraJavaOptions="-Djava.library.path=/usr/local/lib" \
	${RVVIZ_INGEST_ASSEMBLY} \
	--inputPath ${LOCAL_LABEL_PATH} \
	--catalogPath ${LOCAL_CATALOG} \
	--layerPrefix "isprs-potsdam-labels" \
	--numPartitions 50 \
	--type "LABEL"

local-ingest-fcn: ${RVVIZ_INGEST_ASSEMBLY}
	spark-submit --name "FCN Ingest ${NAME}" --master "local[4]" --driver-memory 4G --class rastervision.viz.ingest.Ingest \
	--conf spark.driver.extraJavaOptions="-Djava.library.path=/usr/local/lib" \
	--conf spark.executor.extraJavaOptions="-Djava.library.path=/usr/local/lib" \
	${RVVIZ_INGEST_ASSEMBLY} \
	--inputPath ${LOCAL_FCN_PATH} \
	--catalogPath ${LOCAL_CATALOG} \
	--layerPrefix "isprs-potsdam-fcn" \
	--numPartitions 50 \
	--type "MODELRESULT"

local-ingest-fcndsm: ${RVVIZ_INGEST_ASSEMBLY}
	spark-submit --name "FCN Ingest ${NAME}" --master "local[4]" --driver-memory 4G --class rastervision.viz.ingest.Ingest \
	--conf spark.driver.extraJavaOptions="-Djava.library.path=/usr/local/lib" \
	--conf spark.executor.extraJavaOptions="-Djava.library.path=/usr/local/lib" \
	${RVVIZ_INGEST_ASSEMBLY} \
	--inputPath ${LOCAL_FCNDSM_PATH} \
	--catalogPath ${LOCAL_CATALOG} \
	--layerPrefix "isprs-potsdam-fcndsm" \
	--numPartitions 50 \
	--type "MODELRESULT"

local-ingest-unet: ${RVVIZ_INGEST_ASSEMBLY}
	spark-submit --name "UNET Ingest ${NAME}" --master "local[4]" --driver-memory 4G --class rastervision.viz.ingest.Ingest \
	--conf spark.driver.extraJavaOptions="-Djava.library.path=/usr/local/lib" \
	--conf spark.executor.extraJavaOptions="-Djava.library.path=/usr/local/lib" \
	${RVVIZ_INGEST_ASSEMBLY} \
	--inputPath ${LOCAL_UNET_PATH} \
	--catalogPath ${LOCAL_CATALOG} \
	--layerPrefix "isprs-potsdam-unet" \
	--numPartitions 50 \
	--type "MODELRESULT"

get-logs:
	@aws emr ssh --cluster-id $(CLUSTER_ID) --key-pair-file "${HOME}/${EC2_KEY}.pem" \
		--command "rm -rf /tmp/spark-logs && hdfs dfs -copyToLocal /var/log/spark/apps /tmp/spark-logs"
	@mkdir -p  logs/$(CLUSTER_ID)
	@aws emr get --cluster-id $(CLUSTER_ID) --key-pair-file "${HOME}/${EC2_KEY}.pem" --src "/tmp/spark-logs/" --dest logs/$(CLUSTER_ID)

.PHONY: local-ingest ingest get-logs

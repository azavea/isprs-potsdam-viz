# Query parameters
export DRIVER_MEMORY := 20000M
export DRIVER_CORES := 8
export EXECUTOR_MEMORY := 8400M
export EXECUTOR_CORES := 2
export YARN_OVERHEAD := 300
export EXECUTOR_COUNT := 80
export PARTITION_COUNT := 60000
export POINTCLOUD_PATH := /data/test/a
export LOCAL_POINTCLOUD_PATH := file:///${PWD}/data/raw
export LOCAL_CATALOG := file:///${PWD}/data/catalog/
export S3_CATALOG := s3://geotrellis-test/pointcloud-demo/catalog-v3
export S3_POINTCLOUD_PATH := s3://geotrellis-test/pointcloud-demo
export HDFS_POINTCLOUD_PATH := /data/test

#!/usr/bin/env bash

# hadoop fs -mkdir -p /data/test/a
# hadoop fs -mkdir -p /data/test/b
# cd /tmp; aws s3 cp s3://geotrellis-test/ross/lidar_CO_Flood_before_after.zip .
# unzip lidar_CO_Flood_before_after.zip
# hadoop fs -copyFromLocal 13*.las /data/test/a
# hadoop fs -copyFromLocal 30*.las /data/test/b

# mkdir -p /tmp/SHCZO_Dec10
# mkdir -p /tmp/SHCZO_Jul10

# hadoop fs -mkdir -p /data/test/

# wget -r --no-parent -P /tmp/ -A '*.laz' https://cloud.sdsc.edu/v1/AUTH_opentopography/PC_Bulk/SHCZO_Dec10/
# wget -r --no-parent -P /tmp/ -A '*.laz' https://cloud.sdsc.edu/v1/AUTH_opentopography/PC_Bulk/SHCZO_Jul10/

# mv /tmp/cloud.sdsc.edu/v1/AUTH_opentopography/PC_Bulk/* /tmp/ && rm -r /tmp/cloud.sdsc.edu/

# hadoop fs -copyFromLocal /tmp/SHCZO* /data/test/

hadoop fs -mkdir -p /data/test/JRB_10_Jul && hadoop fs -mkdir -p /data/test/JRB_10_Mar

hdfs dfs -cp -p s3://geotrellis-test/pointcloud-demo/JRB_10_Jul_subset/* /data/test/JRB_10_Jul
hdfs dfs -cp -p s3://geotrellis-test/pointcloud-demo/JRB_10_Mar_subset/* /data/test/JRB_10_Mar


#!/usr/bin/env bash

sudo mkdir -p /var/www/html/
sudo cp -r /tmp/static/* /var/www/html/
sudo chmod 755 -R /var/www/html/

# --conf spark.executor.instances=400 \

spark-submit \
  --class com.azavea.server.Main \
  --master yarn-client \
  --driver-memory 5000M \
  --driver-cores 4 \
  --executor-cores 2 \
  --executor-memory 5000M \
  --conf spark.dynamicAllocation.enabled=false \
  --conf spark.executor.instances=400 \
  --conf spark.yarn.executor.memoryOverhead=600 \
  --conf spark.yarn.driver.memoryOverhead=600 \
  /tmp/pointcloud-server-assembly-0.1.0-SNAPHOST.jar

#!/bin/bash

# This scripts bootstraps each node in the the EMR cluster to install PDAL.

# Ensure that config files are copied to S3
aws s3 cp /etc/hadoop/conf/core-site.xml s3://geotrellis-test/pdal-test/
aws s3 cp /etc/hadoop/conf/yarn-site.xml s3://geotrellis-test/pdal-test/

# Install minimal explicit dependencies.
sudo yum -y install git geos-devel libcurl-devel cmake libtiff-devel

aws s3 cp s3://geotrellis-pointcloud/pointcloud-demo-libraries.tar.bz2 /tmp
sudo tar xjf /tmp/pointcloud-demo-libraries.tar.bz2 --directory=/
sudo ldconfig -n /usr/local/lib

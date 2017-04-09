#!/bin/bash

# This scripts bootstraps each node in the the EMR cluster to install PDAL.

# Ensure that config files are copied to S3
aws s3 cp /etc/hadoop/conf/core-site.xml s3://geotrellis-test/pdal-test/
aws s3 cp /etc/hadoop/conf/yarn-site.xml s3://geotrellis-test/pdal-test/

# Install minimal explicit dependencies.
sudo yum -y install git geos-devel libcurl-devel cmake libtiff-devel

# laz-perf
cd /mnt
git clone https://github.com/verma/laz-perf.git laz-perf
cd laz-perf
cmake .
make
sudo make install

# laszip
cd /mnt
git clone https://github.com/LASzip/LASzip.git laszip
cd laszip
git checkout e7065cbc5bdbbe0c6e50c9d93d1cd346e9be6778  # Yes this is necessary. See https://github.com/PDAL/PDAL/issues/1205
cmake .
make
sudo make install

# proj4
cd /mnt
wget https://github.com/OSGeo/proj.4/archive/4.9.3.zip
unzip 4.9.3.zip
cd proj.4-4.9.3
cmake .
make
sudo make install

# libgeotiff
cd /mnt
wget http://download.osgeo.org/geotiff/libgeotiff/libgeotiff-1.4.2.zip
unzip libgeotiff-1.4.2.zip
cd libgeotiff-1.4.2
cmake .
make
sudo make install

# jsoncpp
cd /mnt
wget https://github.com/open-source-parsers/jsoncpp/archive/1.7.7.zip
unzip 1.7.7.zip
cd jsoncpp-1.7.7
cmake . -DBUILD_SHARED_LIBS=ON  # Need BUILD_SHARED_LIBS or pdal fails.
make
sudo make install

# Compile/install GDAL
cd /mnt
git clone https://github.com/OSGeo/gdal.git
git checkout 2.1
cd gdal/gdal
./configure
make
sudo make install

# Compile/install PDAL
cd /mnt
git clone https://github.com/PDAL/PDAL.git pdal
cd pdal
git checkout -f 1.4-maintenance
cmake . -DWITH_PDAL_JNI=ON -DWITH_APPS=ON -DWITH_LAZPERF=ON -DWITH_LASZIP=ON -DCMAKE_BUILD_TYPE=Release
make -j4
sudo make install

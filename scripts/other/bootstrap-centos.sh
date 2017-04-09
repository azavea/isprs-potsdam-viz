#!/bin/bash
# This Script is a modifyed version of https://adamsteer.github.io/pdal/centos-install.html
# Documentation on buuilding the PDAL stack on Centos 7
# taken heavily from here:
# https://github.com/PDAL/PDAL/tree/master/scripts/linux-install-scripts
# Also check the docker install scripts in the PDAL source if things seem
# to be missing.


# note - here we assume that the epel repository is enabled on your machine:
# https://fedoraproject.org/wiki/EPEL

# yum yum - get the basic Centos stuff done
yum -y install curl-devel gcc-c++

# many compression libraries
yum -y install bzip2 bzip2-devel lzip lzma xz-devel libarchive-devel

# I need to google expat sometime. Note than jsoncpp from source is built later, but
# does not over-write the system library.
yum -y install expat-devel jsoncpp jsoncpp-devel ncurses-devel

#more yum installs
yum -y install CUnit-devel libxml2-devel git

#geospatial stuff
yum -y install proj proj-devel geos geos-devel libtiff libtiff-devel gdal gdal-devel libgeotiff libgeotiff-devel

# system boost version is OK
yum -y install boost boost-devel

# using this because I install the postgres-pointcloud extension
# nb - for my setup postgres is installed by DevOps. Uncomment below if that doesn't happen for you
# yum install postgresql95
yum -y install postgresql95-devel

# using these because I install the icebridge extension
yum -y install hdf5-devel netcdf4-devel

# And I want the python bindings...
yum -y install numpy

# cmake3 is required for PDAL and entwine
yum -y install cmake3 cmake-gui

# building everything in a place called /local, change to suit.

mkdir -p /local/build

# laz-perf
cd /local/build
git clone https://github.com/verma/laz-perf.git laz-perf
cd laz-perf
cmake -G "Unix Makefiles" -DCMAKE_INSTALL_PREFIX=/usr . && make && make install
cd ../

# laszip
git clone https://github.com/LASzip/LASzip.git laszip
cd laszip
git checkout 6de83bc3f4abf6ca30fd07013ba76b06af0d2098
cmake . -DCMAKE_INSTALL_PREFIX=/usr && make && make install
cd -

# NB - the commit checked out above is taken from entwine docs and seems to work.
# checking out master did not at the time I build it last (early Nov 2016)
# git clone https://github.com/LASzip/LASzip.git laszip
# cd laszip/
# cmake . -DCMAKE_INSTALL_PREFIX=/usr
# make
# make install
# cd ../

# hexer
git clone https://github.com/hobu/hexer.git
cd hexer
cmake . -DCMAKE_INSTALL_PREFIX=/usr -DWITH_GDAL=ON
make
make install

# p2g - probably superceded by writers.gdal
git clone https://github.com/CRREL/points2grid.git
cd points2grid/
cmake . -DCMAKE_INSTALL_PREFIX=/usr
make
make install
cd ../

# libGHT (for postgres-pointcloud)
git clone https://github.com/pramsey/libght.git
cd libght
cmake . -DCMAKE_INSTALL_PREFIX=/usr
make
make install
cd ../

# pgpointcloud
git clone https://github.com/pramsey/pointcloud.git
mkdir pointcloud-build
cd pointcloud-build
cmake ../pointcloud -DPG_CONFIG=/usr/pgsql-9.5/bin/pg_config
make
make install

#.PDAL!
git clone https://github.com/PDAL/PDAL.git
mkdir build
cd build
cmake3 \
        -DBUILD_PLUGIN_CPD=OFF \
        -DBUILD_PLUGIN_GREYHOUND=ON \
        -DBUILD_PLUGIN_HEXBIN=ON \
        -DBUILD_PLUGIN_ICEBRIDGE=ON \
        -DBUILD_PLUGIN_MRSID=ON \
        -DBUILD_PLUGIN_NITF=ON \
        -DBUILD_PLUGIN_OCI=OFF \
        -DBUILD_PLUGIN_P2G=ON \
        -DBUILD_PLUGIN_PCL=ON \
        -DBUILD_PLUGIN_PGPOINTCLOUD=ON \
        -DBUILD_PLUGIN_SQLITE=ON \
        -DBUILD_PLUGIN_RIVLIB=OFF \
        -DBUILD_PLUGIN_PYTHON=ON \
        -DCMAKE_INSTALL_PREFIX=/usr \
        -DENABLE_CTEST=OFF \
        -DWITH_APPS=ON \
        -DWITH_LAZPERF=ON \
        -DWITH_GEOTIFF=ON \
        -DWITH_LASZIP=ON \
        -DWITH_TESTS=ON \
        -DCMAKE_BUILD_TYPE=Release \
        .. \
    && make -j4 \
    && make install \

# need to know where to look for PDAL...
export LD_LIBRARY_PATH="/usr/lib:/usr/local/lib"

#update jsoncpp from source:
git clone https://github.com/open-source-parsers/jsoncpp.git
mkdir jsoncpp-build && cd jsoncpp-build
cmake3 -G "Unix Makefiles" -DCMAKE_INSTALL_PREFIX=/usr -DCMAKE_BUILD_TYPE=RelWithDebInfo ../jsoncpp
make && make install
# installs into /usr/lib - note this for entwine build

# then entwine
git clone https://github.com/connormanning/entwine.git
mkdir entwine-build && cd entwine-build
cmake3 -G "Unix Makefiles"     -DCMAKE_INSTALL_PREFIX=/usr     -DCMAKE_BUILD_TYPE=RelWithDebInfo ../entwine
#configure jsoncpp libraries here:
cmake3 ../entwine
make && make install
cd ../

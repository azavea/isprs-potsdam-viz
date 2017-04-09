#!/usr/bin/env bash

# probably requires sudo
sudo -i

cd ~

# Download Jar and JNI binaries
aws s3 cp s3://geotrellis-test/pdal-test/geotrellis-pdal-assembly-0.1.0-SNAPSHOT.jar /tmp/geotrellis-pdal-assembly-0.1.0-SNAPSHOT.jar
aws s3 cp s3://geotrellis-test/pdal-test/libpdaljni0.so /usr/lib/jni/libpdaljni0.so

apt-key adv --recv-keys --keyserver hkp://keyserver.ubuntu.com:80 16126D3A3E5C1192
apt-get update -qq
apt-get -qq remove postgis

apt-get update && apt-get install -y --fix-missing --no-install-recommends \
        build-essential \
        ca-certificates \
        cmake \
        curl \
        gfortran \
        git \
        libarmadillo-dev \
        libarpack2-dev \
        libflann-dev \
        libhdf5-serial-dev \
        liblapack-dev \
        libtiff5-dev \
        openssh-client \
        python-dev \
        python-numpy \
        python-software-properties \
        software-properties-common \
        wget \
        automake \
        libtool \
        libspatialite-dev \
        libsqlite3-mod-spatialite \
        libhdf5-dev \
        subversion \
        libjsoncpp-dev \
        libboost-filesystem1.58-dev \
        libboost-iostreams1.58-dev \
        libboost-program-options1.58-dev \
        libboost-system1.58-dev \
        libboost-thread1.58-dev \
        subversion \
        clang \
        clang-3.6 \
        libproj-dev \
        libc6-dev \
        libnetcdf-dev \
        libjasper-dev \
        libpng-dev \
        libjpeg-dev \
        libgif-dev \
        libwebp-dev \
        libhdf4-alt-dev \
        libhdf5-dev \
        libpq-dev \
        libxerces-c-dev \
        unixodbc-dev \
        libsqlite3-dev \
        libgeos-dev \
        libmysqlclient-dev \
        libltdl-dev \
        libcurl4-openssl-dev \
        libspatialite-dev \
        libdap-dev\
        ninja \
        cython \
        python-pip \
        libgdal1-dev \
    && rm -rf /var/lib/apt/lists/*

update-alternatives --install /usr/bin/clang clang /usr/bin/clang-3.6 20 && update-alternatives --install /usr/bin/clang++ clang++ /usr/bin/clang++-3.6 20


#git clone --depth=1 https://github.com/OSGeo/gdal.git \
#    &&    cd gdal/gdal \
#    && ./configure --prefix=/usr \
#            --mandir=/usr/share/man \
#            --includedir=/usr/include/gdal \
#            --with-threads \
#            --with-grass=no \
#            --with-hide-internal-symbols=yes \
#            --with-rename-internal-libtiff-symbols=yes \
#            --with-rename-internal-libgeotiff-symbols=yes \
#            --with-libtiff=internal \
#            --with-geotiff=internal \
#            --with-webp \
#            --with-jasper \
#            --with-netcdf \
#            --with-hdf5=/usr/lib/x86_64-linux-gnu/hdf5/serial/ \
#            --with-xerces \
#            --with-geos \
#            --with-sqlite3 \
#            --with-curl \
#            --with-pg \
#            --with-mysql \
#            --with-python \
#            --with-odbc \
#            --with-ogdi \
#            --with-dods-root=/usr \
#            --with-spatialite=/usr \
#            --with-cfitsio=no \
#            --with-ecw=no \
#            --with-mrsid=no \
#            --with-poppler=yes \
#            --with-openjpeg=yes \
#            --with-freexl=yes \
#            --with-libkml=yes \
#            --with-armadillo=yes \
#            --with-liblzma=yes \
#            --with-epsilon=/usr \
#    && make -j 4 \
#    && make install \
#    && rm -rf /gdal

git clone https://github.com/hobu/nitro \
    && cd nitro \
    && mkdir build \
    && cd build \
    && cmake \
        -DCMAKE_INSTALL_PREFIX=/usr \
        .. \
    && make \
    && make install \
    && rm -rf /nitro

git clone https://github.com/LASzip/LASzip.git laszip \
    && cd laszip \
    && git checkout e7065cbc5bdbbe0c6e50c9d93d1cd346e9be6778 \
    && mkdir build \
    && cd build \
    && cmake \
        -DCMAKE_INSTALL_PREFIX=/usr \
        -DCMAKE_BUILD_TYPE="Release" \
        .. \
    && make \
    && make install \
    && rm -rf /laszip


git clone https://github.com/hobu/hexer.git \
    && cd hexer \
    && mkdir build \
    && cd build \
    && cmake \
        -DCMAKE_INSTALL_PREFIX=/usr \
        -DCMAKE_BUILD_TYPE="Release" \
        .. \
    && make \
    && make install \
    && rm -rf /hexer

git clone https://github.com/CRREL/points2grid.git \
    && cd points2grid \
    && mkdir build \
    && cd build \
    && CXXFLAGS="-std=c++11" cmake \
        -DCMAKE_INSTALL_PREFIX=/usr \
        -DCMAKE_BUILD_TYPE="Release" \
        .. \
    && make \
    && make install \
    && rm -rf /points2grid

git clone  https://github.com/hobu/laz-perf.git \
    && cd laz-perf \
    && mkdir build \
    && cd build \
    && cmake \
        -DCMAKE_INSTALL_PREFIX=/usr \
        -DCMAKE_BUILD_TYPE="Release" \
        .. \
    && make \
    && make install \
    && rm -rf /laz-perf

wget http://bitbucket.org/eigen/eigen/get/3.2.7.tar.gz \
        && tar -xvf 3.2.7.tar.gz \
        && cp -R eigen-eigen-b30b87236a1b/Eigen/ /usr/include/Eigen/ \
        && cp -R eigen-eigen-b30b87236a1b/unsupported/ /usr/include/unsupported/ \
        && rm -rf /3.2.7.tar.gz \
        && rm -rf /eigen-eigen-b30b87236a1b

git clone https://github.com/PointCloudLibrary/pcl.git \
        && cd pcl \
        && git checkout pcl-1.8.0 \
        && mkdir build \
        && cd build \
        && CC="clang" CXX="clang++" CXXFLAGS="-std=c++11"  cmake \
                -DBUILD_2d=ON \
                -DBUILD_CUDA=OFF \
                -DBUILD_GPU=OFF \
                -DBUILD_apps=OFF \
                -DBUILD_common=ON \
                -DBUILD_examples=OFF \
                -DBUILD_features=ON \
                -DBUILD_filters=ON \
                -DBUILD_geometry=ON \
                -DBUILD_global_tests=OFF \
                -DBUILD_io=ON \
                -DBUILD_kdtree=ON \
                -DBUILD_keypoints=ON \
                -DBUILD_ml=ON \
                -DBUILD_octree=ON \
                -DBUILD_outofcore=OFF \
                -DBUILD_people=OFF \
                -DBUILD_recognition=OFF \
                -DBUILD_registration=ON \
                -DBUILD_sample_concensus=ON \
                -DBUILD_search=ON \
                -DBUILD_segmentation=ON \
                -DBUILD_simulation=OFF \
                -DBUILD_stereo=OFF \
                -DBUILD_surface=ON \
                -DBUILD_surface_on_nurbs=OFF \
                -DBUILD_tools=OFF \
                -DBUILD_tracking=OFF \
                -DBUILD_visualization=OFF \
                -DWITH_LIBUSB=OFF \
                -DWITH_OPENNI=OFF \
                -DWITH_OPENNI2=OFF \
                -DWITH_FZAPI=OFF \
                -DWITH_PXCAPI=OFF \
                -DWITH_PNG=OFF \
                -DWITH_QHULL=OFF \
                -DWITH_QT=OFF \
                -DWITH_VTK=OFF \
                -DWITH_PCAP=OFF \
                -DWITH_OPENNI=OFF \
                -DWITH_OPENNI2=OFF \
                -DWITH_FZAPI=OFF \
                -DWITH_ENSENSO=OFF \
                -DWITH_DAVIDSDK=OFF \
                -DWITH_DSSDK=OFF \
                -DWITH_RSSDK=OFF \
                -DWITH_OPENGL=OFF \
                -DCMAKE_INSTALL_PREFIX=/usr \
                -DCMAKE_BUILD_TYPE="Release" \
                .. \
        && make -j 4\
        && make install \
        && rm -rf /pcl



svn co -r 2691 https://svn.osgeo.org/metacrs/geotiff/trunk/libgeotiff/ \
    && cd libgeotiff \
    && ./autogen.sh \
    && ./configure --prefix=/usr \
    && make \
    && make install \
    && rm -rf /libgeotiff

apt-get update && apt-get install -y --fix-missing --no-install-recommends \
        ninja-build \
        libgeos++-dev \
        unzip \
    && rm -rf /var/lib/apt/lists/*

#mkdir /vdatum \
#    && cd /vdatum \
#    && wget http://download.osgeo.org/proj/vdatum/usa_geoid2012.zip && unzip -j -u usa_geoid2012.zip -d /usr/share/proj \
#    && wget http://download.osgeo.org/proj/vdatum/usa_geoid2009.zip && unzip -j -u usa_geoid2009.zip -d /usr/share/proj \
#    && wget http://download.osgeo.org/proj/vdatum/usa_geoid2003.zip && unzip -j -u usa_geoid2003.zip -d /usr/share/proj \
#    && wget http://download.osgeo.org/proj/vdatum/usa_geoid1999.zip && unzip -j -u usa_geoid1999.zip -d /usr/share/proj \
#    && wget http://download.osgeo.org/proj/vdatum/vertcon/vertconc.gtx && mv vertconc.gtx /usr/share/proj \
#    && wget http://download.osgeo.org/proj/vdatum/vertcon/vertcone.gtx && mv vertcone.gtx /usr/share/proj \
#    && wget http://download.osgeo.org/proj/vdatum/vertcon/vertconw.gtx && mv vertconw.gtx /usr/share/proj \
#    && wget http://download.osgeo.org/proj/vdatum/egm96_15/egm96_15.gtx && mv egm96_15.gtx /usr/share/proj \
#    && wget http://download.osgeo.org/proj/vdatum/egm08_25/egm08_25.gtx && mv egm08_25.gtx /usr/share/proj \
#    && rm -rf /vdatum

git clone https://github.com/gadomski/fgt.git \
    && cd fgt \
    && git checkout v0.4.4 \
    && cmake . -DWITH_TESTS=OFF -DBUILD_SHARED_LIBS=ON -DEIGEN3_INCLUDE_DIR=/usr/include -DCMAKE_INSTALL_PREFIX=/usr -DCMAKE_BUILD_TYPE=Release \
    && make \
    && make install \
    && rm -rf /fgt

git clone https://github.com/gadomski/cpd.git \
    && cd cpd \
    && git checkout v0.3.2 \
    && cmake . -DWITH_TESTS=OFF -DBUILD_SHARED_LIBS=ON -DCMAKE_INSTALL_PREFIX=/usr -DCMAKE_BUILD_TYPE=Release \
    && make \
    && make install \
    && rm -rf /cpd

apt-get update && apt-get install -y --fix-missing --no-install-recommends \
        libhpdf-dev \
    python-setuptools \
    && rm -rf /var/lib/apt/lists/*

git clone https://github.com/ninja-build/ninja.git \
    && cd ninja \
    && ./configure.py --bootstrap \
    && cp ninja /usr/bin

apt-get update && apt-get install -y --fix-missing --no-install-recommends \
        libhpdf-dev \
    libsqlite3-mod-spatialite \
    && rm -rf /var/lib/apt/lists/*

git clone --depth=1 https://github.com/PDAL/PDAL \
    && cd PDAL \
    && git checkout master \
    && mkdir build \
    && cd build \
    && cmake \
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
    && rm -rf /PDAL

cd ~-

exit

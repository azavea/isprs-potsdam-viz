#!/bin/bash

set -e

if [[ -n "${POTSDAM_DEBUG}" ]]; then
    set -x
fi

function usage() {
    echo -n \
"Usage: $(basename "$0")

Downloads tiff files from S3 for local ingest.
"
}

DIR="$(dirname "$0")"

function download_if_not_exits() {

    pushd "${DIR}/../data" > /dev/null
    if [ ! -f $2 ]
    then
        echo "Downloading ${1}"
        aws s3 cp ${1} ${2}
    else
        echo "${2} already exists"
    fi
    popd > /dev/null
}

if [ "${BASH_SOURCE[0]}" = "${0}" ]
then
    if [ "${1:-}" = "--help" ]
    then
        usage
    else
        download_if_not_exits \
            "s3://otid-data/input/1_DSM_normalisation_geotiff-with-geo/dsm_potsdam_02_10_normalized_lastools-geo.tif" \
            "dsm.tif"
        download_if_not_exits \
            "s3://otid-data/input/geotrellis_generated_dsm/dsm_potsdam_02_10.tff" \
            "dsm-gt.tif"
        download_if_not_exits \
            "s3://otid-data/input/geotrellis_generated_dsm_normalized/normalized-dsm_potsdam_02_10.tif" \
            "dsm-gtn.tif"
        download_if_not_exits \
            "s3://otid-data/input/4_Ortho_RGBIR_geotiff/top_potsdam_2_10_RGBIR.tif" \
            "rgbir.tif"
        download_if_not_exits \
            "s3://otid-data/input/5_Labels_for_participants_geotiff/top_potsdam_2_10_label.tif" \
            "label.tif"
        download_if_not_exits \
            "s3://otid-data/input/viz/fcn_results_4_7_17/top_potsdam_2_10_label-geo.tif" \
            "fcn.tif"
        download_if_not_exits \
            "s3://otid-data/input/viz/unet_results_4_7_17/top_potsdam_2_10_label-geo.tif" \
            "unet.tif"
        download_if_not_exits \
            "s3://otid-data/input/viz/fcn_results_irrgdsm_5_20_17/top_potsdam_2_10_label.tif" \
            "fcn-dsm.tif"
    fi
    exit
fi

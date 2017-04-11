# Query parameters
export DRIVER_MEMORY := 20000M
export DRIVER_CORES := 8
export EXECUTOR_MEMORY := 8400M
export EXECUTOR_CORES := 2
export YARN_OVERHEAD := 300
export EXECUTOR_COUNT := 80
export PARTITION_COUNT := 20000

export LOCAL_CATALOG := ${PWD}/data/catalog/
export LOCAL_DSM_PATH := file:///${PWD}/data/dsm.tif
export LOCAL_RGBIR_PATH := file:///${PWD}/data/rgbir.tif
export LOCAL_LABEL_PATH := file:///${PWD}/data/label.tif
export LOCAL_FCN_PATH := file:///${PWD}/data/fcn.tif
export LOCAL_UNET_PATH := file:///${PWD}/data/unet.tif

export S3_CATALOG := s3://otid-data/viz/catalog
export INPUT_DSM := s3://otid-data/input/1_DSM_normalisation_geotiff-with-geo/
export INPUT_RGBIR := s3://otid-data/input/4_Ortho_RGBIR_geotiff/
export INPUT_LABEL := s3://otid-data/input/5_Labels_for_participants_geotiff/
export INPUT_RESULT_FCN := s3://otid-data/input/viz/fcn_results_4_7_17/
export INPUT_RESULT_UNET := s3://otid-data/input/viz/unet_results_4_7_17/

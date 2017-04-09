import immutable from 'object-path-immutable';

import {
    singlePointStats,
    diffPointStats,
    singlePolyStats,
    diffPolyStats,
} from 'api';

export const SET_ZOOM = "SET_ZOOM";
export const SET_TARGET_LAYER = 'SET_TARGET_LAYER';
export const SET_TARGET_LAYER_OPACITY = 'SET_TARGET_LAYER_OPACITY';
export const SET_DATA_SOURCE_TYPE = 'SET_DATA_SOURCE_TYPE';
export const SET_DEM_ALGORITHM = 'SET_DEM_ALGORITHM';
export const SET_RENDER_METHOD = 'SET_RENDER_METHOD';
export const CLEAR_GEOMETRIES = 'CLEAR_GEOMETRIES';
export const SET_POLYGON = 'SET_POLYGON';
export const SET_POINT = 'SET_POINT';
export const SET_ANALYSIS_ON = 'SET_ANALYSIS_ON';
export const SET_ACTIVE_TAB = 'SET_ACTIVE_TAB';
export const START_FETCH_STATS = 'START_FETCH_STATS';
export const END_FETCH_STATS = 'END_FETCH_STATS';
export const FAIL_FETCH_STATS = 'FAIL_FETCH_STATS';

export function setZoom(zoom) {
    return {
        type: SET_ZOOM,
        payload: zoom,
    };
}

export function setTargetLayerName(layerName) {
    return {
        type: SET_TARGET_LAYER,
        payload: layerName,
    };
}

export function setTargetLayerOpacity(value) {
    return {
        type: SET_TARGET_LAYER_OPACITY,
        payload: value,
    };
}

export function setDataSourceType(dsType) {
    return {
        type: SET_DATA_SOURCE_TYPE,
        payload: dsType,
    };
}

export function setRenderMethod(method) {
    return {
        type: SET_RENDER_METHOD,
        payload: method,
    };
}

export function setDEMAlgorithm(method) {
    return {
        type: SET_DEM_ALGORITHM,
        payload: method
    };
}

export function clearGeometries() {
    return {
        type: CLEAR_GEOMETRIES,
        payload: null,
    };
}

export function setPolygon(polygon) {
    return {
        type: SET_POLYGON,
        payload: polygon,
    };
}

export function setPoint(point) {
    return {
        type: SET_POINT,
        payload: point,
    };
}

export function setAnalysisOn(flag) {
    return {
        type: SET_ANALYSIS_ON,
        payload: flag
    };
}

export function setActiveTab(idx) {
    return {
        type: SET_ACTIVE_TAB,
        payload: idx
    };
}

export function startFetchStats() {
    console.log("START_FETCH_STATS");
    return {
        type: START_FETCH_STATS,
        payload: null
    };
}

export function endFetchStats(result) {
    console.log("END_FETCH_STATS: " + result);
    return {
        type: END_FETCH_STATS,
        payload: result
    };
}

export function failFetchStats(error) {
    console.log("FAIL_FETCH_STATS: " + error);
    return {
        type: FAIL_FETCH_STATS,
        payload: error
    };
}

export function fetchSinglePointStats(layerName, zoom, point) {
    return (dispatch) => {
        dispatch(startFetchStats());
        singlePointStats(layerName, zoom, point)
            .then(({ data }) => dispatch(endFetchStats(immutable.set(data, 'type', 'point'))))
            .catch(error => dispatch(failFetchStats(error)));
    };
}

export function fetchDiffPointStats(layer1Name, layer2Name, zoom, point) {
    return (dispatch) => {
        dispatch(startFetchStats());
        diffPointStats(layer1Name, layer2Name, zoom, point)
            .then(({ data }) => dispatch(endFetchStats(immutable.set(data, 'type', 'point'))))
            .catch(error => dispatch(failFetchStats(error)));
    };
}

export function fetchSinglePolyStats(layerName, zoom, poly) {
    return (dispatch) => {
        dispatch(startFetchStats());
        singlePolyStats(layerName, zoom, poly)
            .then(({ data }) => dispatch(endFetchStats(immutable.set(data, 'type', 'poly'))))
            .catch(error => dispatch(failFetchStats(error)));
    };
}

export function fetchDiffPolyStats(layer1Name, layer2Name, zoom, poly) {
    return (dispatch) => {
        dispatch(startFetchStats());
        diffPolyStats(layer1Name, layer2Name, zoom, poly)
            .then(({ data }) => dispatch(endFetchStats(immutable.set(data, 'type', 'poly'))))
            .catch(error => dispatch(failFetchStats(error)));
    };
}

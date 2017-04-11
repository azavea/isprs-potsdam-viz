import immutable from 'object-path-immutable';

import {
    singlePointStats,
    diffPointStats,
    singlePolyStats,
    diffPolyStats,
} from 'api';

export const SET_ZOOM = "SET_ZOOM";
export const SET_IMAGERY_TYPE = "SET_IMAGERY_TYPE";
export const SET_IMAGERY_OPACITY = "SET_IMAGERY_OPACITY";
export const SET_DSM_TYPE = "SET_DSM_TYPE";
export const SET_DSM_OPACITY = "SET_DSM_OPACITY";
export const SET_LABELS_TYPE = "SET_LABELS_TYPE";
export const SET_LABELS_OPACITY = "SET_LABELS_OPACITY";
export const SET_MODEL_PREDICTION_TYPE = "SET_MODEL_PREDICTION_TYPE";
export const SET_MODEL_PREDICTION_OPACITY = "SET_MODEL_PREDICTION_OPACITY";
export const SET_MODEL_PROBABILITIES_TYPE = "SET_MODEL_PROBABILITIES_TYPE";
export const SET_MODEL_PROBABILITIES_OPACITY = "SET_MODEL_PROBABILITIES_OPACITY";
export const SET_MODEL_PROBABILITIES_LABEL = "SET_MODEL_PROBABILITIES_LABEL";
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

export function setImageryType(layerType) {
    return {
        type: SET_IMAGERY_TYPE,
        payload: layerType
    };
}

export function setImageryOpacity(value) {
    return {
        type: SET_IMAGERY_OPACITY,
        payload: value
    };
}

export function setDsmType(layerType) {
    return {
        type: SET_DSM_TYPE,
        payload: layerType
    };
}

export function setDsmOpacity(value) {
    return {
        type: SET_DSM_OPACITY,
        payload: value
    };
}

export function setLabelsType(layerType) {
    return {
        type: SET_LABELS_TYPE,
        payload: layerType
    };
}

export function setLabelsOpacity(value) {
    return {
        type: SET_LABELS_OPACITY,
        payload: value
    };
}

export function setModelPredictionType(modelId, layerType) {
    return {
        type: SET_MODEL_PREDICTION_TYPE,
        payload: { modelId: modelId, layerType: layerType }
    };
}

export function setModelPredictionOpacity(modelId, value) {
    return {
        type: SET_MODEL_PREDICTION_OPACITY,
        payload: { modelId: modelId, opacity: value }
    };
}

export function setModelProbabilitiesType(modelId, layerType) {
    return {
        type: SET_MODEL_PROBABILITIES_TYPE,
        payload: { modelId: modelId, layerType: layerType }
    };
}

export function setModelProbabilitiesOpacity(modelId, value) {
    return {
        type: SET_MODEL_PROBABILITIES_OPACITY,
        payload: { modelId: modelId, opacity: value }
    };
}

export function setModelProbabilitiesLabel(modelId, value) {
    return {
        type: SET_MODEL_PROBABILITIES_LABEL,
        payload: { modelId: modelId, labelId: value }
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

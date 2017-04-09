import _ from 'lodash';
import immutable from 'object-path-immutable';
import { defaultMapCenter } from 'constants';

import {
    SET_ZOOM,
    SET_TARGET_LAYER,
    SET_TARGET_LAYER_OPACITY,
    SET_DATA_SOURCE_TYPE,
    SET_DEM_ALGORITHM,
    SET_RENDER_METHOD,
    CLEAR_GEOMETRIES,
    SET_POLYGON,
    SET_POINT,
    SET_ANALYSIS_ON,
    SET_ACTIVE_TAB,
    START_FETCH_STATS,
    END_FETCH_STATS,
    FAIL_FETCH_STATS,
} from './actions';


const initAppPage = {
    activeTab: 0,
    zoom: 12,
    singleLayer: {
        active: true,
        idwChecked: true,
        tinChecked: false,
        staticChecked: true,
        dynamicChecked: false,
        targetLayerOpacity: 0.9,
        colorRampChecked: true,
        hillshadeChecked: false,
        snowOnChecked: true,
        snowOffChecked: false,
        renderMethod: "COLORRAMP",
        targetLayerName: "SNOW-ON"
    },
    changeDetection: {
        active: false,
        idwChecked: true,
        tinChecked: false,
        staticChecked: true,
        dynamicChecked: false,
        targetLayerOpacity: 0.9,
    },
    analysis: {
        analysisOn: false,
        results: null,
        isFetching: false,
        fetchError: null,
        polygon: null,
        point: null,
    },
    center: defaultMapCenter,
};

function propForActiveTab(state, propName) {
    if(state.singleLayer.active) {
        return 'singleLayer.' + propName;
    } else {
        return 'changeDetection.' + propName;
    }
}

export default function appPage(state = initAppPage, action) {
    var newState = state;

    switch (action.type) {
        case SET_ZOOM:
            console.log("SET_ZOOM:" + action.payload);
            newState = immutable.set(newState, "zoom", action.payload);
            return newState;
        case CLEAR_GEOMETRIES:
            console.log("Clearing Geometries");
            newState = immutable.set(newState, 'analysis.polygon', null);
            newState = immutable.set(newState, 'analysis.point', null);
            newState = immutable.set(newState, 'analysis.isFetching', false);
            newState = immutable.set(newState, 'analysis.fetchError', action.payload);
            return newState;
        case SET_POLYGON:
            console.log("Setting polygon");
            newState = immutable.set(newState, 'analysis.polygon', action.payload);
            newState = immutable.set(newState, 'analysis.point', null);
            return newState;
        case SET_POINT:
            console.log("Setting polygon");
            newState = immutable.set(newState, 'analysis.polygon', null);
            newState = immutable.set(newState, 'analysis.point', action.payload);
            return newState;
        case SET_TARGET_LAYER:
            console.log("LAYER NAME: " + action.payload);
            var snowOnChecked = action.payload == "SNOW-ON";
            var snowOffChecked = action.payload == "SNOW-OFF";

            newState = immutable.set(newState, 'singleLayer.targetLayerName', action.payload);
            newState = immutable.set(newState, 'singleLayer.snowOnChecked', snowOnChecked);
            newState = immutable.set(newState, 'singleLayer.snowOffChecked', snowOffChecked);
            return newState;
        case SET_TARGET_LAYER_OPACITY:
            return immutable.set(newState, propForActiveTab(state, 'targetLayerOpacity'), action.payload);
        case SET_DEM_ALGORITHM:
            switch (action.payload) {
                case 'IDW':
                    newState = immutable.set(newState, propForActiveTab(state, 'idwChecked'), true);
                    return immutable.set(newState, propForActiveTab(state, 'tinChecked'), false);
                case 'TIN':
                    newState = immutable.set(newState, propForActiveTab(state, 'idwChecked'), false);
                    return immutable.set(newState, propForActiveTab(state, 'tinChecked'), true);
                default:
                    return newState;
            }
        case SET_DATA_SOURCE_TYPE:
            switch (action.payload) {
                case 'STATIC':
                    newState = immutable.set(newState, propForActiveTab(state, 'staticChecked'), true);
                    return immutable.set(newState, propForActiveTab(state, 'dynamicChecked'), false);
                case 'DYNAMIC':
                    newState = immutable.set(newState, propForActiveTab(state, 'staticChecked'), false);
                    return immutable.set(newState, propForActiveTab(state, 'dynamicChecked'), true);
                default:
                    return newState;
            }
        case SET_RENDER_METHOD:
            newState = immutable.set(newState, 'singleLayer.renderMethod', action.payload);
            switch (action.payload) {
                case 'COLORRAMP':
                    newState = immutable.set(newState, 'singleLayer.colorRampChecked', true);
                    return immutable.set(newState, 'singleLayer.hillshadeChecked', false);
                case 'HILLSHADE':
                    newState = immutable.set(newState, 'singleLayer.colorRampChecked', false);
                    return immutable.set(newState, 'singleLayer.hillshadeChecked', true);
                default:
                    return newState;
            }
        case SET_ANALYSIS_ON:
            newState = immutable.set(newState, 'analysis.analysisOn', action.payload);
            if(!action.payload) {
                newState = immutable.set(newState, 'analysis.results', null);
                newState = immutable.set(newState, 'analysis.polygon', null);
                newState = immutable.set(newState, 'analysis.point', null);
                newState = immutable.set(newState, 'analysis.isFetching', false);
                newState = immutable.set(newState, 'analysis.fetchError', action.payload);
            }
            return newState;
        case SET_ACTIVE_TAB:
            newState = immutable.set(newState, 'activeTab', action.payload);
            newState = immutable.set(newState, 'singleLayer.active', action.payload == 0);
            newState = immutable.set(newState, 'changeDetection.active', action.payload == 1);
            newState = immutable.set(newState, 'analysis.polygon', null);
            newState = immutable.set(newState, 'analysis.point', null);
            newState = immutable.set(newState, 'analysis.isFetching', false);
            newState = immutable.set(newState, 'analysis.fetchError', null);

            return newState;
        case START_FETCH_STATS:
            console.log("START FETCH STATS REDUCER");
            newState = immutable.set(newState, 'analysis.isFetching', true);
            return newState;
        case END_FETCH_STATS:
            console.log("FETCH RESULT: " + action.payload);
            if(state.analysis.isFetching) {
                newState = immutable.set(newState, 'analysis.isFetching', false);
                newState = immutable.set(newState, 'analysis.results', action.payload);
            }
            return newState;
        case FAIL_FETCH_STATS:
            console.log("FETCH ERROR: " + action.payload);
            if(state.analysis.isFetching) {
                newState = immutable.set(newState, 'analysis.isFetching', false);
                newState = immutable.set(newState, 'analysis.fetchError', action.payload);
            }
            return newState;
        default:
            console.log("UNKOWN ACTION: " + action.type);
            return newState;
    }
}

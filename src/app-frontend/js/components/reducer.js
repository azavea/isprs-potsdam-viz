import _ from 'lodash';
import immutable from 'object-path-immutable';
import { defaultMapCenter } from 'constants';

import {
    SET_ZOOM,
    CLEAR_GEOMETRIES,
    SET_POLYGON,
    SET_POINT,
    SET_ANALYSIS_ON,
    SET_ACTIVE_TAB,
    START_FETCH_STATS,
    END_FETCH_STATS,
    FAIL_FETCH_STATS,
    SET_IMAGERY_TYPE,
    SET_IMAGERY_OPACITY,
    SET_DSM_TYPE,
    SET_DSM_OPACITY,
    SET_LABELS_TYPE,
    SET_LABELS_OPACITY,
    SET_MODEL_PREDICTION_TYPE,
    SET_MODEL_PREDICTION_OPACITY,
    SET_MODEL_PROBABILITIES_TYPE,
    SET_MODEL_PROBABILITIES_OPACITY,
    SET_MODEL_PROBABILITIES_LABEL,
    SET_AB_TYPE,
    SET_AB_OPACITY,
} from './actions';


const initAppPage = {
    activeTab: 0,
    zoom: 15,
    singleLayer: {
      active: true,
      imagery: {
        rgbChecked: true,
        irrgChecked: false,
        grayscaleChecked: false,
        ndviChecked: false,
        opacity: 1.0
      },
      dsm: {
        colorRampChecked: false,
        hillshadeChecked: false,
        opacity: 1.0
      },
      labels: {
        checked: false,
        opacity: 1.0
      },
      models: {
        unet: {
          name: "UNET",
          predictions: {
            allChecked: true,
            incorrectChecked: false,
            opacity: 0.7
          },
          probabilities:  {
            labelId: 1,
            checked: false,
            opacity: 0.9
          }
        },
        fcn: {
          name: "FCN",
          predictions: {
            allChecked: false,
            incorrectChecked: false,
            opacity: 0.7
          },
          probabilities:  {
            labelId: 1,
            checked: false,
            opacity: 0.9
          }
        }
      },
        ab: {
            checked: false,
            opacity: 0.9
        }
    },
    changeDetection: {
        active: false,
        idwChecked: true,
        tinChecked: false,
        staticChecked: true,
        dynamicChecked: false,
        targetLayerOpacity: 0.9
    },
    analysis: {
        analysisOn: false,
        results: null,
        isFetching: false,
        fetchError: null,
        polygon: null,
        point: null
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

        // SINGLE LAYER

        case SET_IMAGERY_TYPE:
            // May be "NONE"
            var rgbChecked = action.payload == "RGB";
            var irrgChecked = action.payload == "IRRG";
            var ndviChecked = action.payload == "NDVI";
            var grayscaleChecked = action.payload == "GRAYSCALE";

            newState = immutable.set(newState,
                                     'singleLayer.imagery.rgbChecked',
                                     rgbChecked);
            newState = immutable.set(newState,
                                     'singleLayer.imagery.irrgChecked',
                                     irrgChecked);
            newState = immutable.set(newState,
                                     'singleLayer.imagery.ndviChecked',
                                     ndviChecked);
            newState = immutable.set(newState,
                                     'singleLayer.imagery.grayscaleChecked',
                                     grayscaleChecked);
            return newState;
        case SET_IMAGERY_OPACITY:
            return immutable.set(newState,
                                 'singleLayer.imagery.opacity',
                                 action.payload);
        case SET_DSM_TYPE:
            // May be "NONE"
            var colorRampChecked = action.payload == "COLORRAMP";
            var hillshadeChecked = action.payload == "HILLSHADE";

            newState = immutable.set(newState,
                                     'singleLayer.dsm.colorRampChecked',
                                     colorRampChecked);
            newState = immutable.set(newState,
                                     'singleLayer.dsm.hillshadeChecked',
                                     hillshadeChecked);
            return newState;
        case SET_DSM_OPACITY:
            return immutable.set(newState,
                                 'singleLayer.dsm.opacity',
                                 action.payload);
        case SET_LABELS_TYPE:
            // May be "NONE"
            var checked = action.payload == "CHECKED";

            newState = immutable.set(newState,
                                     'singleLayer.labels.checked',
                                     checked);
            return newState;
        case SET_LABELS_OPACITY:
            return immutable.set(newState,
                                 'singleLayer.labels.opacity',
                                 action.payload);
        case SET_MODEL_PREDICTION_TYPE:
            var modelId = action.payload.modelId;
            // May be "NONE"
            var incorrectChecked = action.payload.layerType == "INCORRECT";
            var allChecked = action.payload.layerType == "ALL";
            console.log(" MODEL ID:" + modelId, "  TYPE: " + action.payload.layerType);
            newState = immutable.set(newState,
                                     'singleLayer.models.' + modelId + '.predictions.incorrectChecked',
                                     incorrectChecked);
            newState = immutable.set(newState,
                                     'singleLayer.models.' + modelId + '.predictions.allChecked',
                                     allChecked);
            return newState;
        case SET_MODEL_PREDICTION_OPACITY:
            var modelId = action.payload.modelId;
            return immutable.set(newState,
                                 'singleLayer.models.' + modelId + '.predictions.opacity',
                                 action.payload.opacity);
        case SET_MODEL_PROBABILITIES_LABEL:
            var modelId = action.payload.modelId;
            var labelId = action.payload.labelId;
            newState = immutable.set(newState,
                                     'singleLayer.models.' + modelId + '.probabilities.labelId',
                                     labelId);
            /* console.log("NEW STATE LABELID: " + newState.singleLayer.models.*/
            return newState;
        case SET_MODEL_PROBABILITIES_TYPE:
            var modelId = action.payload.modelId;
            // May be "NONE"
            var checked = action.payload.layerType == "CHECKED";

            newState = immutable.set(newState,
                                     'singleLayer.models.' + modelId + '.probabilities.checked',
                                     checked);
            return newState;
        case SET_MODEL_PROBABILITIES_OPACITY:
            var modelId = action.payload.modelId;
            return immutable.set(newState,
                                 'singleLayer.models.' + modelId + '.probabilities.opacity',
                                 action.payload.opacity);

        // Hacked together
        case SET_AB_TYPE:
            // May be "NONE"
            var checked = action.payload == "CHECKED";

            newState = immutable.set(newState,
                                     'singleLayer.ab.checked',
                                     checked);
            return newState;
        case SET_AB_OPACITY:
            return immutable.set(newState,
                                 'singleLayer.ab.opacity',
                                 action.payload);
        default:
            console.log("UNKOWN ACTION: " + action.type);
            return newState;
    }
}

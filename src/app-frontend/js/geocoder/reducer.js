import {
    START_GEOCODER_AUTOCOMPLETE,
    COMPLETE_GEOCODER_AUTOCOMPLETE,
    FAIL_GEOCODER_AUTOCOMPLETE,
    CLEAR_AUTOCOMPLETE,
    SELECT_GEOCODER_RESULT,
} from './actions';

const initGeocoder = {
    results: [],
    error: false,
};

export default function geocoder(state = initGeocoder, action) {
    switch (action.type) {
        case START_GEOCODER_AUTOCOMPLETE:
            return Object.assign({}, state, {
                error: false,
            });
        case COMPLETE_GEOCODER_AUTOCOMPLETE:
            return Object.assign({}, state, {
                results: action.payload,
                error: false,
            });
        case FAIL_GEOCODER_AUTOCOMPLETE:
            return Object.assign({}, state, {
                results: [],
                error: true,
            });
        case CLEAR_AUTOCOMPLETE:
            return Object.assign({}, state, {
                results: [],
                error: false,
            });
        case SELECT_GEOCODER_RESULT:
            return Object.assign({}, state, {
                results: [],
                error: false,
            });
        default:
            return state;
    }
}

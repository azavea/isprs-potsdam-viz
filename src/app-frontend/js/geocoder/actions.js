import axios from 'axios';

import {
    formatMapzenAutocompleteUrl,
    filterGeocoderResults,
} from './utils';

export const COMPLETE_GEOCODER_SEARCH = 'COMPLETE_GEOCODER_SEARCH';
export const START_GEOCODER_AUTOCOMPLETE = 'START_GEOCODER_AUTOCOMPLETE';
export const COMPLETE_GEOCODER_AUTOCOMPLETE = 'COMPLETE_GEOCODER_AUTOCOMPLETE';
export const FAIL_GEOCODER_AUTOCOMPLETE = 'FAIL_GEOCODER_AUTOCOMPLETE';
export const CLEAR_AUTOCOMPLETE = 'CLEAR_AUTOCOMPLETE';
export const SELECT_GEOCODER_RESULT = 'SELECT_GEOCODER_RESULT';

function startGeocoderAutocomplete() {
    return {
        type: START_GEOCODER_AUTOCOMPLETE,
    };
}

function completeGeocoderAutocomplete(response) {
    const filteredResponse = filterGeocoderResults(response);
    return {
        type: COMPLETE_GEOCODER_AUTOCOMPLETE,
        payload: filteredResponse,
    };
}

function failGeocoderAutocomplete() {
    return {
        type: FAIL_GEOCODER_AUTOCOMPLETE,
    };
}

export function autocompleteGeocoderSearch(query) {
    const autocompleteUrl = formatMapzenAutocompleteUrl(query);
    return (dispatch) => {
        dispatch(startGeocoderAutocomplete());
        axios.get(autocompleteUrl)
             .then(({ data }) => dispatch(completeGeocoderAutocomplete(data)))
             .catch(() => dispatch(failGeocoderAutocomplete()));
    };
}

export function clearAutocompleteResults() {
    return {
        type: CLEAR_AUTOCOMPLETE,
    };
}

export function selectGeocoderResult(data) {
    return {
        type: SELECT_GEOCODER_RESULT,
        payload: data,
    };
}

import _ from 'lodash';

import {
    mapzenApiKey,
    mapzenAutocompleteUrl,
    focusPoint,
    phlFilterString,
} from './constants';

export function formatMapzenAutocompleteUrl(query) {
    return `${mapzenAutocompleteUrl}?${focusPoint}&text=${query}&api_key=${mapzenApiKey}`;
}

export function filterGeocoderResults({ features }) {
    if (!features) {
        throw new Error('No features were returned from Mapzen search.');
    }
    return _.chain(features)
        .filter(feature => feature.properties.county === phlFilterString)
        .map(feature => ({
            coordinates: {
                lat: feature.geometry.coordinates[1],
                lng: feature.geometry.coordinates[0],
            },
            name: feature.properties.name,
            fullName: feature.properties.label,
            zipCode: feature.properties.postalcode || null,
        }))
        .value();
}

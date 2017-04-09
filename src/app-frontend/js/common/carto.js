import axios from 'axios';

import { metersPerMile } from 'constants';

const cartoSqlUrl = 'https://pgw-community-mapping.carto.com/api/v2/sql';

export function cartoRadiusQuery(tableName, center, radiusMiles) {
    const radiusMeters = radiusMiles * metersPerMile;
    const query = `SELECT * FROM ${tableName} ` +
        'WHERE ST_DWithin(the_geom::geography, ' +
                         `ST_MakePoint(${center.lng}, ${center.lat})::geography, ` +
                         `${radiusMeters})`;

    return axios.get(`${cartoSqlUrl}?format=GeoJSON&q=${query}`);
}

export function cartoContainQuery(tableName, center) {
    const query = `SELECT * FROM ${tableName} ` +
        'WHERE ST_Contains(the_geom, ' +
                          `ST_SetSRID(ST_MakePoint(${center.lng}, ${center.lat}), 4326))`;

    return axios.get(`${cartoSqlUrl}?q=${query}`);
}

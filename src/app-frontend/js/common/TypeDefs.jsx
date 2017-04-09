import { PropTypes } from 'react';

export const LocationTypeDef = PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
});

export const GeoJSONGeometryTypeDef = PropTypes.shape({
    coordinates: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.number), // Point / Line
        PropTypes.arrayOf(
            PropTypes.arrayOf(PropTypes.number)), // MultiLine
        PropTypes.arrayOf(
            PropTypes.arrayOf(
                PropTypes.arrayOf(PropTypes.number))), // Polygon
        PropTypes.arrayOf(
            PropTypes.arrayOf(
                PropTypes.arrayOf(
                    PropTypes.arrayOf(PropTypes.number)))), // MultiPolygon
    ]).isRequired,
    type: PropTypes.string.isRequired,
});

export const GeoJSONFeatureTypeDef = PropTypes.shape({
    geometry: GeoJSONGeometryTypeDef.isRequired,
    properties: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
});

export const PhoneNumberTypeDef = PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
]);

export const PoliticianTypeDef = PropTypes.shape({
    name: PropTypes.string.isRequired,
    district: PropTypes.string,
    party: PropTypes.string,
    email: PropTypes.string,
    link: PropTypes.string,
    facebook: PropTypes.string,
    twitter: PropTypes.string,
    address: PropTypes.string,
    phone: PhoneNumberTypeDef,
    photoUrl: PropTypes.string,
});

export const CommunityOrgTypeDef = PropTypes.shape({
    name: PropTypes.string.isRequired,
    contactPerson: PropTypes.string,
    description: PropTypes.string,
    address: PropTypes.string,
    phone: PhoneNumberTypeDef,
    location: LocationTypeDef,
    geometry: GeoJSONGeometryTypeDef,
});

export const DemographicTypeDef = PropTypes.shape({
    descriptor: PropTypes.string,
    quantity: PropTypes.number.isRequired,
    uom: PropTypes.string,
});

export const DemographicsResultTypeDef = PropTypes.shape({
    income: DemographicTypeDef.isRequired,
    medianAge: DemographicTypeDef.isRequired,
    population: DemographicTypeDef.isRequired,
    racialMakeup: PropTypes.arrayOf(DemographicTypeDef).isRequired,
    genderMakeup: PropTypes.arrayOf(DemographicTypeDef).isRequired,
});

export const PoliticsResultTypeDef = PropTypes.arrayOf(PoliticianTypeDef).isRequired;

export const PointsOfInterestResultTypeDef = PropTypes.shape({
    police: PropTypes.arrayOf(CommunityOrgTypeDef),
    fire: PropTypes.arrayOf(CommunityOrgTypeDef),
    communityOrgs: PropTypes.arrayOf(CommunityOrgTypeDef),
});

export const QueryResultTypeDef = PropTypes.shape({
    data: PropTypes.arrayOf(
            PropTypes.oneOfType([
                PropTypes.string,
                DemographicsResultTypeDef,
                PoliticsResultTypeDef,
                PointsOfInterestResultTypeDef,
            ])).isRequired,
    fetching: PropTypes.bool.isRequired,
    error: PropTypes.object.isRequired,
});

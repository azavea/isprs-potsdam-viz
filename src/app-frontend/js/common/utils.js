import { find, head, includes, map, reverse } from 'lodash';

import {
    civicInfoApiUrl,
    civicInfoApiKey,
} from './constants';

const facebook = 'Facebook';
const twitter = 'Twitter';
const facebookUrl = 'https://www.facebook.com/';
const twitterUrl = 'https://www.twitter.com/';
const country = 'country';
const pennsylvania = 'pennsylvania';
const democrat = 'Democrat';
const democratic = 'Democratic';

export function addressDataFromGeocoderResult(result) {
    const { name, coordinates, zipCode } = result;
    return {
        text: name,
        latlng: {
            lat: coordinates.lat,
            lng: coordinates.lng,
        },
        zipCode,
    };
}

export function numericLabel(number) {
    switch (number % 10) {
        case 1:
            return `${number}st`;
        case 2:
            return `${number}nd`;
        case 3:
            return `${number}rd`;
        default:
            return `${number}th`;
    }
}

// Thanks to http://stackoverflow.com/a/196991/6995854
export function sentenceCase(sentence) {
    return sentence.replace(/\w\S*/g, word =>
        word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
    );
}

export function formatCivicInfoUrl(street) {
    const address = `${street}, Philadelphia, PA`;
    // Retrieve only US and PA Senators and Representatives from the API
    const roles = 'roles=legislatorLowerBody&roles=legislatorUpperBody';
    return `${civicInfoApiUrl}${address}&${roles}&key=${civicInfoApiKey}`;
}

function getDistrict(index, offices) {
    return find(offices, ({ officialIndices }) =>
        includes(officialIndices, index)).name;
}

function getOfficeLevel(index, offices) {
    const officeLevel = head(find(offices, ({ officialIndices }) =>
        includes(officialIndices, index)).levels);
    switch (officeLevel) {
        case country:
            return country;
        default:
            return pennsylvania;
    }
}

function getSocialUrl({ channels }, socialSite) {
    const service = find(channels, { type: socialSite });
    if (!service) { return ''; }
    switch (socialSite) {
        case facebook:
            return `${facebookUrl}${service.id}`;
        case twitter:
            return `${twitterUrl}${service.id}`;
        default:
            throw new Error('Invalid social site');
    }
}

function formatAddress({ address }) {
    if (!address) { return ''; }
    const { line1: street, city, state, zip } = head(address);
    return `${street}\n${city}, ${state} ${zip}`;
}

function formatPartyAffiliation(party) {
    if (!party) {
        return '';
    } else if (party === democratic) {
        return democrat;
    }
    return party;
}

export function politicsDataFromCivicInfoResult({ officials, offices }) {
    return reverse(map(officials, (official, index) => ({
        name: official.name,
        level: getOfficeLevel(index, offices),
        district: getDistrict(index, offices),
        party: formatPartyAffiliation(official.party),
        email: official.emails ? head(official.emails) : '',
        link: official.urls ? head(official.urls) : '',
        facebook: getSocialUrl(official, facebook),
        twitter: getSocialUrl(official, twitter),
        address: formatAddress(official),
        phone: official.phones ? head(official.phones) : '',
        photoUrl: official.photoUrl,
    })));
}

export function mapStateDataToChartData(data, valueTransform) {
    return map(data, d => ({
        name: d.descriptor,
        value: valueTransform(d.quantity),
    }));
}

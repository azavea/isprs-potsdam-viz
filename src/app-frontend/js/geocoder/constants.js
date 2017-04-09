export const mapzenApiKey = process.env.MAPZEN_API_KEY;
export const mapzenAutocompleteUrl = 'https://search.mapzen.com/v1/autocomplete';
// Focus relevant results returned from the autocomplete endpoint around
// Philadelphia City Hall, a proxy for the center of the city
export const focusPoint = '&focus.point.lat=39.9524&focus.point.lon=-75.1636';
export const phlFilterString = 'Philadelphia County';

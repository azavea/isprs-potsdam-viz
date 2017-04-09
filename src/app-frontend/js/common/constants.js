export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const defaultMapCenter = { lat: 35.866144, lng: -106.595149 };

export const LayerNames = {
    snowOn : "mar10",
    snowOff: "jul10",
    addTin: function(ln) { return ln + "tin"; },
    addIdw: function(ln) { return ln + "idw"; },
};

export const polygonDefaults = {
    fillColor: '#0000FF',
    color: '#0000FF',
};

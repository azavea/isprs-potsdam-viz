import React, { Component, PropTypes } from 'react';
import { delay, isEqual } from 'lodash';
import L from 'leaflet';
import {
    Map as LeafletMap,
    Polygon,
    Marker,
    TileLayer,
    GeoJson,
    ZoomControl
} from 'react-leaflet';

import { GeoJSONGeometryTypeDef, LocationTypeDef } from 'TypeDefs';
import 'leaflet-fullscreen';

import DrawToolbar from './DrawToolbar';

import {
    setAnalysisOn,
    setZoom
} from './actions';

import {
    LayerNames as LN,
    polygonDefaults,
} from '../common/constants.js';

export default class Map extends Component {
    constructor() {
        super();

        this.adjustMap = this.adjustMap.bind(this);
        this.createDrawToolbarComponent = this.createDrawToolbarComponent.bind(this);
    }

    componentDidMount() {
        /* const leafletMap = this.map.leafletElement;

         * L.control.fullscreen({
         *     position: 'topLeft',
         *     pseudoFullscreen: true,
         * }).addTo(leafletMap);

         * leafletMap.on('fullscreenchange', this.adjustMap);*/
    }

    componentWillReceiveProps({ center, zoom }) {
        const hasNewCenter = !isEqual(center, this.props.center);

        // Hack, there should be a way to update the zoom when it changes.
        // Check if the zoom is different and set it.
        if(zoom != this.map.leafletElement.getZoom()) {
            this.props.dispatch(setZoom(this.map.leafletElement.getZoom()));
        }

        if (hasNewCenter) {
            this.adjustMap();
        }
    }

    adjustMap() {
        const { map } = this;
        if (map) {
            // TODO: Center map.
            /* const { leafletElement: circle } = circleShape;
             * const { leafletElement: leafletMap } = map;
             * delay(() => { leafletMap.fitBounds(circle.getBounds()); }, 400);*/
        }
    }

    createDrawToolbarComponent() {
        if (this.props.analysisOn) {
            return (
                <DrawToolbar
                    onClearGeometries={this.props.onClearGeometries}
                    onSetPolygon={this.props.onSetPolygon}
                    onSetPoint={this.props.onSetPoint}
                    isClear={(!this.props.polygon) && (!this.props.point)}
                />
            );
        }

        return null;
    }

    render() {
        const { singleLayer,
                changeDetection,
                center,
                zoom,
                targetLayerName,
                polygon,
                point } = this.props;

        var layer = targetLayerName == "SNOW-ON" ? "mar10idw" : "jul10idw"
        var colorRamp = "blue-to-red"

        var hostname = window.location.hostname

        var demLayerUrl = 'tms/'

        let targetLayer = null;

        if(singleLayer.active) {
            let layerName = singleLayer.targetLayerName == "SNOW-ON" ? LN.snowOn : LN.snowOff;
            layerName = singleLayer.idwChecked ? LN.addIdw(layerName) : LN.addTin(layerName);

            let renderMethodPath = singleLayer.renderMethod == "COLORRAMP" ? "png" : "hillshade";
            let singleLayerPath = renderMethodPath + '/' + layerName + '/{z}/{x}/{y}?colorRamp={colorRamp}';

            demLayerUrl = demLayerUrl.concat(singleLayerPath);

            targetLayer = [<TileLayer
                               key="targetLayer"
                               url={demLayerUrl}
                               colorRamp={colorRamp}
                               opacity={singleLayer.targetLayerOpacity}
                               maxZoom={19}
                           />]
        } else {
            let layerName1 = LN.snowOn;
            layerName1 = changeDetection.idwChecked ? LN.addIdw(layerName1) : LN.addTin(layerName1);
            let layerName2 = LN.snowOff;
            layerName2 = changeDetection.idwChecked ? LN.addIdw(layerName2) : LN.addTin(layerName2);
            let changeDetectionPath = 'diff-tms/png/' + layerName1 + '/' + layerName2 + '/{z}/{x}/{y}';

            demLayerUrl = demLayerUrl.concat(changeDetectionPath);

            targetLayer = [<TileLayer
                               key="targetLayer"
                               url={demLayerUrl}
                               opacity={changeDetection.targetLayerOpacity}
                               maxZoom={19}
                           />]
        }

        /* Draw tooling */

        const drawToolbar = this.createDrawToolbarComponent();

        let polygonLayer = '';
        if (polygon) {
            const latLngs = L.GeoJSON.coordsToLatLngs(polygon.geometry.coordinates[0]);

            polygonLayer = <Polygon positions={latLngs} {...polygonDefaults} />
        }

        let pointLayer = '';
        if (point) {
            pointLayer = <Marker position={point} />
        }


        return (
            <LeafletMap
                center={[center.lat, center.lng]}
                zoom={zoom}
                ref={map => { this.map = map; }}
                zoomControl={false}
                animate={true}
            >
                <ZoomControl position="topright" />
                {/* <TileLayer
                url="http://tile.stamen.com/terrain-background/{z}/{x}/{y}@2x.jpg"
                /> */}

                <TileLayer
                    url="http://{s}.tiles.mapbox.com/v3/azavea.map-zbompf85/{z}/{x}/{y}.png"
                />

                {/* <TileLayer
                url="http://c.tiles.mapbox.com/v3/mapbox.world-light/{z}/{x}/{y}.png"
                /> */}

                <TileLayer
                    url="http://tile.stamen.com/toner-labels/{z}/{x}/{y}@2x.png"
                />

                {targetLayer}
                {drawToolbar}
                {polygonLayer}
                {pointLayer}
            </LeafletMap>
        );
    }
}

Map.propTypes = {
    center: LocationTypeDef.isRequired,
    zoom: PropTypes.number.isRequired,
    singleLayer: PropTypes.object.isRequired,
    changeDetection: PropTypes.object.isRequired,
    analysisOn: PropTypes.bool.isRequired,
    onClearGeometries: PropTypes.func.isRequired,
    onSetPolygon: PropTypes.func.isRequired,
    onSetPoint: PropTypes.func.isRequired,
};

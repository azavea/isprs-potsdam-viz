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
import _ from 'lodash';

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

        var hostname = window.location.hostname

        var layers = [];

        if(singleLayer.active) {
            // Imagery

            if(singleLayer.imagery.rgbChecked) {
                var rgbUrl = "tms/imagery/rgb/isprs-potsdam-imagery-rgb/{z}/{x}/{y}"
                layers.push([<TileLayer
                                 key="rgbLayer"
                                 url={rgbUrl}
                                 opacity={singleLayer.imagery.opacity}
                                 maxZoom={22}
                                 zIndex={0}
                                />]);
            }

            if(singleLayer.imagery.irrgChecked) {
                var irrgUrl = "tms/imagery/rgb/isprs-potsdam-imagery-irrg/{z}/{x}/{y}"
                layers.push([<TileLayer
                                 key="irrgLayer"
                                 url={irrgUrl}
                                 opacity={singleLayer.imagery.opacity}
                                 maxZoom={22}
                                 zIndex={0}
                                 />]);
            }

            if(singleLayer.imagery.ndviChecked) {
                var ndviUrl = "tms/imagery/ndvi/isprs-potsdam-imagery-rir/{z}/{x}/{y}"
                layers.push([<TileLayer
                                 key="ndviLayer"
                                 url={ndviUrl}
                                 opacity={singleLayer.imagery.opacity}
                                 maxZoom={22}
                                 zIndex={0}
                             />]);
            }

            if(singleLayer.imagery.grayscaleChecked) {
                var grayscaleUrl = "tms/imagery/grayscale/isprs-potsdam-imagery-rgb/{z}/{x}/{y}"
                layers.push([<TileLayer
                                 key="grayscaleLayer"
                                 url={grayscaleUrl}
                                 opacity={singleLayer.imagery.opacity}
                                 maxZoom={22}
                                 zIndex={0}
                             />]);
            }

            // DSM

            if(singleLayer.dsm.colorRampChecked) {
                let dsmUrl = 'tms/png/isprs-potsdam-dsm/{z}/{x}/{y}';
                layers.push([<TileLayer
                                 key="dsmColorRampLayer"
                                 url={dsmUrl}
                                 opacity={singleLayer.dsm.opacity}
                                 maxZoom={22}
                                 zIndex={1}
                             />]);
            }

            if(singleLayer.dsm.hillshadeChecked) {
                let dsmUrl = 'tms/hillshade/isprs-potsdam-dsm/{z}/{x}/{y}';
                layers.push([<TileLayer
                                 key="dsmHillshadeLayer"
                                 url={dsmUrl}
                                 opacity={singleLayer.dsm.opacity}
                                 maxZoom={22}
                                 zIndex={1}
                             />]);
            }

            // GT DSM

            if(singleLayer.dsmGt.colorRampChecked) {
                let dsmGtUrl = 'tms/png/isprs-potsdam-dsm-gtn/{z}/{x}/{y}';
                layers.push([<TileLayer
                                 key="dsmGtColorRampLayer"
                                 url={dsmGtUrl}
                                 opacity={singleLayer.dsmGt.opacity}
                                 maxZoom={22}
                                 zIndex={1}
                             />]);
            }

            if(singleLayer.dsmGt.hillshadeChecked) {
                let dsmGtUrl = 'tms/hillshade/isprs-potsdam-dsm-gtn/{z}/{x}/{y}';
                layers.push([<TileLayer
                                 key="dsmGtHillshadeLayer"
                                 url={dsmGtUrl}
                                 opacity={singleLayer.dsmGt.opacity}
                                 maxZoom={22}
                                 zIndex={1}
                             />]);
            }

            // Labels

            if(singleLayer.labels.checked) {
                var labelsUrl = "tms/labels/isprs-potsdam-labels/{z}/{x}/{y}";
                layers.push([<TileLayer
                                 key="labelsLayer"
                                 url={labelsUrl}
                                 opacity={singleLayer.labels.opacity}
                                 maxZoom={22}
                                 zIndex={2}
                                   />]);
            }

            // Models
            let models = singleLayer.models;

            for (var property in models) {
                if (models.hasOwnProperty(property)) {
                    let modelId = property;
                    let model = models[modelId];
                    let predictions = model.predictions;
                    let probabilities = model.probabilities;

                    if(predictions.allChecked) {
                        let predUrl = 'tms/models/prediction/isprs-potsdam-' + modelId + '-predictions/{z}/{x}/{y}'
                        layers.push(
                            [<TileLayer
                                key={modelId+'PredLayer'}
                                url={predUrl}
                                opacity={predictions.opacity}
                                 maxZoom={22}
                                 zIndex={3}
                                />]
                        )
                    }

                    if(predictions.incorrectChecked) {
                        let predUrl = 'tms/models/prediction-incorrect/isprs-potsdam-' + modelId + '-predictions/isprs-potsdam-labels/{z}/{x}/{y}'
                        layers.push(
                            [<TileLayer
                                 key={modelId+'PredLayer'}
                                 url={predUrl}
                                 opacity={predictions.opacity}
                                 maxZoom={22}
                                 zIndex={3}
                             />]
                        )
                    }

                    if(probabilities.checked) {
                        var probUrl = 'tms/models/probability/isprs-potsdam-' + modelId + '-probabilities/' + probabilities.labelId + '/{z}/{x}/{y}'
                        layers.push(
                            [<TileLayer
                                 key="probLayer"
                                 url={probUrl}
                                 opacity={probabilities.opacity}
                                 maxZoom={22}
                                 zIndex={4}
                             />]
                        )
                    }
                }
            }

            // AB

            if(singleLayer.ab.checked) {
                var abUrl = "tms/models/prediction-ab/isprs-potsdam-fcn-predictions/isprs-potsdam-unet-predictions/isprs-potsdam-labels/{z}/{x}/{y}";
                layers.push([<TileLayer
                                 key="abLayer"
                                 url={abUrl}
                                 opacity={singleLayer.ab.opacity}
                                 maxZoom={22}
                                 zIndex={5}
                             />]);
            }

            // ABDSM

            if(singleLayer.abDsm.checked) {
                var abDsmUrl = "tms/models/prediction-ab/isprs-potsdam-fcn-predictions/isprs-potsdam-fcndsm-predictions/isprs-potsdam-labels/{z}/{x}/{y}";
                layers.push([<TileLayer
                                 key="abDsmLayer"
                                 url={abDsmUrl}
                                 opacity={singleLayer.abDsm.opacity}
                                 maxZoom={22}
                                 zIndex={5}
                             />]);
            }


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
                               maxZoom={22}
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

                {/* <TileLayer
                url="http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png"
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

                {layers}

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

/* @flow */

import React, { Component, PropTypes } from 'react';
import 'leaflet-draw';
import L from 'leaflet';

import { polygonDefaults } from '../common/constants.js';

// Cancel any previous draw action in progress.
function cancelDrawing(map) {
    map.fire('draw:drawstop');
}

function drawPolygon(map, drawOpts) {
    return new Promise((resolve, reject) => {
        const drawTool = new L.Draw.Polygon(map, {
            shapeOptions: Object.assign({}, drawOpts || {}),
        });

        function clearEvents() {
            map.off('draw:created');
            map.off('draw:drawstop');
        }

        function drawCreated(e) {
            const layer = e.layer;
            const shape = layer.toGeoJSON();
            clearEvents();
            resolve(shape);
        }

        function drawStop() {
            drawTool.disable();
            clearEvents();
            reject();
        }

        cancelDrawing(map);

        map.on('draw:created', drawCreated);
        map.on('draw:drawstop', drawStop);
        drawTool.enable();
    });
}

function drawPoint(map, drawOpts) {
    return new Promise((resolve, reject) => {
        const drawTool = new L.Draw.Marker(map, {
            shapeOptions: Object.assign({}, drawOpts || {}),
        });

        function clearEvents() {
            map.off('draw:created');
            map.off('draw:drawstop');
        }

        function drawCreated(e) {
            const layer = e.layer;
            const latLng = layer.getLatLng();
            clearEvents();
            resolve(latLng);
        }

        function drawStop() {
            drawTool.disable();
            clearEvents();
            reject();
        }

        cancelDrawing(map);

        map.on('draw:created', drawCreated);
        map.on('draw:drawstop', drawStop);
        drawTool.enable();
    });
}

export default class DrawToolbar extends Component {
    constructor(props: Object): any {
        super(props);

        this.state = {
            isClear: props.isClear,
        };

        this.clearGeometries = this.clearGeometries.bind(this);
        this.drawPolygon = this.drawPolygon.bind(this);
        this.drawPoint = this.drawPoint.bind(this);
    }

    clearGeometries(e) {
        const { onClearGeometries, map } = this.props;
        e.preventDefault();
        if (!this.state.isClear) {
            onClearGeometries();
            cancelDrawing(map);
            this.setState({ isClear: true });
        }
    }

    drawPolygon(e) {
        const { onSetPolygon, map } = this.props;
        e.preventDefault();
        if (this.state.isClear) {
            this.setState({ isClear: false });
            drawPolygon(map, polygonDefaults)
                .then(shape => {
                    onSetPolygon(shape);
                })
                .catch(() => {
                    this.setState({ isClear: true });
                });
        }
    }

    drawPoint(e) {
        const { onSetPoint, map } = this.props;
        e.preventDefault();
        if (this.state.isClear) {
            this.setState({ isClear: false });
            drawPoint(map)
                .then(shape => {
                    onSetPoint(shape);
                })
                .catch(() => {
                    this.setState({ isClear: true });
                });
        }
    }

    render(): any {
        // drawing/drawn so disable draw, enable clear
        const disabledClass = 'leaflet-disabled';
        let drawDisabledClass = disabledClass;
        let drawTitle = 'Area already drawn';
        let pointTitle = 'Point already drawn';
        let clearDisabledClass = '';
        let clearTitle = 'Clear geometries';

        // isClear so enable draw, disable clear
        if (this.state.isClear) {
            drawDisabledClass = '';
            drawTitle = 'Draw an area';
            pointTitle = 'Drop a point';
            clearDisabledClass = disabledClass;
            clearTitle = 'No geometries to clear';
        }

        return (
            <div className="leaflet-draw leaflet-control">
                <div className="leaflet-draw-section">
                    <div className="leaflet-draw-toolbar leaflet-bar leaflet-draw-toolbar-top">
                        <div className="draw-buttons">
                            <div className="button-group">
                                <button
                                    className={`button leaflet-draw-draw-geom ${drawDisabledClass}`}
                                    onClick={this.drawPolygon}
                                >
                                    Area
                                </button>
                                <button
                                    className={`button leaflet-draw-draw-geom ${drawDisabledClass}`}
                                    onClick={this.drawPoint}
                                >
                                    Point
                                </button>
                                <button
                                    className={`button leaflet-draw-edit-remove ${clearDisabledClass}`}
                                    title={clearTitle}
                                    onClick={this.clearGeometries}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                        {/* <a
                        className={`leaflet-draw-draw-polygon ${drawDisabledClass}`}
                        href="#"
                        title={drawTitle}
                        onClick={this.drawPolygon}
                        >
                        Draw an area
                        </a>
                        <a
                        className={`leaflet-draw-draw-point ${drawDisabledClass}`}
                        href="#"
                        title={pointTitle}
                        onClick={this.drawPoint}
                        >
                        Drop a point
                        </a> */}
                        {/* <a
                        className={`leaflet-draw-edit-remove ${clearDisabledClass}`}
                        href="#"
                        title={clearTitle}
                        onClick={this.clearGeometries}
                        >
                        Reset
                        </a> */}
                    </div>
                </div>
            </div>
        );
    }
}

DrawToolbar.propTypes = {
    map: PropTypes.object,
    onClearGeometries: PropTypes.func.isRequired,
    onSetPolygon: PropTypes.func.isRequired,
    onSetPoint: PropTypes.func.isRequired,
    isClear: PropTypes.bool.isRequired,
};

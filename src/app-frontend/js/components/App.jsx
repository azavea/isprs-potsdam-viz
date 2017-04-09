import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { head, isEqual, isEmpty } from 'lodash';
import { Slider, Button, Tabs, TabList, TabPanel, Tab } from "@blueprintjs/core";

import ScrollButton from 'components/ScrollButton';
import {
    GeoJSONGeometryTypeDef,
    QueryResultTypeDef,
} from 'TypeDefs';

import Map from './Map';
import SingleLayer from './SingleLayer';
import ChangeDetection from './ChangeDetection';
import Analysis from './Analysis';

import { LayerNames as LN } from '../common/constants.js';

import {
    setTargetLayerOpacity,
    setDataSourceType,
    clearGeometries,
    setPolygon,
    setPoint,
    setAnalysisOn,
    setActiveTab,
    fetchSinglePointStats,
    fetchDiffPointStats,
    fetchSinglePolyStats,
    fetchDiffPolyStats
} from './actions';

/* import PGWLogo from '../../img/geotrellis-logo.png';*/

class App extends Component {
    constructor(props) {
        super(props);

        this.onClearGeometries = this.onClearGeometries.bind(this);
        this.onSetPolygon = this.onSetPolygon.bind(this);
        this.onSetPoint = this.onSetPoint.bind(this);
        this.onAnalyzeClicked = this.onAnalyzeClicked.bind(this);
        this.onTabChanged = this.onTabChanged.bind(this);
    }

    onClearGeometries() {
        const { dispatch } = this.props;
        dispatch(clearGeometries());
    }

    onSetPolygon(polygon) {
        const {
            dispatch,
            singleLayer,
            changeDetection,
            zoom,
        } = this.props;
        console.log("SET POLYGON: " + polygon);
        dispatch(setPolygon(polygon));
        if(singleLayer.active) {
            let layerName = singleLayer.targetLayerName == "SNOW-ON" ? LN.snowOn : LN.snowOff;
            layerName = singleLayer.idwChecked ? LN.addIdw(layerName) : LN.addTin(layerName);

            dispatch(fetchSinglePolyStats(layerName, zoom, polygon));
        } else {
            let layerName1 = LN.snowOn;
            layerName1 = changeDetection.idwChecked ? LN.addIdw(layerName1) : LN.addTin(layerName1);
            let layerName2 = LN.snowOff;
            layerName2 = changeDetection.idwChecked ? LN.addIdw(layerName2) : LN.addTin(layerName2);
            dispatch(fetchDiffPolyStats(layerName1, layerName2, zoom, polygon));

        }
    }

    onSetPoint(point) {
        const {
            dispatch,
            singleLayer,
            changeDetection,
            zoom,
        } = this.props;
        dispatch(setPoint(point));
        if(singleLayer.active) {
            let layerName = singleLayer.targetLayerName == "SNOW-ON" ? LN.snowOn : LN.snowOff;
            layerName = singleLayer.idwChecked ? LN.addIdw(layerName) : LN.addTin(layerName);
            dispatch(fetchSinglePointStats(layerName, zoom, point));
        } else {
            let layerName1 = LN.snowOn;
            layerName1 = changeDetection.idwChecked ? LN.addIdw(layerName1) : LN.addTin(layerName1);
            let layerName2 = LN.snowOff;
            layerName2 = changeDetection.idwChecked ? LN.addIdw(layerName2) : LN.addTin(layerName2);
            dispatch(fetchDiffPointStats(layerName1, layerName2, zoom, point));

        }
    }

    onAnalyzeClicked() {
        const { dispatch } = this.props;
        dispatch(setAnalysisOn(true));
    }

    onTabChanged(selectedTabIndex, prevSelectedTabIndex) {
        const { dispatch } = this.props;
        dispatch(setActiveTab(selectedTabIndex));
    }

    render() {
        const {
            dispatch,
            activeTab,
            singleLayer,
            changeDetection,
            center,
            zoom,
            analysis,
        } = this.props;

        return (
            <div className="flex-expand-column height-100percent mode-detail pt-dark">
                <main>
                    <button className="button-analyze" onClick={this.onAnalyzeClicked}>Analyze</button>
                    <div className="sidebar options">
                        <Tabs
                            onChange={this.onTabChanged}
                            selectedTabIndex={activeTab}
                        >
                            <TabList className="main-tabs">
                                <Tab><span>Single Layer</span></Tab>
                                <Tab><span>Change Detection</span></Tab>
                            </TabList>
                            <TabPanel>
                                <SingleLayer
                                    dispatch={dispatch}
                                    idwChecked={singleLayer.idwChecked}
                                    tinChecked={singleLayer.tinChecked}
                                    staticChecked={singleLayer.staticChecked}
                                    dynamicChecked={singleLayer.dynamicChecked}
                                    targetLayerOpacity={singleLayer.targetLayerOpacity}
                                    colorRampChecked={singleLayer.colorRampChecked}
                                    hillshadeChecked={singleLayer.hillshadeChecked}
                                    snowOnChecked={singleLayer.snowOnChecked}
                                    snowOffChecked={singleLayer.snowOffChecked}
                                />
                            </TabPanel>
                            <TabPanel>
                                <ChangeDetection
                                    dispatch={dispatch}
                                    idwChecked={changeDetection.idwChecked}
                                    tinChecked={changeDetection.tinChecked}
                                    staticChecked={changeDetection.staticChecked}
                                    dynamicChecked={changeDetection.dynamicChecked}
                                    targetLayerOpacity={changeDetection.targetLayerOpacity}
                                />

                            </TabPanel>
                        </Tabs>
                    </div>

                    <Analysis
                        dispatch={dispatch}
                        analysisOn={analysis.analysisOn}
                        polygon={analysis.polygon}
                        point={analysis.point}
                        results={analysis.results}
                        isFetching={analysis.isFetching}
                    />

                    <Map className="map"
                         dispatch={dispatch}
                         center={center}
                         zoom={zoom}
                         singleLayer={singleLayer}
                         changeDetection={changeDetection}
                         analysisOn={analysis.analysisOn}
                         onClearGeometries={this.onClearGeometries}
                         onSetPolygon={this.onSetPolygon}
                         onSetPoint={this.onSetPoint}
                         polygon={analysis.polygon}
                         point={analysis.point}
                    />
                </main>
            </div>

        );
    }
}

function mapStateToProps({ appPage }) {
    return appPage;
}

export default connect(mapStateToProps)(App);

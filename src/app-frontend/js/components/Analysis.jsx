import React, { Component, PropTypes } from 'react';

import { Spinner, Slider, Button, Tabs, TabList, TabPanel, Tab } from "@blueprintjs/core";

import {
    setAnalysisOn,
} from './actions';

export default class Analysis extends Component {
    constructor() {
        super();

        this.onCancelClicked = this.onCancelClicked.bind(this);
    }

    onCancelClicked() {
        const { dispatch } = this.props;
        console.log("CANCEL ANALYSIS");
        dispatch(setAnalysisOn(false));
    }

    render() {
        const {
            analysisOn,
            polygon,
            point,
            isFetching,
            results } = this.props;

        if(!analysisOn) { return null; }

        let body = null;
        if(isFetching) {
            body =
            <div className="analyze-result-wrapper active">
                <div className="analyze-spinner">
                    <Spinner className=".pt-large"/>
                </div>
              </div>
        } else if(results) {
            if(results.type == 'point') {
                if(results.value2) {
                    // Diff
                    body =
                        <div className="analyze-result-wrapper active">
                            <div className="analyze-result">
                                <div className="analyze-number">{results.value1}</div>
                                <div className="label primary" htmlFor="">Snow On Elevation (m)</div>
                            </div>
                            <div className="analyze-result">
                                <div className="analyze-number">{results.value2}</div>
                                <div className="label primary" htmlFor="">Snow Off Elevation (m)</div>
                            </div>
                        </div>
                } else {
                    // Single layer
                    body =
                        <div className="analyze-result-wrapper active">
                            <div className="analyze-result">
                                <div className="analyze-number">{results.value}</div>
                                <div className="label primary" htmlFor="">Elevation (m)</div>
                            </div>
                        </div>
                }
            } else { // polygon
                if(results.volume) {
                    // Diff
                    body =
                        <div className="analyze-result-wrapper active">
                            <div className="analyze-result">
                                <div className="analyze-number">{results.mean}</div>
                                <div className="label primary" htmlFor="">Average Difference (m)</div>
                            </div>
                            <div className="analyze-result">
                                <div className="analyze-number">{results.min}</div>
                                <div className="label primary" htmlFor="">Minimum Difference (m)</div>
                            </div>
                            <div className="analyze-result">
                                <div className="analyze-number">{results.max}</div>
                                <div className="label primary" htmlFor="">Maximum Differnce (m)</div>
                            </div>
                            <div className="analyze-result">
                                <div className="analyze-number">{results.volume}</div>
                                <div className="label primary" htmlFor="">Volume Change (m<sup>3</sup>)</div>
                            </div>
                        </div>
                } else {
                    // Single layer
                    body =
                        <div className="analyze-result-wrapper active">
                            <div className="analyze-result">
                                <div className="analyze-number">{results.mean}</div>
                                <div className="label primary" htmlFor="">Average Elevation (m)</div>
                            </div>
                            <div className="analyze-result">
                                <div className="analyze-number">{results.min}</div>
                                <div className="label primary" htmlFor="">Minimum Elevation (m)</div>
                            </div>
                            <div className="analyze-result">
                                <div className="analyze-number">{results.max}</div>
                                <div className="label primary" htmlFor="">Maximum Elevation (m)</div>
                            </div>
                        </div>
                }
            }
        } else {
            body =
                <div className="analyze-description active">
                        <p>Draw an area or drop a point on the map to calculate
                            statistics for that location.</p>
                </div>
        }

        return (
            <div className="sidebar analyze active">
                <header>
                    <div className="sidebar-heading">Analyze</div>
                    <button className="button-cancel" onClick={this.onCancelClicked}>
                        <i className="icon icon-cancel"></i>
                    </button>
                </header>

                <div className="content">
                    {body}
                </div>
            </div>
        );
    }
}

Analysis.propTypes = {
    dispatch: PropTypes.func.isRequired,
    analysisOn: PropTypes.bool.isRequired,
    results: PropTypes.object.isRequired,
}

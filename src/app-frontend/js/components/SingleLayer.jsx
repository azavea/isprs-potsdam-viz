import React, { Component, PropTypes } from 'react';

import { Slider, Button, Tabs, TabList, TabPanel, Tab } from "@blueprintjs/core";

import {
    setImageryType,
    setImageryOpacity,
    setDsmType,
    setDsmOpacity,
    setLabelsType,
    setLabelsOpacity,
    setModelPredictionType,
    setModelPredictionOpacity,
    setModelProbabilitiesType,
    setModelProbabilitiesOpacity,
    setModelProbabilitiesLabel,
    setAbType,
    setAbOpacity
} from './actions';

export default class SingleLayer extends Component {
    constructor() {
        super();

        // Imagery

        this.checkRgb = this.checkRgb.bind(this);
        this.checkIrrg = this.checkIrrg.bind(this);
        this.checkGrayscale = this.checkGrayscale.bind(this);
        this.checkNdvi = this.checkNdvi.bind(this);
        this.checkNoImagery = this.checkNoImagery.bind(this);
        this.handleImageryOpacityChange = this.handleImageryOpacityChange.bind(this);

        // DSM

        this.checkColorRamp = this.checkColorRamp.bind(this);
        this.checkHillshade = this.checkHillshade.bind(this);
        this.checkNoDsm = this.checkNoDsm.bind(this);
        this.handleDsmOpacityChange = this.handleDsmOpacityChange.bind(this);

        // DSM - GT

        this.checkGtColorRamp = this.checkGtColorRamp.bind(this);
        this.checkGtHillshade = this.checkGtHillshade.bind(this);
        this.checkGtNoDsm = this.checkGtNoDsm.bind(this);
        this.handleDsmGtOpacityChange = this.handleDsmGtOpacityChange.bind(this);

        // Labels

        this.checkLabels = this.checkLabels.bind(this);
        this.checkNoLabels = this.checkNoLabels.bind(this);
        this.handleLabelsOpacityChange = this.handleLabelsOpacityChange.bind(this);

        // Model Predictions

        this.checkModelPredictionAllHandler = this.checkModelPredictionAllHandler.bind(this);
        this.checkModelPredictionIncorrectHandler = this.checkModelPredictionIncorrectHandler.bind(this);
        this.checkNoModelPredictionHandler = this.checkNoModelPredictionHandler.bind(this);
        this.handleModelPredicitionOpacityChangeHandler = this.handleModelPredictionOpacityChangeHandler.bind(this);

        // Model Probabilities

        this.checkModelProbabilitiesHandler = this.checkModelProbabilitiesHandler.bind(this);
        this.checkNoModelProbabilitiesHandler = this.checkNoModelProbabilitiesHandler.bind(this);
        this.handleModelProbabilitiesLabelHandler = this.handleModelProbabilitiesLabelHandler.bind(this);
        this.handleModelProbabilitiesOpacityChangeHandler = this.handleModelProbabilitiesOpacityChangeHandler.bind(this);

        // AB

        this.checkAb = this.checkAb.bind(this);
        this.checkNoAb = this.checkNoAb.bind(this);
        this.handleAbOpacityChange = this.handleAbOpacityChange.bind(this);

        // ABDSM

        this.checkAbDsm = this.checkAbDsm.bind(this);
        this.checkNoAbDsm = this.checkNoAbDsm.bind(this);
        this.handleAbDsmOpacityChange = this.handleAbDsmOpacityChange.bind(this);
    }

    // Imagery

    checkRgb() {
        const { dispatch } = this.props;
        dispatch(setImageryType("RGB"));
    }

    checkIrrg() {
        const { dispatch } = this.props;
        dispatch(setImageryType("IRRG"));
    }

    checkGrayscale() {
        const { dispatch } = this.props;
        dispatch(setImageryType("GRAYSCALE"));
    }

    checkNdvi() {
        const { dispatch } = this.props;
        dispatch(setImageryType("NDVI"));
    }

    checkNoImagery() {
        const { dispatch } = this.props;
        dispatch(setImageryType("NONE"));
    }

    handleImageryOpacityChange(value) {
        const { dispatch } = this.props;
        dispatch(setImageryOpacity(value));
    }

    // DSM

    checkColorRamp() {
        const { dispatch } = this.props;
        dispatch(setDsmType("COLORRAMP"));
    }

    checkHillshade() {
        const { dispatch } = this.props;
        dispatch(setDsmType("HILLSHADE"));
    }

    checkNoDsm() {
        const { dispatch } = this.props;
        dispatch(setDsmType("NONE"));
    }

    handleDsmOpacityChange(value) {
        const { dispatch } = this.props;
        dispatch(setDsmOpacity(value));
    }

    // GT DSM

    checkGtColorRamp() {
        const { dispatch } = this.props;
        dispatch(setDsmType("COLORRAMP", "gt"));
    }

    checkGtHillshade() {
        const { dispatch } = this.props;
        dispatch(setDsmType("HILLSHADE", "gt"));
    }

    checkGtNoDsm() {
        const { dispatch } = this.props;
        dispatch(setDsmType("NONE", "gt"));
    }

    handleDsmGtOpacityChange(value) {
        const { dispatch } = this.props;
        dispatch(setDsmOpacity(value, "gt"));
    }

    // Labels

    checkLabels() {
        const { dispatch } = this.props;
        dispatch(setLabelsType("CHECKED"));
    }

    checkNoLabels() {
        const { dispatch } = this.props;
        dispatch(setLabelsType("NONE"));
    }

    handleLabelsOpacityChange(value) {
        const { dispatch } = this.props;
        dispatch(setLabelsOpacity(value));
    }

    // Model Predictions

    checkModelPredictionAllHandler(modelId) {
        const { dispatch } = this.props;
        return function() {
            dispatch(setModelPredictionType(modelId, "ALL"));
        };
    }

    checkModelPredictionIncorrectHandler(modelId) {
        const { dispatch } = this.props;
        return function() {
            dispatch(setModelPredictionType(modelId, "INCORRECT"));
        };
    }

    checkNoModelPredictionHandler(modelId) {
        const { dispatch } = this.props;
        return function() {
            dispatch(setModelPredictionType(modelId, "NONE"));
        };
    }

    handleModelPredictionOpacityChangeHandler(modelId) {
        const { dispatch } = this.props;
        return function(value) {
            dispatch(setModelPredictionOpacity(modelId, value));
        }
    }

    // Model Probabilities

    checkModelProbabilitiesHandler(modelId) {
        const { dispatch } = this.props;
        return function() {
            dispatch(setModelProbabilitiesType(modelId, "CHECKED"));
        };
    }

    checkNoModelProbabilitiesHandler(modelId) {
        const { dispatch } = this.props;
        return function() {
            dispatch(setModelProbabilitiesType(modelId, "NONE"));
        };
    }

    handleModelProbabilitiesLabelHandler(modelId, labelId) {
        const { dispatch } = this.props;
        return function() {
            dispatch(setModelProbabilitiesLabel(modelId, labelId));
        };
    }

    handleModelProbabilitiesOpacityChangeHandler(modelId) {
        const { dispatch } = this.props;
        return function(value) {
            dispatch(setModelProbabilitiesOpacity(modelId, value));
        }
    }

    // AB

    checkAb() {
        const { dispatch } = this.props;
        dispatch(setAbType("CHECKED"));
    }

    checkNoAb() {
        const { dispatch } = this.props;
        dispatch(setAbType("NONE"));
    }

    handleAbOpacityChange(value) {
        const { dispatch } = this.props;
        dispatch(setAbOpacity(value));
    }

    // ABDSM

    checkAbDsm() {
        const { dispatch } = this.props;
        dispatch(setAbType("CHECKED", "dsm"));
    }

    checkNoAbDsm() {
        const { dispatch } = this.props;
        dispatch(setAbType("NONE", "dsm"));
    }

    handleAbDsmOpacityChange(value) {
        const { dispatch } = this.props;
        dispatch(setAbOpacity(value, "dsm"));
    }

    isActive(b) {
        return b ? "pt-active" : "";
    }

    isActiveLabel(b, v) {
        return b == v ? "pt-active" : "";
    }

    render() {
        const {
            imagery,
            dsm,
            dsmGt,
            labels,
            models,
            ab,
            abDsm } = this.props;

        var modelSections = [];
        for (var property in models) {
            if (models.hasOwnProperty(property)) {
                var modelId = property;
                var model = models[modelId];
                var predictions = model.predictions;
                var probabilities = model.probabilities;
                // Model Predictions

                var checkModelPredictionAll = this.checkModelPredictionAllHandler(modelId);
                var checkModelPredictionIncorrect = this.checkModelPredictionIncorrectHandler(modelId);
                var checkNoModelPrediction = this.checkNoModelPredictionHandler(modelId);
                var handleModelPredictionOpacityChange = this.handleModelPredicitionOpacityChangeHandler(modelId);

                // Model Probabilities

                var checkModelProbabilities = this.checkModelProbabilitiesHandler(modelId);
                var checkNoModelProbabilities = this.checkNoModelProbabilitiesHandler(modelId);
                var handleModelProbabilitiesOpacityChange = this.handleModelProbabilitiesOpacityChangeHandler(modelId);

                var handleImperviousSurface = this.handleModelProbabilitiesLabelHandler(modelId, 0);
                var handleBuilding = this.handleModelProbabilitiesLabelHandler(modelId, 1);
                var handleLowVeg = this.handleModelProbabilitiesLabelHandler(modelId, 2);
                var handleTrees = this.handleModelProbabilitiesLabelHandler(modelId, 3);
                var handleCars = this.handleModelProbabilitiesLabelHandler(modelId, 4);
                var handleClutter = this.handleModelProbabilitiesLabelHandler(modelId, 5);

                var probabilitiesLabelButtons = null;
                if(probabilities.checked) {
                    probabilitiesLabelButtons =
                    [<div className="pt-button-group pt-vertical pt-fill">
                        <Button
                            active={predictions.labelId == 0}
                            onClick={handleImperviousSurface}
                            text="Impervious Surfaces"
                            className={this.isActiveLabel(probabilities.labelId, 0)}
                        />
                        <Button
                            active={probabilities.labelId == 1}
                            onClick={handleBuilding}
                            text="Building"
                            className={this.isActiveLabel(probabilities.labelId, 1)}
                        />
                        <Button
                            active={probabilities.labelId == 2}
                            onClick={handleLowVeg}
                            text="Low Vegatation"
                            className={this.isActiveLabel(probabilities.labelId, 2)}
                        />
                        <Button
                            active={probabilities.labelId == 3}
                            onClick={handleTrees}
                            text="Trees"
                            className={this.isActiveLabel(probabilities.labelId, 3)}
                        />
                        <Button
                            active={probabilities.labelId == 4}
                            onClick={handleCars}
                            text="Cars"
                            className={this.isActiveLabel(probabilities.labelId, 4)}
                        />
                        <Button
                            active={probabilities.labelId == 5}
                            onClick={handleClutter}
                            text="Clutter"
                            className={this.isActiveLabel(probabilities.labelId, 5)}
                        />
                    </div>]
                }


                modelSections.push(
                    <div className="option-section">
                        <label htmlFor="" className="primary">Model Predictions: {model.name}</label>
                        <div className="pt-button-group pt-fill">
                            <Button
                                active={predictions.allChecked}
                                onClick={checkModelPredictionAll}
                                text="ALL"
                                className={this.isActive(predictions.allChecked)}
                            />
                            <Button
                                active={predictions.incorrectChecked}
                                onClick={checkModelPredictionIncorrect}
                                text="WRONG"
                                className={this.isActive(predictions.incorrectChecked)}
                            />
                            <Button
                                active={!(predictions.allChecked || predictions.incorrectChecked)}
                                onClick={checkNoModelPrediction}
                                text="OFF"
                                className={this.isActive(!(predictions.allChecked || predictions.incorrectChecked))}
                            />
                        </div>
                        <div className="slider-section">
                            <label htmlFor="" className="secondary">Opacity</label>
                            <Slider
                                min={0}
                                max={1}
                                stepSize={0.02}
                                renderLabel={false}
                                value={predictions.opacity}
                                onChange={handleModelPredictionOpacityChange}
                            />
                        </div>
                    </div>
                )
                modelSections.push(
                    <div className="option-section">
                        <label htmlFor="" className="primary">Model Probabilities: {model.name}</label>
                        <div className="pt-button-group pt-fill">
                            <Button
                                active={probabilities.checked}
                                onClick={checkModelProbabilities}
                                text="ON"
                                className={this.isActive(probabilities.checked)}
                            />
                            <Button
                                active={!probabilities.checked}
                                onClick={checkNoModelProbabilities}
                                text="OFF"
                                className={this.isActive(!probabilities.checked)}
                            />
                        </div>
                        <div className="slider-section">
                            <label htmlFor="" className="secondary">Opacity</label>
                            <Slider
                                min={0}
                                max={1}
                                stepSize={0.02}
                                renderLabel={false}
                                value={probabilities.opacity}
                                onChange={handleModelProbabilitiesOpacityChange}
                            />
                        </div>
                        {probabilitiesLabelButtons}
                    </div>
                )
            }
        }

        return (
            <div className="content tab-content content-singlelayer active">
                <div className="option-section">
                    <label htmlFor="" className="primary">Imagery</label>
                    <div className="pt-button-group pt-fill">
                        <Button
                            active={imagery.rgbChecked}
                            onClick={this.checkRgb}
                            text="RGB"
                            className={this.isActive(imagery.rgbChecked)}
                        />
                        <Button
                            active={imagery.irrgChecked}
                            onClick={this.checkIrrg}
                            text="IRRG"
                            className={this.isActive(imagery.irrgChecked)}
                        />
                    </div>
                    <div className="pt-button-group pt-fill">
                        <Button
                            active={imagery.ndviChecked}
                            onClick={this.checkNdvi}
                            text="NDVI"
                            className={this.isActive(imagery.ndviChecked)}
                        />
                        <Button
                            active={imagery.grayscaleChecked}
                            onClick={this.checkGrayscale}
                            text="GRAYSCALE"
                            className={this.isActive(imagery.grayscaleChecked)}
                        />
                        <Button
                            active={!(imagery.rgbChecked || imagery.irrgChecked || imagery.ndviChecked || imagery.grayscaleChecked)}
                            onClick={this.checkNoImagery}
                            text="OFF"
                            className={this.isActive(!(imagery.rgbChecked || imagery.irrgChecked || imagery.ndviChecked || imagery.grayscaleChecked))}
                        />
                    </div>
                    <div className="slider-section">
                        <label htmlFor="" className="secondary">Opacity</label>
                        <Slider
                            min={0}
                            max={1}
                            stepSize={0.02}
                            renderLabel={false}
                            value={imagery.opacity}
                            onChange={this.handleImageryOpacityChange}
                        />
                    </div>
                </div>
                <div className="option-section">
                    <label htmlFor="" className="primary">DSM</label>
                    <div className="pt-button-group pt-fill">
                        <Button
                            active={dsm.hillshadeChecked}
                            onClick={this.checkHillshade}
                            text="Hillshade"
                            className={this.isActive(dsm.hillshadeChecked)}
                        />
                        <Button
                            active={dsm.colorRampChecked}
                            onClick={this.checkColorRamp}
                            text="Ramp"
                            className={this.isActive(dsm.colorRampChecked)}
                        />
                        <Button
                            active={!(dsm.colorRampChecked || dsm.hillshadeChecked)}
                            onClick={this.checkNoDsm}
                            text="OFF"
                            className={this.isActive(!(dsm.colorRampChecked || dsm.hillshadeChecked))}
                        />
                    </div>
                    <div className="slider-section">
                        <label htmlFor="" className="secondary">Opacity</label>
                        <Slider
                            min={0}
                            max={1}
                            stepSize={0.02}
                            renderLabel={false}
                            value={dsm.opacity}
                            onChange={this.handleDsmOpacityChange}
                        />
                    </div>
                </div>
                <div className="option-section">
                    <label htmlFor="" className="primary">DSM - GeoTrellis Generated</label>
                    <div className="pt-button-group pt-fill">
                        <Button
                            active={dsmGt.hillshadeChecked}
                            onClick={this.checkGtHillshade}
                            text="Hillshade"
                            className={this.isActive(dsmGt.hillshadeChecked)}
                        />
                        <Button
                            active={dsmGt.colorRampChecked}
                            onClick={this.checkGtColorRamp}
                            text="Ramp"
                            className={this.isActive(dsmGt.colorRampChecked)}
                        />
                        <Button
                            active={!(dsmGt.colorRampChecked || dsmGt.hillshadeChecked)}
                            onClick={this.checkGtNoDsm}
                            text="OFF"
                            className={this.isActive(!(dsmGt.colorRampChecked || dsmGt.hillshadeChecked))}
                        />
                    </div>
                    <div className="slider-section">
                        <label htmlFor="" className="secondary">Opacity</label>
                        <Slider
                            min={0}
                            max={1}
                            stepSize={0.02}
                            renderLabel={false}
                            value={dsmGt.opacity}
                            onChange={this.handleDsmGtOpacityChange}
                        />
                    </div>
                </div>
                <div className="option-section">
                    <label htmlFor="" className="primary">Labels</label>
                    <div className="pt-button-group pt-fill">
                        <Button
                            active={labels.checked}
                            onClick={this.checkLabels}
                            text="ON"
                            className={this.isActive(labels.checked)}
                        />
                        <Button
                            active={!labels.checked}
                            onClick={this.checkNoLabels}
                            text="OFF"
                            className={this.isActive(!labels.checked)}
                        />
                    </div>
                    <div className="slider-section">
                        <label htmlFor="" className="secondary">Opacity</label>
                        <Slider
                            min={0}
                            max={1}
                            stepSize={0.02}
                            renderLabel={false}
                            value={labels.opacity}
                            onChange={this.handleLabelsOpacityChange}
                        />
                    </div>
                </div>
                {modelSections}
                <div className="option-section">
                    <label htmlFor="" className="primary">FCN vs UNET</label>
                    <div className="pt-button-group pt-fill">
                        <Button
                            active={ab.checked}
                            onClick={this.checkAb}
                            text="ON"
                            className={this.isActive(ab.checked)}
                        />
                        <Button
                            active={!ab.checked}
                            onClick={this.checkNoAb}
                            text="OFF"
                            className={this.isActive(!ab.checked)}
                        />
                    </div>
                    <div className="slider-section">
                        <label htmlFor="" className="secondary">Opacity</label>
                        <Slider
                            min={0}
                            max={1}
                            stepSize={0.02}
                            renderLabel={false}
                            value={ab.opacity}
                            onChange={this.handleAbOpacityChange}
                        />
                    </div>
                </div>
                <div className="option-section">
                    <label htmlFor="" className="primary">FCN vs FCN w/ DSM</label>
                    <div className="pt-button-group pt-fill">
                        <Button
                            active={abDsm.checked}
                            onClick={this.checkAbDsm}
                            text="ON"
                            className={this.isActive(abDsm.checked)}
                        />
                        <Button
                            active={!abDsm.checked}
                            onClick={this.checkNoAbDsm}
                            text="OFF"
                            className={this.isActive(!abDsm.checked)}
                        />
                    </div>
                    <div className="slider-section">
                        <label htmlFor="" className="secondary">Opacity</label>
                        <Slider
                            min={0}
                            max={1}
                            stepSize={0.02}
                            renderLabel={false}
                            value={abDsm.opacity}
                            onChange={this.handleAbDsmOpacityChange}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

SingleLayer.propTypes = {
    dispatch: PropTypes.func.isRequired,
    imagery: PropTypes.object.isRequired,
    dsm: PropTypes.object.isRequired,
    dsmGt: PropTypes.object.isRequired,
    labels: PropTypes.object.isRequired,
    models: PropTypes.object.isRequired
}

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { debounce, map } from 'lodash';
import Select from 'react-select';

import {
    autocompleteGeocoderSearch,
    clearAutocompleteResults,
    selectGeocoderResult,
} from './actions';

class Geocoder extends Component {
    constructor(props) {
        super(props);
        this.state = { address: '', options: [] };
        this.submitAutocomplete = debounce(this.submitAutocomplete, 300).bind(this);
        this.handleSelectInputChange = this.handleSelectInputChange.bind(this);
        this.handleOptionSelect = this.handleOptionSelect.bind(this);
    }

    handleSelectInputChange(inputAddress) {
        this.setState({ address: inputAddress });
        this.submitAutocomplete(inputAddress);
    }

    handleOptionSelect({ value }) {
        this.props.dispatch(selectGeocoderResult(value));
    }

    submitAutocomplete(address) {
        const { dispatch } = this.props;
        if (address) {
            dispatch(autocompleteGeocoderSearch(address));
        } else {
            dispatch(clearAutocompleteResults());
        }
    }

    render() {
        const { results } = this.props;
        const formattedAutocompleteResults = map(results, result => ({
            label: result.name,
            value: result,
        }));

        return (
            <div className="addresspicker">
                <div className="input-container">
                    <Select
                        onInputChange={this.handleSelectInputChange}
                        onChange={this.handleOptionSelect}
                        placeholder="Enter an address to select an area"
                        options={formattedAutocompleteResults}
                        autoBlur
                        filterOptions={false}
                    />
                </div>
            </div>
        );
    }
}

Geocoder.propTypes = {
    dispatch: PropTypes.func.isRequired,
    error: PropTypes.bool.isRequired,
    results: PropTypes.array.isRequired,
};

function mapStateToProps({ geocoder }) {
    return {
        error: geocoder.error,
        results: geocoder.results,
    };
}

export default connect(mapStateToProps)(Geocoder);

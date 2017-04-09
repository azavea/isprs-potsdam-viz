import React, { Component, PropTypes } from 'react';
import { map } from 'lodash';

import { setRadius } from './actions';

function mileLabel(miles) {
    switch (miles) {
        case 0.5:
            return '½ miles';
        case 1:
            return '1 mile';
        default:
            return `${miles} miles`;
    }
}

export default class RadiusPicker extends Component {
    constructor(props) {
        super(props);

        this.handleOptionSelect = this.handleOptionSelect.bind(this);
    }

    handleOptionSelect({ target }) {
        this.props.dispatch(setRadius(parseFloat(target.value)));
    }

    render() {
        const { radii, selected } = this.props;
        const radiusOptions = map(radii, (radius, index) =>
            <span
                key={index}
                className="radiuspicker-option"
            >
                <label htmlFor={`radius-${index}`}>
                    <input
                        id={`radius-${index}`}
                        name="radius"
                        type="radio"
                        value={radius}
                        onChange={this.handleOptionSelect}
                        checked={radius === selected}
                    />
                    <div className="radiuspicker-label">{mileLabel(radius)}</div>
                </label>
            </span>
        );

        return (
            <div className="radiuspicker">
                <h3 className="radiuspicker-title display-inline">
                    Selection radius
                </h3>
                <form
                    className="display-inline"
                    action=""
                >
                    {radiusOptions}
                </form>
            </div>
        );
    }
}

RadiusPicker.propTypes = {
    dispatch: PropTypes.func.isRequired,
    radii: PropTypes.arrayOf(PropTypes.number).isRequired,
    selected: PropTypes.number.isRequired,
};

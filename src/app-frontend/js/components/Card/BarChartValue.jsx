import React, { PropTypes } from 'react';
import { round } from 'lodash';

export default function BarChartValue({ value, maxValue }) {
    const fillWidth = { width: `${round((value / maxValue) * 20.0, 0)}.0rem` };
    return (
        <td className="bar-chart-value">
            <span
                style={fillWidth}
                className="bar-chart-progress-fill"
            />
            <span className="bar-chart-progress-value">
                {`${value}%`}
            </span>
        </td>
    );
}

BarChartValue.propTypes = {
    value: PropTypes.number.isRequired,
    maxValue: PropTypes.number.isRequired,
};

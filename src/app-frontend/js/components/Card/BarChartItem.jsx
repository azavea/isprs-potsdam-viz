import React, { PropTypes } from 'react';

import BarChartValue from './BarChartValue.jsx';

export default function BarChartItem({ name, value, maxValue }) {
    const maximumValue = (maxValue.value * 0.8) ? maxValue.value : 80;

    return (
        <tr className="bar-chart-row">
            <td className="bar-chart-text">
                {name}
            </td>
            <BarChartValue
                value={value}
                maxValue={maximumValue}
            />
        </tr>
    );
}

BarChartItem.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    maxValue: PropTypes.object.isRequired,
};

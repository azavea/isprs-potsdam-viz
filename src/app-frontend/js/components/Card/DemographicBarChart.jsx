import React, { PropTypes } from 'react';
import { map, maxBy } from 'lodash';

import BarChartItem from './BarChartItem.jsx';

export default function DemographicBarChart({ data }) {
    const maxValue = maxBy(data, ({ value }) => (value));

    const barChartItems = map(data, ({ name, value }) => {
        if (value > 0) {
            return (
                <BarChartItem
                    key={name}
                    name={name}
                    value={value}
                    maxValue={maxValue}
                />
            );
        }

        return null;
    });

    return (
        <table className="demographics-bar-chart-table">
            <tbody>
                {barChartItems}
            </tbody>
        </table>
    );
}

DemographicBarChart.propTypes = {
    data: PropTypes.array.isRequired,
};

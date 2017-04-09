import React from 'react';
import _ from 'lodash';

import { DemographicsResultTypeDef } from 'TypeDefs';
import { mapStateDataToChartData } from 'utils';
import DemographicBarChart from './DemographicBarChart.jsx';

function demographicTable(data, template) {
    let displayedData = '';
    if (data) {
        if (_.isArray(data)) {
            const mappedVals = _.map(data, d => template(d));
            displayedData = _.join(mappedVals, _.size(data) > 1 ? ', ' : '');
        } else {
            displayedData = template(data);
        }
    }

    return (<h4 className="card-title">{displayedData}</h4>);
}

function demographicCard(title, table, chart) {
    return (
        <div className="card">
            <h3 className="demographic-title">{title}</h3>
            {table}
            {chart}
        </div>
    );
}

export default function DemographicCards({ data }) {
    const { income, population, medianAge, genderMakeup, racialMakeup } = data || {};

    const incomeCard = demographicCard(
        'Per-Capita Income',
        demographicTable(
            income, (obj) => (`$${obj.quantity.toLocaleString()}`)),
        null
    );

    const populationCard = demographicCard(
        'Population',
        demographicTable(
            population, (obj) => (`${obj.quantity.toLocaleString()} ${obj.uom}`)),
        null
    );

    const medianAgeCard = demographicCard(
        'Median Age',
        demographicTable(
            medianAge, (obj) => (`${obj.quantity} ${obj.uom}`)),
        null
    );

    const genderCard = demographicCard(
        'Sex',
        demographicTable(
            genderMakeup,
            (obj) => (`${obj.quantity}${obj.uom} ${obj.descriptor}`)),
        null
    );

    const raceDemographicData = mapStateDataToChartData(racialMakeup,
        datum => _.round(datum * 100, 0));
    const raceDemographicCard = raceDemographicData ?
        <DemographicBarChart data={raceDemographicData} /> : null;

    return (
        <div className="card-container card-demographics">
            {incomeCard}
            {genderCard}
            {medianAgeCard}
            {populationCard}
            <div className="card">
                <h3 className="demographic-title">Race</h3>
                {raceDemographicCard}
            </div>
        </div>
    );
}

DemographicCards.propTypes = {
    data: DemographicsResultTypeDef,
};

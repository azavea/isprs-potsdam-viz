import React from 'react';
import { map } from 'lodash';

import { PoliticsResultTypeDef } from 'TypeDefs';
import PoliticianCard from './PoliticianCard';

export default function PoliticsCards({ data }) {
    const cards = map(data, (obj, index) =>
        (<PoliticianCard key={index} politician={obj} />));

    return (
        <div className="card-container">
            {cards}
        </div>
    );
}

PoliticsCards.propTypes = {
    data: PoliticsResultTypeDef,
};

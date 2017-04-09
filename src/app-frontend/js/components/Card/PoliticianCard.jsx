import React, { Component } from 'react';
import { get } from 'lodash';

import { PoliticianTypeDef } from 'TypeDefs';

const partyStyleMap = {
    democrat: 'card-democrat',
    republican: 'card-republican',
};

const iconMap = {
    twitter: 'icon-twitter',
    facebook: 'icon-facebook',
    link: 'icon-link',
    email: 'icon-mail-squared',
};

function getPartyStyle(party) {
    return get(partyStyleMap, party.toLowerCase(), 'card-otherparty');
}

function onlineElement(link, icon) {
    const linkDestination = icon === iconMap.email ? `mailto:${link}` : link;
    return (
        <a
            key={`${link}_${icon}`}
            href={linkDestination}
            target="_blank"
            rel="noopener noreferrer"
        >
            <i className={`icon ${icon}`} />
        </a>
    );
}

function formatAddress(address) {
    if (!address) { return null; }
    const [street, city] = address.split('\n');
    return (
        <div>
            {street}<br />
            {city}
        </div>
    );
}

export default class PoliticianCard extends Component {
    constructor(props) {
        super(props);
        this.state = { displayCardExtra: false };
        this.displayCardExtra = this.displayCardExtra.bind(this);
    }

    displayCardExtra() {
        this.setState({ displayCardExtra: !this.state.displayCardExtra });
    }

    render() {
        const { twitter, facebook, email, link, district, address, name, party,
            phone } = this.props.politician;

        const { displayCardExtra } = this.state;

        const twitterElement = twitter ? (
            <span className="card-social">
                {onlineElement(twitter, iconMap.twitter)}
            </span>
        ) : null;

        const facebookElement = facebook ? (
            <span className="card-social">
                {onlineElement(facebook, iconMap.facebook)}
            </span>
        ) : null;

        const emailElement = email ? (
            <span className="card-social">
                {onlineElement(email, iconMap.email)}
            </span>
        ) : null;

        const linkElement = link ? (
            <span className="card-social">
                {onlineElement(link, iconMap.link)}
            </span>
        ) : null;

        const cardExtraCSSClassName = displayCardExtra ?
            'card-extra-visible' : 'card-extra';

        const arrowIconCSSClassName = displayCardExtra ?
             'icon icon-down-dir' : 'icon icon-left-dir';

        return (
            <div className="card">
                <h4 className="card-title">{name}</h4>
                <h5 className="card-subtitle">{district}</h5>
                <div className="card-details">
                    <div className={`card-party ${getPartyStyle(party)}`}>
                        {party}
                    </div>
                    {facebookElement}
                    {twitterElement}
                    {linkElement}
                    {emailElement}
                    <div
                        className="card-viewextra"
                        onClick={this.displayCardExtra}
                    >
                        View address & phone
                        <i className={arrowIconCSSClassName} />
                    </div>
                    <div className={cardExtraCSSClassName}>
                        {formatAddress(address)}
                        <a
                            href={`tel:${phone}`}
                        >
                            {phone}
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}

PoliticianCard.propTypes = {
    politician: PoliticianTypeDef,
};

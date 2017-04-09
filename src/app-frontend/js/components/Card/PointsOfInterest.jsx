import React, { Component, PropTypes } from 'react';
import {
    indexOf,
    isEqual,
    map,
    take,
} from 'lodash';

import { CommunityOrgTypeDef } from 'TypeDefs';
import {
    setHoverGeom,
    clearHoverGeom,
    setHighlightedGeom,
    clearHighlightedGeom,
} from '../actions';

function pointOfInterestCard(dispatch, org, id, highlightedCard) {
    const { geometry, name, address, phone, contactPerson, description } = org;

    const mouseEnterHandler = () => {
        if (geometry) {
            dispatch(clearHoverGeom());
            setTimeout(() => dispatch(setHoverGeom(geometry)));
        }
    };

    const clickHandler = () => {
        if (geometry) {
            dispatch(clearHighlightedGeom());
            if (id !== highlightedCard) {
                setTimeout(() => dispatch(setHighlightedGeom(geometry, id)), 50);
            }
        }
    };

    const mouseLeaveHandler = () => dispatch(clearHoverGeom());

    // Helper method to convert emails to links
    const linkIfEmail = (text) => (
        indexOf(text, '@') > 0
            ? <a href={`mailto:${text}`}>{text}</a>
            : text
    );

    const mappable = geometry ? 'mappable' : '';
    const active = id === highlightedCard ? 'active' : '';

    return (
        <div
            key={id}
            className={`card ${mappable} ${active}`}
            onMouseEnter={mouseEnterHandler}
            onClick={clickHandler}
            onMouseLeave={mouseLeaveHandler}
        >
            <h4 className="card-title">{name}</h4>
            <div className="card-details">
                <div className="card-address">
                    {address}
                </div>
                {contactPerson
                    ? <div className="card-person">{contactPerson}</div>
                    : null}
                {description
                    ? <div className="card-email">{linkIfEmail(description)}</div>
                    : null}
                <div className="card-phone">
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

export default class PointOfInterestCards extends Component {
    constructor(props) {
        super(props);

        this.state = { hideCards: true };
        this.showAllCards = this.showAllCards.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        // TODO Expensive to do this on every redux state change.
        // Find a more efficient place to reset state.
        if (!isEqual(this.props.searchResult, nextProps.searchResult)) {
            this.setState({ hideCards: true });
        }
    }

    showAllCards() {
        this.setState({ hideCards: false });
    }

    render() {
        const { dispatch, header, showFirst, searchResult, highlightedCard } = this.props;
        const { hideCards } = this.state;

        const cards = map(searchResult, (org, index) =>
                          pointOfInterestCard(dispatch, org, header + index, highlightedCard));
        const shownCards = hideCards ? take(cards, showFirst || 3) : cards;
        const hiddenCardCount = cards.length - (showFirst || 3);

        if (shownCards.length === 0) {
            return null;
        }

        return (
            <div>
                <h3 className="section-title">{header}</h3>
                <div className="card-container">{shownCards}</div>
                {hideCards && (hiddenCardCount > 0) ?
                    <button
                        onClick={this.showAllCards}
                        className="button-link button view-more"
                    >
                        {`View ${hiddenCardCount} more`}
                    </button>
                    : null}
            </div>
        );
    }
}

PointOfInterestCards.propTypes = {
    dispatch: PropTypes.func.isRequired,
    header: PropTypes.string.isRequired,
    showFirst: PropTypes.number,
    searchResult: PropTypes.arrayOf(CommunityOrgTypeDef),
    highlightedCard: PropTypes.string,
};

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';

import { resetAddressData } from './actions';
import Geocoder from '../geocoder';

import PGWLogo from '../../img/geotrellis-logo.png';

class Intro extends Component {
    componentDidMount() {
        this.props.dispatch(resetAddressData());
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.address !== this.props.address) {
            browserHistory.push('/app');
        }
    }

    render() {
        return (
            <div className="flex-expand-column height-100percent mode-intro">
                <header className="primary">
                    <div className="brand">
                        <img src={PGWLogo} alt="PGW" />
                    </div>
                </header>
                <main>
                    <div className="layout-intro">
                        <div className="intro-container">
                            <h1>Explore communities and learn about them</h1>
                            <Geocoder />
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                Soluta neque tempore dignissimos suscipit vel aspernatur,
                                asperiores velit sed reiciendis adipisci.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }
}

Intro.propTypes = {
    dispatch: PropTypes.func.isRequired,
    address: PropTypes.object,
};

function mapStateToProps({ appPage }) {
    return {
        address: appPage.address,
    };
}

export default connect(mapStateToProps)(Intro);

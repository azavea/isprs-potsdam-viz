import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';

import '../sass/main.scss';
import createStoreWithMiddleware from './store';
import mainReducer from './reducer';
import App from './components/App.jsx';

const store = createStoreWithMiddleware(mainReducer);

render(
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path="/" component={App} />
        </Router>
    </Provider>,
    document.getElementById('mount')
);

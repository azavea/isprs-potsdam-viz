import { createStore, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import { isDevelopment } from 'constants.js';

let innerCreateStoreWithMiddleware = applyMiddleware(thunk)(createStore);
if (isDevelopment) {
    const logger = createLogger();
    innerCreateStoreWithMiddleware = applyMiddleware(thunk, logger)(createStore);
}

const createStoreWithMiddleware = innerCreateStoreWithMiddleware;
export default createStoreWithMiddleware;

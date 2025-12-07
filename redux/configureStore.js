import { createStore, combineReducers, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import logger from 'redux-logger';
import { products } from './products';
import { promotions } from './promotions';
import { partners } from './partners';

export const ConfigureStore = () => {
    const store = createStore(
        combineReducers({
            products,
            promotions,
            partners
        }),
        applyMiddleware(thunk, logger)
    );

    return store;
};

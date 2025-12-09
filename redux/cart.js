import * as ActionTypes from './ActionTypes';

export const cart = (state = [], action) => {
    switch (action.type) {
        case ActionTypes.ADD_TO_CART:
            const exists = state.some(item => item.id === action.payload.id);
            if (exists) {
                return state.map(item =>
                    item.id === action.payload.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...state, { ...action.payload, quantity: 1 }];
            }

        case ActionTypes.DELETE_FROM_CART:
            return state.filter((item) => item.id !== action.payload);

        case ActionTypes.DECREASE_FROM_CART:
            return state.map(item =>
                item.id === action.payload
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            ).filter(item => item.quantity > 0);

        default:
            return state;
    }
};

import * as ActionTypes from './ActionTypes';

export const notifications = (state = { isLoading: true,
                                        errMess: null,
                                        notifications: []}, action) => {
    switch (action.type) {
        case ActionTypes.ADD_NOTIFICATIONS:
            return {...state, isLoading: false, errMess: null, notifications: action.payload};

        case ActionTypes.NOTIFICATIONS_LOADING:
            return {...state, isLoading: true, errMess: null, notifications: []}

        case ActionTypes.NOTIFICATIONS_FAILED:
            return {...state, isLoading: false, errMess: action.payload};

        default:
            return state;
    }
};

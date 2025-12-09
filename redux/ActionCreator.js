import * as ActionTypes from './ActionTypes';
import { PRODUCTS } from '../shared/products';
import { PROMOTIONS } from '../shared/promotions';
import { PARTNERS } from '../shared/partners';

export const fetchProducts = () => (dispatch) => {
    dispatch(productsLoading());

    setTimeout(() => {
        dispatch(addProducts(PRODUCTS));
    }, 2000);
};

export const productsLoading = () => ({
    type: ActionTypes.PRODUCTS_LOADING
});

export const productsFailed = (errmess) => ({
    type: ActionTypes.PRODUCTS_FAILED,
    payload: errmess
});

export const addProducts = (products) => ({
    type: ActionTypes.ADD_PRODUCTS,
    payload: products
});

export const fetchPromotions = () => (dispatch) => {
    dispatch(promotionsLoading());

    setTimeout(() => {
        dispatch(addPromotions(PROMOTIONS));
    }, 2000);
};

export const promotionsLoading = () => ({
    type: ActionTypes.PROMOTIONS_LOADING
});

export const promotionsFailed = (errmess) => ({
    type: ActionTypes.PROMOTIONS_FAILED,
    payload: errmess
});

export const addPromotions = (promotions) => ({
    type: ActionTypes.ADD_PROMOTIONS,
    payload: promotions
});

export const fetchPartners = () => (dispatch) => {
    dispatch(partnersLoading());

    setTimeout(() => {
        dispatch(addPartners(PARTNERS));
    }, 2000);
};

export const partnersLoading = () => ({
    type: ActionTypes.PARTNERS_LOADING
});

export const partnersFailed = (errmess) => ({
    type: ActionTypes.PARTNERS_FAILED,
    payload: errmess
});

export const addPartners = (partners) => ({
    type: ActionTypes.ADD_PARTNERS,
    payload: partners
});

export const addToCart = (product) => ({
    type: ActionTypes.ADD_TO_CART,
    payload: product
});

export const deleteFromCart = (productId) => ({
    type: ActionTypes.DELETE_FROM_CART,
    payload: productId
});

export const decreaseFromCart = (productId) => ({
    type: ActionTypes.DECREASE_FROM_CART,
    payload: productId
});

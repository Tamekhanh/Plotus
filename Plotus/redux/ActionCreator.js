import * as ActionTypes from './ActionTypes';
import { baseUrl } from '../shared/baseUrl';

export const fetchProducts = () => (dispatch) => {
    dispatch(productsLoading());

    return fetch(baseUrl + 'products')
        .then(response => {
            if (response.ok) {
                return response;
            } else {
                var error = new Error('Error ' + response.status + ': ' + response.statusText);
                error.response = response;
                throw error;
            }
        },
        error => {
            var errmess = new Error(error.message);
            throw errmess;
        })
        .then(response => response.json())
        .then(products => dispatch(addProducts(products)))
        .catch(error => dispatch(productsFailed(error.message)));
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

    return fetch(baseUrl + 'promotions')
        .then(response => {
            if (response.ok) {
                return response;
            } else {
                var error = new Error('Error ' + response.status + ': ' + response.statusText);
                error.response = response;
                throw error;
            }
        },
        error => {
            var errmess = new Error(error.message);
            throw errmess;
        })
        .then(response => response.json())
        .then(promotions => dispatch(addPromotions(promotions)))
        .catch(error => dispatch(promotionsFailed(error.message)));
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

    return fetch(baseUrl + 'partners')
        .then(response => {
            if (response.ok) {
                return response;
            } else {
                var error = new Error('Error ' + response.status + ': ' + response.statusText);
                error.response = response;
                throw error;
            }
        },
        error => {
            var errmess = new Error(error.message);
            throw errmess;
        })
        .then(response => response.json())
        .then(partners => dispatch(addPartners(partners)))
        .catch(error => dispatch(partnersFailed(error.message)));
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

export const clearCart = () => ({
    type: ActionTypes.CLEAR_CART
});

export const fetchOrders = () => (dispatch) => {
    dispatch(ordersLoading());

    return fetch(baseUrl + 'orders')
        .then(response => {
            if (response.ok) {
                return response;
            } else {
                var error = new Error('Error ' + response.status + ': ' + response.statusText);
                error.response = response;
                throw error;
            }
        },
        error => {
            var errmess = new Error(error.message);
            throw errmess;
        })
        .then(response => response.json())
        .then(orders => dispatch(addOrders(orders)))
        .catch(error => dispatch(ordersFailed(error.message)));
};

export const ordersLoading = () => ({
    type: ActionTypes.ORDERS_LOADING
});

export const ordersFailed = (errmess) => ({
    type: ActionTypes.ORDERS_FAILED,
    payload: errmess
});

export const addOrders = (orders) => ({
    type: ActionTypes.ADD_ORDERS,
    payload: orders
});

export const postOrder = (orderInfo) => (dispatch, getState) => {
    const newOrder = {
        customerName: orderInfo.customerName ?? 'Retail customers',
        email: orderInfo.email,
        phone: orderInfo.phone,
        taxCode: orderInfo.taxCode,
        date: new Date().toISOString(),
        items: orderInfo.cart,
        total: orderInfo.total.toFixed(2),
        paymentMethod: orderInfo.paymentMethod,
        deliveryMethod: orderInfo.deliveryMethod,
        address: orderInfo.address,
        deliveryFee: orderInfo.deliveryFee,
        status: 'Commplete'
    };

    return fetch(baseUrl + 'orders', {
        method: 'POST',
        body: JSON.stringify(newOrder),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            return response;
        } else {
            var error = new Error('Error ' + response.status + ': ' + response.statusText);
            error.response = response;
            throw error;
        }
    },
    error => { throw error; })
    .then(response => response.json())
    .then(async response => {
        // Update stock
        const products = getState().products.products;
        const updatePromises = orderInfo.cart.map(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                const newQuantity = Math.max(0, parseInt(product.quantity) - item.quantity);
                return fetch(baseUrl + 'products/' + item.id, {
                    method: 'PATCH',
                    body: JSON.stringify({ quantity: newQuantity }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
            return Promise.resolve();
        });

        await Promise.all(updatePromises);

        alert('Order placed successfully!');
        dispatch(clearCart());
        dispatch(fetchOrders());
        dispatch(fetchProducts());
    })
    .catch(error => {
        console.log('Post order ', error.message);
        alert('Your order could not be placed\nError: ' + error.message);
    });
};

export const confirmOrder = (orderId) => (dispatch) => {
    const confirmedDate = new Date().toISOString();
    return fetch(baseUrl + 'orders/' + orderId, {
        method: 'PATCH',
        body: JSON.stringify({ confirmed: true, confirmedDate: confirmedDate, status: 'Commplete' }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            return response;
        } else {
            var error = new Error('Error ' + response.status + ': ' + response.statusText);
            error.response = response;
            throw error;
        }
    },
    error => { throw error; })
    .then(response => response.json())
    .then(response => {
        alert('Order confirmed successfully!');
        dispatch(fetchOrders());
    })
    .catch(error => {
        console.log('Confirm order ', error.message);
        alert('Your order could not be confirmed\nError: ' + error.message);
    });
};

export const cancelOrder = (orderId) => (dispatch) => {
    return fetch(baseUrl + 'orders/' + orderId, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Cancelled' }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            return response;
        } else {
            var error = new Error('Error ' + response.status + ': ' + response.statusText);
            error.response = response;
            throw error;
        }
    },
    error => { throw error; })
    .then(response => response.json())
    .then(response => {
        alert('Order cancelled successfully!');
        dispatch(fetchOrders());
    })
    .catch(error => {
        console.log('Cancel order ', error.message);
        alert('Your order could not be cancelled\nError: ' + error.message);
    });
};

export const postProduct = (name, description, price, image, category, brand, quantity) => (dispatch) => {
    
    return fetch(baseUrl + 'products')
    .then(response => response.json())
    .then(products => {
        let maxSerial = 1234567890000;
        products.forEach(p => {
            if (p.serialNumber && !isNaN(p.serialNumber)) {
                const sn = parseInt(p.serialNumber);
                if (sn > maxSerial) maxSerial = sn;
            }
        });
        const nextSerial = (maxSerial + 1).toString();

        const newProduct = {
            name: name,
            description: description,
            price: price,
            image: image,
            category: category,
            brand: brand,
            quantity: quantity,
            label: '',
            featured: false,
            serialNumber: nextSerial
        };

        return fetch(baseUrl + 'products', {
            method: 'POST',
            body: JSON.stringify(newProduct),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    })
    .then(response => {
        if (response.ok) {
            return response;
        } else {
            var error = new Error('Error ' + response.status + ': ' + response.statusText);
            error.response = response;
            throw error;
        }
    },
    error => { throw error; })
    .then(response => response.json())
    .then(response => dispatch(fetchProducts()))
    .catch(error => {
        console.log('Post product ', error.message);
        alert('Your product could not be posted\nError: ' + error.message);
    });
};

export const deleteProduct = (productId) => (dispatch) => {
    return fetch(baseUrl + 'products/' + productId, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            return response;
        } else {
            var error = new Error('Error ' + response.status + ': ' + response.statusText);
            error.response = response;
            throw error;
        }
    },
    error => { throw error; })
    .then(response => dispatch(fetchProducts()))
    .catch(error => {
        console.log('Delete product ', error.message);
        alert('Your product could not be deleted\nError: ' + error.message);
    });
};

export const updateProduct = (productId, name, description, price, image, category, brand, quantity) => (dispatch) => {
    const updatedProduct = {
        name: name,
        description: description,
        price: price,
        image: image,
        category: category,
        brand: brand,
        quantity: quantity
    };

    return fetch(baseUrl + 'products/' + productId, {
        method: 'PATCH',
        body: JSON.stringify(updatedProduct),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            return response;
        } else {
            var error = new Error('Error ' + response.status + ': ' + response.statusText);
            error.response = response;
            throw error;
        }
    },
    error => { throw error; })
    .then(response => response.json())
    .then(response => {
        alert('Product updated successfully!');
        dispatch(fetchProducts());
    })
    .catch(error => {
        console.log('Update product ', error.message);
        alert('Your product could not be updated\nError: ' + error.message);
    });
};

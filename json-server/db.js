const partners = require('./data/partners');
const promotions = require('./data/promotions');
const products = require('./data/products');
const favorites = require('./data/favorites');
const orders = require('./data/orders');

module.exports = () => {
  return {
    partners,
    promotions,
    products,
    favorites,
    orders
  }
}

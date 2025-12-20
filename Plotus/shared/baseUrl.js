export let baseUrl = 'http://10.106.25.116:3001/';
export let imageUrl = baseUrl + 'images/product/';
export let partnerImageUrl = baseUrl + 'images/partner/';
export let promotionImageUrl = baseUrl + 'images/event/';

export const setBaseUrl = (ip) => {
    if (ip && ip.trim() !== '') {
        baseUrl = `http://${ip}:3001/`;
    } else {
        baseUrl = 'http://10.106.25.116:3001/';
    }
    imageUrl = baseUrl + 'images/product/';
    partnerImageUrl = baseUrl + 'images/partner/';
    promotionImageUrl = baseUrl + 'images/event/';
};
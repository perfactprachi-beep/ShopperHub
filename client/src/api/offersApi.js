import api from './axios.js';
export const getActiveOffers = () => api.get('/offers/active').then(r => r.data.data);

import api from './axios.js';
export const getActiveOffers = (categoryId) =>
  api.get('/offers/active', { params: categoryId ? { categoryId } : {} }).then(r => r.data.data);

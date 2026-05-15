import api from './axios.js';

export const getReviews = (productId) => api.get(`/reviews/${productId}`);
export const checkPurchased = (productId) => api.get(`/reviews/${productId}/purchased`);
export const addReview = (body) => api.post('/reviews', body);

import api from './axios.js';

export const getOrders = (params) => api.get('/orders', { params });
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const cancelOrder = (id) => api.post(`/orders/${id}/cancel`);

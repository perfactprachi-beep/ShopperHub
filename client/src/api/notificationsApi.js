import api from './axios.js';

export const getNotifications = () => api.get('/notifications');
export const markAllRead = () => api.put('/notifications/read');

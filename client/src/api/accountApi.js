import api from './axios.js';

export const getProfile = () => api.get('/account');
export const updateProfile = (body) => api.put('/account', body);
export const getFirstCitizen = () => api.get('/account/first-citizen');

export const getAddresses = () => api.get('/account/addresses');
export const addAddress = (body) => api.post('/account/addresses', body);
export const updateAddress = (id, body) => api.put(`/account/addresses/${id}`, body);
export const deleteAddress = (id) => api.delete(`/account/addresses/${id}`);
export const setDefaultAddress = (id) => api.put(`/account/addresses/${id}/default`);

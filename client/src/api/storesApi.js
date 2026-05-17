import api from './axios.js';

export const getAllStores   = ()                         => api.get('/stores');
export const getStoresNear = (pincode)                  => api.get(`/stores/near/${pincode}`);
export const checkPincode  = (pincode)                  => api.post('/stores/check-pincode', { pincode });
export const checkStoreAvail = (storeId, variantIds)    => api.post(`/stores/${storeId}/availability`, { variantIds });

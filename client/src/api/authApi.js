import api from './axios.js';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  checkMobile: (phone) => api.post('/auth/check-mobile', { phone }),
  verifyOtp: (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),
  registerMobile: (data) => api.post('/auth/register-mobile', data),
};

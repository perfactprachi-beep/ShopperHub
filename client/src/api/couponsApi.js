import api from './axios.js';

export async function validateCoupon(code, cartTotal) {
  const { data } = await api.post('/coupons/validate', { code, cartTotal });
  return data.data;
}

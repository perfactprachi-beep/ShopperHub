import api from './axios.js';

export async function createOrder(payload) {
  const { data } = await api.post('/payments/create-order', payload);
  return data.data;
}

export async function verifyPayment(payload) {
  const { data } = await api.post('/payments/verify', payload);
  return data.data;
}

export async function fetchOrder(orderId) {
  const { data } = await api.get(`/payments/orders/${orderId}`);
  return data.data;
}

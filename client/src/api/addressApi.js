import api from './axios.js';

export async function fetchAddresses() {
  const { data } = await api.get('/account/addresses');
  return data.data;
}

export async function createAddress(payload) {
  const { data } = await api.post('/account/addresses', payload);
  return data.data;
}

export async function updateAddress(id, payload) {
  const { data } = await api.put(`/account/addresses/${id}`, payload);
  return data.data;
}

export async function deleteAddress(id) {
  const { data } = await api.delete(`/account/addresses/${id}`);
  return data;
}

export async function setDefaultAddress(id) {
  const { data } = await api.put(`/account/addresses/${id}/default`);
  return data.data;
}

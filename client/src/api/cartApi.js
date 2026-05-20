import api from './axios.js';

export async function fetchCart() {
  const { data } = await api.get('/cart');
  return data.data;
}

export async function addCartItem({ variantId, productId, quantity = 1 }) {
  const { data } = await api.post('/cart', { variantId, productId, quantity });
  return data.data;
}

export async function updateCartItem(itemId, { quantity }) {
  const { data } = await api.put(`/cart/${itemId}`, { quantity });
  return data.data;
}

export async function removeCartItem(itemId) {
  const { data } = await api.delete(`/cart/${itemId}`);
  return data.data;
}

export async function mergeCart(items) {
  const { data } = await api.post('/cart/merge', { items });
  return data.data;
}

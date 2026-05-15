import api from './axios.js';

export async function fetchWishlist() {
  const { data } = await api.get('/wishlist');
  return data.data;
}

export async function toggleWishlist(productId) {
  const { data } = await api.post('/wishlist', { productId });
  return data.data;
}

export async function removeFromWishlist(productId) {
  const { data } = await api.delete(`/wishlist/${productId}`);
  return data.data;
}

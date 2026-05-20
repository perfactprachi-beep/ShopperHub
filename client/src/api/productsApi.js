import api from './axios.js';

export const productsApi = {
  list:   (params) => api.get('/products', { params }),
  detail: (slug)   => api.get(`/products/${slug}`),
  search: (q, params) => api.get('/products/search', { params: { q, ...params } }),

  categories: ()     => api.get('/categories'),
  categoryProducts: (slug, params) => api.get(`/categories/${slug}/products`, { params }),

  brands: ()         => api.get('/brands'),
  brandProducts: (slug, params) => api.get(`/brands/${slug}/products`, { params }),
};

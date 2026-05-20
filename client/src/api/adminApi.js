import api from './axios.js';

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboardStats = () =>
  api.get('/admin/dashboard/stats').then(r => r.data.data);

// ── Products ──────────────────────────────────────────────────────────────────
export const getAdminProducts = (params) =>
  api.get('/admin/products', { params }).then(r => r.data.data);

export const createProduct = (formData) =>
  api.post('/admin/products', formData).then(r => r.data.data);

export const updateProduct = (id, data) =>
  api.put(`/admin/products/${id}`, data).then(r => r.data.data);

export const deleteProduct = (id) =>
  api.delete(`/admin/products/${id}`).then(r => r.data);

export const getProductVariants = (id) =>
  api.get(`/admin/products/${id}/variants`).then(r => r.data.data);

export const addVariant = (productId, data) =>
  api.post(`/admin/products/${productId}/variants`, data).then(r => r.data.data);

export const updateVariant = (id, data) =>
  api.put(`/admin/products/variants/${id}`, data).then(r => r.data.data);

export const deleteVariant = (id) =>
  api.delete(`/admin/products/variants/${id}`).then(r => r.data);

export const getProductImages = (id) =>
  api.get(`/admin/products/${id}/images`).then(r => r.data.data);

export const uploadImages = (productId, formData) =>
  api.post(`/admin/products/${productId}/images`, formData).then(r => r.data.data);

export const deleteImage = (id) =>
  api.delete(`/admin/products/images/${id}`).then(r => r.data);

export const setPrimaryImage = (id, productId) =>
  api.put(`/admin/products/images/${id}/primary`, { productId }).then(r => r.data.data);

export const addImageByUrl = (productId, url) =>
  api.post(`/admin/products/${productId}/images/url`, { url }).then(r => r.data.data);

export const fillMissingImages = () =>
  api.post('/admin/products/fill-missing-images').then(r => r.data);

// ── Product Attributes ────────────────────────────────────────────────────────
export const getProductAttributes = (productId) =>
  api.get(`/admin/products/${productId}/attributes`).then(r => r.data.data);

export const addProductAttribute = (productId, data) =>
  api.post(`/admin/products/${productId}/attributes`, data).then(r => r.data.data);

export const updateProductAttribute = (id, data) =>
  api.put(`/admin/products/attributes/${id}`, data).then(r => r.data.data);

export const deleteProductAttribute = (id) =>
  api.delete(`/admin/products/attributes/${id}`).then(r => r.data);

// ── Categories ────────────────────────────────────────────────────────────────
export const getAdminCategories = () =>
  api.get('/admin/categories').then(r => r.data.data);

export const createCategory = (data) =>
  api.post('/admin/categories', data).then(r => r.data.data);

export const updateCategory = (id, data) =>
  api.put(`/admin/categories/${id}`, data).then(r => r.data.data);

export const deleteCategory = (id) =>
  api.delete(`/admin/categories/${id}`).then(r => r.data);

// ── Brands ────────────────────────────────────────────────────────────────────
export const getAdminBrands = () =>
  api.get('/admin/brands').then(r => r.data.data);

export const createBrand = (data) =>
  api.post('/admin/brands', data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}).then(r => r.data.data);

export const updateBrand = (id, data) =>
  api.put(`/admin/brands/${id}`, data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}).then(r => r.data.data);

export const deleteBrand = (id) =>
  api.delete(`/admin/brands/${id}`).then(r => r.data);

// ── Orders ────────────────────────────────────────────────────────────────────
export const getAdminOrders = (params) =>
  api.get('/admin/orders', { params }).then(r => r.data.data);

export const updateOrderStatus = (id, status) =>
  api.put(`/admin/orders/${id}/status`, { status }).then(r => r.data.data);

export const updatePickupStatus = (id, status) =>
  api.put(`/admin/orders/${id}/pickup-status`, { status }).then(r => r.data);

// ── Coupons ───────────────────────────────────────────────────────────────────
export const getAdminCoupons = () =>
  api.get('/admin/coupons').then(r => r.data.data);

export const createCoupon = (data) =>
  api.post('/admin/coupons', data).then(r => r.data.data);

export const updateCoupon = (id, data) =>
  api.put(`/admin/coupons/${id}`, data).then(r => r.data.data);

export const deleteCoupon = (id) =>
  api.delete(`/admin/coupons/${id}`).then(r => r.data);

// ── Banners ───────────────────────────────────────────────────────────────────
export const getAdminBanners = () =>
  api.get('/admin/banners').then(r => r.data.data);

export const createBanner = (formData) =>
  api.post('/admin/banners', formData).then(r => r.data.data);

export const updateBanner = (id, data) =>
  api.put(`/admin/banners/${id}`, data).then(r => r.data.data);

export const deleteBanner = (id) =>
  api.delete(`/admin/banners/${id}`).then(r => r.data);

// ── Offers ────────────────────────────────────────────────────────────────────
export const getAdminOffers = () =>
  api.get('/admin/offers').then(r => r.data.data);

export const createOffer = (data) =>
  api.post('/admin/offers', data).then(r => r.data.data);

export const updateOffer = (id, data) =>
  api.put(`/admin/offers/${id}`, data).then(r => r.data.data);

export const deleteOffer = (id) =>
  api.delete(`/admin/offers/${id}`).then(r => r.data);

// ── Users ─────────────────────────────────────────────────────────────────────
export const getAdminUsers = (params) =>
  api.get('/admin/users', { params }).then(r => r.data.data);

export const updateUserStatus = (id, isActive) =>
  api.patch(`/admin/users/${id}/status`, { is_active: isActive }).then(r => r.data.data);

export const deleteAdminUser = (id) =>
  api.delete(`/admin/users/${id}`).then(r => r.data);

// ── Payment Methods ───────────────────────────────────────────────────────────
export const getAdminPaymentMethods = () =>
  api.get('/admin/payment-methods').then(r => r.data.data);

export const createPaymentMethod = (data) =>
  api.post('/admin/payment-methods', data).then(r => r.data.data);

export const updatePaymentMethod = (id, data) =>
  api.put(`/admin/payment-methods/${id}`, data).then(r => r.data.data);

export const deletePaymentMethod = (id) =>
  api.delete(`/admin/payment-methods/${id}`).then(r => r.data);

// ── Delivery: stores ─────────────────────────────────────────────────────────
export const getAdminStores = () =>
  api.get('/admin/delivery/stores').then(r => r.data.data);

export const addAdminStore = (data) =>
  api.post('/admin/delivery/stores', data).then(r => r.data.data);

export const updateAdminStore = (id, data) =>
  api.patch(`/admin/delivery/stores/${id}`, data).then(r => r.data.data);

export const deleteAdminStore = (id) =>
  api.delete(`/admin/delivery/stores/${id}`).then(r => r.data);

// ── Delivery: express pincodes ────────────────────────────────────────────────
export const getDeliveryPincodes = () =>
  api.get('/admin/delivery/pincodes').then(r => r.data.data);

export const addDeliveryPincode = (data) =>
  api.post('/admin/delivery/pincodes', data).then(r => r.data.data);

export const updateDeliveryPincode = (pincode, data) =>
  api.patch(`/admin/delivery/pincodes/${pincode}`, data).then(r => r.data.data);

export const deleteDeliveryPincode = (pincode) =>
  api.delete(`/admin/delivery/pincodes/${pincode}`).then(r => r.data);

import api from './axios.js';

export const inventoryApi = {
  // Dashboard
  getDashboardStats: () => api.get('/inventory/dashboard/stats'),

  // Warehouses
  getWarehouses: () => api.get('/inventory/warehouses'),
  getWarehouse: (id) => api.get(`/inventory/warehouses/${id}`),
  createWarehouse: (data) => api.post('/inventory/warehouses', data),
  updateWarehouse: (id, data) => api.put(`/inventory/warehouses/${id}`, data),
  deleteWarehouse: (id) => api.delete(`/inventory/warehouses/${id}`),

  // Inventory
  getInventory: (params) => api.get('/inventory/inventory', { params }),
  getInventoryItem: (id) => api.get(`/inventory/inventory/${id}`),
  createInventoryItem: (data) => api.post('/inventory/inventory', data),
  updateInventoryItem: (id, data) => api.put(`/inventory/inventory/${id}`, data),
  bulkUpdateInventory: (updates) => api.post('/inventory/inventory/bulk-update', { updates }),
  adjustStock: (id, data) => api.post(`/inventory/inventory/${id}/adjust`, data),

  // Low Stock
  getLowStockItems: (params) => api.get('/inventory/low-stock', { params }),

  // Logs
  getInventoryLogs: (params) => api.get('/inventory/logs', { params }),
  createInventoryLog: (data) => api.post('/inventory/logs', data),
};
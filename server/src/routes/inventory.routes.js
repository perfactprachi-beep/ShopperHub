import { Router } from 'express';
import { authGuard } from '../middleware/authGuard.js';
import { adminGuard } from '../middleware/adminGuard.js';
import {
  // Warehouses
  listWarehouses,
  getWarehouse,
  addWarehouse,
  editWarehouse,
  removeWarehouse,
  
  // Inventory
  listInventory,
  getInventoryItem,
  addInventoryItem,
  updateInventoryItem,
  bulkUpdateInventory,
  adjustInventoryStock,
  
  // Low stock
  listLowStockItems,
  
  // Dashboard
  getDashboardStats,
  
  // Logs
  listInventoryLogs,
  addInventoryLog
} from '../controllers/inventory.controller.js';

const router = Router();

// Apply auth and admin guards to all routes
router.use(authGuard, adminGuard);

// ── Dashboard routes ──────────────────────────────────────────────────────────
router.get('/dashboard/stats', getDashboardStats);

// ── Warehouse routes ──────────────────────────────────────────────────────────
router.get('/warehouses', listWarehouses);
router.get('/warehouses/:id', getWarehouse);
router.post('/warehouses', addWarehouse);
router.put('/warehouses/:id', editWarehouse);
router.delete('/warehouses/:id', removeWarehouse);

// ── Inventory routes ──────────────────────────────────────────────────────────
router.get('/inventory', listInventory);
router.get('/inventory/:id', getInventoryItem);
router.post('/inventory', addInventoryItem);
router.put('/inventory/:id', updateInventoryItem);
router.post('/inventory/bulk-update', bulkUpdateInventory);
router.post('/inventory/:id/adjust', adjustInventoryStock);

// ── Low stock routes ──────────────────────────────────────────────────────────
router.get('/low-stock', listLowStockItems);

// ── Inventory logs routes ─────────────────────────────────────────────────────
router.get('/logs', listInventoryLogs);
router.post('/logs', addInventoryLog);

export default router;
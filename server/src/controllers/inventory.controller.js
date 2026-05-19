import {
  getAllWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getInventoryList,
  getInventoryById,
  createInventory,
  updateInventoryStock,
  bulkUpdateInventoryStock,
  getLowStockItems,
  getInventoryDashboardStats,
  getRecentInventoryActivity,
  getInventoryLogs,
  createInventoryLog,
  adjustStock,
  setVariantStock
} from '../db/queries/inventory.js';

// ── Warehouse controllers ─────────────────────────────────────────────────────

export async function listWarehouses(req, res, next) {
  try {
    const warehouses = await getAllWarehouses();
    res.json({ success: true, data: warehouses });
  } catch (err) {
    next(err);
  }
}

export async function getWarehouse(req, res, next) {
  try {
    const warehouse = await getWarehouseById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }
    res.json({ success: true, data: warehouse });
  } catch (err) {
    next(err);
  }
}

export async function addWarehouse(req, res, next) {
  try {
    const warehouse = await createWarehouse(req.body);
    res.status(201).json({ success: true, data: warehouse });
  } catch (err) {
    next(err);
  }
}

export async function editWarehouse(req, res, next) {
  try {
    const warehouse = await updateWarehouse(req.params.id, req.body);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }
    res.json({ success: true, data: warehouse });
  } catch (err) {
    next(err);
  }
}

export async function removeWarehouse(req, res, next) {
  try {
    const warehouse = await deleteWarehouse(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }
    res.json({ success: true, message: 'Warehouse deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// ── Inventory controllers ─────────────────────────────────────────────────────

export async function listInventory(req, res, next) {
  try {
    const rows = await getInventoryList(req.query);
    const total = rows[0]?.total_count ? parseInt(rows[0].total_count, 10) : 0;
    res.json({ success: true, data: { inventory: rows, total } });
  } catch (err) {
    next(err);
  }
}

export async function getInventoryItem(req, res, next) {
  try {
    const item = await getInventoryById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function addInventoryItem(req, res, next) {
  try {
    const item = await createInventory(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function updateInventoryItem(req, res, next) {
  try {
    const { stock_quantity, low_stock_threshold, notes } = req.body;
    const admin_id = req.user.id;
    
    const item = await updateInventoryStock(req.params.id, {
      stock_quantity,
      low_stock_threshold,
      admin_id,
      notes
    });
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
    
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function bulkUpdateInventory(req, res, next) {
  try {
    const { updates } = req.body;
    const admin_id = req.user.id;
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Updates array is required' });
    }
    
    const results = await bulkUpdateInventoryStock(updates, admin_id);
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}

// ── Stock adjustment controllers ──────────────────────────────────────────────

export async function adjustInventoryStock(req, res, next) {
  try {
    const { quantity_change, action_type, notes } = req.body;
    const admin_id = req.user.id;
    
    if (!quantity_change || !action_type) {
      return res.status(400).json({ 
        success: false, 
        message: 'quantity_change and action_type are required' 
      });
    }
    
    const item = await adjustStock(
      req.params.id,
      quantity_change,
      action_type,
      admin_id,
      notes
    );
    
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

// ── Low stock controllers ─────────────────────────────────────────────────────

export async function listLowStockItems(req, res, next) {
  try {
    const rows = await getLowStockItems(req.query);
    const total = rows[0]?.total_count ? parseInt(rows[0].total_count, 10) : 0;
    res.json({ success: true, data: { items: rows, total } });
  } catch (err) {
    next(err);
  }
}

// ── Dashboard controllers ─────────────────────────────────────────────────────

export async function getDashboardStats(req, res, next) {
  try {
    const [stats, recentActivity] = await Promise.all([
      getInventoryDashboardStats(),
      getRecentInventoryActivity(10)
    ]);
    
    res.json({ 
      success: true, 
      data: { 
        stats: {
          total_products: parseInt(stats.total_products) || 0,
          total_warehouses: parseInt(stats.total_warehouses) || 0,
          in_stock_count: parseInt(stats.in_stock_count) || 0,
          low_stock_count: parseInt(stats.low_stock_count) || 0,
          out_of_stock_count: parseInt(stats.out_of_stock_count) || 0,
          total_stock_quantity: parseInt(stats.total_stock_quantity) || 0
        },
        recent_activity: recentActivity
      }
    });
  } catch (err) {
    next(err);
  }
}

// ── Inventory logs controllers ────────────────────────────────────────────────

export async function listInventoryLogs(req, res, next) {
  try {
    const rows = await getInventoryLogs(req.query);
    const total = rows[0]?.total_count ? parseInt(rows[0].total_count, 10) : 0;
    res.json({ success: true, data: { logs: rows, total } });
  } catch (err) {
    next(err);
  }
}

export async function addInventoryLog(req, res, next) {
  try {
    const log = await createInventoryLog({
      ...req.body,
      admin_id: req.user.id
    });
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
}

// ── Variant stock controller (works with or without an inventory record) ───────
export async function updateVariantStock(req, res, next) {
  try {
    const { stock_quantity, low_stock_threshold } = req.body;
    if (stock_quantity == null || stock_quantity < 0) {
      return res.status(400).json({ success: false, message: 'stock_quantity is required and must be >= 0' });
    }
    const item = await setVariantStock(
      Number(req.params.variantId),
      Number(stock_quantity),
      low_stock_threshold != null ? Number(low_stock_threshold) : null
    );
    if (!item) return res.status(404).json({ success: false, message: 'Variant not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}
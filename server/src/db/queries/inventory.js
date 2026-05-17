import { pool } from '../pool.js';

// ── Warehouse queries ─────────────────────────────────────────────────────────

export async function getAllWarehouses() {
  const { rows } = await pool.query(`
    SELECT w.*, 
           COUNT(i.id) as inventory_count,
           COALESCE(SUM(i.stock_quantity), 0) as total_stock
    FROM warehouses w
    LEFT JOIN inventory i ON w.id = i.warehouse_id
    WHERE w.is_active = true
    GROUP BY w.id
    ORDER BY w.created_at DESC
  `);
  return rows;
}

export async function getWarehouseById(id) {
  const { rows } = await pool.query(`
    SELECT w.*, 
           COUNT(i.id) as inventory_count,
           COALESCE(SUM(i.stock_quantity), 0) as total_stock
    FROM warehouses w
    LEFT JOIN inventory i ON w.id = i.warehouse_id
    WHERE w.id = $1 AND w.is_active = true
    GROUP BY w.id
  `, [id]);
  return rows[0];
}

export async function createWarehouse({ name, location, manager_name, contact_number }) {
  const { rows } = await pool.query(`
    INSERT INTO warehouses (name, location, manager_name, contact_number)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [name, location, manager_name || null, contact_number || null]);
  return rows[0];
}

export async function updateWarehouse(id, { name, location, manager_name, contact_number }) {
  const { rows } = await pool.query(`
    UPDATE warehouses 
    SET name = $2, location = $3, manager_name = $4, contact_number = $5
    WHERE id = $1 AND is_active = true
    RETURNING *
  `, [id, name, location, manager_name || null, contact_number || null]);
  return rows[0];
}

export async function deleteWarehouse(id) {
  const { rows } = await pool.query(`
    UPDATE warehouses 
    SET is_active = false
    WHERE id = $1
    RETURNING *
  `, [id]);
  return rows[0];
}

// ── Inventory queries ─────────────────────────────────────────────────────────

export async function getInventoryList({ page = 1, limit = 20, search, warehouse_id, category_id, status }) {
  const conditions = ['w.is_active = true'];
  const values = [];
  let idx = 1;

  if (search) {
    conditions.push(`(p.title ILIKE $${idx} OR p.slug ILIKE $${idx} OR pv.sku ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }

  if (warehouse_id) {
    conditions.push(`i.warehouse_id = $${idx++}`);
    values.push(warehouse_id);
  }

  if (category_id) {
    conditions.push(`p.category_id = $${idx++}`);
    values.push(category_id);
  }

  if (status) {
    if (status === 'in_stock') {
      conditions.push(`i.stock_quantity > i.low_stock_threshold`);
    } else if (status === 'low_stock') {
      conditions.push(`i.stock_quantity <= i.low_stock_threshold AND i.stock_quantity > 0`);
    } else if (status === 'out_of_stock') {
      conditions.push(`i.stock_quantity = 0`);
    }
  }

  const offset = (Number(page) - 1) * Number(limit);
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT 
      i.*,
      p.title as product_title,
      p.slug as product_slug,
      p.base_price,
      p.discount_pct,
      b.name as brand_name,
      c.name as category_name,
      w.name as warehouse_name,
      pv.size,
      pv.color,
      pv.sku as variant_sku,
      (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image_url,
      CASE 
        WHEN i.stock_quantity = 0 THEN 'out_of_stock'
        WHEN i.stock_quantity <= i.low_stock_threshold THEN 'low_stock'
        ELSE 'in_stock'
      END as status,
      COUNT(*) OVER() as total_count
    FROM inventory i
    JOIN products p ON i.product_id = p.id
    LEFT JOIN product_variants pv ON i.variant_id = pv.id
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    JOIN warehouses w ON i.warehouse_id = w.id
    ${whereClause}
    ORDER BY i.updated_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;
  
  values.push(Number(limit), offset);
  const { rows } = await pool.query(sql, values);
  return rows;
}

export async function getInventoryById(id) {
  const { rows } = await pool.query(`
    SELECT 
      i.*,
      p.title as product_title,
      p.slug as product_slug,
      b.name as brand_name,
      c.name as category_name,
      w.name as warehouse_name,
      pv.size,
      pv.color,
      pv.sku as variant_sku
    FROM inventory i
    JOIN products p ON i.product_id = p.id
    LEFT JOIN product_variants pv ON i.variant_id = pv.id
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    JOIN warehouses w ON i.warehouse_id = w.id
    WHERE i.id = $1
  `, [id]);
  return rows[0];
}

export async function createInventory({ product_id, variant_id, warehouse_id, sku, stock_quantity, low_stock_threshold }) {
  const { rows } = await pool.query(`
    INSERT INTO inventory (product_id, variant_id, warehouse_id, sku, stock_quantity, low_stock_threshold)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [product_id, variant_id || null, warehouse_id, sku || null, stock_quantity || 0, low_stock_threshold || 10]);
  return rows[0];
}

export async function updateInventoryStock(id, { stock_quantity, low_stock_threshold, admin_id, notes }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Get current inventory
    const { rows: currentRows } = await client.query('SELECT * FROM inventory WHERE id = $1', [id]);
    const current = currentRows[0];
    if (!current) throw new Error('Inventory not found');
    
    // Update inventory
    const { rows } = await client.query(`
      UPDATE inventory 
      SET stock_quantity = $2, low_stock_threshold = $3
      WHERE id = $1
      RETURNING *
    `, [id, stock_quantity, low_stock_threshold || current.low_stock_threshold]);
    
    // Log the change
    const quantityDiff = stock_quantity - current.stock_quantity;
    if (quantityDiff !== 0) {
      await client.query(`
        INSERT INTO inventory_logs (inventory_id, action_type, quantity, admin_id, notes)
        VALUES ($1, $2, $3, $4, $5)
      `, [id, 'manual_update', quantityDiff, admin_id, notes || 'Manual stock update']);
    }
    
    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function bulkUpdateInventoryStock(updates, admin_id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const results = [];
    for (const update of updates) {
      const { id, stock_quantity } = update;
      
      // Get current inventory
      const { rows: currentRows } = await client.query('SELECT * FROM inventory WHERE id = $1', [id]);
      const current = currentRows[0];
      if (!current) continue;
      
      // Update inventory
      const { rows } = await client.query(`
        UPDATE inventory 
        SET stock_quantity = $2
        WHERE id = $1
        RETURNING *
      `, [id, stock_quantity]);
      
      // Log the change
      const quantityDiff = stock_quantity - current.stock_quantity;
      if (quantityDiff !== 0) {
        await client.query(`
          INSERT INTO inventory_logs (inventory_id, action_type, quantity, admin_id, notes)
          VALUES ($1, $2, $3, $4, $5)
        `, [id, 'manual_update', quantityDiff, admin_id, 'Bulk stock update']);
      }
      
      results.push(rows[0]);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ── Low stock queries ─────────────────────────────────────────────────────────

export async function getLowStockItems({ page = 1, limit = 20, category_id }) {
  const conditions = ['i.stock_quantity <= i.low_stock_threshold', 'w.is_active = true'];
  const values = [];
  let idx = 1;

  if (category_id) {
    conditions.push(`p.category_id = $${idx++}`);
    values.push(category_id);
  }

  const offset = (Number(page) - 1) * Number(limit);
  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const sql = `
    SELECT 
      i.*,
      p.title as product_title,
      p.slug as product_slug,
      b.name as brand_name,
      c.name as category_name,
      w.name as warehouse_name,
      pv.size,
      pv.color,
      (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image_url,
      COUNT(*) OVER() as total_count
    FROM inventory i
    JOIN products p ON i.product_id = p.id
    LEFT JOIN product_variants pv ON i.variant_id = pv.id
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    JOIN warehouses w ON i.warehouse_id = w.id
    ${whereClause}
    ORDER BY (i.stock_quantity::float / NULLIF(i.low_stock_threshold, 0)) ASC
    LIMIT $${idx++} OFFSET $${idx++}
  `;
  
  values.push(Number(limit), offset);
  const { rows } = await pool.query(sql, values);
  return rows;
}

// ── Dashboard queries ─────────────────────────────────────────────────────────

export async function getInventoryDashboardStats() {
  const { rows } = await pool.query(`
    SELECT 
      COUNT(DISTINCT i.product_id) as total_products,
      COUNT(DISTINCT w.id) as total_warehouses,
      SUM(CASE WHEN i.stock_quantity > i.low_stock_threshold THEN 1 ELSE 0 END) as in_stock_count,
      SUM(CASE WHEN i.stock_quantity <= i.low_stock_threshold AND i.stock_quantity > 0 THEN 1 ELSE 0 END) as low_stock_count,
      SUM(CASE WHEN i.stock_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_count,
      SUM(i.stock_quantity) as total_stock_quantity
    FROM inventory i
    JOIN warehouses w ON i.warehouse_id = w.id
    WHERE w.is_active = true
  `);
  return rows[0];
}

export async function getRecentInventoryActivity(limit = 10) {
  const { rows } = await pool.query(`
    SELECT 
      il.*,
      p.title as product_title,
      u.full_name as admin_name,
      w.name as warehouse_name,
      pv.size,
      pv.color
    FROM inventory_logs il
    JOIN inventory i ON il.inventory_id = i.id
    JOIN products p ON i.product_id = p.id
    LEFT JOIN product_variants pv ON i.variant_id = pv.id
    LEFT JOIN users u ON il.admin_id = u.id
    JOIN warehouses w ON i.warehouse_id = w.id
    ORDER BY il.created_at DESC
    LIMIT $1
  `, [limit]);
  return rows;
}

// ── Inventory logs queries ───────────────────────────────────────────────────

export async function getInventoryLogs({ page = 1, limit = 20, inventory_id, action_type, admin_id }) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (inventory_id) {
    conditions.push(`il.inventory_id = $${idx++}`);
    values.push(inventory_id);
  }

  if (action_type) {
    conditions.push(`il.action_type = $${idx++}`);
    values.push(action_type);
  }

  if (admin_id) {
    conditions.push(`il.admin_id = $${idx++}`);
    values.push(admin_id);
  }

  const offset = (Number(page) - 1) * Number(limit);
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT 
      il.*,
      p.title as product_title,
      u.full_name as admin_name,
      w.name as warehouse_name,
      pv.size,
      pv.color,
      COUNT(*) OVER() as total_count
    FROM inventory_logs il
    JOIN inventory i ON il.inventory_id = i.id
    JOIN products p ON i.product_id = p.id
    LEFT JOIN product_variants pv ON i.variant_id = pv.id
    LEFT JOIN users u ON il.admin_id = u.id
    JOIN warehouses w ON i.warehouse_id = w.id
    ${whereClause}
    ORDER BY il.created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;
  
  values.push(Number(limit), offset);
  const { rows } = await pool.query(sql, values);
  return rows;
}

export async function createInventoryLog({ inventory_id, action_type, quantity, admin_id, notes }) {
  const { rows } = await pool.query(`
    INSERT INTO inventory_logs (inventory_id, action_type, quantity, admin_id, notes)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [inventory_id, action_type, quantity, admin_id || null, notes || null]);
  return rows[0];
}

// ── Stock operations ──────────────────────────────────────────────────────────

export async function adjustStock(inventory_id, quantity_change, action_type, admin_id, notes) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Update inventory
    const { rows } = await client.query(`
      UPDATE inventory 
      SET stock_quantity = GREATEST(0, stock_quantity + $2)
      WHERE id = $1
      RETURNING *
    `, [inventory_id, quantity_change]);
    
    if (!rows[0]) throw new Error('Inventory not found');
    
    // Log the change
    await client.query(`
      INSERT INTO inventory_logs (inventory_id, action_type, quantity, admin_id, notes)
      VALUES ($1, $2, $3, $4, $5)
    `, [inventory_id, action_type, quantity_change, admin_id, notes]);
    
    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
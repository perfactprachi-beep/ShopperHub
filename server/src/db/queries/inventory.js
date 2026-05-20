import { pool } from '../pool.js';

// ── Warehouse queries ─────────────────────────────────────────────────────────

export async function getAllWarehouses() {
  const { rows } = await pool.query(`
    SELECT w.*,
           COUNT(i.id) as inventory_count,
           COALESCE(SUM(pv.stock), 0) as total_stock
    FROM warehouses w
    LEFT JOIN inventory i ON w.id = i.warehouse_id
    LEFT JOIN product_variants pv ON pv.id = i.variant_id
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
           COALESCE(SUM(pv.stock), 0) as total_stock
    FROM warehouses w
    LEFT JOIN inventory i ON w.id = i.warehouse_id
    LEFT JOIN product_variants pv ON pv.id = i.variant_id
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

export async function getInventoryList({ page = 1, limit = 20, search, warehouse_id, category_id, brand_id, status }) {
  // Base from product_variants so every variant appears even without an inventory record.
  // inventory is LEFT JOINed for threshold and warehouse info.
  const conditions = ['p.status = \'active\''];
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

  if (brand_id) {
    conditions.push(`p.brand_id = $${idx++}`);
    values.push(brand_id);
  }

  if (status) {
    const threshold = 'COALESCE(i.low_stock_threshold, 5)';
    if (status === 'in_stock') {
      conditions.push(`pv.stock > ${threshold}`);
    } else if (status === 'low_stock') {
      conditions.push(`pv.stock <= ${threshold} AND pv.stock > 0`);
    } else if (status === 'out_of_stock') {
      conditions.push(`pv.stock = 0`);
    }
  }

  const offset = (Number(page) - 1) * Number(limit);
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT
      i.id            AS inventory_id,
      i.warehouse_id,
      i.stock_quantity,
      COALESCE(i.low_stock_threshold, 5) AS low_stock_threshold,
      i.reserved_quantity,
      i.updated_at,
      pv.id           AS variant_id,
      pv.stock        AS live_stock,
      pv.sku          AS variant_sku,
      pv.size,
      pv.color,
      p.id            AS product_id,
      p.title         AS product_title,
      p.slug          AS product_slug,
      p.base_price,
      p.discount_pct,
      b.name          AS brand_name,
      c.name          AS category_name,
      w.name          AS warehouse_name,
      (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS image_url,
      CASE
        WHEN pv.stock = 0 THEN 'out_of_stock'
        WHEN pv.stock <= COALESCE(i.low_stock_threshold, 5) THEN 'low_stock'
        ELSE 'in_stock'
      END AS status,
      COUNT(*) OVER() AS total_count
    FROM product_variants pv
    JOIN products p ON p.id = pv.product_id
    LEFT JOIN inventory i ON i.variant_id = pv.id
    LEFT JOIN warehouses w ON w.id = i.warehouse_id AND w.is_active = true
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN categories c ON c.id = p.category_id
    ${whereClause}
    ORDER BY pv.stock ASC, p.title ASC
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

    // Sync live stock to product_variants so website reflects the change
    if (current.variant_id) {
      await client.query(
        'UPDATE product_variants SET stock = $1 WHERE id = $2',
        [stock_quantity, current.variant_id]
      );
    }

    // Log the change
    const quantityDiff = stock_quantity - current.stock_quantity;
    if (quantityDiff !== 0) {
      await client.query(`
        INSERT INTO inventory_logs (inventory_id, action_type, quantity, admin_id, notes)
        VALUES ($1, $2, $3, $4, $5)
      `, [id, 'manual_update', quantityDiff, admin_id, notes || 'Manual stock update']);
    }

    await client.query('COMMIT');
    return { ...rows[0], live_stock: stock_quantity };
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
      // `id` is variant_id (sent by the frontend)
      const { id: variant_id, stock_quantity } = update;

      // Look up by variant_id (not inventory PK)
      const { rows: currentRows } = await client.query(
        'SELECT * FROM inventory WHERE variant_id = $1',
        [variant_id]
      );
      const current = currentRows[0];

      if (!current) {
        // No inventory row — update product_variants.stock directly and continue
        await client.query(
          'UPDATE product_variants SET stock = $1 WHERE id = $2',
          [stock_quantity, variant_id]
        );
        results.push({ variant_id, live_stock: stock_quantity, stock_quantity });
        continue;
      }

      // Update inventory row
      const { rows } = await client.query(`
        UPDATE inventory
        SET stock_quantity = $2
        WHERE id = $1
        RETURNING *
      `, [current.id, stock_quantity]);

      // Sync live stock to product_variants
      await client.query(
        'UPDATE product_variants SET stock = $1 WHERE id = $2',
        [stock_quantity, variant_id]
      );

      // Log the change
      const quantityDiff = stock_quantity - current.stock_quantity;
      if (quantityDiff !== 0) {
        await client.query(`
          INSERT INTO inventory_logs (inventory_id, action_type, quantity, admin_id, notes)
          VALUES ($1, $2, $3, $4, $5)
        `, [current.id, 'manual_update', quantityDiff, admin_id, 'Bulk stock update']);
      }

      results.push({ ...rows[0], live_stock: stock_quantity });
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

export async function getLowStockItems({ page = 1, limit = 20, category_id, brand_id }) {
  // Query from product_variants directly so every variant appears regardless of
  // whether it has an inventory record. LEFT JOIN inventory to pick up a custom
  // low_stock_threshold if one was configured; otherwise fall back to 5.
  const conditions = ['p.status = \'active\'', 'pv.stock <= COALESCE(i.low_stock_threshold, 5)'];
  const values = [];
  let idx = 1;

  if (category_id) {
    conditions.push(`p.category_id = $${idx++}`);
    values.push(category_id);
  }

  if (brand_id) {
    conditions.push(`p.brand_id = $${idx++}`);
    values.push(brand_id);
  }

  const offset = (Number(page) - 1) * Number(limit);
  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const sql = `
    SELECT
      pv.id               AS variant_id,
      pv.stock            AS live_stock,
      pv.stock            AS stock_quantity,
      COALESCE(i.low_stock_threshold, 5) AS low_stock_threshold,
      i.id                AS inventory_id,
      i.warehouse_id,
      COALESCE(w.name, (SELECT name FROM warehouses WHERE is_active = true ORDER BY id LIMIT 1)) AS warehouse_name,
      p.id                AS product_id,
      p.title             AS product_title,
      p.slug              AS product_slug,
      b.name              AS brand_name,
      c.name              AS category_name,
      pv.size,
      pv.color,
      pv.sku              AS variant_sku,
      (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS image_url,
      COUNT(*) OVER()     AS total_count
    FROM product_variants pv
    JOIN products p ON p.id = pv.product_id
    LEFT JOIN inventory i ON i.variant_id = pv.id
    LEFT JOIN warehouses w ON w.id = i.warehouse_id AND w.is_active = true
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN categories c ON c.id = p.category_id
    ${whereClause}
    ORDER BY pv.stock ASC, p.title ASC
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
      COUNT(DISTINCT p.id) as total_products,
      (SELECT COUNT(DISTINCT id) FROM warehouses WHERE is_active = true) as total_warehouses,
      SUM(CASE WHEN pv.stock > 5 THEN 1 ELSE 0 END) as in_stock_count,
      SUM(CASE WHEN pv.stock > 0 AND pv.stock <= 5 THEN 1 ELSE 0 END) as low_stock_count,
      SUM(CASE WHEN pv.stock = 0 THEN 1 ELSE 0 END) as out_of_stock_count,
      COALESCE(SUM(pv.stock), 0) as total_stock_quantity
    FROM product_variants pv
    JOIN products p ON p.id = pv.product_id
    WHERE p.status = 'active'
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

// Update stock directly by variant_id — works whether or not an inventory record exists
export async function setVariantStock(variantId, newStock, lowStockThreshold, adminId, notes) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Read current stock for diff calculation
    const { rows: current } = await client.query(
      'SELECT stock FROM product_variants WHERE id = $1',
      [variantId]
    );
    const oldStock = current[0]?.stock ?? 0;

    await client.query(
      'UPDATE product_variants SET stock = $1 WHERE id = $2',
      [newStock, variantId]
    );

    // Sync inventory record; create one if it doesn't exist so we can log
    let { rows: invRows } = await client.query(
      'UPDATE inventory SET stock_quantity = $1 WHERE variant_id = $2 RETURNING id',
      [newStock, variantId]
    );

    if (!invRows[0]) {
      // No inventory row — look up the first active warehouse and auto-create one
      const { rows: wh } = await client.query(
        'SELECT id FROM warehouses WHERE is_active = true ORDER BY id LIMIT 1'
      );
      if (wh[0]) {
        const { rows: pRow } = await client.query(
          'SELECT product_id FROM product_variants WHERE id = $1', [variantId]
        );
        if (pRow[0]) {
          const created = await client.query(
            `INSERT INTO inventory (product_id, variant_id, warehouse_id, stock_quantity, low_stock_threshold)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [pRow[0].product_id, variantId, wh[0].id, newStock, lowStockThreshold ?? 5]
          );
          invRows = created.rows;
        }
      }
    }

    if (lowStockThreshold != null && invRows[0]) {
      await client.query(
        'UPDATE inventory SET low_stock_threshold = $1 WHERE variant_id = $2',
        [lowStockThreshold, variantId]
      );
    }

    // Write inventory log if stock changed and an inventory record exists
    const inventoryId = invRows[0]?.id;
    const diff = newStock - oldStock;
    if (inventoryId && diff !== 0) {
      await client.query(
        `INSERT INTO inventory_logs (inventory_id, action_type, quantity, admin_id, notes)
         VALUES ($1, 'manual_update', $2, $3, $4)`,
        [inventoryId, diff, adminId || null, notes || null]
      );
    }

    await client.query('COMMIT');

    // Return updated variant info for the frontend
    const { rows } = await pool.query(
      `SELECT pv.id AS variant_id, pv.stock AS live_stock, pv.stock AS stock_quantity,
              COALESCE(i.low_stock_threshold, 5) AS low_stock_threshold,
              i.id AS inventory_id
       FROM product_variants pv
       LEFT JOIN inventory i ON i.variant_id = pv.id
       WHERE pv.id = $1 LIMIT 1`,
      [variantId]
    );
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
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

    // Sync delta to product_variants live stock
    if (rows[0].variant_id) {
      await client.query(
        'UPDATE product_variants SET stock = GREATEST(0, stock + $1) WHERE id = $2',
        [quantity_change, rows[0].variant_id]
      );
    }

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
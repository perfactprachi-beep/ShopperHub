import { pool } from '../pool.js';

export async function getAllStores() {
  const { rows } = await pool.query(
    'SELECT * FROM stores WHERE is_active = true ORDER BY city, name'
  );
  return rows;
}

export async function getStoresNearPincode(pincode) {
  const { rows: pin } = await pool.query(
    'SELECT city FROM express_pincodes WHERE pincode = $1', [pincode]
  );
  const city = pin[0]?.city;
  if (!city) return getAllStores();

  const { rows } = await pool.query(
    'SELECT * FROM stores WHERE is_active = true AND city ILIKE $1 ORDER BY name',
    [city]
  );
  return rows.length ? rows : getAllStores();
}

export async function checkStoreAvailability(storeId, variantIds) {
  const { rows } = await pool.query(`
    SELECT
      si.variant_id,
      si.stock,
      pv.size,
      pv.color,
      p.title AS product_title
    FROM store_inventory si
    JOIN product_variants pv ON pv.id = si.variant_id
    JOIN products p ON p.id = pv.product_id
    WHERE si.store_id = $1
      AND si.variant_id = ANY($2::int[])
  `, [storeId, variantIds]);

  return rows.map(r => ({ ...r, available: r.stock > 0 }));
}

export async function checkExpressPincode(pincode) {
  const { rows } = await pool.query(
    'SELECT * FROM express_pincodes WHERE pincode = $1', [pincode]
  );
  if (!rows[0]) return { available: false, reason: 'Pincode not serviceable for express delivery' };
  return {
    available:    rows[0].is_express,
    city:         rows[0].city,
    delivery_hrs: rows[0].delivery_hrs,
    reason:       rows[0].is_express ? null : 'Express delivery not available at this pincode',
  };
}

export async function getStoreById(id) {
  const { rows } = await pool.query('SELECT * FROM stores WHERE id = $1', [id]);
  return rows[0];
}

export async function updatePickupStatus(orderId, status) {
  await pool.query(
    'UPDATE orders SET pickup_status = $1 WHERE id = $2',
    [status, orderId]
  );
}

// ── Admin: store management ───────────────────────────────────────────────────

export async function adminListStores() {
  const { rows } = await pool.query(
    'SELECT * FROM stores ORDER BY city, name'
  );
  return rows;
}

export async function adminToggleStore(id, is_active) {
  const { rows } = await pool.query(
    'UPDATE stores SET is_active = $2 WHERE id = $1 RETURNING *',
    [id, is_active]
  );
  return rows[0];
}

export async function adminAddStore({ name, city, state, address, pincode, lat, lng, phone, timing }) {
  const { rows } = await pool.query(
    `INSERT INTO stores (name, city, state, address, pincode, lat, lng, phone, timing)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [name, city, state, address, pincode, lat || null, lng || null, phone || null, timing || '10:00 AM – 10:00 PM']
  );
  return rows[0];
}

export async function adminUpdateStore(id, { name, city, state, address, pincode, phone, timing, is_active }) {
  const { rows } = await pool.query(
    `UPDATE stores SET
       name    = COALESCE($2, name),
       city    = COALESCE($3, city),
       state   = COALESCE($4, state),
       address = COALESCE($5, address),
       pincode = COALESCE($6, pincode),
       phone   = COALESCE($7, phone),
       timing  = COALESCE($8, timing),
       is_active = COALESCE($9, is_active)
     WHERE id = $1 RETURNING *`,
    [id, name, city, state, address, pincode, phone, timing, is_active ?? null]
  );
  return rows[0];
}

export async function adminDeleteStore(id) {
  await pool.query('DELETE FROM stores WHERE id = $1', [id]);
}

// ── Admin: express pincode management ─────────────────────────────────────────

export async function adminListPincodes() {
  const { rows } = await pool.query(
    'SELECT * FROM express_pincodes ORDER BY city, pincode'
  );
  return rows;
}

export async function adminAddPincode({ pincode, city, is_express = true, delivery_hrs = 24 }) {
  const { rows } = await pool.query(
    `INSERT INTO express_pincodes (pincode, city, is_express, delivery_hrs)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (pincode) DO UPDATE
       SET city = EXCLUDED.city, is_express = EXCLUDED.is_express, delivery_hrs = EXCLUDED.delivery_hrs
     RETURNING *`,
    [pincode, city, is_express, delivery_hrs]
  );
  return rows[0];
}

export async function adminUpdatePincode(pincode, { city, is_express, delivery_hrs }) {
  const { rows } = await pool.query(
    `UPDATE express_pincodes
     SET city = COALESCE($2, city),
         is_express = COALESCE($3, is_express),
         delivery_hrs = COALESCE($4, delivery_hrs)
     WHERE pincode = $1
     RETURNING *`,
    [pincode, city ?? null, is_express ?? null, delivery_hrs ?? null]
  );
  return rows[0];
}

export async function adminDeletePincode(pincode) {
  await pool.query('DELETE FROM express_pincodes WHERE pincode = $1', [pincode]);
}

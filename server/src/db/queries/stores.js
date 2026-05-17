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

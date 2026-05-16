import { pool } from '../pool.js';

export async function getAllCoupons() {
  const { rows } = await pool.query(
    'SELECT * FROM coupons ORDER BY id DESC'
  );
  return rows;
}

export async function createCoupon({ code, type, value, min_order, max_uses, expires_at, is_active }) {
  const { rows } = await pool.query(
    `INSERT INTO coupons (code, type, value, min_order, max_uses, expires_at, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [code.toUpperCase(), type, value, min_order || 0, max_uses || null,
     expires_at || null, is_active !== false]
  );
  return rows[0];
}

export async function updateCoupon(id, { code, type, value, min_order, max_uses, expires_at, is_active }) {
  const { rows } = await pool.query(
    `UPDATE coupons
     SET code=$2, type=$3, value=$4, min_order=$5, max_uses=$6, expires_at=$7, is_active=$8
     WHERE id=$1 RETURNING *`,
    [id, code.toUpperCase(), type, value, min_order || 0, max_uses || null,
     expires_at || null, is_active !== false]
  );
  return rows[0];
}

export async function deleteCoupon(id) {
  await pool.query('DELETE FROM coupons WHERE id=$1', [id]);
}

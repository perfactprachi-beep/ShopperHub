import { pool } from '../pool.js';

// ── Address queries ───────────────────────────────────────────────

export async function getAddresses(userId) {
  const { rows } = await pool.query(
    'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id ASC',
    [userId]
  );
  return rows;
}

export async function addAddress(userId, data) {
  const { label, full_name, phone, line1, line2, city, state, pincode } = data;
  const { rows } = await pool.query(
    `INSERT INTO addresses (user_id, label, full_name, phone, line1, line2, city, state, pincode)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [userId, label, full_name || null, phone || null, line1, line2 || null, city, state, pincode]
  );
  return rows[0];
}

export async function updateAddress(id, userId, data) {
  const { label, full_name, phone, line1, line2, city, state, pincode } = data;
  const { rows } = await pool.query(
    `UPDATE addresses
     SET label=$3, full_name=$4, phone=$5, line1=$6, line2=$7, city=$8, state=$9, pincode=$10
     WHERE id=$1 AND user_id=$2
     RETURNING *`,
    [id, userId, label, full_name || null, phone || null, line1, line2 || null, city, state, pincode]
  );
  return rows[0];
}

export async function deleteAddress(id, userId) {
  await pool.query('DELETE FROM addresses WHERE id=$1 AND user_id=$2', [id, userId]);
}

export async function setDefaultAddress(id, userId) {
  await pool.query('UPDATE addresses SET is_default=false WHERE user_id=$1', [userId]);
  const { rows } = await pool.query(
    'UPDATE addresses SET is_default=true WHERE id=$1 AND user_id=$2 RETURNING *',
    [id, userId]
  );
  return rows[0];
}

// ── User queries ──────────────────────────────────────────────────

export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return rows[0];
}

export async function findUserById(id) {
  const { rows } = await pool.query(
    'SELECT id, email, full_name, phone, role, first_citizen_points, created_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0];
}

export async function createUser({ email, passwordHash, fullName, phone }) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, phone)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, full_name, phone, role, first_citizen_points, created_at`,
    [email, passwordHash, fullName || null, phone || null]
  );
  return rows[0];
}

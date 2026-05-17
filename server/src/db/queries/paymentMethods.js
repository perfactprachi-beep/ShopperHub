import { pool } from '../pool.js';

export async function getActivePaymentMethods() {
  const { rows } = await pool.query(
    'SELECT * FROM payment_methods WHERE is_active = true ORDER BY sort_order ASC, id ASC'
  );
  return rows;
}

export async function adminListPaymentMethods() {
  const { rows } = await pool.query(
    'SELECT * FROM payment_methods ORDER BY sort_order ASC, id ASC'
  );
  return rows;
}

export async function createPaymentMethod({ name, code, description = '', icon_type = 'card', is_active = true, sort_order = 0 }) {
  const { rows } = await pool.query(
    `INSERT INTO payment_methods (name, code, description, icon_type, is_active, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, code, description, icon_type, is_active, sort_order]
  );
  return rows[0];
}

export async function updatePaymentMethod(id, { name, code, description, icon_type, is_active, sort_order }) {
  const { rows } = await pool.query(
    `UPDATE payment_methods
     SET name = COALESCE($1, name),
         code = COALESCE($2, code),
         description = COALESCE($3, description),
         icon_type = COALESCE($4, icon_type),
         is_active = COALESCE($5, is_active),
         sort_order = COALESCE($6, sort_order)
     WHERE id = $7
     RETURNING *`,
    [name, code, description, icon_type, is_active, sort_order, id]
  );
  return rows[0];
}

export async function deletePaymentMethod(id) {
  await pool.query('DELETE FROM payment_methods WHERE id = $1', [id]);
}

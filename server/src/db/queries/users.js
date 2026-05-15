import { pool } from '../pool.js';

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

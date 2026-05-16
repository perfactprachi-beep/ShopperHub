import { pool } from '../pool.js';

// Create table on startup if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS offers (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    is_active   BOOLEAN DEFAULT true,
    sort_order  INT DEFAULT 0,
    expires_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  )
`).catch(console.error);

export async function getAllOffers() {
  const { rows } = await pool.query(
    'SELECT * FROM offers ORDER BY sort_order, id DESC'
  );
  return rows;
}

export async function getActiveOffers() {
  const { rows } = await pool.query(`
    SELECT id, title, description, sort_order
    FROM offers
    WHERE is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY sort_order, id
  `);
  return rows;
}

export async function createOffer({ title, description, is_active, sort_order, expires_at }) {
  const { rows } = await pool.query(
    `INSERT INTO offers (title, description, is_active, sort_order, expires_at)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [title, description || null, is_active !== false, Number(sort_order) || 0, expires_at || null]
  );
  return rows[0];
}

export async function updateOffer(id, { title, description, is_active, sort_order, expires_at }) {
  const { rows } = await pool.query(
    `UPDATE offers
     SET title=$2, description=$3, is_active=$4, sort_order=$5, expires_at=$6
     WHERE id=$1 RETURNING *`,
    [id, title, description || null, is_active !== false, Number(sort_order) || 0, expires_at || null]
  );
  return rows[0];
}

export async function deleteOffer(id) {
  await pool.query('DELETE FROM offers WHERE id=$1', [id]);
}

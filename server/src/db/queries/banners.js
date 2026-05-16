import { pool } from '../pool.js';

export async function getActiveBanners() {
  const { rows } = await pool.query(`
    SELECT id, title, image_url, link, position
    FROM banners
    WHERE is_active = true
    ORDER BY sort_order
  `);
  return rows;
}

export async function getAllBanners() {
  const { rows } = await pool.query(
    'SELECT * FROM banners ORDER BY sort_order, id'
  );
  return rows;
}

export async function createBanner({ title, image_url, link, position, sort_order, is_active }) {
  const { rows } = await pool.query(
    `INSERT INTO banners (title, image_url, link, position, sort_order, is_active)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [title || null, image_url || null, link || null, position || 'hero', sort_order || 0, is_active !== false]
  );
  return rows[0];
}

export async function updateBanner(id, { title, image_url, link, position, sort_order, is_active }) {
  const { rows } = await pool.query(
    `UPDATE banners SET title=$2, image_url=$3, link=$4, position=$5, sort_order=$6, is_active=$7
     WHERE id=$1 RETURNING *`,
    [id, title || null, image_url || null, link || null, position || 'hero', sort_order || 0, is_active !== false]
  );
  return rows[0];
}

export async function deleteBanner(id) {
  await pool.query('DELETE FROM banners WHERE id=$1', [id]);
}

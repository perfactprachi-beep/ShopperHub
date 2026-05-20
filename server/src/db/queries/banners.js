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

export async function getActiveBannersByPosition(position) {
  const { rows } = await pool.query(`
    SELECT id, title, eyebrow, subtitle, image_url, link, position, align, sort_order
    FROM banners
    WHERE is_active = true AND position = $1
    ORDER BY sort_order
  `, [position]);
  return rows;
}

export async function getAllBanners() {
  const { rows } = await pool.query(
    'SELECT * FROM banners ORDER BY sort_order, id'
  );
  return rows;
}

export async function createBanner({ title, eyebrow, subtitle, image_url, link, position, align, sort_order, is_active }) {
  const { rows } = await pool.query(
    `INSERT INTO banners (title, eyebrow, subtitle, image_url, link, position, align, sort_order, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [title || null, eyebrow || null, subtitle || null, image_url || null, link || null, position || 'hero', align || 'left', sort_order || 0, is_active !== false]
  );
  return rows[0];
}

export async function updateBanner(id, { title, eyebrow, subtitle, image_url, link, position, align, sort_order, is_active }) {
  const { rows } = await pool.query(
    `UPDATE banners SET title=$2, eyebrow=$3, subtitle=$4, image_url=$5, link=$6, position=$7, align=$8, sort_order=$9, is_active=$10
     WHERE id=$1 RETURNING *`,
    [id, title || null, eyebrow || null, subtitle || null, image_url || null, link || null, position || 'hero', align || 'left', sort_order || 0, is_active !== false]
  );
  return rows[0];
}

export async function deleteBanner(id) {
  await pool.query('DELETE FROM banners WHERE id=$1', [id]);
}

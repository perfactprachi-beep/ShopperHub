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

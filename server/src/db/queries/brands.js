import { pool } from '../pool.js';

export async function getBrands() {
  const { rows } = await pool.query(
    'SELECT id, name, slug, logo_url, description FROM brands ORDER BY name'
  );
  return rows;
}

export async function getBrandBySlug(slug) {
  const { rows } = await pool.query(
    'SELECT * FROM brands WHERE slug = $1',
    [slug]
  );
  return rows[0];
}

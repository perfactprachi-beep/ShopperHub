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

export async function createBrand({ name, slug, logo_url, description }) {
  const { rows } = await pool.query(
    `INSERT INTO brands (name, slug, logo_url, description)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [name, slug, logo_url || null, description || null]
  );
  return rows[0];
}

export async function updateBrand(id, { name, slug, logo_url, description }) {
  const { rows } = await pool.query(
    `UPDATE brands SET name=$2, slug=$3, logo_url=$4, description=$5
     WHERE id=$1 RETURNING *`,
    [id, name, slug, logo_url || null, description || null]
  );
  return rows[0];
}

export async function deleteBrand(id) {
  await pool.query('DELETE FROM brands WHERE id=$1', [id]);
}

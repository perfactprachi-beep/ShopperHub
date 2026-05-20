import { pool } from '../pool.js';

export async function getAllPages() {
  const { rows } = await pool.query(
    `SELECT id, title, slug, excerpt, meta_title, meta_description, status, created_at, updated_at
     FROM cms_pages ORDER BY id ASC`
  );
  return rows;
}

export async function getPageBySlug(slug) {
  const { rows } = await pool.query(
    `SELECT id, title, slug, excerpt, content, meta_title, meta_description, status, updated_at
     FROM cms_pages WHERE slug = $1`,
    [slug]
  );
  return rows[0] || null;
}

export async function createPage({ title, slug, excerpt, content, meta_title, meta_description, status }) {
  const { rows } = await pool.query(
    `INSERT INTO cms_pages (title, slug, excerpt, content, meta_title, meta_description, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [title, slug, excerpt || '', content || '', meta_title || null, meta_description || null, status || 'published']
  );
  return rows[0];
}

export async function updatePage(id, { title, slug, excerpt, content, meta_title, meta_description, status }) {
  const { rows } = await pool.query(
    `UPDATE cms_pages
     SET title=$1, slug=$2, excerpt=$3, content=$4, meta_title=$5, meta_description=$6,
         status=$7, updated_at=NOW()
     WHERE id=$8 RETURNING *`,
    [title, slug, excerpt || '', content || '', meta_title || null, meta_description || null, status || 'published', id]
  );
  return rows[0] || null;
}

export async function deletePage(id) {
  const { rows } = await pool.query(
    `DELETE FROM cms_pages WHERE id=$1 RETURNING id`,
    [id]
  );
  return rows[0] || null;
}

import { pool } from '../pool.js';

export async function getCategoriesTree() {
  const { rows } = await pool.query(`
    SELECT id, name, slug, parent_id, image_url, sort_order
    FROM categories
    ORDER BY sort_order, name
  `);

  const map = {};
  rows.forEach(r => { map[r.id] = { ...r, children: [] }; });

  const tree = [];
  rows.forEach(r => {
    if (r.parent_id) {
      map[r.parent_id]?.children.push(map[r.id]);
    } else {
      tree.push(map[r.id]);
    }
  });
  return tree;
}

export async function getCategoryBySlug(slug) {
  const { rows } = await pool.query(`
    SELECT c.*, p.name AS parent_name, p.slug AS parent_slug
    FROM categories c
    LEFT JOIN categories p ON p.id = c.parent_id
    WHERE c.slug = $1
  `, [slug]);
  if (!rows[0]) return null;

  const cat = rows[0];
  const { rows: children } = await pool.query(
    'SELECT id, name, slug, image_url FROM categories WHERE parent_id = $1 ORDER BY sort_order, name',
    [cat.id]
  );
  return { ...cat, children };
}

export async function getAllCategories() {
  const { rows } = await pool.query(
    'SELECT * FROM categories ORDER BY sort_order, name'
  );
  return rows;
}

export async function createCategory({ name, slug, parent_id, image_url, sort_order }) {
  const { rows } = await pool.query(
    `INSERT INTO categories (name, slug, parent_id, image_url, sort_order)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [name, slug, parent_id || null, image_url || null, sort_order || 0]
  );
  return rows[0];
}

export async function updateCategory(id, { name, slug, parent_id, image_url, sort_order }) {
  const { rows } = await pool.query(
    `UPDATE categories SET name=$2, slug=$3, parent_id=$4, image_url=$5, sort_order=$6
     WHERE id=$1 RETURNING *`,
    [id, name, slug, parent_id || null, image_url || null, sort_order || 0]
  );
  return rows[0];
}

export async function deleteCategory(id) {
  await pool.query('DELETE FROM categories WHERE id=$1', [id]);
}

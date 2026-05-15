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
  const { rows } = await pool.query(
    'SELECT * FROM categories WHERE slug = $1',
    [slug]
  );
  return rows[0];
}

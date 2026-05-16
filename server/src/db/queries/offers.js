import { pool } from '../pool.js';

// Create table on startup if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS offers (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    code        VARCHAR(50),
    image_url   VARCHAR(500),
    is_active   BOOLEAN DEFAULT true,
    sort_order  INT DEFAULT 0,
    expires_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  )
`).then(() => pool.query(`
  ALTER TABLE offers ADD COLUMN IF NOT EXISTS category_id INT REFERENCES categories(id) ON DELETE SET NULL
`)).then(() => pool.query(`
  ALTER TABLE offers ADD COLUMN IF NOT EXISTS code VARCHAR(50)
`)).then(() => pool.query(`
  ALTER TABLE offers ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)
`)).catch(console.error);

const OFFER_WITH_CATEGORY = `
  SELECT o.*, c.name AS category_name, c.slug AS category_slug,
         p.name AS parent_name, p.slug AS parent_slug
  FROM offers o
  LEFT JOIN categories c ON c.id = o.category_id
  LEFT JOIN categories p ON p.id = c.parent_id
`;

export async function getAllOffers() {
  const { rows } = await pool.query(
    `${OFFER_WITH_CATEGORY} ORDER BY o.sort_order, o.id DESC`
  );
  return rows;
}

export async function getActiveOffers(categoryId) {
  const values = [];
  let categoryFilter = 'o.category_id IS NULL';

  if (categoryId) {
    values.push(Number(categoryId));
    // Show global offers (no category), offers matching exact category,
    // or offers targeting the parent of this category
    categoryFilter = `(
      o.category_id IS NULL
      OR o.category_id = $1
      OR o.category_id IN (
        SELECT parent_id FROM categories WHERE id = $1 AND parent_id IS NOT NULL
      )
    )`;
  }

  const { rows } = await pool.query(`
    SELECT o.id, o.title, o.description, o.code, o.image_url, o.sort_order,
           c.name AS category_name, c.slug AS category_slug
    FROM offers o
    LEFT JOIN categories c ON c.id = o.category_id
    WHERE o.is_active = true
      AND (o.expires_at IS NULL OR o.expires_at > NOW())
      AND ${categoryFilter}
    ORDER BY o.sort_order, o.id
  `, values);
  return rows;
}

export async function createOffer({ title, description, code, image_url, is_active, sort_order, expires_at, category_id }) {
  const { rows } = await pool.query(
    `INSERT INTO offers (title, description, code, image_url, is_active, sort_order, expires_at, category_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [title, description || null, code || null, image_url || null, is_active !== false, Number(sort_order) || 0, expires_at || null, category_id || null]
  );
  const { rows: full } = await pool.query(`${OFFER_WITH_CATEGORY} WHERE o.id=$1`, [rows[0].id]);
  return full[0];
}

export async function updateOffer(id, { title, description, code, image_url, is_active, sort_order, expires_at, category_id }) {
  const { rows } = await pool.query(
    `UPDATE offers
     SET title=$2, description=$3, code=$4, image_url=$5, is_active=$6, sort_order=$7, expires_at=$8, category_id=$9
     WHERE id=$1 RETURNING *`,
    [id, title, description || null, code || null, image_url || null, is_active !== false, Number(sort_order) || 0, expires_at || null, category_id || null]
  );
  const { rows: full } = await pool.query(`${OFFER_WITH_CATEGORY} WHERE o.id=$1`, [rows[0].id]);
  return full[0];
}

export async function deleteOffer(id) {
  await pool.query('DELETE FROM offers WHERE id=$1', [id]);
}

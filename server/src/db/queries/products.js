import { pool } from '../pool.js';

export async function getProducts({ category, brand, gender, minPrice, maxPrice, sort, page, limit }) {
  const conditions = ['p.status = $1'];
  const values = ['active'];
  let idx = 2;

  if (category) { conditions.push(`c.slug = $${idx++}`); values.push(category); }
  if (brand)    { conditions.push(`b.slug = $${idx++}`); values.push(brand); }
  if (gender)   { conditions.push(`p.gender = $${idx++}`); values.push(gender); }
  if (minPrice) { conditions.push(`p.base_price >= $${idx++}`); values.push(minPrice); }
  if (maxPrice) { conditions.push(`p.base_price <= $${idx++}`); values.push(maxPrice); }

  const orderMap = {
    'price_asc':  'p.base_price ASC',
    'price_desc': 'p.base_price DESC',
    'newest':     'p.created_at DESC',
    'discount':   'p.discount_pct DESC',
  };
  const order = orderMap[sort] || 'p.created_at DESC';

  const offset = (Number(page || 1) - 1) * Number(limit || 20);

  const sql = `
    SELECT
      p.id, p.title, p.slug, p.base_price, p.discount_pct, p.gender, p.stock,
      b.name AS brand_name, b.slug AS brand_slug,
      c.name AS category_name, c.slug AS category_slug,
      (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS image_url,
      COUNT(*) OVER() AS total_count
    FROM products p
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY ${order}
    LIMIT $${idx++} OFFSET $${idx++}
  `;
  values.push(Number(limit || 20), offset);

  const { rows } = await pool.query(sql, values);
  return rows;
}

export async function getProductBySlug(slug) {
  const { rows } = await pool.query(`
    SELECT
      p.*,
      b.name AS brand_name, b.slug AS brand_slug,
      c.name AS category_name, c.slug AS category_slug
    FROM products p
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.slug = $1 AND p.status = 'active'
  `, [slug]);

  if (!rows[0]) return null;
  const product = rows[0];

  const [{ rows: images }, { rows: variants }] = await Promise.all([
    pool.query('SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order', [product.id]),
    pool.query('SELECT * FROM product_variants WHERE product_id = $1', [product.id]),
  ]);

  return { ...product, images, variants };
}

export async function searchProducts(q, limit = 20) {
  const { rows } = await pool.query(`
    SELECT
      p.id, p.title, p.slug, p.base_price, p.discount_pct, p.gender,
      b.name AS brand_name,
      c.name AS category_name,
      (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS image_url,
      ts_rank(to_tsvector('english', p.title), plainto_tsquery('english', $1)) AS rank
    FROM products p
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE to_tsvector('english', p.title) @@ plainto_tsquery('english', $1)
      AND p.status = 'active'
    ORDER BY rank DESC
    LIMIT $2
  `, [q, limit]);
  return rows;
}

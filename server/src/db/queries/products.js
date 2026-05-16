import { pool } from '../pool.js';

export async function getProducts({ category, brand, gender, minPrice, maxPrice, minDiscount, sort, page, limit }) {
  const conditions = ['p.status = $1'];
  const values = ['active'];
  let idx = 2;

  if (category)    { conditions.push(`c.slug = $${idx++}`); values.push(category); }
  if (brand)       { conditions.push(`b.slug = $${idx++}`); values.push(brand); }
  if (gender)      { conditions.push(`p.gender = $${idx++}`); values.push(gender); }
  if (minPrice)    { conditions.push(`p.base_price >= $${idx++}`); values.push(minPrice); }
  if (maxPrice)    { conditions.push(`p.base_price <= $${idx++}`); values.push(maxPrice); }
  if (minDiscount) { conditions.push(`p.discount_pct >= $${idx++}`); values.push(Number(minDiscount)); }

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

// ── Admin queries ─────────────────────────────────────────────────────────────

export async function adminListProducts({ page = 1, limit = 20, search, status }) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (status && status !== 'all') { conditions.push(`p.status = $${idx++}`); values.push(status); }
  if (search) {
    conditions.push(`(p.title ILIKE $${idx} OR b.name ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(limit);

  const sql = `
    SELECT
      p.id, p.title, p.slug, p.base_price, p.discount_pct, p.gender, p.stock, p.status, p.created_at,
      b.name AS brand_name, b.id AS brand_id,
      c.name AS category_name, c.id AS category_id,
      (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS image_url,
      COUNT(*) OVER() AS total_count
    FROM products p
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN categories c ON c.id = p.category_id
    ${where}
    ORDER BY p.created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;
  values.push(Number(limit), offset);

  const { rows } = await pool.query(sql, values);
  return rows;
}

export async function createProduct({ title, slug, brand_id, category_id, description, gender, base_price, discount_pct, stock, status }) {
  const { rows } = await pool.query(
    `INSERT INTO products (title, slug, brand_id, category_id, description, gender, base_price, discount_pct, stock, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [title, slug, brand_id || null, category_id || null, description || null, gender || null,
     base_price, discount_pct || 0, stock || 0, status || 'active']
  );
  return rows[0];
}

export async function updateProduct(id, { title, slug, brand_id, category_id, description, gender, base_price, discount_pct, stock, status }) {
  const { rows } = await pool.query(
    `UPDATE products
     SET title=$2, slug=$3, brand_id=$4, category_id=$5, description=$6,
         gender=$7, base_price=$8, discount_pct=$9, stock=$10, status=$11
     WHERE id=$1 RETURNING *`,
    [id, title, slug, brand_id || null, category_id || null, description || null,
     gender || null, base_price, discount_pct || 0, stock || 0, status || 'active']
  );
  return rows[0];
}

export async function deleteProduct(id) {
  const { rows } = await pool.query(
    `UPDATE products SET status='inactive' WHERE id=$1 RETURNING *`,
    [id]
  );
  return rows[0];
}

export async function addVariant(productId, { size, color, sku, stock, extra_price }) {
  const { rows } = await pool.query(
    `INSERT INTO product_variants (product_id, size, color, sku, stock, extra_price)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [productId, size || null, color || null, sku || null, stock || 0, extra_price || 0]
  );
  return rows[0];
}

export async function updateVariant(id, { size, color, sku, stock, extra_price }) {
  const { rows } = await pool.query(
    `UPDATE product_variants SET size=$2, color=$3, sku=$4, stock=$5, extra_price=$6
     WHERE id=$1 RETURNING *`,
    [id, size || null, color || null, sku || null, stock || 0, extra_price || 0]
  );
  return rows[0];
}

export async function deleteVariant(id) {
  await pool.query('DELETE FROM product_variants WHERE id=$1', [id]);
}

export async function addImage(productId, url, isPrimary = false) {
  const { rows } = await pool.query(
    `INSERT INTO product_images (product_id, url, is_primary)
     VALUES ($1,$2,$3) RETURNING *`,
    [productId, url, isPrimary]
  );
  return rows[0];
}

export async function deleteImage(id) {
  await pool.query('DELETE FROM product_images WHERE id=$1', [id]);
}

export async function setPrimaryImage(id, productId) {
  await pool.query('UPDATE product_images SET is_primary=false WHERE product_id=$1', [productId]);
  const { rows } = await pool.query(
    'UPDATE product_images SET is_primary=true WHERE id=$1 AND product_id=$2 RETURNING *',
    [id, productId]
  );
  return rows[0];
}

export async function getProductVariants(productId) {
  const { rows } = await pool.query(
    'SELECT * FROM product_variants WHERE product_id=$1 ORDER BY id',
    [productId]
  );
  return rows;
}

export async function getProductImages(productId) {
  const { rows } = await pool.query(
    'SELECT * FROM product_images WHERE product_id=$1 ORDER BY sort_order, id',
    [productId]
  );
  return rows;
}

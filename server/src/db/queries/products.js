import { pool } from '../pool.js';

pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_deal BOOLEAN DEFAULT false`).catch(console.error);
pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_returnable BOOLEAN DEFAULT true`).catch(console.error);

pool.query(`
  CREATE TABLE IF NOT EXISTS product_attributes (
    id         SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    label      VARCHAR(100) NOT NULL,
    value      VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    section    VARCHAR(20) DEFAULT 'highlights'
  )
`).then(() => pool.query(`
  ALTER TABLE product_attributes ADD COLUMN IF NOT EXISTS section VARCHAR(20) DEFAULT 'highlights'
`)).catch(console.error);

export async function getProducts({ category, brand, gender, minPrice, maxPrice, minDiscount, sort, page, limit }) {
  const conditions = ['p.status = $1'];
  const values = ['active'];
  let idx = 2;

  // Use recursive CTE so browsing /category/men includes all subcategory products
  const categoryWith = category ? `
    WITH RECURSIVE cat_tree AS (
      SELECT id FROM categories WHERE slug = $${idx}
      UNION ALL
      SELECT c.id FROM categories c JOIN cat_tree ct ON c.parent_id = ct.id
    )
  ` : '';
  if (category) { conditions.push(`(p.category_id IN (SELECT id FROM cat_tree) OR (p.sub_category_id IS NOT NULL AND p.sub_category_id IN (SELECT id FROM cat_tree)))`); values.push(category); idx++; }

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
    'random':     'RANDOM()',
  };
  const order = orderMap[sort] || 'p.created_at DESC';

  const offset = (Number(page || 1) - 1) * Number(limit || 20);

  const sql = `
    ${categoryWith}
    SELECT
      p.id, p.title, p.slug, p.base_price, p.discount_pct, p.gender,
      COALESCE(
        (SELECT SUM(pv.stock) FROM product_variants pv WHERE pv.product_id = p.id),
        p.stock
      ) AS stock,
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
      c.name AS category_name, c.slug AS category_slug,
      pc.name AS parent_category_name, pc.slug AS parent_category_slug
    FROM products p
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN categories pc ON pc.id = c.parent_id
    WHERE p.slug = $1 AND p.status = 'active'
  `, [slug]);

  if (!rows[0]) return null;
  const product = rows[0];

  const [{ rows: images }, { rows: variants }, { rows: attributes }] = await Promise.all([
    pool.query('SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order', [product.id]),
    pool.query('SELECT * FROM product_variants WHERE product_id = $1', [product.id]),
    pool.query('SELECT * FROM product_attributes WHERE product_id = $1 ORDER BY sort_order, id', [product.id]),
  ]);

  return { ...product, images, variants, attributes };
}

// ── Product Attributes CRUD ───────────────────────────────────────────────────
export async function getProductAttributes(productId) {
  const { rows } = await pool.query(
    'SELECT * FROM product_attributes WHERE product_id = $1 ORDER BY sort_order, id',
    [productId]
  );
  return rows;
}

export async function addProductAttribute(productId, { label, value, sort_order = 0, section = 'highlights' }) {
  const { rows } = await pool.query(
    'INSERT INTO product_attributes (product_id, label, value, sort_order, section) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [productId, label, value, Number(sort_order) || 0, section]
  );
  return rows[0];
}

export async function updateProductAttribute(id, { label, value, sort_order, section }) {
  const { rows } = await pool.query(
    'UPDATE product_attributes SET label=$2, value=$3, sort_order=$4, section=$5 WHERE id=$1 RETURNING *',
    [id, label, value, Number(sort_order) || 0, section || 'highlights']
  );
  return rows[0];
}

export async function deleteProductAttribute(id) {
  await pool.query('DELETE FROM product_attributes WHERE id=$1', [id]);
}

export async function searchProducts(q, limit = 20) {
  const tsq = `plainto_tsquery('english', $1)`;
  const titleVec = `to_tsvector('english', p.title)`;
  const like = `%${q}%`;
  const { rows } = await pool.query(`
    SELECT
      p.id, p.title, p.slug, p.base_price, p.discount_pct, p.gender,
      COALESCE(
        (SELECT SUM(pv.stock) FROM product_variants pv WHERE pv.product_id = p.id),
        p.stock
      ) AS stock,
      b.name AS brand_name,
      c.name AS category_name,
      (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS image_url,
      ts_rank(${titleVec}, ${tsq}) AS rank
    FROM products p
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.status = 'active'
      AND (
        ${titleVec} @@ ${tsq}
        OR b.name ILIKE $3
        OR c.name ILIKE $3
      )
    ORDER BY rank DESC
    LIMIT $2
  `, [q, limit, like]);
  return rows;
}

// ── Admin queries ─────────────────────────────────────────────────────────────

export async function adminListProducts({ page = 1, limit = 20, search, status, brand_id, category_id, is_deal }) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (status && status !== 'all') { conditions.push(`p.status = $${idx++}`); values.push(status); }
  if (brand_id)    { conditions.push(`p.brand_id = $${idx++}`);    values.push(brand_id); }
  if (category_id) { conditions.push(`p.category_id = $${idx++}`); values.push(category_id); }
  if (is_deal === 'true') { conditions.push(`p.is_deal = true`); }
  if (search) {
    conditions.push(`(p.title ILIKE $${idx} OR b.name ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(limit);

  const sql = `
    SELECT
      p.id, p.title, p.slug, p.base_price, p.discount_pct, p.gender,
      COALESCE(
        (SELECT SUM(pv.stock) FROM product_variants pv WHERE pv.product_id = p.id),
        p.stock
      ) AS stock,
      p.status, p.is_deal, p.is_returnable, p.created_at,
      b.name AS brand_name, b.id AS brand_id,
      c.name AS category_name, c.id AS category_id,
      p.sub_category_id, sc.name AS sub_category_name,
      (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS image_url,
      COUNT(*) OVER() AS total_count
    FROM products p
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN categories sc ON sc.id = p.sub_category_id
    ${where}
    ORDER BY p.created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;
  values.push(Number(limit), offset);

  const { rows } = await pool.query(sql, values);
  return rows;
}

export async function createProduct({ title, slug, brand_id, category_id, sub_category_id, description, gender, base_price, discount_pct, stock, status, is_deal, is_returnable }) {
  const { rows } = await pool.query(
    `INSERT INTO products (title, slug, brand_id, category_id, sub_category_id, description, gender, base_price, discount_pct, stock, status, is_deal, is_returnable)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING *`,
    [title, slug, brand_id || null, category_id || null, sub_category_id || null,
     description || null, gender || null,
     base_price, discount_pct || 0, stock || 0, status || 'active',
     is_deal === true || is_deal === 'true',
     is_returnable !== false && is_returnable !== 'false']
  );
  return rows[0];
}

export async function updateProduct(id, { title, slug, brand_id, category_id, sub_category_id, description, gender, base_price, discount_pct, stock, status, is_deal, is_returnable }) {
  const { rows } = await pool.query(
    `UPDATE products
     SET title=$2, slug=$3, brand_id=$4, category_id=$5, sub_category_id=$6, description=$7,
         gender=$8, base_price=$9, discount_pct=$10, stock=$11, status=$12, is_deal=$13, is_returnable=$14
     WHERE id=$1 RETURNING *`,
    [id, title, slug, brand_id || null, category_id || null, sub_category_id || null,
     description || null, gender || null, base_price, discount_pct || 0, stock || 0,
     status || 'active',
     is_deal === true || is_deal === 'true',
     is_returnable !== false && is_returnable !== 'false']
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

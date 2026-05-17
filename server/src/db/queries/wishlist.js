import { pool } from '../pool.js';

export async function getWishlistByUser(userId) {
  const { rows } = await pool.query(
    `SELECT
       p.id, p.title, p.slug, p.base_price, p.discount_pct, p.stock,
       b.name AS brand_name, b.slug AS brand_slug,
       (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS image_url,
       w.created_at AS wishlisted_at
     FROM wishlists w
     JOIN products p ON p.id = w.product_id AND p.status = 'active'
     LEFT JOIN brands b ON b.id = p.brand_id
     WHERE w.user_id = $1
     ORDER BY w.created_at DESC`,
    [userId]
  );
  return rows;
}

export async function addToWishlist(userId, productId) {
  await pool.query(
    `INSERT INTO wishlists (user_id, product_id) VALUES ($1, $2)
     ON CONFLICT (user_id, product_id) DO NOTHING`,
    [userId, productId]
  );
}

export async function removeFromWishlist(userId, productId) {
  await pool.query(
    'DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2',
    [userId, productId]
  );
}

export async function isInWishlist(userId, productId) {
  const { rows } = await pool.query(
    'SELECT 1 FROM wishlists WHERE user_id = $1 AND product_id = $2',
    [userId, productId]
  );
  return rows.length > 0;
}

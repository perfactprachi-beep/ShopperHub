import { pool } from '../pool.js';
import { hasPurchasedProduct } from './orders.js';

export async function getReviews(productId) {
  const { rows } = await pool.query(
    `SELECT r.id, r.rating, r.body, r.created_at,
            u.full_name
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.product_id = $1
     ORDER BY r.created_at DESC`,
    [productId]
  );
  return rows;
}

export async function getAverageRating(productId) {
  const { rows } = await pool.query(
    `SELECT ROUND(AVG(rating)::numeric, 1) AS average,
            COUNT(*) AS count,
            COUNT(*) FILTER (WHERE rating = 5) AS five,
            COUNT(*) FILTER (WHERE rating = 4) AS four,
            COUNT(*) FILTER (WHERE rating = 3) AS three,
            COUNT(*) FILTER (WHERE rating = 2) AS two,
            COUNT(*) FILTER (WHERE rating = 1) AS one
     FROM reviews WHERE product_id = $1`,
    [productId]
  );
  return rows[0];
}

export async function addReview(userId, productId, { rating, body }) {
  const purchased = await hasPurchasedProduct(userId, productId);
  if (!purchased) {
    const err = new Error('You can only review products you have purchased and received.');
    err.status = 403;
    throw err;
  }
  const { rows } = await pool.query(
    `INSERT INTO reviews (user_id, product_id, rating, body)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, product_id) DO UPDATE
       SET rating = EXCLUDED.rating, body = EXCLUDED.body
     RETURNING *`,
    [userId, productId, rating, body || null]
  );
  return rows[0];
}

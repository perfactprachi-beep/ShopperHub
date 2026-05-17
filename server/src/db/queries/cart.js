import { pool } from '../pool.js';

const ITEM_SELECT = `
  ci.id        AS "itemId",
  ci.variant_id AS "variantId",
  ci.quantity,
  pv.size, pv.color, pv.sku,
  p.id         AS "productId",
  p.title      AS "productTitle",
  b.name       AS brand,
  (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS image,
  ROUND((p.base_price * (1 - p.discount_pct::NUMERIC / 100)) + pv.extra_price, 2) AS "unitPrice",
  ROUND(((p.base_price * (1 - p.discount_pct::NUMERIC / 100)) + pv.extra_price) * ci.quantity, 2) AS "lineTotal",
  COALESCE(p.express_eligible, false)      AS "expressEligible",
  COALESCE(p.store_pickup_eligible, false) AS "storePickupEligible"
`;

export async function getCartByUser(userId) {
  const { rows } = await pool.query(
    `SELECT ${ITEM_SELECT}
     FROM cart_items ci
     JOIN product_variants pv ON pv.id = ci.variant_id
     JOIN products p ON p.id = pv.product_id
     LEFT JOIN brands b ON b.id = p.brand_id
     WHERE ci.user_id = $1
     ORDER BY ci.created_at DESC`,
    [userId]
  );
  return rows;
}

export async function addOrUpdateItem(userId, variantId, quantity) {
  const { rows } = await pool.query(
    `INSERT INTO cart_items (user_id, variant_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, variant_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
     RETURNING id`,
    [userId, variantId, quantity]
  );
  return rows[0];
}

export async function updateItemQty(itemId, userId, quantity) {
  const { rows } = await pool.query(
    `UPDATE cart_items SET quantity = $1
     WHERE id = $2 AND user_id = $3
     RETURNING id`,
    [quantity, itemId, userId]
  );
  return rows[0];
}

export async function removeItem(itemId, userId) {
  await pool.query(
    'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
    [itemId, userId]
  );
}

export async function clearCart(userId) {
  await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
}

export async function mergeCarts(userId, guestItems) {
  if (!guestItems?.length) return;
  const values = guestItems
    .map((_, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`)
    .join(', ');
  const params = [userId];
  guestItems.forEach(({ variantId, quantity }) => params.push(variantId, quantity));

  await pool.query(
    `INSERT INTO cart_items (user_id, variant_id, quantity)
     VALUES ${values}
     ON CONFLICT (user_id, variant_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
    params
  );
}

import { pool } from '../pool.js';
import { createNotification } from './notifications.js';

export async function createOrder(data) {
  const { userId, addressId, couponId, subtotal, discount, shipping, total, pointsEarned, paymentMethod, razorpayOrderId } = data;
  const { rows } = await pool.query(
    `INSERT INTO orders
       (user_id, address_id, coupon_id, subtotal, discount, shipping, total,
        points_earned, payment_method, payment_status, razorpay_order_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'paid',$10)
     RETURNING *`,
    [userId, addressId, couponId || null, subtotal, discount, shipping, total,
     pointsEarned, paymentMethod || 'razorpay', razorpayOrderId]
  );
  return rows[0];
}

export async function addOrderItems(orderId, items) {
  if (!items?.length) return;
  const vals = items.map((_, i) => `($1, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4}, $${i * 4 + 5})`).join(', ');
  const ps = [orderId];
  items.forEach(({ productId, variantId, quantity, unitPrice }) => {
    ps.push(productId, variantId ?? null, quantity, unitPrice);
  });
  await pool.query(
    `INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price) VALUES ${vals}`,
    ps
  );
}

export async function deductStock(variantId, qty) {
  await pool.query(
    'UPDATE product_variants SET stock = GREATEST(stock - $1, 0) WHERE id = $2',
    [qty, variantId]
  );
}

export async function awardPoints(userId, points) {
  await pool.query(
    'UPDATE users SET first_citizen_points = first_citizen_points + $1 WHERE id = $2',
    [points, userId]
  );
}

export async function markCouponUsed(couponId) {
  await pool.query(
    'UPDATE coupons SET used_count = used_count + 1 WHERE id = $1',
    [couponId]
  );
}

export async function getOrderById(orderId, userId) {
  const { rows } = await pool.query(
    `SELECT o.*,
            a.label, a.line1, a.line2, a.city, a.state, a.pincode,
            a.full_name AS address_full_name, a.phone AS address_phone
     FROM orders o
     JOIN addresses a ON a.id = o.address_id
     WHERE o.id = $1 AND o.user_id = $2`,
    [orderId, userId]
  );
  return rows[0];
}

export async function getOrderItems(orderId) {
  const { rows } = await pool.query(
    `SELECT oi.*, p.title, p.slug,
            pv.size, pv.color,
            (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS image
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     LEFT JOIN product_variants pv ON pv.id = oi.variant_id
     WHERE oi.order_id = $1`,
    [orderId]
  );
  return rows;
}

export async function getOrdersByUser(userId, { page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(
    `SELECT o.id, o.status, o.total, o.subtotal, o.discount, o.shipping,
            o.payment_method, o.payment_status, o.created_at, o.points_earned,
            json_agg(
              json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'title', p.title,
                'slug', p.slug,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'size', pv.size,
                'color', pv.color,
                'image', (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1)
              )
            ) AS items
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     JOIN products p ON p.id = oi.product_id
     LEFT JOIN product_variants pv ON pv.id = oi.variant_id
     WHERE o.user_id = $1
     GROUP BY o.id
     ORDER BY o.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  const { rows: countRows } = await pool.query(
    'SELECT COUNT(*) FROM orders WHERE user_id = $1', [userId]
  );
  return { orders: rows, total: parseInt(countRows[0].count, 10) };
}

export async function cancelOrder(orderId, userId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `UPDATE orders SET status = 'cancelled'
       WHERE id = $1 AND user_id = $2 AND status IN ('pending','confirmed')
       RETURNING *`,
      [orderId, userId]
    );
    if (!rows[0]) { await client.query('ROLLBACK'); return null; }

    const items = await client.query(
      'SELECT variant_id, quantity FROM order_items WHERE order_id = $1', [orderId]
    );
    for (const { variant_id, quantity } of items.rows) {
      if (variant_id) {
        await client.query(
          'UPDATE product_variants SET stock = stock + $1 WHERE id = $2',
          [quantity, variant_id]
        );
      }
    }

    if (rows[0].points_earned > 0) {
      await client.query(
        'UPDATE users SET first_citizen_points = GREATEST(first_citizen_points - $1, 0) WHERE id = $2',
        [rows[0].points_earned, userId]
      );
    }

    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function hasPurchasedProduct(userId, productId) {
  const { rows } = await pool.query(
    `SELECT 1 FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status = 'delivered'
     LIMIT 1`,
    [userId, productId]
  );
  return rows.length > 0;
}

// Wrap fulfilment in a single transaction
export async function fulfillOrder({ userId, addressId, couponId, subtotal, discount,
  shipping, total, pointsEarned, paymentMethod, razorpayOrderId, items }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: [order] } = await client.query(
      `INSERT INTO orders
         (user_id, address_id, coupon_id, subtotal, discount, shipping, total,
          points_earned, payment_method, payment_status, razorpay_order_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'paid',$10,'confirmed')
       RETURNING *`,
      [userId, addressId, couponId || null, subtotal, discount, shipping, total,
       pointsEarned, paymentMethod || 'razorpay', razorpayOrderId]
    );

    if (items?.length) {
      const vals = items.map((_, i) => `($1, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4}, $${i * 4 + 5})`).join(', ');
      const ps = [order.id];
      items.forEach(({ productId, variantId, quantity, unitPrice }) => {
        ps.push(productId, variantId ?? null, quantity, unitPrice);
      });
      await client.query(
        `INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price) VALUES ${vals}`,
        ps
      );

      for (const { variantId, quantity } of items) {
        if (variantId) {
          await client.query(
            'UPDATE product_variants SET stock = GREATEST(stock - $1, 0) WHERE id = $2',
            [quantity, variantId]
          );
        }
      }
    }

    if (pointsEarned > 0) {
      await client.query(
        'UPDATE users SET first_citizen_points = first_citizen_points + $1 WHERE id = $2',
        [pointsEarned, userId]
      );
    }

    if (couponId) {
      await client.query(
        'UPDATE coupons SET used_count = used_count + 1 WHERE id = $1',
        [couponId]
      );
    }

    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    await client.query('COMMIT');

    // Fire-and-forget notification outside transaction
    createNotification(userId, `Your order #ORD-${order.id} has been confirmed.`).catch(() => {});

    return order;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

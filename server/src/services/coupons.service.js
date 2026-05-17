import { pool } from '../db/pool.js';

export async function validateCoupon(code, cartTotal, userId) {
  const { rows } = await pool.query(
    `SELECT * FROM coupons WHERE code = $1`,
    [code.trim().toUpperCase()]
  );

  const coupon = rows[0];
  if (!coupon) return { valid: false, reason: 'Invalid coupon code' };
  if (!coupon.is_active) return { valid: false, reason: 'This coupon is no longer active' };
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { valid: false, reason: 'This coupon has expired' };
  }
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return { valid: false, reason: 'Coupon usage limit reached' };
  }
  if (userId) {
    const { rows: usageRows } = await pool.query(
      `SELECT COUNT(*) FROM orders WHERE user_id = $1 AND coupon_id = $2 AND payment_status = 'paid'`,
      [userId, coupon.id]
    );
    if (parseInt(usageRows[0].count) > 0) {
      return { valid: false, reason: 'You have already used this coupon' };
    }
  }
  if (Number(cartTotal) < Number(coupon.min_order)) {
    return { valid: false, reason: `Minimum order of ₹${coupon.min_order} required` };
  }

  let discount;
  if (coupon.type === 'flat') {
    discount = Number(coupon.value);
  } else {
    discount = Math.round((Number(cartTotal) * Number(coupon.value)) / 100);
  }

  discount = Math.min(discount, Number(cartTotal));
  const finalTotal = Number(cartTotal) - discount;

  return { valid: true, discount, finalTotal, couponId: coupon.id, coupon };
}

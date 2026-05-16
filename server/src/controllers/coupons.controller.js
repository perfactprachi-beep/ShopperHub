import { validateCoupon } from '../services/coupons.service.js';
import { pool } from '../db/pool.js';

export async function getActiveCoupons(_req, res, next) {
  try {
    const { rows } = await pool.query(`
      SELECT id, code, type, value, min_order, expires_at
      FROM coupons
      WHERE is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (max_uses IS NULL OR used_count < max_uses)
      ORDER BY value DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

export async function validate(req, res, next) {
  try {
    const { code, cartTotal } = req.body;
    if (!code || cartTotal === undefined) {
      return res.status(400).json({ success: false, message: 'code and cartTotal are required' });
    }
    const result = await validateCoupon(code, cartTotal, req.user.id);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.reason });
    }
    res.json({
      success: true,
      data: { couponId: result.couponId, discount: result.discount, finalTotal: result.finalTotal },
    });
  } catch (err) { next(err); }
}

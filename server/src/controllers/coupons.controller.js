import { validateCoupon } from '../services/coupons.service.js';

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

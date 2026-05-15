import { getCartByUser } from '../db/queries/cart.js';
import { getAddresses, findUserById } from '../db/queries/users.js';
import { pool } from '../db/pool.js';
import { validateCoupon } from '../services/coupons.service.js';
import { createRazorpayOrder, verifySignature } from '../services/payments.service.js';
import { fulfillOrder, getOrderById, getOrderItems } from '../db/queries/orders.js';

export async function createOrder(req, res, next) {
  try {
    const { addressId, couponCode, usePoints } = req.body;
    const userId = req.user.id;

    if (!addressId) {
      return res.status(400).json({ success: false, message: 'addressId is required' });
    }

    // Verify address belongs to user
    const addresses = await getAddresses(userId);
    const address = addresses.find((a) => a.id === Number(addressId));
    if (!address) {
      return res.status(400).json({ success: false, message: 'Invalid address' });
    }

    // Get cart
    const cartItems = await getCartByUser(userId);
    if (!cartItems.length) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const subtotal = cartItems.reduce((sum, i) => sum + Number(i.lineTotal), 0);
    let discount = 0;
    let couponId = null;

    if (couponCode) {
      const couponResult = await validateCoupon(couponCode, subtotal, userId);
      if (!couponResult.valid) {
        return res.status(400).json({ success: false, message: couponResult.reason });
      }
      discount = couponResult.discount;
      couponId = couponResult.couponId;
    }

    // Points redemption (max 20% of post-coupon total, 1 point = ₹1)
    let pointsDiscount = 0;
    if (usePoints) {
      const userRow = await findUserById(userId);
      if (userRow.first_citizen_points > 0) {
        const maxPointsDiscount = Math.floor((subtotal - discount) * 0.2);
        pointsDiscount = Math.min(userRow.first_citizen_points, maxPointsDiscount);
      }
    }

    const shipping = 0; // FREE shipping
    const total = Math.max(subtotal - discount - pointsDiscount + shipping, 0);
    const pointsEarned = Math.floor(total / 100);

    const rzpOrder = await createRazorpayOrder(total, 'INR', `order_${userId}_${Date.now()}`);

    res.json({
      success: true,
      data: {
        razorpayOrderId: rzpOrder.id,
        amount:   rzpOrder.amount,
        currency: rzpOrder.currency,
        keyId:    process.env.RAZORPAY_KEY_ID,
        subtotal,
        discount,
        pointsDiscount,
        shipping,
        total,
        couponId,
      },
    });
  } catch (err) { next(err); }
}

export async function verifyPayment(req, res, next) {
  try {
    const {
      razorpayOrderId, razorpayPaymentId, razorpaySignature,
      addressId, couponId, subtotal, discount, pointsDiscount, shipping, total,
    } = req.body;
    const userId = req.user.id;

    if (!verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const cartItems = await getCartByUser(userId);
    const items = cartItems.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      quantity:  i.quantity,
      unitPrice: Number(i.unitPrice),
    }));

    const pointsEarned = Math.floor(Number(total) / 100);

    const order = await fulfillOrder({
      userId,
      addressId: Number(addressId),
      couponId:  couponId ? Number(couponId) : null,
      subtotal:  Number(subtotal),
      discount:  Number(discount) + Number(pointsDiscount || 0),
      shipping:  Number(shipping || 0),
      total:     Number(total),
      pointsEarned,
      paymentMethod:   'razorpay',
      razorpayOrderId,
      items,
    });

    // Deduct redeemed points if any
    if (Number(pointsDiscount) > 0) {
      await pool.query(
        'UPDATE users SET first_citizen_points = GREATEST(first_citizen_points - $1, 0) WHERE id = $2',
        [Number(pointsDiscount), userId]
      );
    }

    res.json({ success: true, data: { orderId: order.id }, message: 'Payment verified, order placed' });
  } catch (err) { next(err); }
}

export async function fetchOrder(req, res, next) {
  try {
    const order = await getOrderById(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const items = await getOrderItems(order.id);
    res.json({ success: true, data: { order, items } });
  } catch (err) { next(err); }
}

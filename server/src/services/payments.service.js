import Razorpay from 'razorpay';
import crypto from 'crypto';

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID) throw new Error('RAZORPAY_KEY_ID is not configured');
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export async function createRazorpayOrder(amount, currency = 'INR', receipt) {
  const order = await getRazorpay().orders.create({
    amount:   Math.round(amount * 100),
    currency,
    receipt:  receipt || `rcpt_${Date.now()}`,
  });
  return { id: order.id, amount: order.amount, currency: order.currency };
}

export function verifySignature(orderId, paymentId, signature) {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expected === signature;
}

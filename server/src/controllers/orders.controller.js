import { getOrdersByUser, getOrderById, getOrderItems, cancelOrder } from '../db/queries/orders.js';
import { createNotification } from '../db/queries/notifications.js';

export async function listOrders(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await getOrdersByUser(req.user.id, { page, limit });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function fetchOrder(req, res, next) {
  try {
    const order = await getOrderById(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const items = await getOrderItems(req.params.id);
    res.json({ success: true, data: { ...order, items } });
  } catch (err) { next(err); }
}

export async function cancel(req, res, next) {
  try {
    const order = await cancelOrder(req.params.id, req.user.id);
    if (!order) {
      return res.status(400).json({ success: false, message: 'Order not found or cannot be cancelled' });
    }
    await createNotification(req.user.id, `Your order #ORD-${order.id} has been cancelled.`);
    res.json({ success: true, data: order, message: 'Order cancelled' });
  } catch (err) { next(err); }
}

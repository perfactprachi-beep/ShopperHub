import { getNotifications, getUnreadCount, markAllRead } from '../db/queries/notifications.js';

export async function listNotifications(req, res, next) {
  try {
    const [notifications, unread] = await Promise.all([
      getNotifications(req.user.id),
      getUnreadCount(req.user.id),
    ]);
    res.json({ success: true, data: { notifications, unread } });
  } catch (err) { next(err); }
}

export async function markRead(req, res, next) {
  try {
    await markAllRead(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
}

import { pool } from '../pool.js';

export async function createNotification(userId, message) {
  const { rows } = await pool.query(
    `INSERT INTO notifications (user_id, message) VALUES ($1, $2) RETURNING *`,
    [userId, message]
  );
  return rows[0];
}

export async function getNotifications(userId) {
  const { rows } = await pool.query(
    `SELECT id, message, is_read, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 20`,
    [userId]
  );
  return rows;
}

export async function getUnreadCount(userId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
    [userId]
  );
  return parseInt(rows[0].count, 10);
}

export async function markAllRead(userId) {
  await pool.query(
    'UPDATE notifications SET is_read = true WHERE user_id = $1',
    [userId]
  );
}

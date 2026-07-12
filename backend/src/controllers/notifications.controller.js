/**
 * Notifications Controller
 *
 * Backed by Supabase Postgres via the unified pool (config/db.js).
 * Uses $1/$2/... parameterized query syntax (pg driver).
 *
 * Table: notifications
 * Columns: notification_id (PK), user_id (FK), message, is_read, created_at
 *
 * All operations are scoped to the authenticated user (req.user.user_id).
 * Admin can manage all notifications.
 *
 * Response envelope: { status, message, data } — via sendSuccess / sendFailure.
 */
const pool = require('../config/db');
const { sendSuccess, sendFailure } = require('../utils/response');

// ─── CREATE ────────────────────────────────────────────────────────────────────
const createNotification = async (req, res, next) => {
  try {
    const { message, user_id: targetUserId } = req.body;
    const isAdmin = req.user?.role === 'admin';

    // Only admins can create notifications for other users;
    // regular users can only create notifications for themselves.
    const recipientId = isAdmin && targetUserId ? targetUserId : req.user.user_id;

    if (!message) {
      return sendFailure(res, { statusCode: 400, message: 'Message is required.' });
    }

    const result = await pool.query(
      `INSERT INTO notifications (user_id, message, is_read)
       VALUES ($1, $2, false)
       RETURNING *`,
      [recipientId, message],
    );

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Notification created successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    return next(error);
  }
};

// ─── GET ALL (user-scoped) ─────────────────────────────────────────────────────
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );

    return sendSuccess(res, {
      message: 'Notifications retrieved successfully.',
      data: result.rows,
    });
  } catch (error) {
    return next(error);
  }
};

// ─── MARK ONE AS READ ─────────────────────────────────────────────────────────
const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const result = await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE notification_id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId],
    );

    if (result.rowCount === 0) {
      return sendFailure(res, { statusCode: 404, message: 'Notification not found.' });
    }

    return sendSuccess(res, {
      message: 'Notification marked as read.',
      data: result.rows[0],
    });
  } catch (error) {
    return next(error);
  }
};

// ─── MARK ALL AS READ ─────────────────────────────────────────────────────────
const markAllNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    await pool.query(
      `UPDATE notifications SET is_read = true WHERE user_id = $1`,
      [userId],
    );

    return sendSuccess(res, {
      message: 'All notifications marked as read.',
      data: null,
    });
  } catch (error) {
    return next(error);
  }
};

// ─── DELETE ────────────────────────────────────────────────────────────────────
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const isAdmin = req.user?.role === 'admin';

    const whereClause = isAdmin
      ? 'WHERE notification_id = $1'
      : 'WHERE notification_id = $1 AND user_id = $2';
    const params = isAdmin ? [id] : [id, userId];

    const result = await pool.query(
      `DELETE FROM notifications ${whereClause}`,
      params,
    );

    if (result.rowCount === 0) {
      return sendFailure(res, { statusCode: 404, message: 'Notification not found.' });
    }

    return sendSuccess(res, {
      message: 'Notification deleted successfully.',
      data: null,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
};

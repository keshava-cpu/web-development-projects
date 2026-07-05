const pool = require('../config/db');
const { sendSuccess } = require('../utils/response');

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const [rows] = await pool.query(
      `SELECT id, user_id, message, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    return sendSuccess(res, {
      message: 'Notifications retrieved successfully.',
      data: rows,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getNotifications,
};

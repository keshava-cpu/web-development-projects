const pool = require('../config/db');
const { sendSuccess, sendFailure } = require('../utils/response');

const createConsultancy = async (req, res, next) => {
  try {
    const { industry, amount, duration } = req.body;
    const userId = req.user.user_id;

    if (!industry) {
      return sendFailure(res, { statusCode: 400, message: 'Industry is required.' });
    }

    const [result] = await pool.query(
      'INSERT INTO consultancy (user_id, industry, amount, duration) VALUES (?, ?, ?, ?)',
      [userId, industry, amount || 0, duration || null]
    );

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Consultancy record created successfully.',
      data: { id: result.insertId, industry, amount, duration },
    });
  } catch (error) {
    return next(error);
  }
};

const getConsultancy = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, user_id, industry, amount, duration, created_at, updated_at
       FROM consultancy
       ORDER BY created_at DESC`
    );

    return sendSuccess(res, {
      message: 'Consultancy records retrieved successfully.',
      data: rows,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createConsultancy,
  getConsultancy,
};

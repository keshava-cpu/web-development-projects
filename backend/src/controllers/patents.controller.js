const pool = require('../config/db');
const { sendSuccess, sendFailure } = require('../utils/response');

const createPatent = async (req, res, next) => {
  try {
    const { title, status, number, document } = req.body;
    const userId = req.user.user_id;

    if (!title || !status) {
      return sendFailure(res, {
        statusCode: 400,
        message: 'Title and status are required.',
      });
    }

    const [result] = await pool.query(
      'INSERT INTO patents (user_id, title, status, number, document) VALUES (?, ?, ?, ?, ?)',
      [userId, title, status, number || null, document || null]
    );

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Patent created successfully.',
      data: { patent_id: result.insertId, title, status, number, document },
    });
  } catch (error) {
    return next(error);
  }
};

const getPatents = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT patent_id, user_id, title, status, number, document, created_at, updated_at
       FROM patents
       ORDER BY created_at DESC`
    );

    return sendSuccess(res, {
      message: 'Patents retrieved successfully.',
      data: rows,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createPatent,
  getPatents,
};

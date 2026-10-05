const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const jwtConfig = require('../config/jwt');
const { sendSuccess, sendFailure } = require('../utils/response');

/**
 * POST /api/register
 * Currently disabled.
 */
const register = async (req, res, next) => {
  return sendFailure(res, {
    statusCode: 400,
    message: 'Password registration is disabled. Please contact an administrator.',
  });
};

/**
 * POST /api/login
 * Standard email/password login route.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendFailure(res, {
        statusCode: 400,
        message: 'Email and password are required',
      });
    }

    const result = await pool.query(
      `SELECT u.user_id, u.name, u.email, u.role, c.password_hash
       FROM users u
       JOIN credentials c ON u.user_id = c.user_id
       WHERE u.email = $1`,
      [email],
    );

    // Dummy hash comparison to prevent timing side-channels
    const dummyHash = '$2a$10$abcdefghijklmnopqrstuv'; // Valid bcrypt prefix length

    if (result.rows.length === 0) {
      // Simulate bcrypt comparison time
      await bcrypt.compare(password, dummyHash);
      return sendFailure(res, {
        statusCode: 401,
        message: 'Incorrect email or password',
      });
    }

    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return sendFailure(res, {
        statusCode: 401,
        message: 'Incorrect email or password',
      });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'change_me_to_a_secure_random_string',
      { expiresIn: '7d' },
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Login successful',
      data: {
        user: { user_id: user.user_id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
};

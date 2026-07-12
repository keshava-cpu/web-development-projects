const jwt = require('jsonwebtoken');
const { sendFailure } = require('../utils/response');

/**
 * Accepts either:
 *   - Authorization: Bearer <token>  (used by the axios apiClient)
 *   - auth_token cookie              (set by the login endpoint)
 *
 * Checking the Bearer header first makes this compatible with both flows
 * without requiring any frontend changes.
 */
const cookieAuth = (req, res, next) => {
  // 1. Try the Authorization header (Bearer token sent by apiClient)
  const authHeader = req.headers.authorization || '';
  let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  // 2. Fall back to the HTTP-only cookie
  if (!token) {
    token = req.cookies?.auth_token || null;
  }

  if (!token) {
    return sendFailure(res, {
      statusCode: 401,
      message: 'Authentication required. Please log in.',
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'default-secret';
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch (error) {
    return sendFailure(res, {
      statusCode: 401,
      message: 'Invalid or expired session. Please log in again.',
    });
  }
};

module.exports = cookieAuth;

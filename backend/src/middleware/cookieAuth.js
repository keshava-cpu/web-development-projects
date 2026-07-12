const jwt = require('jsonwebtoken');
const { sendFailure } = require('../utils/response');

const cookieAuth = (req, res, next) => {
  const token = req.cookies.auth_token;

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

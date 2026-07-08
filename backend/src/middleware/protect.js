const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { sendFailure } = require('../utils/response');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendFailure(res, {
      statusCode: 401,
      message: 'Authentication required. Provide a valid Bearer token.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    return next();
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError'
        ? 'Token has expired. Please log in again.'
        : 'Invalid or malformed token.';

    return sendFailure(res, {
      statusCode: 401,
      message,
    });
  }
};

module.exports = protect;

require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'change_me_to_a_secure_random_string',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
};

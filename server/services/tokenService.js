const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generate a signed JWT with user id, campus id, and role
 */
const generateAuthToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      campusId: user.campus ? user.campus._id ? user.campus._id.toString() : user.campus.toString() : null,
      role: user.role,
    },
    process.env.JWT_SECRET || 'dev_jwt_secret',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

/**
 * Generate a random 32-byte hex token and its sha256 hash for secure storage in DB
 */
const generateRandomToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, hashedToken };
};

/**
 * Hash a plain token string (e.g. from url query parameter) using sha256 to compare with DB
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  generateAuthToken,
  generateRandomToken,
  hashToken,
};

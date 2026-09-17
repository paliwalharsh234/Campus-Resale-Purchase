const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

/**
 * Verifies the JWT and attaches req.user.
 * Token is read from Authorization header (Bearer token) or httpOnly cookie.
 */
const authenticate = asyncHandler(async (req, _res, next) => {
  let token;

  // 1. Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Fallback to cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(ApiError.unauthorized('No authentication token provided.'));
  }

  // Verify signature & expiry
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Fetch fresh user (ensures account still exists and isn't suspended)
  const user = await User.findById(decoded.userId).select('-password').lean();

  if (!user) {
    return next(ApiError.unauthorized('User account not found.'));
  }
  if (!user.isEmailVerified) {
    return next(ApiError.forbidden('Please verify your email address first.'));
  }
  if (user.isSuspended) {
    return next(ApiError.forbidden('Your account has been suspended. Contact support.'));
  }

  // Attach user context for downstream middleware and controllers
  req.user = {
    userId:   user._id.toString(),
    campusId: user.campus.toString(),
    role:     user.role,
    name:     user.name,
    email:    user.email,
  };

  next();
});

module.exports = authenticate;

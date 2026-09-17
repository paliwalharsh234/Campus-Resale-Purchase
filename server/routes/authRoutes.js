const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  validate,
  registerValidationRules,
  loginValidationRules,
} = require('../middleware/validator');
const {
  register,
  verifyEmail,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  getActiveCampuses,
} = require('../controllers/authController');

// Public routes
router.get('/campuses', getActiveCampuses);
router.post('/register', authLimiter, registerValidationRules(), validate, register);
router.get('/verify-email/:token', verifyEmail);
router.post('/verify-email', verifyEmail);
router.post('/login', authLimiter, loginValidationRules(), validate, login);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);

// Protected routes
router.get('/me', authenticate, getMe);

module.exports = router;

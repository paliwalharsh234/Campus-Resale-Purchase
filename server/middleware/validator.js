const { body, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Middleware that checks validation results and returns 400 with formatted errors
 */
const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = errors.array().map((err) => `${err.path}: ${err.msg}`);
  return next(ApiError.badRequest(extractedErrors[0], extractedErrors));
};

// Validation rules for registration
const registerValidationRules = () => [
  body('name').trim().notEmpty().withMessage('Full name is required').isLength({ max: 50 }),
  body('email').trim().isEmail().withMessage('Please provide a valid college email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// Validation rules for login
const loginValidationRules = () => [
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Validation rules for creating listings
const listingValidationRules = () => [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 2000 }),
  body('price').isNumeric().withMessage('Price must be a number').custom((val) => val >= 0).withMessage('Price cannot be negative'),
  body('category').notEmpty().withMessage('Category is required'),
  body('condition').isIn(['New', 'Like New', 'Good', 'Fair', 'Used']).withMessage('Invalid condition'),
  body('meetingPoint').trim().notEmpty().withMessage('Meeting point is required').isLength({ max: 100 }),
];

module.exports = {
  validate,
  registerValidationRules,
  loginValidationRules,
  listingValidationRules,
};

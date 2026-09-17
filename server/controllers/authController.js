const Campus = require('../models/Campus');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateAuthToken, generateRandomToken, hashToken } = require('../services/tokenService');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

/**
 * Cookie options helper for JWT
 */
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
};

/**
 * Helper to extract email domain: e.g. "student@mit.edu" -> "mit.edu"
 */
const extractDomain = (email) => {
  const parts = email.split('@');
  return parts.length === 2 ? parts[1].toLowerCase().trim() : '';
};

// @desc    Register a new student user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, campusId, phone, course, branch, graduationYear } = req.body;

  if (!name || !email || !password) {
    return next(ApiError.badRequest('Name, email, and password are required.'));
  }

  const normalizedEmail = email.toLowerCase().trim();
  const domain = extractDomain(normalizedEmail);

  if (!domain) {
    return next(ApiError.badRequest('Invalid email address format.'));
  }

  // 1. Verify Campus match: if campusId is provided, check domain matches.
  // Otherwise check if the domain corresponds to any active campus in system.
  let campus;
  if (campusId) {
    campus = await Campus.findById(campusId);
    if (!campus || !campus.isActive) {
      return next(ApiError.badRequest('Selected campus is invalid or currently inactive.'));
    }
    if (domain !== campus.emailDomain.toLowerCase()) {
      return next(
        ApiError.badRequest(
          `Your email domain (@${domain}) does not match the selected campus domain (@${campus.emailDomain}).`
        )
      );
    }
  } else {
    // Find campus by domain automatically
    campus = await Campus.findOne({ emailDomain: domain, isActive: true });
    if (!campus) {
      return next(
        ApiError.badRequest(
          `No active campus registered with the email domain @${domain}. Please contact your administrator.`
        )
      );
    }
  }

  // 2. Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return next(ApiError.conflict('An account with this campus email already exists.'));
  }

  // 3. Generate verification token
  const { rawToken, hashedToken } = generateRandomToken();
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // 4. Create user
  const newUser = await User.create({
    name,
    email: normalizedEmail,
    password,
    campus: campus._id,
    phone: phone || '',
    course: course || '',
    branch: branch || '',
    graduationYear: graduationYear ? Number(graduationYear) : null,
    isEmailVerified: false,
    verificationToken: hashedToken,
    verificationTokenExpires: verificationExpires,
  });

  // 5. Send verification email (fails gracefully in development)
  await sendVerificationEmail(normalizedEmail, name, rawToken);

  res.status(201).json({
    success: true,
    message: 'Registration successful! Please check your campus email for the verification link.',
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      campus: {
        id: campus._id,
        name: campus.campusName,
      },
    },
    // Include in dev mode so developer can test verification immediately without real SMTP
    ...(process.env.NODE_ENV === 'development' && { devVerificationToken: rawToken }),
  });
});

// @desc    Verify email address via token
// @route   POST /api/auth/verify-email or GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res, next) => {
  const token = req.params.token || req.body.token;

  if (!token) {
    return next(ApiError.badRequest('Verification token is missing.'));
  }

  const hashedToken = hashToken(token);

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: Date.now() },
  }).select('+verificationToken +verificationTokenExpires');

  if (!user) {
    return next(ApiError.badRequest('Verification link is invalid or has expired.'));
  }

  user.isEmailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Campus email successfully verified! You can now log in.',
  });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(ApiError.badRequest('Email and password are required.'));
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Explicitly select password
  const user = await User.findOne({ email: normalizedEmail })
    .select('+password')
    .populate('campus', 'campusName emailDomain city state logo isActive');

  if (!user) {
    return next(ApiError.unauthorized('Invalid email or password.'));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(ApiError.unauthorized('Invalid email or password.'));
  }

  if (!user.isEmailVerified) {
    return next(
      ApiError.forbidden('Please verify your campus email address before logging in.')
    );
  }

  if (user.isSuspended) {
    return next(
      ApiError.forbidden('Your account has been suspended. Please contact your campus admin.')
    );
  }

  if (user.campus && !user.campus.isActive) {
    return next(
      ApiError.forbidden('Your campus is currently inactive on the platform.')
    );
  }

  // Generate JWT
  const token = generateAuthToken(user);

  // Set httpOnly cookie
  res.cookie('token', token, getCookieOptions());

  res.status(200).json({
    success: true,
    message: 'Logged in successfully.',
    token, // Also provided in JSON for localStorage/testing convenience
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      campus: user.campus,
      course: user.course,
      branch: user.branch,
      graduationYear: user.graduationYear,
      profileImage: user.profileImage,
      phone: user.phone,
    },
  });
});

// @desc    Get current authenticated user info
// @route   GET /api/auth/me
// @access  Protected
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.userId).populate('campus', 'campusName emailDomain city state logo');

  if (!user) {
    return next(ApiError.notFound('User not found.'));
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      campus: user.campus,
      course: user.course,
      branch: user.branch,
      graduationYear: user.graduationYear,
      profileImage: user.profileImage,
      phone: user.phone,
      createdAt: user.createdAt,
    },
  });
});

// @desc    Log user out / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('token', getCookieOptions());
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});

// @desc    Send password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(ApiError.badRequest('Please provide your campus email.'));
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    // Send generic message to prevent email enumeration
    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  }

  const { rawToken, hashedToken } = generateRandomToken();
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  await sendPasswordResetEmail(user.email, user.name, rawToken);

  res.status(200).json({
    success: true,
    message: 'If an account exists with this email, a password reset link has been sent.',
    ...(process.env.NODE_ENV === 'development' && { devResetToken: rawToken }),
  });
});

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return next(ApiError.badRequest('Password must be at least 6 characters long.'));
  }

  const hashedToken = hashToken(token);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    return next(ApiError.badRequest('Password reset token is invalid or has expired.'));
  }

  // Pre-save hook will hash this password automatically
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password has been successfully updated. You can now log in with your new password.',
  });
});

// @desc    List all active campuses for registration dropdown
// @route   GET /api/auth/campuses
// @access  Public
const getActiveCampuses = asyncHandler(async (_req, res) => {
  const campuses = await Campus.find({ isActive: true }).select('campusName emailDomain city state logo');
  res.status(200).json({
    success: true,
    campuses,
  });
});

module.exports = {
  register,
  verifyEmail,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  getActiveCampuses,
};

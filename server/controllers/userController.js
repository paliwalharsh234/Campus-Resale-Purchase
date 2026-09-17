const User = require('../models/User');
const Listing = require('../models/Listing');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user public profile and active listings
// @route   GET /api/users/:id
// @access  Protected
const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate('campus', 'campusName city')
    .select('name course branch graduationYear profileImage createdAt campus')
    .lean();

  if (!user) {
    return next(ApiError.notFound('User profile not found.'));
  }

  // Active listings published by this user on the same campus
  const listings = await Listing.find({
    seller: user._id,
    campus: req.user.campusId, // campus isolation
    status: 'Available',
  })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    user,
    listings,
  });
});

// @desc    Update own user profile
// @route   PUT /api/users/profile
// @access  Protected
const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, course, branch, graduationYear, profileImage } = req.body;

  const user = await User.findById(req.user.userId);
  if (!user) {
    return next(ApiError.notFound('User not found.'));
  }

  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (course !== undefined) user.course = course.trim();
  if (branch !== undefined) user.branch = branch.trim();
  if (graduationYear !== undefined) {
    user.graduationYear = graduationYear ? Number(graduationYear) : null;
  }
  if (profileImage !== undefined) user.profileImage = profileImage;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
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

module.exports = {
  getUserProfile,
  updateProfile,
};

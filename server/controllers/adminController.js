const User = require('../models/User');
const Campus = require('../models/Campus');
const Listing = require('../models/Listing');
const Report = require('../models/Report');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { deleteFromCloudinary } = require('../services/cloudinaryService');

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────
// @desc    Get aggregate platform statistics
// @route   GET /api/admin/stats
// @access  Admin only
const getAdminStats = asyncHandler(async (_req, res) => {
  const [
    totalUsers,
    totalCampuses,
    activeListings,
    soldListings,
    freeListings,
    pendingReports,
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Campus.countDocuments({}),
    Listing.countDocuments({ status: 'Available' }),
    Listing.countDocuments({ status: 'Sold' }),
    Listing.countDocuments({ price: 0 }),
    Report.countDocuments({ status: 'Pending' }),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalCampuses,
      activeListings,
      soldListings,
      freeListings,
      pendingReports,
    },
  });
});

// ─── USER MANAGEMENT ────────────────────────────────────────────────────────
// @desc    Get all users across campuses with search & filter
// @route   GET /api/admin/users
// @access  Admin only
const getAllUsers = asyncHandler(async (req, res) => {
  const { q, campusId, role, isSuspended, page = 1, limit = 20 } = req.query;

  const query = {};
  if (campusId) query.campus = campusId;
  if (role) query.role = role;
  if (isSuspended !== undefined) query.isSuspended = isSuspended === 'true';

  if (q && q.trim()) {
    query.$or = [
      { name: { $regex: q.trim(), $options: 'i' } },
      { email: { $regex: q.trim(), $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('campus', 'campusName emailDomain city')
      .lean(),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    users,
  });
});

// @desc    Toggle user suspension status
// @route   PATCH /api/admin/users/:id/suspend
// @access  Admin only
const toggleUserSuspension = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(ApiError.notFound('User not found.'));
  }

  // Prevent self-suspension
  if (user._id.toString() === req.user.userId) {
    return next(ApiError.badRequest('You cannot suspend your own admin account.'));
  }

  user.isSuspended = !user.isSuspended;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User account has been ${user.isSuspended ? 'suspended' : 're-activated'}.`,
    isSuspended: user.isSuspended,
  });
});

// ─── LISTINGS MODERATION ───────────────────────────────────────────────────
// @desc    Get all listings across all campuses
// @route   GET /api/admin/listings
// @access  Admin only
const getAllListings = asyncHandler(async (req, res) => {
  const { q, campusId, category, status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (campusId) query.campus = campusId;
  if (category) query.category = category;
  if (status) query.status = status;

  if (q && q.trim()) {
    query.$or = [
      { title: { $regex: q.trim(), $options: 'i' } },
      { description: { $regex: q.trim(), $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [listings, total] = await Promise.all([
    Listing.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('seller', 'name email')
      .populate('campus', 'campusName')
      .lean(),
    Listing.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: listings.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    listings,
  });
});

// @desc    Admin removal of inappropriate listing
// @route   DELETE /api/admin/listings/:id
// @access  Admin only
const adminDeleteListing = asyncHandler(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(ApiError.notFound('Listing not found.'));
  }

  if (listing.images && listing.images.length > 0) {
    for (const img of listing.images) {
      if (img.publicId) await deleteFromCloudinary(img.publicId);
    }
  }

  await listing.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Listing permanently removed by administrator.',
  });
});

// ─── REPORTS REVIEW ─────────────────────────────────────────────────────────
// @desc    Get all filed reports
// @route   GET /api/admin/reports
// @access  Admin only
const getReports = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = {};
  if (status) query.status = status;

  const reports = await Report.find(query)
    .sort({ createdAt: -1 })
    .populate('reporter', 'name email')
    .populate('reportedUser', 'name email isSuspended')
    .populate('listing', 'title price images status campus')
    .lean();

  res.status(200).json({
    success: true,
    count: reports.length,
    reports,
  });
});

// @desc    Update report status (Reviewed / Resolved / Dismissed)
// @route   PATCH /api/admin/reports/:id/status
// @access  Admin only
const updateReportStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!['Pending', 'Reviewed', 'Resolved', 'Dismissed'].includes(status)) {
    return next(ApiError.badRequest('Invalid report status.'));
  }

  const report = await Report.findById(req.params.id);
  if (!report) {
    return next(ApiError.notFound('Report not found.'));
  }

  report.status = status;
  await report.save();

  res.status(200).json({
    success: true,
    message: `Report marked as ${status}.`,
    report,
  });
});

// ─── CAMPUS MANAGEMENT ─────────────────────────────────────────────────────
// @desc    Get all campuses
// @route   GET /api/admin/campuses
// @access  Admin only
const getCampuses = asyncHandler(async (_req, res) => {
  const campuses = await Campus.find({}).sort({ campusName: 1 }).lean();
  res.status(200).json({
    success: true,
    count: campuses.length,
    campuses,
  });
});

// @desc    Add a new campus
// @route   POST /api/admin/campuses
// @access  Admin only
const addCampus = asyncHandler(async (req, res, next) => {
  const { campusName, emailDomain, city, state, logo } = req.body;

  if (!campusName || !emailDomain) {
    return next(ApiError.badRequest('Campus name and email domain are required.'));
  }

  const normalizedDomain = emailDomain.toLowerCase().trim().replace(/^@/, '');

  const existing = await Campus.findOne({ emailDomain: normalizedDomain });
  if (existing) {
    return next(ApiError.conflict(`Campus with domain @${normalizedDomain} already exists.`));
  }

  const newCampus = await Campus.create({
    campusName: campusName.trim(),
    emailDomain: normalizedDomain,
    city: city ? city.trim() : '',
    state: state ? state.trim() : '',
    logo: logo || null,
    isActive: true,
  });

  res.status(201).json({
    success: true,
    message: `Campus ${newCampus.campusName} created successfully.`,
    campus: newCampus,
  });
});

// @desc    Update an existing campus
// @route   PUT /api/admin/campuses/:id
// @access  Admin only
const updateCampus = asyncHandler(async (req, res, next) => {
  const { campusName, emailDomain, city, state, logo } = req.body;

  const campus = await Campus.findById(req.params.id);
  if (!campus) {
    return next(ApiError.notFound('Campus not found.'));
  }

  if (campusName) campus.campusName = campusName.trim();
  if (emailDomain) {
    const normalizedDomain = emailDomain.toLowerCase().trim().replace(/^@/, '');
    const duplicate = await Campus.findOne({
      emailDomain: normalizedDomain,
      _id: { $ne: campus._id },
    });
    if (duplicate) {
      return next(ApiError.conflict(`Email domain @${normalizedDomain} already registered to another campus.`));
    }
    campus.emailDomain = normalizedDomain;
  }
  if (city !== undefined) campus.city = city.trim();
  if (state !== undefined) campus.state = state.trim();
  if (logo !== undefined) campus.logo = logo;

  await campus.save();

  res.status(200).json({
    success: true,
    message: 'Campus updated successfully.',
    campus,
  });
});

// @desc    Toggle campus active status
// @route   PATCH /api/admin/campuses/:id/toggle
// @access  Admin only
const toggleCampusStatus = asyncHandler(async (req, res, next) => {
  const campus = await Campus.findById(req.params.id);
  if (!campus) {
    return next(ApiError.notFound('Campus not found.'));
  }

  campus.isActive = !campus.isActive;
  await campus.save();

  res.status(200).json({
    success: true,
    message: `Campus status changed to ${campus.isActive ? 'Active' : 'Inactive'}.`,
    isActive: campus.isActive,
  });
});

module.exports = {
  getAdminStats,
  getAllUsers,
  toggleUserSuspension,
  getAllListings,
  adminDeleteListing,
  getReports,
  updateReportStatus,
  getCampuses,
  addCampus,
  updateCampus,
  toggleCampusStatus,
};

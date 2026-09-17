const Report = require('../models/Report');
const Listing = require('../models/Listing');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    File a new report (against a listing or user)
// @route   POST /api/reports
// @access  Protected
const createReport = asyncHandler(async (req, res, next) => {
  const { listingId, reportedUserId, reason, description } = req.body;

  if (!reason || !description) {
    return next(ApiError.badRequest('Reason and description are required.'));
  }

  let listing = null;
  let reportedUser = reportedUserId || null;

  if (listingId) {
    listing = await Listing.findById(listingId);
    if (!listing) {
      return next(ApiError.notFound('Listing not found.'));
    }
    if (!reportedUser) {
      reportedUser = listing.seller;
    }
  }

  const report = await Report.create({
    reporter: req.user.userId,
    reportedUser,
    listing: listingId || null,
    reason,
    description: description.trim(),
    status: 'Pending',
  });

  res.status(201).json({
    success: true,
    message: 'Report submitted successfully. Administrators will review it shortly.',
    report,
  });
});

module.exports = {
  createReport,
};

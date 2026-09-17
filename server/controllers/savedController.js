const SavedItem = require('../models/SavedItem');
const Listing = require('../models/Listing');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all saved listings for current user
// @route   GET /api/saved
// @access  Protected
const getSavedItems = asyncHandler(async (req, res) => {
  const savedItems = await SavedItem.find({ user: req.user.userId })
    .sort({ createdAt: -1 })
    .populate({
      path: 'listing',
      populate: [
        { path: 'seller', select: 'name course branch graduationYear profileImage' },
        { path: 'campus', select: 'campusName' },
      ],
    })
    .lean();

  // Filter out any items where the listing was deleted
  const validListings = savedItems
    .filter((item) => item.listing != null)
    .map((item) => item.listing);

  res.status(200).json({
    success: true,
    count: validListings.length,
    savedItems: validListings,
  });
});

// @desc    Check if a listing is saved by current user
// @route   GET /api/saved/check/:listingId
// @access  Protected
const checkIfSaved = asyncHandler(async (req, res) => {
  const existing = await SavedItem.findOne({
    user: req.user.userId,
    listing: req.params.listingId,
  });

  res.status(200).json({
    success: true,
    isSaved: !!existing,
  });
});

// @desc    Save a listing
// @route   POST /api/saved/:listingId
// @access  Protected
const saveItem = asyncHandler(async (req, res, next) => {
  const listing = await Listing.findById(req.params.listingId);

  if (!listing) {
    return next(ApiError.notFound('Listing not found.'));
  }

  // Prevent saving across different campus
  if (listing.campus.toString() !== req.user.campusId && req.user.role !== 'admin') {
    return next(ApiError.forbidden('Cannot save listings from another campus.'));
  }

  // Check duplicate
  const existing = await SavedItem.findOne({
    user: req.user.userId,
    listing: listing._id,
  });

  if (existing) {
    return res.status(200).json({
      success: true,
      message: 'Item already saved in your wishlist.',
      isSaved: true,
    });
  }

  await SavedItem.create({
    user: req.user.userId,
    listing: listing._id,
  });

  res.status(201).json({
    success: true,
    message: 'Item saved to wishlist.',
    isSaved: true,
  });
});

// @desc    Remove a listing from saved items
// @route   DELETE /api/saved/:listingId
// @access  Protected
const unsaveItem = asyncHandler(async (req, res) => {
  await SavedItem.findOneAndDelete({
    user: req.user.userId,
    listing: req.params.listingId,
  });

  res.status(200).json({
    success: true,
    message: 'Item removed from saved wishlist.',
    isSaved: false,
  });
});

module.exports = {
  getSavedItems,
  checkIfSaved,
  saveItem,
  unsaveItem,
};

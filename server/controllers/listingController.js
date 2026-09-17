const Listing = require('../models/Listing');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { uploadMultipleImages, deleteFromCloudinary } = require('../services/cloudinaryService');

// @desc    Get all listings for the user's campus with search, filter, and sorting
// @route   GET /api/listings
// @access  Protected
const getListings = asyncHandler(async (req, res) => {
  const {
    q,             // Text search query
    category,      // Category filter
    condition,     // Condition filter ('New', 'Like New', etc.)
    minPrice,      // Minimum price
    maxPrice,      // Maximum price
    freeOnly,      // 'true' | 'false'
    status,        // Default 'Available'
    sort,          // 'newest' | 'price_asc' | 'price_desc'
    page = 1,
    limit = 12,
  } = req.query;

  // 1. CORE RULE: Strict campus isolation — user only sees listings from their own campus
  const query = {
    campus: req.user.campusId,
  };

  // 2. Status filter (by default, only show Available items in the general marketplace)
  if (status) {
    query.status = status;
  } else {
    query.status = 'Available';
  }

  // 3. Text search (Title or Description)
  if (q && q.trim()) {
    query.$or = [
      { title: { $regex: q.trim(), $options: 'i' } },
      { description: { $regex: q.trim(), $options: 'i' } },
    ];
  }

  // 4. Category filter
  if (category && category !== 'All') {
    query.category = category;
  }

  // 5. Condition filter
  if (condition && condition !== 'All') {
    query.condition = condition;
  }

  // 6. Free items only filter
  if (freeOnly === 'true' || freeOnly === true) {
    query.price = 0;
  } else {
    // Price range filters
    if (minPrice !== undefined && minPrice !== '' && !isNaN(Number(minPrice))) {
      query.price = { ...query.price, $gte: Number(minPrice) };
    }
    if (maxPrice !== undefined && maxPrice !== '' && !isNaN(Number(maxPrice))) {
      query.price = { ...query.price, $lte: Number(maxPrice) };
    }
  }

  // 7. Sorting options
  let sortOption = { createdAt: -1 }; // Default: Newest first
  if (sort === 'price_asc') {
    sortOption = { price: 1, createdAt: -1 };
  } else if (sort === 'price_desc') {
    sortOption = { price: -1, createdAt: -1 };
  } else if (sort === 'oldest') {
    sortOption = { createdAt: 1 };
  }

  // 8. Pagination calculation
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 12;
  const skip = (pageNum - 1) * limitNum;

  const [listings, total] = await Promise.all([
    Listing.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate('seller', 'name course branch graduationYear profileImage')
      .populate('campus', 'campusName city')
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

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Protected (Student)
const createListing = asyncHandler(async (req, res, next) => {
  const { title, description, price, category, condition, meetingPoint } = req.body;

  if (!title || !description || price === undefined || !category || !condition || !meetingPoint) {
    return next(ApiError.badRequest('Please fill in all required listing fields.'));
  }

  const numericPrice = Number(price);
  if (isNaN(numericPrice) || numericPrice < 0) {
    return next(ApiError.badRequest('Price must be 0 (Free) or a positive number.'));
  }

  let uploadedImages = [];
  if (req.files && req.files.length > 0) {
    uploadedImages = await uploadMultipleImages(req.files);
  }

  const newListing = await Listing.create({
    title,
    description,
    price: numericPrice,
    category,
    condition,
    meetingPoint,
    images: uploadedImages,
    seller: req.user.userId,
    campus: req.user.campusId, // Strictly assigned from verified JWT token
    status: 'Available',
  });

  const populatedListing = await Listing.findById(newListing._id)
    .populate('seller', 'name email course branch graduationYear profileImage phone')
    .populate('campus', 'campusName city state');

  res.status(201).json({
    success: true,
    message: 'Listing published successfully!',
    listing: populatedListing,
  });
});

// @desc    Get single listing details by ID (enforcing campus isolation)
// @route   GET /api/listings/:id
// @access  Protected
const getListingById = asyncHandler(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id)
    .populate('seller', 'name email course branch graduationYear profileImage phone')
    .populate('campus', 'campusName city state');

  if (!listing) {
    return next(ApiError.notFound('Listing not found or has been removed.'));
  }

  // Enforce campus isolation: student cannot access another campus's listing
  if (listing.campus._id.toString() !== req.user.campusId && req.user.role !== 'admin') {
    return next(ApiError.forbidden('This listing belongs to another campus.'));
  }

  res.status(200).json({
    success: true,
    listing,
  });
});

// @desc    Update an existing listing
// @route   PUT /api/listings/:id
// @access  Protected (Owner only)
const updateListing = asyncHandler(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(ApiError.notFound('Listing not found.'));
  }

  if (listing.seller.toString() !== req.user.userId && req.user.role !== 'admin') {
    return next(ApiError.forbidden('You are not authorized to update this listing.'));
  }

  const { title, description, price, category, condition, meetingPoint, status, keepExistingImages } = req.body;

  if (title) listing.title = title;
  if (description) listing.description = description;
  if (category) listing.category = category;
  if (condition) listing.condition = condition;
  if (meetingPoint) listing.meetingPoint = meetingPoint;
  if (status && ['Available', 'Reserved', 'Sold'].includes(status)) {
    listing.status = status;
  }

  if (price !== undefined) {
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return next(ApiError.badRequest('Price cannot be negative.'));
    }
    listing.price = numericPrice;
  }

  if (req.files && req.files.length > 0) {
    const newImages = await uploadMultipleImages(req.files);

    if (keepExistingImages === 'true' || keepExistingImages === true) {
      listing.images = [...listing.images, ...newImages];
    } else {
      for (const img of listing.images) {
        if (img.publicId) await deleteFromCloudinary(img.publicId);
      }
      listing.images = newImages;
    }
  }

  await listing.save();

  const updatedListing = await Listing.findById(listing._id)
    .populate('seller', 'name email course branch graduationYear profileImage phone')
    .populate('campus', 'campusName city state');

  res.status(200).json({
    success: true,
    message: 'Listing updated successfully.',
    listing: updatedListing,
  });
});

// @desc    Update listing status (Available / Reserved / Sold)
// @route   PATCH /api/listings/:id/status
// @access  Protected (Owner only)
const updateListingStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!['Available', 'Reserved', 'Sold'].includes(status)) {
    return next(ApiError.badRequest('Invalid status. Allowed: Available, Reserved, Sold.'));
  }

  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(ApiError.notFound('Listing not found.'));
  }

  if (listing.seller.toString() !== req.user.userId && req.user.role !== 'admin') {
    return next(ApiError.forbidden('You are not authorized to update this listing status.'));
  }

  listing.status = status;
  await listing.save();

  res.status(200).json({
    success: true,
    message: `Listing marked as ${status}.`,
    listing,
  });
});

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Protected (Owner or Admin)
const deleteListing = asyncHandler(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(ApiError.notFound('Listing not found.'));
  }

  if (listing.seller.toString() !== req.user.userId && req.user.role !== 'admin') {
    return next(ApiError.forbidden('You are not authorized to delete this listing.'));
  }

  if (listing.images && listing.images.length > 0) {
    for (const img of listing.images) {
      if (img.publicId) await deleteFromCloudinary(img.publicId);
    }
  }

  await listing.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Listing deleted successfully.',
  });
});

// @desc    Get listings created by the logged-in user
// @route   GET /api/listings/user/my-listings
// @access  Protected
const getMyListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ seller: req.user.userId })
    .sort({ createdAt: -1 })
    .populate('campus', 'campusName');

  res.status(200).json({
    success: true,
    count: listings.length,
    listings,
  });
});

module.exports = {
  getListings,
  createListing,
  getListingById,
  updateListing,
  updateListingStatus,
  deleteListing,
  getMyListings,
};

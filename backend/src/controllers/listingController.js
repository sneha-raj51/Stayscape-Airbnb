const Listing = require('../models/Listing');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const APIFeatures = require('../utils/apiFeatures');

/**
 * @desc    Get all active listings with filtering, search, sorting and pagination
 * @route   GET /api/listings
 * @access  Public
 */
const getListings = async (req, res, next) => {
  try {
    // Count total documents matching basic filter criteria
    const countFeatures = new APIFeatures(
      Listing.find({ isActive: true }),
      req.query
    )
      .search()
      .filter();

    const totalCount = await countFeatures.query.countDocuments();

    // Query documents with pagination and sorting
    const apiFeatures = new APIFeatures(
      Listing.find({ isActive: true }),
      req.query
    )
      .search()
      .filter()
      .sort()
      .paginate()
      .limitFields();

    const listings = await apiFeatures.query.populate(
      'host',
      'name avatar email'
    );

    const page = apiFeatures.page || 1;
    const limit = apiFeatures.limit || 12;
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      message: 'Listings retrieved successfully',
      data: {
        listings,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single listing by ID with host and reviews populated
 * @route   GET /api/listings/:id
 * @access  Public
 */
const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('host', 'name avatar email phone role')
      .populate({
        path: 'reviews',
        populate: {
          path: 'guest',
          select: 'name avatar'
        }
      });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: `Listing not found with ID of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Listing retrieved successfully',
      data: {
        listing
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new listing
 * @route   POST /api/listings
 * @access  Private (Host or Admin only)
 */
const createListing = async (req, res, next) => {
  try {
    // Attach current user as host
    const listingData = {
      ...req.body,
      host: req.user._id
    };

    const listing = await Listing.create(listingData);

    const populatedListing = await listing.populate(
      'host',
      'name avatar email'
    );

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: {
        listing: populatedListing
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update listing
 * @route   PUT /api/listings/:id
 * @access  Private (Owner Host or Admin only)
 */
const updateListing = async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: `Listing not found with ID of ${req.params.id}`
      });
    }

    // Verify ownership or admin role
    if (
      listing.host.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this listing'
      });
    }

    // Prevent changing the host
    delete req.body.host;
    delete req.body.averageRating;
    delete req.body.totalReviews;

    listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('host', 'name avatar email');

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      data: {
        listing
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete listing
 * @route   DELETE /api/listings/:id
 * @access  Private (Owner Host or Admin only)
 */
const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: `Listing not found with ID of ${req.params.id}`
      });
    }

    // Verify ownership or admin role
    if (
      listing.host.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this listing'
      });
    }

    // Delete listing
    await Listing.findByIdAndDelete(req.params.id);

    // Clean up associated reviews
    await Review.deleteMany({ listing: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Listing and associated reviews deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get listings created by current host
 * @route   GET /api/listings/my-listings
 * @access  Private (Host or Admin only)
 */
const getMyListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ host: req.user._id }).sort(
      '-createdAt'
    );

    res.status(200).json({
      success: true,
      message: 'Host listings retrieved successfully',
      data: {
        listings
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings
};

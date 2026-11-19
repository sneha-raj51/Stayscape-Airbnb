const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');

/**
 * @desc    Submit a review for a completed stay
 * @route   POST /api/reviews
 * @access  Private
 */
const createReview = async (req, res, next) => {
  try {
    const { listing: listingId, booking: bookingId, rating, comment } = req.body;

    if (!listingId || !bookingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide listing ID, booking ID, rating, and comment'
      });
    }

    // Validate rating range
    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5'
      });
    }

    // Verify booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking not found with ID of ${bookingId}`
      });
    }

    // Verify booking belongs to the current guest
    if (booking.guest.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only review bookings made by your account'
      });
    }

    // Verify booking matches the listing
    if (booking.listing.toString() !== listingId) {
      return res.status(400).json({
        success: false,
        message: 'The booking does not match the specified listing'
      });
    }

    // Verify that the stay has completed
    const now = new Date();
    const isCompleted =
      booking.status === 'completed' ||
      (booking.status === 'confirmed' && new Date(booking.checkOut) <= now);

    if (!isCompleted) {
      return res.status(400).json({
        success: false,
        message: 'You can only submit a review after your stay has concluded'
      });
    }

    // Check if this booking has already been reviewed (one review per booking)
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'A review has already been submitted for this booking'
      });
    }

    // Create review
    const review = await Review.create({
      listing: listingId,
      guest: req.user._id,
      booking: bookingId,
      rating: numericRating,
      comment
    });

    // Populate guest details
    const populatedReview = await review.populate('guest', 'name avatar');

    // Update listing rating explicitly to ensure synchronization
    await Review.calculateAverageRating(listingId);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: {
        review: populatedReview
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews for a listing
 * @route   GET /api/reviews/listing/:listingId
 * @access  Public
 */
const getListingReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate('guest', 'name avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: {
        count: reviews.length,
        reviews
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private (Review author or Admin only)
 */
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: `Review not found with ID of ${req.params.id}`
      });
    }

    // Check ownership or admin role
    if (
      review.guest.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    const listingId = review.listing;

    await Review.findByIdAndDelete(req.params.id);

    // Recalculate listing rating after deletion
    await Review.calculateAverageRating(listingId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getListingReviews,
  deleteReview
};

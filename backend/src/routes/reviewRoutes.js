const express = require('express');
const { body } = require('express-validator');
const {
  createReview,
  getListingReviews,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/errorMiddleware');

const router = express.Router();

const reviewValidation = [
  body('listing')
    .notEmpty()
    .withMessage('Listing ID is required')
    .isMongoId()
    .withMessage('Invalid listing ID format'),
  body('booking')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isMongoId()
    .withMessage('Invalid booking ID format'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Review comment is required')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
  validateRequest
];

// Public route: fetch reviews for a specific listing
router.get('/listing/:listingId', getListingReviews);

// Protected routes: submit and delete review
router.post('/', protect, reviewValidation, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;

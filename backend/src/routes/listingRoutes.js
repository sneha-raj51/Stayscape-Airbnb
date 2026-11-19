const express = require('express');
const { body } = require('express-validator');
const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings
} = require('../controllers/listingController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/errorMiddleware');

const router = express.Router();

const listingValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Listing title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Listing description is required'),
  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('location.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('location.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  body('propertyType')
    .notEmpty()
    .withMessage('Property type is required'),
  body('pricePerNight')
    .isFloat({ min: 0 })
    .withMessage('Price per night must be a positive number'),
  body('maxGuests')
    .isInt({ min: 1 })
    .withMessage('Maximum guests must be at least 1'),
  body('bedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bedrooms cannot be negative'),
  body('beds')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Beds must be at least 1'),
  body('bathrooms')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Bathrooms cannot be negative'),
  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one image is required'),
  validateRequest
];

// Public routes
router.get('/', getListings);

// Host routes
router.get('/my-listings', protect, authorize('host', 'admin'), getMyListings);

// Individual listing route
router.get('/:id', getListingById);

// Protected routes (Host & Admin only)
router.post(
  '/',
  protect,
  authorize('host', 'admin'),
  listingValidation,
  createListing
);

router.put(
  '/:id',
  protect,
  authorize('host', 'admin'),
  updateListing
);

router.delete(
  '/:id',
  protect,
  authorize('host', 'admin'),
  deleteListing
);

module.exports = router;

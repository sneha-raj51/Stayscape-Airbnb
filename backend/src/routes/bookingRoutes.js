const express = require('express');
const { body } = require('express-validator');
const {
  getListingAvailability,
  createBooking,
  payBooking,
  getMyBookings,
  getHostBookings,
  getBookingById,
  cancelBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/errorMiddleware');

const router = express.Router();

// Public route: check availability and booked date ranges for a listing
router.get('/availability/:listingId', getListingAvailability);

// All subsequent booking routes require authentication
router.use(protect);

const bookingValidation = [
  body('listing')
    .notEmpty()
    .withMessage('Listing ID is required')
    .isMongoId()
    .withMessage('Invalid listing ID format'),
  body('checkIn')
    .notEmpty()
    .withMessage('Check-in date is required')
    .isISO8601()
    .withMessage('Check-in must be a valid ISO 8601 date'),
  body('checkOut')
    .notEmpty()
    .withMessage('Check-out date is required')
    .isISO8601()
    .withMessage('Check-out must be a valid ISO 8601 date'),
  body('guests')
    .notEmpty()
    .withMessage('Guest count is required')
    .isInt({ min: 1 })
    .withMessage('Guests must be at least 1'),
  validateRequest
];

// Guest booking routes
router.post('/', bookingValidation, createBooking);
router.get('/my-bookings', getMyBookings);
router.put('/:id/pay', payBooking);

// Host booking management
router.get('/host-bookings', authorize('host', 'admin'), getHostBookings);

// Booking details & cancellation
router.get('/:id', getBookingById);
router.put('/:id/cancel', cancelBooking);

module.exports = router;

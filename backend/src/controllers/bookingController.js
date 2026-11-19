const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');

/**
 * @desc    Get booking availability and booked date ranges for a listing
 * @route   GET /api/bookings/availability/:listingId
 * @access  Public
 */
const getListingAvailability = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const { checkIn, checkOut } = req.query;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: `Listing not found with ID of ${listingId}`
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all active (confirmed or pending) bookings that end in the future
    const activeBookings = await Booking.find({
      listing: listingId,
      status: { $in: ['confirmed', 'pending'] },
      checkOut: { $gte: today }
    })
      .select('checkIn checkOut status')
      .sort('checkIn');

    const bookedRanges = activeBookings.map((b) => ({
      bookingId: b._id,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      status: b.status
    }));

    // If query contains checkIn and checkOut, check specific date range availability
    let isAvailable = true;
    let conflictMessage = null;

    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format provided for check-in or check-out'
        });
      }

      if (checkOutDate <= checkInDate) {
        return res.status(400).json({
          success: false,
          message: 'Check-out date must be after check-in date'
        });
      }

      const conflict = activeBookings.find(
        (b) => checkInDate < b.checkOut && checkOutDate > b.checkIn
      );

      if (conflict) {
        isAvailable = false;
        conflictMessage = 'The selected date range overlaps with an existing reservation';
      }
    }

    res.status(200).json({
      success: true,
      data: {
        listingId,
        bookedRanges,
        isAvailable,
        ...(conflictMessage && { message: conflictMessage })
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new booking with overlap prevention and server-side pricing
 * @route   POST /api/bookings
 * @access  Private
 */
const createBooking = async (req, res, next) => {
  try {
    const { listing: listingId, checkIn, checkOut, guests, payNow } = req.body;

    if (!listingId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Please provide listing ID, check-in date, check-out date, and guest count'
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate valid date formats
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided for check-in or check-out'
      });
    }

    // Check-in cannot be in the past (allowing today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInCompare = new Date(checkInDate);
    checkInCompare.setHours(0, 0, 0, 0);

    if (checkInCompare < today) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past'
      });
    }

    // Check-out must be after check-in
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be strictly after check-in date'
      });
    }

    // Fetch listing
    const listing = await Listing.findById(listingId);
    if (!listing || !listing.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found or is currently inactive'
      });
    }

    // Prevent hosts from booking their own property
    if (listing.host.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book your own listing'
      });
    }

    // Guest capacity validation
    const guestCount = parseInt(guests, 10);
    if (guestCount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Guest count must be at least 1'
      });
    }

    if (guestCount > listing.maxGuests) {
      return res.status(400).json({
        success: false,
        message: `Number of guests (${guestCount}) exceeds maximum capacity of ${listing.maxGuests}`
      });
    }

    // Calculate total nights and total price on the server (never trust client price)
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (totalNights < 1) {
      return res.status(400).json({
        success: false,
        message: 'Booking duration must be at least 1 night'
      });
    }

    const pricePerNight = listing.pricePerNight;
    const totalPrice = totalNights * pricePerNight;
    const initialPaymentStatus = payNow ? 'paid' : 'unpaid';

    // Double-Booking Protection:
    // Attempt session transaction when supported by MongoDB deployment (replica set/Atlas),
    // and provide atomic fallback verification for standalone local instances.
    let booking;
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const conflictingBooking = await Booking.findOne({
          listing: listingId,
          status: { $in: ['confirmed', 'pending'] },
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate }
        }).session(session);

        if (conflictingBooking) {
          const conflictErr = new Error(
            'The listing is not available for the selected dates. Please choose different dates.'
          );
          conflictErr.status = 400;
          throw conflictErr;
        }

        const [createdBooking] = await Booking.create(
          [
            {
              listing: listing._id,
              guest: req.user._id,
              host: listing.host,
              checkIn: checkInDate,
              checkOut: checkOutDate,
              guests: guestCount,
              totalNights,
              pricePerNight,
              totalPrice,
              status: 'confirmed',
              paymentStatus: initialPaymentStatus
            }
          ],
          { session }
        );

        booking = createdBooking;
      });
    } catch (transactionErr) {
      // If transactions are not supported by the environment (e.g. standalone MongoDB)
      if (
        transactionErr.message &&
        (transactionErr.message.includes('replica set member') ||
          transactionErr.message.includes('Transaction numbers are only allowed on a replica set'))
      ) {
        // Fallback for standalone Mongo: atomic query check followed by creation
        const conflictingBooking = await Booking.findOne({
          listing: listingId,
          status: { $in: ['confirmed', 'pending'] },
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate }
        });

        if (conflictingBooking) {
          return res.status(400).json({
            success: false,
            message:
              'The listing is not available for the selected dates. Please choose different dates.'
          });
        }

        booking = await Booking.create({
          listing: listing._id,
          guest: req.user._id,
          host: listing.host,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guests: guestCount,
          totalNights,
          pricePerNight,
          totalPrice,
          status: 'confirmed',
          paymentStatus: initialPaymentStatus
        });
      } else {
        // Re-throw genuine errors or conflict errors
        return res.status(transactionErr.status || 400).json({
          success: false,
          message:
            transactionErr.message ||
            'The listing is not available for the selected dates. Please choose different dates.'
        });
      }
    } finally {
      await session.endSession();
    }

    const populatedBooking = await booking.populate([
      { path: 'listing', select: 'title images location pricePerNight propertyType' },
      { path: 'host', select: 'name email avatar phone' },
      { path: 'guest', select: 'name email avatar' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created and confirmed successfully',
      data: {
        booking: populatedBooking
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Simulate payment confirmation for an unpaid booking
 * @route   PUT /api/bookings/:id/pay
 * @access  Private (Guest who booked)
 */
const payBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking not found with ID of ${req.params.id}`
      });
    }

    // Verify ownership
    if (booking.guest.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the guest who made this reservation can process payment'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot process payment for a cancelled booking'
      });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already paid'
      });
    }

    booking.paymentStatus = 'paid';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        booking
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings for currently logged-in guest
 * @route   GET /api/bookings/my-bookings
 * @access  Private
 */
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ guest: req.user._id })
      .populate('listing', 'title images location pricePerNight propertyType')
      .populate('host', 'name email avatar phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      message: 'Guest bookings retrieved successfully',
      data: {
        bookings
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings for properties owned by currently logged-in host
 * @route   GET /api/bookings/host-bookings
 * @access  Private (Host or Admin only)
 */
const getHostBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ host: req.user._id })
      .populate('listing', 'title images location pricePerNight propertyType')
      .populate('guest', 'name email avatar phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      message: 'Host bookings retrieved successfully',
      data: {
        bookings
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single booking by ID
 * @route   GET /api/bookings/:id
 * @access  Private (Guest, Host of listing, or Admin)
 */
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('listing')
      .populate('host', 'name email avatar phone')
      .populate('guest', 'name email avatar phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking not found with ID of ${req.params.id}`
      });
    }

    // Ensure only the guest, the host, or an admin can view this booking
    const isGuest = booking.guest._id.toString() === req.user._id.toString();
    const isHost = booking.host._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isGuest && !isHost && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking details retrieved successfully',
      data: {
        booking
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private (Guest, Host, or Admin)
 */
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking not found with ID of ${req.params.id}`
      });
    }

    // Verify authorization
    const isGuest = booking.guest.toString() === req.user._id.toString();
    const isHost = booking.host.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isGuest && !isHost && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled'
      });
    }

    // Check if already completed
    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed bookings cannot be cancelled'
      });
    }

    // Update status
    booking.status = 'cancelled';
    if (booking.paymentStatus === 'paid') {
      booking.paymentStatus = 'refunded';
    }
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getListingAvailability,
  createBooking,
  payBooking,
  getMyBookings,
  getHostBookings,
  getBookingById,
  cancelBooking
};

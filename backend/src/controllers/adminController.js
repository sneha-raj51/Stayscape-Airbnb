const User = require('../models/User');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

/**
 * @desc    Get high-level platform analytics for admin dashboard
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalListings,
      totalBookings,
      totalReviews,
      recentUsers,
      recentBookings
    ] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Booking.countDocuments(),
      Review.countDocuments(),
      User.find().select('name email role createdAt').sort('-createdAt').limit(5),
      Booking.find()
        .populate('listing', 'title')
        .populate('guest', 'name email')
        .sort('-createdAt')
        .limit(5)
    ]);

    // Calculate total platform revenue from confirmed/paid bookings
    const revenueAgg = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' }, paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Breakdown counts
    const [guestCount, hostCount, adminCount] = await Promise.all([
      User.countDocuments({ role: 'guest' }),
      User.countDocuments({ role: 'host' }),
      User.countDocuments({ role: 'admin' })
    ]);

    const [confirmedBookings, completedBookings, cancelledBookings] = await Promise.all([
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          totalListings,
          totalBookings,
          totalReviews,
          totalRevenue,
          userBreakdown: {
            guests: guestCount,
            hosts: hostCount,
            admins: adminCount
          },
          bookingBreakdown: {
            confirmed: confirmedBookings,
            completed: completedBookings,
            cancelled: cancelledBookings
          }
        },
        recentUsers,
        recentBookings
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users with search, filter, and pagination
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.role && req.query.role !== 'all') {
      query.role = req.query.role;
    }
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search.trim(), $options: 'i' } },
        { email: { $regex: req.query.search.trim(), $options: 'i' } }
      ];
    }

    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query).sort('-createdAt').skip(skip).limit(limit)
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a user role (Admin only)
 * @route   PUT /api/admin/users/:id/role
 * @access  Private (Admin only)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['guest', 'host', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role provided. Role must be guest, host, or admin.'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin only)
 */
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Admins cannot delete their own account'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all listings across the platform
 * @route   GET /api/admin/listings
 * @access  Private (Admin only)
 */
const getAllListings = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search.trim(), $options: 'i' } },
        { 'location.city': { $regex: req.query.search.trim(), $options: 'i' } }
      ];
    }

    const [total, listings] = await Promise.all([
      Listing.countDocuments(query),
      Listing.find(query)
        .populate('host', 'name email avatar')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
    ]);

    res.status(200).json({
      success: true,
      data: {
        listings,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings across the platform
 * @route   GET /api/admin/bookings
 * @access  Private (Admin only)
 */
const getAllBookings = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    const [total, bookings] = await Promise.all([
      Booking.countDocuments(query),
      Booking.find(query)
        .populate('listing', 'title location pricePerNight')
        .populate('guest', 'name email')
        .populate('host', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
    ]);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllListings,
  getAllBookings
};

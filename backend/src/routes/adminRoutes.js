const express = require('express');
const {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllListings,
  getAllBookings
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All admin routes strictly require authentication and 'admin' role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/listings', getAllListings);
router.get('/bookings', getAllBookings);

module.exports = router;

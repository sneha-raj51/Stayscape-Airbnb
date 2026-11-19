const express = require('express');
const { body } = require('express-validator');
const {
  getUserProfile,
  updateUserProfile,
  changePassword
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/errorMiddleware');

const router = express.Router();

// All user routes require authentication
router.use(protect);

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),
  body('phone').optional().trim(),
  body('avatar').optional().trim().isURL().withMessage('Avatar must be a valid URL'),
  body('role')
    .optional()
    .isIn(['guest', 'host'])
    .withMessage('Role can only be updated to host'),
  validateRequest
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  validateRequest
];

router.get('/profile', getUserProfile);
router.put('/profile', updateProfileValidation, updateUserProfile);
router.put('/change-password', changePasswordValidation, changePassword);

module.exports = router;

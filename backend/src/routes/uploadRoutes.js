const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle, uploadMultiple } = require('../middleware/uploadMiddleware');
const { isCloudinaryConfigured, uploadToCloudinary } = require('../config/cloudinary');

const router = express.Router();

/**
 * @desc    Upload single image (Cloudinary with local storage fallback)
 * @route   POST /api/upload
 * @access  Private
 */
router.post('/', protect, (req, res, next) => {
  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading file'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload'
      });
    }

    try {
      let fileUrl;
      let storageType = 'local';

      if (isCloudinaryConfigured()) {
        const cloudResult = await uploadToCloudinary(req.file.path, 'stayscape/listings');
        fileUrl = cloudResult.secure_url;
        storageType = 'cloudinary';
      } else {
        fileUrl = `/uploads/${req.file.filename}`;
      }

      res.status(200).json({
        success: true,
        message: storageType === 'cloudinary'
          ? 'Image uploaded to Cloudinary successfully'
          : 'Image uploaded to local server storage (Cloudinary not configured)',
        data: {
          url: fileUrl,
          filename: req.file.filename,
          mimetype: req.file.mimetype,
          size: req.file.size,
          storage: storageType
        }
      });
    } catch (uploadError) {
      // If Cloudinary fails, fall back to local disk URL
      res.status(200).json({
        success: true,
        message: `Cloudinary upload warning: ${uploadError.message}. Stored locally.`,
        data: {
          url: `/uploads/${req.file.filename}`,
          filename: req.file.filename,
          storage: 'local'
        }
      });
    }
  });
});

/**
 * @desc    Upload multiple images (up to 10)
 * @route   POST /api/upload/multiple
 * @access  Private
 */
router.post('/multiple', protect, (req, res, next) => {
  uploadMultiple(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading files'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one image file to upload'
      });
    }

    try {
      const fileUrls = [];
      const storageType = isCloudinaryConfigured() ? 'cloudinary' : 'local';

      for (const file of req.files) {
        if (isCloudinaryConfigured()) {
          try {
            const cloudResult = await uploadToCloudinary(file.path, 'stayscape/listings');
            fileUrls.push(cloudResult.secure_url);
          } catch (e) {
            fileUrls.push(`/uploads/${file.filename}`);
          }
        } else {
          fileUrls.push(`/uploads/${file.filename}`);
        }
      }

      res.status(200).json({
        success: true,
        message: `${fileUrls.length} images uploaded successfully (${storageType})`,
        data: {
          urls: fileUrls,
          storage: storageType
        }
      });
    } catch (multiUploadErr) {
      const fallbackUrls = req.files.map((f) => `/uploads/${f.filename}`);
      res.status(200).json({
        success: true,
        message: `${fallbackUrls.length} images stored locally`,
        data: {
          urls: fallbackUrls,
          storage: 'local'
        }
      });
    }
  });
});

module.exports = router;

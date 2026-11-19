const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('[Cloudinary] Cloudinary configured successfully.');
} else {
  console.log('[Cloudinary] Cloudinary credentials not detected. Falling back to local disk storage.');
}

/**
 * Upload a local file to Cloudinary
 * @param {string} filePath - Path to local file
 * @param {string} folder - Target Cloudinary folder
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadToCloudinary = async (filePath, folder = 'stayscape') => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured on the server');
  }

  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'image',
  });

  // Optionally remove the local temp file after uploading to cloud
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      // Ignore temp file cleanup error
    }
  }

  return result;
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary,
};

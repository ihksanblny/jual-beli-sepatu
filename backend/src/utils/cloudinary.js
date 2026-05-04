const cloudinary = require('cloudinary').v2;
const logger = require('./logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image to Cloudinary
 * @param {string} filePath - Local path or buffer/stream
 * @param {string} folder - Destination folder
 * @returns {Promise<Object>} Upload result
 */
const uploadImage = async (filePath, folder = 'shoehub/products') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      use_filename: true,
      unique_filename: true,
    });
    return result;
  } catch (error) {
    logger.error('Cloudinary Upload Error:', error);
    throw new Error('Image upload failed');
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 */
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error('Cloudinary Delete Error:', error);
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};

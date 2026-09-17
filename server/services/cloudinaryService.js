const cloudinary = require('../config/cloudinary');

const hasCloudinaryCredentials = () => {
  const configuredValues = [
    process.env.CLOUDINARY_CLOUD_NAME,
    process.env.CLOUDINARY_API_KEY,
    process.env.CLOUDINARY_API_SECRET,
  ];

  return configuredValues.every(
    (value) => value && !value.startsWith('your_') && value !== 'placeholder'
  );
};

/**
 * Upload a single image buffer directly to Cloudinary using upload_stream
 * @param {Buffer} fileBuffer - Image buffer from Multer memoryStorage
 * @param {String} folder - Cloudinary folder destination
 * @returns {Promise<{url: string, publicId: string}>}
 */
const uploadToCloudinary = (fileBuffer, folder = 'campus_resale/listings') => {
  return new Promise((resolve, reject) => {
    // If Cloudinary credentials are mock or missing in development, return a fallback placeholder image
    if (!hasCloudinaryCredentials()) {
      console.log('ℹ️ Cloudinary credentials not configured; using local data URI fallback');
      const base64Image = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
      return resolve({
        url: base64Image,
        publicId: `dev_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload an array of files to Cloudinary
 * @param {Array<Express.Multer.File>} files
 * @param {String} folder
 * @returns {Promise<Array<{url: string, publicId: string}>>}
 */
const uploadMultipleImages = async (files, folder = 'campus_resale/listings') => {
  if (!files || files.length === 0) return [];
  const uploadPromises = files.map((file) => uploadToCloudinary(file.buffer, folder));
  return await Promise.all(uploadPromises);
};

/**
 * Delete image from Cloudinary by public ID
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId || publicId.startsWith('dev_')) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Failed to delete image from Cloudinary:', err.message);
  }
};

module.exports = {
  uploadToCloudinary,
  uploadMultipleImages,
  deleteFromCloudinary,
};

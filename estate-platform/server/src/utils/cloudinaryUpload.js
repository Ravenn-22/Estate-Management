const cloudinary = require('../config/cloudinary');

const uploadBufferToCloudinary = (buffer, folder = 'estate-platform/maintenance') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

module.exports = uploadBufferToCloudinary;
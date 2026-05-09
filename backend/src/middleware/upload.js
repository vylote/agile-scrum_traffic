const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const AppError = require('../middleware/AppError');
const ErrorCodes = require('../utils/constants/errorCodes');

// Cấu hình Cloudinary (Lấy từ biến môi trường Railway)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'incident_photos',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        // Sử dụng ErrorCodes chuẩn
        cb(new AppError(ErrorCodes.FILE_UPLOAD_ERROR), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;
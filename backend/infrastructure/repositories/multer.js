const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'surveillance-recordings',
    resource_type: 'video',
    allowed_formats: ['mp4', 'avi', 'mkv', 'mov'],
    // السر هنا: تقسيم الفيديو لأجزاء (Chunks) بحجم 6 ميجا عشان الرفع ميفصلش
    chunk_size: 6000000, 
  },
});

// إضافة حد أقصى لحجم الفيديو (مثلاً 100 ميجابايت)
const upload = multer({ 
  storage,
  limits: {
    fileSize: 1000 * 1024 * 1024, // 100 MB (تقدر تزودها لو حسابك في Cloudinary يسمح)
  }
});

module.exports = { upload, cloudinary };
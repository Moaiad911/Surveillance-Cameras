const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/recordings/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `recording-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/avi', 'video/x-matroska', 'video/quicktime'];
    const allowedExtensions = ['.mp4', '.avi', '.mkv', '.mov'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only video files are allowed (mp4, avi, mkv, mov)'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB max
});

module.exports = upload;

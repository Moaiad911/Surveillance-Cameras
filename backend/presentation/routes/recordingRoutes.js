const express = require('express');
const router = express.Router();
const recordingController = require('../controllers/recordingController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../../infrastructure/repositories/multer');

router.use(verifyToken);

const handleUpload = (req, res, next) => {
    upload.single('video')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

router.post('/:cameraId/upload', handleUpload, recordingController.uploadRecording);


router.get('/:cameraId', recordingController.getRecordings);


router.delete('/:id', requireAdmin, recordingController.deleteRecording);

module.exports = router;

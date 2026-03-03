const express = require('express');
const router = express.Router();
const recordingController = require('../controllers/recordingController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const upload = require('../../infrastructure/multer');

router.use(verifyToken);

/**
 * @swagger
 * /api/recordings/{cameraId}/upload:
 *   post:
 *     summary: Upload a video recording for a camera
 *     tags: [Recordings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cameraId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Recording uploaded successfully
 *       400:
 *         description: No video file provided
 *       404:
 *         description: Camera not found
 */
router.post('/:cameraId/upload', upload.single('video'), recordingController.uploadRecording);

/**
 * @swagger
 * /api/recordings/{cameraId}:
 *   get:
 *     summary: Get all recordings for a camera
 *     tags: [Recordings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cameraId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of recordings
 *       404:
 *         description: Camera not found
 */
router.get('/:cameraId', recordingController.getRecordings);

/**
 * @swagger
 * /api/recordings/{id}:
 *   delete:
 *     summary: Delete a recording (Admin only)
 *     tags: [Recordings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recording deleted successfully
 *       403:
 *         description: Only admins can delete recordings
 *       404:
 *         description: Recording not found
 */
router.delete('/:id', requireAdmin, recordingController.deleteRecording);

module.exports = router;

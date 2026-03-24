const express = require('express');
const router = express.Router();
const { startMJPEG, stopMJPEG } = require('../../infrastructure/mjpegService');
const CameraModel = require('../../infrastructure/models/CameraModel');
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * /api/mjpeg/{cameraId}:
 *   get:
 *     summary: Get MJPEG live stream for a camera
 *     tags: [Streaming]
 *     parameters:
 *       - in: path
 *         name: cameraId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: MJPEG stream
 */
router.get('/:cameraId', async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(401).json({ message: 'Token required' });
    jwt.verify(token, process.env.JWT_SECRET);

    const camera = await CameraModel.findById(req.params.cameraId);
    if (!camera) return res.status(404).json({ message: 'Camera not found' });

    startMJPEG(res, req.params.cameraId, camera.streamURL);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:cameraId', (req, res) => {
  stopMJPEG(req.params.cameraId);
  res.json({ success: true });
});

module.exports = router;

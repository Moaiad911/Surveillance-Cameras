const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/authMiddleware');
const { startStream, stopStream, getActiveStreams } = require('../../infrastructure/streamingService');
const CameraModel = require('../../infrastructure/models/CameraModel');

router.use(verifyToken);

/**
 * @swagger
 * /api/streams/{cameraId}/start:
 *   post:
 *     summary: Start live stream for a camera
 *     tags: [Streaming]
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
 *         description: Stream started successfully
 *       404:
 *         description: Camera not found
 */
router.post('/:cameraId/start', async (req, res) => {
  try {
    const camera = await CameraModel.findById(req.params.cameraId);
    if (!camera) return res.status(404).json({ message: 'Camera not found' });
    const result = startStream(req.params.cameraId, camera.streamURL);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/streams/{cameraId}/stop:
 *   post:
 *     summary: Stop live stream for a camera
 *     tags: [Streaming]
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
 *         description: Stream stopped successfully
 */
router.post('/:cameraId/stop', (req, res) => {
  const result = stopStream(req.params.cameraId);
  res.json(result);
});

/**
 * @swagger
 * /api/streams/active:
 *   get:
 *     summary: Get all active streams
 *     tags: [Streaming]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active stream camera IDs
 */
router.get('/active', (req, res) => {
  res.json({ activeStreams: getActiveStreams() });
});

/**
 * @swagger
 * /api/streams/{cameraId}/status:
 *   get:
 *     summary: Check if a camera stream is active
 *     tags: [Streaming]
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
 *         description: Stream status
 */
router.get('/:cameraId/status', (req, res) => {
  const active = getActiveStreams();
  const isActive = active.includes(req.params.cameraId);
  res.json({ cameraId: req.params.cameraId, isActive, streamUrl: isActive ? `/streams/${req.params.cameraId}/index.m3u8` : null });
});

/**
 * @swagger
 * /api/streams/{cameraId}/index.m3u8:
 *   get:
 *     summary: Get HLS stream playlist for a camera
 *     tags: [Streaming]
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
 *         description: HLS playlist file
 *       404:
 *         description: Stream not started
 */
router.get('/:cameraId/index.m3u8', (req, res) => {
  const filePath = path.join(__dirname, '../../uploads/streams', req.params.cameraId, 'index.m3u8');
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Stream not started' });
  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  res.sendFile(filePath);
});

module.exports = router;

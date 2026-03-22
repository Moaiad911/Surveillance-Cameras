const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/authMiddleware');
const { startStream, stopStream, getActiveStreams } = require('../../infrastructure/streamingService');
const CameraModel = require('../../infrastructure/models/CameraModel');

router.use(verifyToken);

// Start stream for a camera
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

// Stop stream
router.post('/:cameraId/stop', (req, res) => {
  const result = stopStream(req.params.cameraId);
  res.json(result);
});

// Get active streams
router.get('/active', (req, res) => {
  res.json({ activeStreams: getActiveStreams() });
});

// Serve HLS stream files
router.get('/:cameraId/index.m3u8', (req, res) => {
  const filePath = path.join(__dirname, '../../uploads/streams', req.params.cameraId, 'index.m3u8');
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Stream not started' });
  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  res.sendFile(filePath);
});

module.exports = router;

const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');
const CameraModel = require('../../infrastructure/models/CameraModel');
const { startWSStream } = require('../../infrastructure/wsStreamService');

const setupWSStream = (server) => {
  const wss = new WebSocketServer({ 
    server,
    path: '/ws/stream'
  });

  wss.on('connection', async (ws, req) => {
    try {
      // Extract token and cameraId from URL
      const url = new URL(req.url, 'http://localhost');
      const token = url.searchParams.get('token');
      const cameraId = url.searchParams.get('cameraId');

      if (!token || !cameraId) {
        ws.close(1008, 'Missing token or cameraId');
        return;
      }

      // Verify token
      jwt.verify(token, process.env.JWT_SECRET);

      // Get camera
      const camera = await CameraModel.findById(cameraId);
      if (!camera) {
        ws.close(1008, 'Camera not found');
        return;
      }

      console.log(`[WS] Client connected to camera ${camera.name}`);
      startWSStream(ws, cameraId, camera.streamURL);

    } catch (err) {
      console.error('[WS] Error:', err.message);
      ws.close(1008, err.message);
    }
  });

  console.log('✅ WebSocket Stream server ready at /ws/stream');
};

module.exports = { setupWSStream };

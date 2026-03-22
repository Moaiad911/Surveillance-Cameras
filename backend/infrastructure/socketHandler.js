const { getRouter } = require('./webrtcService');
const { startFFmpegStream, stopFFmpegStream, getProducer } = require('./ffmpegWebRTC');
const CameraModel = require('../infrastructure/models/CameraModel');
const jwt = require('jsonwebtoken');

const consumerTransports = new Map();

const setupSocketIO = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Get Router RTP Capabilities
    socket.on('getRouterRtpCapabilities', (callback) => {
      const router = getRouter();
      callback(router.rtpCapabilities);
    });

    // Start stream for a camera
    socket.on('startStream', async ({ cameraId }, callback) => {
      try {
        const router = getRouter();
        const camera = await CameraModel.findById(cameraId);
        if (!camera) return callback({ error: 'Camera not found' });

        await startFFmpegStream(router, cameraId, camera.streamURL);
        callback({ success: true });
      } catch (err) {
        callback({ error: err.message });
      }
    });

    // Create WebRTC Transport for viewer
    socket.on('createTransport', async ({ cameraId }, callback) => {
      try {
        const router = getRouter();
        const transport = await router.createWebRtcTransport({
          listenIps: [{ ip: '0.0.0.0', announcedIp: '127.0.0.1' }],
          enableUdp: true,
          enableTcp: true,
          preferUdp: true,
        });

        consumerTransports.set(socket.id, transport);

        callback({
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters,
        });
      } catch (err) {
        callback({ error: err.message });
      }
    });

    // Connect Transport
    socket.on('connectTransport', async ({ dtlsParameters }, callback) => {
      try {
        const transport = consumerTransports.get(socket.id);
        if (!transport) return callback({ error: 'Transport not found' });
        await transport.connect({ dtlsParameters });
        callback({ success: true });
      } catch (err) {
        callback({ error: err.message });
      }
    });

    // Consume stream
    socket.on('consume', async ({ cameraId, rtpCapabilities }, callback) => {
      try {
        const router = getRouter();
        const producer = getProducer(cameraId);
        if (!producer) return callback({ error: 'Stream not started' });

        if (!router.canConsume({ producerId: producer.videoProducer.id, rtpCapabilities })) {
          return callback({ error: 'Cannot consume' });
        }

        const transport = consumerTransports.get(socket.id);
        const consumer = await transport.consume({
          producerId: producer.videoProducer.id,
          rtpCapabilities,
          paused: false,
        });

        callback({
          id: consumer.id,
          producerId: producer.videoProducer.id,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
        });
      } catch (err) {
        callback({ error: err.message });
      }
    });

    socket.on('stopStream', ({ cameraId }) => {
      stopFFmpegStream(cameraId);
    });

    socket.on('disconnect', () => {
      const transport = consumerTransports.get(socket.id);
      if (transport) { transport.close(); consumerTransports.delete(socket.id); }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = { setupSocketIO };

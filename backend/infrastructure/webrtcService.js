const mediasoup = require('mediasoup');

let worker;
let router;

const mediaCodecs = [
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters: {},
  },
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
  },
];

const initWorker = async () => {
  worker = await mediasoup.createWorker({
    logLevel: 'warn',
    rtcMinPort: 40000,
    rtcMaxPort: 49999,
  });

  worker.on('died', () => {
    console.error('mediasoup worker died, exiting...');
    process.exit(1);
  });

  router = await worker.createRouter({ mediaCodecs });
  console.log('✅ WebRTC Worker and Router created');
  return router;
};

const getRouter = () => router;

module.exports = { initWorker, getRouter };

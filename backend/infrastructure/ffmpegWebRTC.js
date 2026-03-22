const { spawn } = require('child_process');
const mediasoup = require('mediasoup');

const activeProducers = new Map();

const startFFmpegStream = async (router, cameraId, streamUrl) => {
  if (activeProducers.has(cameraId)) return activeProducers.get(cameraId);

  // Create PlainTransport for FFmpeg to send RTP to mediasoup
  const transport = await router.createPlainTransport({
    listenIp: { ip: '127.0.0.1', announcedIp: null },
    rtcpMux: false,
    comedia: true,
  });

  const videoProducer = await transport.produce({
    kind: 'video',
    rtpParameters: {
      codecs: [{
        mimeType: 'video/VP8',
        payloadType: 96,
        clockRate: 90000,
        parameters: {},
      }],
      encodings: [{ ssrc: 22222222 }],
    },
  });

  const ffmpeg = spawn('ffmpeg', [
    '-re',
    '-f', 'v4l2',
    '-framerate', '30',
    '-video_size', '1280x720',
    '-i', streamUrl,
    '-an',
    '-c:v', 'libvpx',
    '-b:v', '1000k',
    '-deadline', 'realtime',
    '-cpu-used', '4',
    '-f', 'rtp',
    `rtp://127.0.0.1:${transport.tuple.localPort}?rtcpport=${transport.rtcpTuple.localPort}&pkt_size=1200`,
  ]);

  ffmpeg.stderr.on('data', data => console.log(`[FFmpeg-WebRTC ${cameraId}]: ${data}`));
  ffmpeg.on('close', code => {
    console.log(`FFmpeg WebRTC stream ${cameraId} ended: ${code}`);
    activeProducers.delete(cameraId);
  });

  activeProducers.set(cameraId, { transport, videoProducer, ffmpeg });

  return { transport, videoProducer };
};

const stopFFmpegStream = (cameraId) => {
  const stream = activeProducers.get(cameraId);
  if (!stream) return;
  stream.ffmpeg.kill('SIGTERM');
  stream.videoProducer.close();
  stream.transport.close();
  activeProducers.delete(cameraId);
};

const getProducer = (cameraId) => activeProducers.get(cameraId);

module.exports = { startFFmpegStream, stopFFmpegStream, getProducer };

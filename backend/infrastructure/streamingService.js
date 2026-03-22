const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const activeStreams = new Map();

const startStream = (cameraId, streamUrl) => {
  if (activeStreams.has(cameraId)) return { success: true, message: 'Already streaming' };

  const outputDir = path.join(__dirname, '../uploads/streams', cameraId);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, 'index.m3u8');

  const ffmpeg = spawn('ffmpeg', [
    '-f', 'v4l2',
    '-framerate', '30',
    '-video_size', '1280x720',
    '-i', streamUrl,
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-x264-params', 'keyint=30:min-keyint=30:scenecut=0',
    '-b:v', '1000k',
    '-bufsize', '500k',
    '-maxrate', '1000k',
    '-f', 'hls',
    '-hls_time', '0.5',
    '-hls_list_size', '3',
    '-hls_flags', 'delete_segments+independent_segments',
    '-hls_segment_type', 'mpegts',
    outputPath
  ]);

  ffmpeg.stderr.on('data', (data) => {
    console.log(`[Stream ${cameraId}]: ${data}`);
  });

  ffmpeg.on('close', (code) => {
    console.log(`Stream ${cameraId} ended with code ${code}`);
    activeStreams.delete(cameraId);
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
  });

  activeStreams.set(cameraId, { process: ffmpeg, outputDir });
  return { success: true, streamUrl: `/streams/${cameraId}/index.m3u8` };
};

const stopStream = (cameraId) => {
  const stream = activeStreams.get(cameraId);
  if (!stream) return { success: false, message: 'Stream not found' };
  stream.process.kill('SIGTERM');
  activeStreams.delete(cameraId);
  return { success: true };
};

const getActiveStreams = () => {
  return Array.from(activeStreams.keys());
};

module.exports = { startStream, stopStream, getActiveStreams };

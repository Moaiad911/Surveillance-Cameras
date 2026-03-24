const { spawn } = require('child_process');
const os = require('os');

const activeStreams = new Map();

const getInputArgs = (streamUrl) => {
  const platform = os.platform();
  
  // IP Camera (RTSP)
  if (streamUrl.startsWith('rtsp://') || streamUrl.startsWith('http://')) {
    return ['-i', streamUrl];
  }

  // Linux webcam
  if (platform === 'linux') {
    return ['-f', 'v4l2', '-framerate', '30', '-video_size', '1280x720', '-i', streamUrl];
  }

  // Windows webcam
  if (platform === 'win32') {
    const deviceName = streamUrl.startsWith('/dev/') ? 'Integrated Camera' : streamUrl;
    return ['-f', 'dshow', '-i', `video=${deviceName}`];
  }

  // Mac webcam
  if (platform === 'darwin') {
    return ['-f', 'avfoundation', '-framerate', '30', '-i', '0'];
  }

  return ['-i', streamUrl];
};

const startMJPEG = (res, cameraId, streamUrl) => {
  if (activeStreams.has(cameraId)) {
    const old = activeStreams.get(cameraId);
    old.ffmpeg.kill('SIGTERM');
    activeStreams.delete(cameraId);
  }

  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Connection': 'keep-alive',
    'Pragma': 'no-cache',
  });

  const inputArgs = getInputArgs(streamUrl);

  const ffmpeg = spawn('ffmpeg', [
    ...inputArgs,
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-q:v', '5',
    '-vf', 'fps=25',
    'pipe:1'
  ]);

  let buffer = Buffer.alloc(0);

  ffmpeg.stdout.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    let start, end;
    while (true) {
      start = buffer.indexOf(Buffer.from([0xFF, 0xD8]));
      end = buffer.indexOf(Buffer.from([0xFF, 0xD9]));
      if (start !== -1 && end !== -1 && end > start) {
        const frame = buffer.slice(start, end + 2);
        buffer = buffer.slice(end + 2);
        try {
          res.write(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${frame.length}\r\n\r\n`);
          res.write(frame);
          res.write('\r\n');
        } catch (e) { ffmpeg.kill(); }
      } else { break; }
    }
  });

  ffmpeg.stderr.on('data', (data) => {
    console.log(`[MJPEG ${cameraId}]: ${data}`);
  });

  ffmpeg.on('close', () => {
    activeStreams.delete(cameraId);
    try { res.end(); } catch(e) {}
  });

  activeStreams.set(cameraId, { ffmpeg });

  res.on('close', () => {
    ffmpeg.kill('SIGTERM');
    activeStreams.delete(cameraId);
  });
};

const stopMJPEG = (cameraId) => {
  const stream = activeStreams.get(cameraId);
  if (stream) {
    stream.ffmpeg.kill('SIGTERM');
    activeStreams.delete(cameraId);
  }
};

module.exports = { startMJPEG, stopMJPEG };

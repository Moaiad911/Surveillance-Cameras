const { spawn } = require('child_process');

const activeStreams = new Map();

const startMJPEG = (res, cameraId, streamUrl) => {
  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const ffmpeg = spawn('ffmpeg', [
    '-f', 'v4l2',
    '-framerate', '60',
    '-video_size', '854x480',
    '-i', streamUrl,
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-q:v', '8',
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
        } catch (e) {
          ffmpeg.kill();
        }
      } else {
        break;
      }
    }
  });

  ffmpeg.on('close', () => {
    activeStreams.delete(cameraId);
    try { res.end(); } catch(e) {}
  });

  activeStreams.set(cameraId, ffmpeg);

  res.on('close', () => {
    ffmpeg.kill('SIGTERM');
    activeStreams.delete(cameraId);
  });
};

const stopMJPEG = (cameraId) => {
  const ffmpeg = activeStreams.get(cameraId);
  if (ffmpeg) {
    ffmpeg.kill('SIGTERM');
    activeStreams.delete(cameraId);
  }
};

module.exports = { startMJPEG, stopMJPEG };

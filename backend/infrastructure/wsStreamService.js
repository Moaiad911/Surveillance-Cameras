const { spawn } = require('child_process');
const os = require('os');
const aiAnalysis = require('./aiAnalysisService');

const activeStreams = new Map();
const FRAME_SKIP = 3;

const getInputArgs = (streamUrl) => {
  const platform = os.platform();
  if (streamUrl.startsWith('rtsp://') || streamUrl.startsWith('http://')) {
    return ['-i', streamUrl];
  }
  if (platform === 'linux') {
    return ['-f', 'v4l2', '-input_format', 'mjpeg', '-framerate', '30', '-video_size', '848x480', '-i', streamUrl];
  }
  if (platform === 'win32') {
    const deviceName = streamUrl.startsWith('/dev/') ? 'Integrated Camera' : streamUrl;
    return ['-f', 'dshow', '-i', `video=${deviceName}`];
  }
  if (platform === 'darwin') {
    return ['-f', 'avfoundation', '-framerate', '30', '-i', '0'];
  }
  return ['-i', streamUrl];
};

const startWSStream = (ws, cameraId, streamUrl) => {
  if (activeStreams.has(cameraId)) {
    const existing = activeStreams.get(cameraId);
    existing.clients.add(ws);
    return;
  }

  const clients = new Set();
  clients.add(ws);
  let frameCounter = 0;

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
        frameCounter++;

        // بعت الـ frame لكل الـ clients
        clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(frame, { binary: true });
          } else {
            clients.delete(client);
          }
        });

        // بعت frame للـ AI كل FRAME_SKIP frames
        if (frameCounter % FRAME_SKIP === 0) {
          const frameBase64 = frame.toString('base64');
          aiAnalysis.addFrame(cameraId, frameBase64, (result) => {
            const resultMsg = JSON.stringify({ type: 'ai_result', ...result });
            clients.forEach(client => {
              if (client.readyState === 1) {
                client.send(resultMsg);
              }
            });
          });
        }

        if (clients.size === 0) {
          ffmpeg.kill('SIGTERM');
        }
      } else { break; }
    }
  });

  ffmpeg.stderr.on('data', data => {
    const msg = data.toString();
    if (msg.includes('frame=') || msg.includes('Error')) {
      console.log(`[WS Stream ${cameraId}]: ${msg.trim()}`);
    }
  });

  ffmpeg.on('close', () => {
    activeStreams.delete(cameraId);
    aiAnalysis.clearCamera(cameraId);
    clients.forEach(client => {
      try { client.close(); } catch(e) {}
    });
  });

  activeStreams.set(cameraId, { ffmpeg, clients });

  ws.on('close', () => {
    const stream = activeStreams.get(cameraId);
    if (stream) {
      stream.clients.delete(ws);
      if (stream.clients.size === 0) {
        stream.ffmpeg.kill('SIGTERM');
        aiAnalysis.clearCamera(cameraId);
        activeStreams.delete(cameraId);
      }
    }
  });
};

const stopWSStream = (cameraId) => {
  const stream = activeStreams.get(cameraId);
  if (stream) {
    stream.ffmpeg.kill('SIGTERM');
    stream.clients.forEach(client => {
      try { client.close(); } catch(e) {}
    });
    aiAnalysis.clearCamera(cameraId);
    activeStreams.delete(cameraId);
  }
};

module.exports = { startWSStream, stopWSStream };

const fs = require('fs');
const UploadRecordingUseCase = require('../../usecases/recording/UploadRecordingUseCase');
const GetRecordingsUseCase = require('../../usecases/recording/GetRecordingsUseCase');
const DeleteRecordingUseCase = require('../../usecases/recording/DeleteRecordingUseCase');
const RecordingRepository = require('../../infrastructure/repositories/RecordingRepository');
const CameraRepository = require('../../infrastructure/repositories/CameraRepository');

const recordingRepository = new RecordingRepository();
const cameraRepository = new CameraRepository();
const uploadRecording = new UploadRecordingUseCase(recordingRepository, cameraRepository);
const getRecordings = new GetRecordingsUseCase(recordingRepository, cameraRepository);
const deleteRecording = new DeleteRecordingUseCase(recordingRepository);

exports.uploadRecording = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'Admin';
        const recording = await uploadRecording.execute(req.file, req.params.cameraId, req.user._id, isAdmin);
        res.status(201).json({ message: 'Recording uploaded successfully', recording });
        // شغل الـ AI في الـ background تلقائي
        analyzeVideoInBackground(recording);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};

exports.getRecordings = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'Admin';
        const recordings = await getRecordings.execute(req.params.cameraId, req.user._id, isAdmin);
        res.status(200).json(recordings);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};

exports.deleteRecording = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'Admin';
        await deleteRecording.execute(req.params.id, isAdmin);
        res.status(200).json({ message: 'Recording deleted successfully' });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};

exports.analyzeRecording = async (req, res) => {
    try {
        const RecordingModel = require('../../infrastructure/models/RecordingModel');
        const recording = await RecordingModel.findById(req.params.id);
        if (!recording) return res.status(404).json({ message: 'Recording not found' });
        res.json({ message: 'Analysis started', recordingId: recording._id });
        analyzeVideoInBackground(recording);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

async function analyzeVideoInBackground(recording) {
    const fetch = require('node-fetch');
    const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

    try {
        console.log(`[AI Recording] Analyzing: ${recording.originalName}`);
        const frames = await extractFramesFromVideo(recording.path);

        if (frames.length === 0) {
            console.error('[AI Recording] No frames extracted');
            return;
        }

        console.log(`[AI Recording] Extracted ${frames.length} frames`);

        const BATCH_SIZE = 16;
        const results = [];

        for (let i = 0; i < frames.length; i += BATCH_SIZE) {
            const batch = frames.slice(i, i + BATCH_SIZE);
            try {
                const response = await fetch(`${AI_URL}/predict`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        frames: batch,
                        timestamp: new Date().toISOString(),
                        save_features: false
                    }),
                    timeout: 30000
                });

                if (response.ok) {
                    const result = await response.json();
                    result.batchIndex = Math.floor(i / BATCH_SIZE);
                    result.batchStartTime = (i / 8);
                    result.batchEndTime = ((i + batch.length) / 8);
                    results.push(result);
                    console.log(`[AI Recording] Batch ${result.batchIndex+1}: score=${result.anomaly_score?.toFixed(3)} class=${result.predicted_class}`);
                    console.log(`[AI Recording] Batch ${result.batchIndex+1} FULL RESULT:`, JSON.stringify(result, null, 2));
                }
            } catch (err) {
                console.error(`[AI Recording] Batch error: ${err.message}`);
            }
        }

        if (results.length > 0) {
            const worstResult = results.reduce((max, r) => r.anomaly_score > max.anomaly_score ? r : max);

            if (worstResult.anomaly_score > 0.05) {
                const EventModel = require('../../infrastructure/models/EventModel');

                const boundingBoxes = results
                    .filter(r => r.localisation && r.localisation.bounding_boxes && r.localisation.bounding_boxes.length > 0)
                    .map(r => ({
                        startTime: r.batchStartTime,
                        endTime: r.batchEndTime,
                        frameSize: 224,
                        boxes: r.localisation.bounding_boxes.map(b => ({
                            x1: b.x1, y1: b.y1, x2: b.x2, y2: b.y2,
                            anomalyScore: b.anomaly_score,
                        })),
                    }));

                await EventModel.create({
                    cameraId: recording.cameraId,
                    type: worstResult.predicted_class,
                    severity: worstResult.anomaly_score > 0.8 ? 'high' : worstResult.anomaly_score > 0.5 ? 'medium' : 'low',
                    description: `Anomaly in recording "${recording.originalName}": ${worstResult.predicted_class} (score: ${worstResult.anomaly_score.toFixed(2)})`,
                    anomalyScore: worstResult.anomaly_score,
                    confidence: worstResult.class_confidence,
                    recordingId: recording._id,
                    recordingPath: recording.path,
                    recordingName: recording.originalName,
                    clipStartTime: Math.max(0, (worstResult.batchIndex || 0) * BATCH_SIZE - 2),
                    boundingBoxes,
                });
                console.log(`[AI Recording] Event saved: ${worstResult.predicted_class}`);

                try {
                    const WHATSAPP_DAEMON_URL = process.env.WHATSAPP_DAEMON_URL || 'http://localhost:5050';
                    const CameraModel = require('../../infrastructure/models/CameraModel');
                    const camera = await CameraModel.findById(recording.cameraId);
                    const alertPhone = process.env.ALERT_PHONE_NUMBER;

                    if (alertPhone) {
                        let alertSent = false;
                        try {
                            const alertResp = await fetch(`${WHATSAPP_DAEMON_URL}/send-alert`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    phoneNumber: alertPhone,
                                    data: {
                                                type: worstResult.predicted_class,
                                                cameraName: camera?.name || 'Unknown',
                                                predictedClass: worstResult.predicted_class,
                                                anomalyScore: worstResult.anomaly_score,
                                    },
                                }),
                            });
                            const alertJson = await alertResp.json();
                            alertSent = !!alertJson.sent;
                        } catch (daemonErr) {
                            console.error('[AI Recording] WhatsApp daemon unreachable:', daemonErr.message);
                        }
                        console.log(alertSent ? '[AI Recording] WhatsApp alert sent' : '[AI Recording] WhatsApp alert FAILED (daemon not ready/reachable?)');

                        // Extract and send a short clip around the anomaly
                        try {
                            const { execFile } = require('child_process');
                            const path = require('path');
                            const os = require('os');
                            const util = require('util');
                            const execFileAsync = util.promisify(execFile);

                            const clipStart = Math.max(0, (worstResult.batchIndex || 0) * BATCH_SIZE - 2);
                            const clipDuration = 10; // seconds
                            const outputPath = path.join(os.tmpdir(), `clip_${recording._id}_${Date.now()}.mp4`);

                            await execFileAsync('ffmpeg', [
                                '-ss', String(clipStart),
                                '-i', recording.path,
                                '-t', String(clipDuration),
                                '-c', 'copy',
                                '-y',
                                outputPath
                            ]);

                            let clipSent = false;
                            try {
                                const mediaResp = await fetch(`${WHATSAPP_DAEMON_URL}/send-media`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        phoneNumber: alertPhone,
                                        filePath: outputPath,
                                        caption: `🎥 Clip: ${worstResult.predicted_class} - ${camera?.name || 'Unknown'}`,
                                    }),
                                });
                                const mediaJson = await mediaResp.json();
                                clipSent = !!mediaJson.sent;
                            } catch (daemonErr) {
                                console.error('[AI Recording] WhatsApp daemon unreachable (media):', daemonErr.message);
                            }
                            console.log(clipSent ? '[AI Recording] WhatsApp clip sent' : '[AI Recording] WhatsApp clip FAILED (daemon not ready/reachable?)');

                            fs.unlink(outputPath, () => {});
                        } catch (clipErr) {
                            console.error('[AI Recording] Clip extraction/send error:', clipErr.message);
                        }
                    } else {
                        console.log('[AI Recording] ALERT_PHONE_NUMBER not set, skipping WhatsApp alert');
                    }
                } catch (err) {
                    console.error('[AI Recording] WhatsApp alert error:', err.message);
                }
            } else {
                console.log(`[AI Recording] Normal - score: ${worstResult.anomaly_score.toFixed(3)}`);
            }

            const RecordingModel = require('../../infrastructure/models/RecordingModel');
            await RecordingModel.findByIdAndUpdate(recording._id, {
                aiAnalyzed: true,
                aiResult: {
                    anomalyScore: worstResult.anomaly_score,
                    isAnomaly: worstResult.is_anomaly,
                    predictedClass: worstResult.predicted_class,
                    confidence: worstResult.class_confidence,
                }
            });
        }

        console.log(`[AI Recording] Done: ${recording.originalName}`);
    } catch (err) {
        console.error(`[AI Recording] Error: ${err.message}`);
    }
}

async function extractFramesFromVideo(videoPath) {
    const { execSync } = require('child_process');
    const fs = require('fs');
    const path = require('path');
    const os = require('os');

    const frames = [];
    const tempDir = path.join(os.tmpdir(), `frames_${Date.now()}`);

    try {
        fs.mkdirSync(tempDir, { recursive: true });

        let inputPath = videoPath;
        if (videoPath.startsWith('http')) {
            const fetch = require('node-fetch');
            const tempVideo = path.join(tempDir, 'video.mp4');
            const response = await fetch(videoPath);
            const buffer = await response.buffer();
            fs.writeFileSync(tempVideo, buffer);
            inputPath = tempVideo;
        }

        execSync(`ffmpeg -i "${inputPath}" -vf "fps=8,scale=224:224" -q:v 2 "${tempDir}/frame_%04d.jpg" -y 2>/dev/null`, {
            timeout: 60000
        });

        const files = fs.readdirSync(tempDir)
            .filter(f => f.endsWith('.jpg'))
            .sort()
            .slice(0, 128);

        for (const file of files) {
            const filePath = path.join(tempDir, file);
            const buffer = fs.readFileSync(filePath);
            frames.push(buffer.toString('base64'));
        }

    } catch (err) {
        console.error('[AI Recording] Frame extraction error:', err.message);
    } finally {
        try { require('fs').rmSync(tempDir, { recursive: true }); } catch(e) {}
    }

    return frames;
}

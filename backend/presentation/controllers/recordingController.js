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
                    results.push(result);
                    console.log(`[AI Recording] Batch ${Math.floor(i/BATCH_SIZE)+1}: score=${result.anomaly_score?.toFixed(3)} class=${result.predicted_class}`);
                }
            } catch (err) {
                console.error(`[AI Recording] Batch error: ${err.message}`);
            }
        }

        if (results.length > 0) {
            const worstResult = results.reduce((max, r) => r.anomaly_score > max.anomaly_score ? r : max);

            if (worstResult.is_anomaly) {
                const EventModel = require('../../infrastructure/models/EventModel');
                await EventModel.create({
                    cameraId: recording.cameraId,
                    type: worstResult.predicted_class,
                    severity: worstResult.anomaly_score > 0.8 ? 'high' : worstResult.anomaly_score > 0.5 ? 'medium' : 'low',
                    description: `Anomaly in recording "${recording.originalName}": ${worstResult.predicted_class} (score: ${worstResult.anomaly_score.toFixed(2)})`,
                    anomalyScore: worstResult.anomaly_score,
                    confidence: worstResult.class_confidence,
                });
                console.log(`[AI Recording] Event saved: ${worstResult.predicted_class}`);
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

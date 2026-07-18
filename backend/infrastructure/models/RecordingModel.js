const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    cameraId: { type: mongoose.Schema.Types.ObjectId, ref: 'Camera', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    aiAnalyzed: { type: Boolean, default: false },
    aiResult: {
        anomalyScore: Number,
        isAnomaly: Boolean,
        predictedClass: String,
        confidence: Number,
    }
}, { timestamps: true });

module.exports = mongoose.model('Recording', recordingSchema);

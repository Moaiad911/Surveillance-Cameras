const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  type: { type: String, required: true, default: 'Motion Detected' },
  cameraId: { type: mongoose.Schema.Types.ObjectId, ref: 'Camera', required: true },
  camera: { type: String, default: '' },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  description: { type: String, default: '' },
  anomalyScore: { type: Number, default: 0 },
  confidence: { type: Number, default: 0 },
  acknowledged: { type: Boolean, default: false },
  feedback: { type: String, enum: ['pending', 'correct', 'false_alarm'], default: 'pending' },
  recordingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recording' },
  recordingPath: { type: String },
  recordingName: { type: String },
  clipStartTime: { type: Number },
  boundingBoxes: [{
    startTime: Number,
    endTime: Number,
    frameSize: { type: Number, default: 224 },
    boxes: [{
      x1: Number, y1: Number, x2: Number, y2: Number,
      anomalyScore: Number,
    }],
  }],
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);

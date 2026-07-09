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
  recordingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recording' },
  recordingPath: { type: String },
  recordingName: { type: String },
  clipStartTime: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);

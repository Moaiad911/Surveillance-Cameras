const mongoose = require('mongoose');

const cameraSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    model: {
        type: String,
        required: true,
        trim: true
    },
    ipAddress: {
        type: String,
        required: true,
        trim: true,
        match: /^(\d{1,3}\.){3}\d{1,3}$/ // Validate IP address format
    },
    streamURL: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    resolution: {
        type: String,
        required: true,
        trim: true,
        enum: ['1280x720', '1920x1080', '2560x1440', '3840x2160', '1024x768', '1600x1200', '2048x1536']
    },
    frameRate: {
        type: Number,
        required: true,
        min: 1,
        max: 120
    },
    recording: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Camera', cameraSchema);

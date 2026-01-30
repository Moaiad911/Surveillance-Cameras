const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Using default _id (ObjectId) which is standard for Mongo, works for 'int' equivalent on frontend if just treated as ID string
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Admin', 'Operator'],
        default: 'Operator'
    }
}, {
    timestamps: true // Adds createdAt, updatedAt automatically
});

module.exports = mongoose.model('User', userSchema);

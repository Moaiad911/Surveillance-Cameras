const RecordingModel = require('../models/RecordingModel');
const IRecordingRepository = require('../../domain/repositories/IRecordingRepository');

class RecordingRepository extends IRecordingRepository {
    async create(recordingData) {
        const recording = new RecordingModel(recordingData);
        return await recording.save();
    }

    async findById(id) {
        return await RecordingModel.findById(id);
    }

    async findByCamera(cameraId, userId, isAdmin) {
        if (isAdmin) {
            return await RecordingModel.find({ cameraId });
        }
        return await RecordingModel.find({ cameraId, uploadedBy: userId });
    }

    async delete(id) {
        return await RecordingModel.findByIdAndDelete(id);
    }
}

module.exports = RecordingRepository;

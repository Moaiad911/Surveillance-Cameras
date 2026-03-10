const RecordingModel = require('../../infrastructure/models/RecordingModel');

class UploadRecordingUseCase {
  async execute(file, cameraId, uploadedBy) {
    const recording = new RecordingModel({
      filename: file.filename || file.public_id,
      originalName: file.originalname,
      path: file.path,
      size: file.size || 0,
      cameraId,
      uploadedBy,
    });
    return await recording.save();
  }
}

module.exports = UploadRecordingUseCase;

const RecordingModel = require('../../infrastructure/models/RecordingModel');

class UploadRecordingUseCase {
  constructor(recordingRepository, cameraRepository) {
    this.recordingRepository = recordingRepository;
    this.cameraRepository = cameraRepository;
  }

  async execute(file, cameraId, uploadedBy) {
    if (!file) throw { status: 400, message: 'No file uploaded' };

    const recording = new RecordingModel({
      filename: file.filename || file.public_id || file.originalname,
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

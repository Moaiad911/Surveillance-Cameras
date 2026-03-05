class UploadRecordingUseCase {
    constructor(recordingRepository, cameraRepository) {
        this.recordingRepository = recordingRepository;
        this.cameraRepository = cameraRepository;
    }

    async execute(file, cameraId, userId, isAdmin) {
        if (!file) {
            throw { status: 400, message: 'No video file provided' };
        }

        const camera = await this.cameraRepository.findById(cameraId, isAdmin ? null : userId);
        if (!camera) {
            throw { status: 404, message: 'Camera not found or access denied' };
        }

        const recording = await this.recordingRepository.create({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
            cameraId,
            uploadedBy: userId
        });

        return recording;
    }
}

module.exports = UploadRecordingUseCase;

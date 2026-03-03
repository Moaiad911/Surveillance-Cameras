class GetRecordingsUseCase {
    constructor(recordingRepository, cameraRepository) {
        this.recordingRepository = recordingRepository;
        this.cameraRepository = cameraRepository;
    }

    async execute(cameraId, userId, isAdmin) {
        const camera = await this.cameraRepository.findById(cameraId, isAdmin ? null : userId);
        if (!camera) {
            throw { status: 404, message: 'Camera not found or access denied' };
        }

        return await this.recordingRepository.findByCamera(cameraId, userId, isAdmin);
    }
}

module.exports = GetRecordingsUseCase;

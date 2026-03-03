class GetCameraByIdUseCase {
    constructor(cameraRepository) {
        this.cameraRepository = cameraRepository;
    }

    async execute(id, userId) {
        const camera = await this.cameraRepository.findById(id, userId);
        if (!camera) {
            throw { status: 404, message: 'Camera not found or access denied' };
        }
        return camera;
    }
}

module.exports = GetCameraByIdUseCase;

class DeleteCameraUseCase {
    constructor(cameraRepository) {
        this.cameraRepository = cameraRepository;
    }

    async execute(id, userId) {
        const deleted = await this.cameraRepository.delete(id, userId);
        if (!deleted) {
            throw { status: 404, message: 'Camera not found or access denied' };
        }
        return deleted;
    }
}

module.exports = DeleteCameraUseCase;

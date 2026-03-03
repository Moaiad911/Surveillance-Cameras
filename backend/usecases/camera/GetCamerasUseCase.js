class GetCamerasUseCase {
    constructor(cameraRepository) {
        this.cameraRepository = cameraRepository;
    }

    async execute(userId) {
        return await this.cameraRepository.findAllByUser(userId);
    }
}

module.exports = GetCamerasUseCase;

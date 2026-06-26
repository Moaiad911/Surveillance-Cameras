class GetCamerasUseCase {
    constructor(cameraRepository) {
        this.cameraRepository = cameraRepository;
    }
    async execute(userId, isAdmin) {
        if (isAdmin) {
            return await this.cameraRepository.findAll();
        }
        return await this.cameraRepository.findAllByUser(userId);
    }
}
module.exports = GetCamerasUseCase;

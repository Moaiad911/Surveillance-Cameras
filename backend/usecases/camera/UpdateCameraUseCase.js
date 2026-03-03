class UpdateCameraUseCase {
    constructor(cameraRepository) {
        this.cameraRepository = cameraRepository;
    }

    async execute(id, userId, cameraData) {
        const { ipAddress, frameRate, resolution } = cameraData;

        if (ipAddress) {
            const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
            if (!ipRegex.test(ipAddress)) {
                throw { status: 400, message: 'Invalid IP address format' };
            }
        }

        if (frameRate !== undefined && (frameRate < 1 || frameRate > 120)) {
            throw { status: 400, message: 'Frame rate must be between 1 and 120' };
        }

        if (resolution) {
            const validResolutions = ['1280x720', '1920x1080', '2560x1440', '3840x2160', '1024x768', '1600x1200', '2048x1536'];
            if (!validResolutions.includes(resolution)) {
                throw { status: 400, message: `Invalid resolution. Valid options: ${validResolutions.join(', ')}` };
            }
        }

        const updated = await this.cameraRepository.update(id, userId, cameraData);
        if (!updated) {
            throw { status: 404, message: 'Camera not found or access denied' };
        }
        return updated;
    }
}

module.exports = UpdateCameraUseCase;

class CreateCameraUseCase {
    constructor(cameraRepository) {
        this.cameraRepository = cameraRepository;
    }

    async execute(cameraData, userId) {
        const { name, model, ipAddress, streamURL, location, resolution, frameRate, recording, status } = cameraData;

        if (!name || !model || !ipAddress || !streamURL || !location || !resolution || frameRate === undefined) {
            throw { status: 400, message: 'Name, Model, IP Address, Stream URL, Location, Resolution, and Frame Rate are required' };
        }

        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!ipRegex.test(ipAddress)) {
            throw { status: 400, message: 'Invalid IP address format' };
        }

        if (frameRate < 1 || frameRate > 120) {
            throw { status: 400, message: 'Frame rate must be between 1 and 120' };
        }

        const validResolutions = ['1280x720', '1920x1080', '2560x1440', '3840x2160', '1024x768', '1600x1200', '2048x1536'];
        if (!validResolutions.includes(resolution)) {
            throw { status: 400, message: `Invalid resolution. Valid options: ${validResolutions.join(', ')}` };
        }

        return await this.cameraRepository.create({
            name, model, ipAddress, streamURL, location, resolution,
            frameRate,
            recording: recording !== undefined ? recording : true,
            status: status || 'Active',
            createdBy: userId
        });
    }
}

module.exports = CreateCameraUseCase;

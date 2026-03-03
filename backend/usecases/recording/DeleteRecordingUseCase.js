const fs = require('fs');

class DeleteRecordingUseCase {
    constructor(recordingRepository) {
        this.recordingRepository = recordingRepository;
    }

    async execute(id, isAdmin) {
        if (!isAdmin) {
            throw { status: 403, message: 'Only admins can delete recordings' };
        }

        const recording = await this.recordingRepository.findById(id);
        if (!recording) {
            throw { status: 404, message: 'Recording not found' };
        }

        if (fs.existsSync(recording.path)) {
            fs.unlinkSync(recording.path);
        }

        await this.recordingRepository.delete(id);
        return recording;
    }
}

module.exports = DeleteRecordingUseCase;

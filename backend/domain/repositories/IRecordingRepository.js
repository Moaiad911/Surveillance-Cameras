class IRecordingRepository {
    async create(recordingData) { throw new Error('Not implemented'); }
    async findById(id) { throw new Error('Not implemented'); }
    async findByCamera(cameraId, userId, isAdmin) { throw new Error('Not implemented'); }
    async delete(id) { throw new Error('Not implemented'); }
}

module.exports = IRecordingRepository;

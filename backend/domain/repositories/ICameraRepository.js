class ICameraRepository {
    async findById(id, userId) { throw new Error('Not implemented'); }
    async findAllByUser(userId) { throw new Error('Not implemented'); }
    async create(cameraData) { throw new Error('Not implemented'); }
    async update(id, userId, cameraData) { throw new Error('Not implemented'); }
    async delete(id, userId) { throw new Error('Not implemented'); }
}

module.exports = ICameraRepository;

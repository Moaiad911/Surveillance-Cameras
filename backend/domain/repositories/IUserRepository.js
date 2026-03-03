class IUserRepository {
    async findById(id) { throw new Error('Not implemented'); }
    async findByUsername(username) { throw new Error('Not implemented'); }
    async create(userData) { throw new Error('Not implemented'); }
    async update(id, userData) { throw new Error('Not implemented'); }
    async delete(id) { throw new Error('Not implemented'); }
    async findAll() { throw new Error('Not implemented'); }
}

module.exports = IUserRepository;

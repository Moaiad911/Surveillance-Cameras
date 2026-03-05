class IEventRepository {
    async findAll() { throw new Error('Not implemented'); }
    async findRecent(limit) { throw new Error('Not implemented'); }
    async create(eventData) { throw new Error('Not implemented'); }
    async acknowledge(id) { throw new Error('Not implemented'); }
}

module.exports = IEventRepository;

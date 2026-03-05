/**
 * @interface IUserRepository
 */
class IUserRepository {
    /**
     * @param {*} doc
     * @returns {User}
     */
    toEntity(doc) {
        throw new Error('Method not implemented');
    }

    /**
     * @param {string} id
     * @returns {Promise<User|null>}
     */
    async findById(id) {
        throw new Error('Method not implemented');
    }

    /**
     * @param {string} username
     * @returns {Promise<User|null>}
     */
    async findByUsername(username) {
        throw new Error('Method not implemented');
    }

    /**
     * @returns {Promise<User[]>}
     */
    async findAll() {
        throw new Error('Method not implemented');
    }

    /**
     * @param {User} user
     * @returns {Promise<User>}
     */
    async create(user) {
        throw new Error('Method not implemented');
    }

    /**
     * @param {string} id
     * @param {Object} user
     * @returns {Promise<User|null>}
     */
    async update(id, user) {
        throw new Error('Method not implemented');
    }

    /**
     * @param {string} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        throw new Error('Method not implemented');
    }
}

module.exports = { IUserRepository };

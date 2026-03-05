/**
 * @interface ICameraRepository
 */
class ICameraRepository {
    /**
     * @param {*} doc
     * @returns {Camera}
     */
    toEntity(doc) {
        throw new Error('Method not implemented');
    }

    /**
     * @param {string} id
     * @returns {Promise<Camera|null>}
     */
    async findById(id) {
        throw new Error('Method not implemented');
    }

    /**
     * @returns {Promise<Camera[]>}
     */
    async findAll() {
        throw new Error('Method not implemented');
    }

    /**
     * @param {Camera} camera
     * @returns {Promise<Camera>}
     */
    async create(camera) {
        throw new Error('Method not implemented');
    }

    /**
     * @param {string} id
     * @param {Object} camera
     * @returns {Promise<Camera|null>}
     */
    async update(id, camera) {
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

module.exports = { ICameraRepository };

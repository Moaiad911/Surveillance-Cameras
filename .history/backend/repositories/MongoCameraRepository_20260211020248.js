const CameraModel = require('../models/Camera');
const { Camera } = require('../entities/Camera');

class MongoCameraRepository {
    // @ts-ignore
    /**
     * @param {*} doc
     */
    toEntity(doc) {
        return new Camera(
            doc._id.toString(),
            doc.name,
            doc.streamURL,
            doc.location,
            doc.status,
            doc.createdBy.toString()
        );
    }

    /**
     * @param {string} id
     */
    async findById(id) {
        const doc = await CameraModel.findById(id);
        // @ts-ignore
        return doc ? this.toEntity(doc) : null;
    }

    async findAll() {
        const docs = await CameraModel.find();
        // @ts-ignore
        return docs.map(doc => this.toEntity(doc));
    }

    /**
     * @param {Camera} camera
     */
    async create(camera) {
        const doc = await CameraModel.create(camera);
        // @ts-ignore
        return this.toEntity(doc);
    }

    /**
     * @param {string} id
     * @param {Object} camera
     */
    async update(id, camera) {
        const doc = await CameraModel.findByIdAndUpdate(id, camera, { new: true });
        return doc ? this.toEntity(doc) : null;
    }

    /**
     * @param {string} id
     */
    async delete(id) {
        await CameraModel.findByIdAndDelete(id);
    }
}

module.exports = { MongoCameraRepository };

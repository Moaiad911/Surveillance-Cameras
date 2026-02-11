const CameraModel = require('../models/Camera');
const { Camera } = require('../entities/Camera');

class MongoCameraRepository {
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

    async findById(id) {
        const doc = await CameraModel.findById(id);
        return doc ? this.toEntity(doc) : null;
    }

    async findAll() {
        const docs = await CameraModel.find();
        return docs.map(doc => this.toEntity(doc));
    }

    async create(camera) {
        const doc = await CameraModel.create(camera);
        return this.toEntity(doc);
    }

    async update(id, camera) {
        const doc = await CameraModel.findByIdAndUpdate(id, camera, { new: true });
        return doc ? this.toEntity(doc) : null;
    }

    async delete(id) {
        await CameraModel.findByIdAndDelete(id);
    }
}

module.exports = { MongoCameraRepository };

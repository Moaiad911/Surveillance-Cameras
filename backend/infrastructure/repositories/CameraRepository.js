const CameraModel = require('../models/CameraModel');
const ICameraRepository = require('../../domain/repositories/ICameraRepository');

class CameraRepository extends ICameraRepository {
    async findById(id, userId) {
        if (!userId) {
            return await CameraModel.findById(id);
        }
        return await CameraModel.findOne({ _id: id, createdBy: userId });
    }

    async findAllByUser(userId) {
        return await CameraModel.find({ createdBy: userId });
    }

    async create(cameraData) {
        const camera = new CameraModel(cameraData);
        return await camera.save();
    }

    async update(id, userId, cameraData) {
        const camera = await CameraModel.findOne({ _id: id, createdBy: userId });
        if (!camera) return null;
        Object.assign(camera, cameraData);
        return await camera.save();
    }

    async delete(id, userId) {
        const camera = await CameraModel.findOne({ _id: id, createdBy: userId });
        if (!camera) return null;
        await camera.deleteOne();
        return camera;
    }
}

module.exports = CameraRepository;

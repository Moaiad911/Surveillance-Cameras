import { Camera } from '../entities/Camera';

/**
 * @typedef {import('../interfaces/ICameraRepository').ICameraRepository} ICameraRepository
 */

class CameraService {
    /**
     * @param {ICameraRepository} cameraRepo
     */
    constructor(cameraRepo) {
        this.cameraRepo = cameraRepo;
    }

    async getAllCameras() {
        return this.cameraRepo.findAll();
    }

    /**
     * @param {string} id
     */
    async getCameraById(id) {
        return this.cameraRepo.findById(id);
    }

    /**
     * @param {Object} data
     * @param {string} data.name
     * @param {string} data.streamURL
     * @param {string} data.location
     * @param {string} data.status
     * @param {string} data.createdBy
     */
    async createCamera(data) {
        const camera = new Camera(
            '',
            data.name,
            data.streamURL,
            data.location,
            data.status,
            data.createdBy
        );
        return this.cameraRepo.create(camera);
    }

    /**
     * @param {string} id
     * @param {Partial<Camera>} data
     */
    async updateCamera(id, data) {
        return this.cameraRepo.update(id, data);
    }

    /**
     * @param {string} id
     */
    async deleteCamera(id) {
        return this.cameraRepo.delete(id);
    }
}

module.exports = { CameraService };

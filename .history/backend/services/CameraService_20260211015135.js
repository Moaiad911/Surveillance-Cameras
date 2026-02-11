import { Camera } from '../entities/Camera';

class CameraService {
    constructor(cameraRepo) {
        this.cameraRepo = cameraRepo;
    }

    async getAllCameras() {
        return this.cameraRepo.findAll();
    }

    async getCameraById(id) {
        return this.cameraRepo.findById(id);
    }

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

    async updateCamera(id, data) {
        return this.cameraRepo.update(id, data);
    }

    async deleteCamera(id) {
        return this.cameraRepo.delete(id);
    }
}

module.exports = { CameraService };

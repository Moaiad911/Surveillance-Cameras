import { ICameraRepository } from "../interfaces/ICameraRepository";
import { Camera } from "../entities/Camera";

export class CameraService {
    constructor(private cameraRepo: ICameraRepository) {}

    async getAllCameras(): Promise<Camera[]> {
        return this.cameraRepo.findAll();
    }

    async getCameraById(id: string): Promise<Camera | null> {
        return this.cameraRepo.findById(id);
    }

    async createCamera(data: Omit<Camera, 'id'>): Promise<Camera> {
        const camera = new Camera('', data.name, data.streamURL, data.location, data.status, data.createdBy);
        return this.cameraRepo.create(camera);
    }

    async updateCamera(id: string, data: Partial<Camera>, userId?: string): Promise<Camera | null> {
        return this.cameraRepo.update(id, data);
    }

    async deleteCamera(id: string, userId?: string): Promise<boolean> {
        return this.cameraRepo.delete(id, userId);
    }
}

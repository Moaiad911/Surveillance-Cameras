import { Camera } from "../entities/Camera";

export interface ICameraRepository {
    findById(id: string, userId?: string): Promise<Camera | null>;
    findAll(userId?: string): Promise<Camera[]>;
    create(camera: Camera): Promise<Camera>;
    update(id: string, camera: Partial<Camera>, userId?: string): Promise<Camera | null>;
    delete(id: string, userId?: string): Promise<boolean>;
}

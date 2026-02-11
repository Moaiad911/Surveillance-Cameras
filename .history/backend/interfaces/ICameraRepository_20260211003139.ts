import { Camera } from "../entities/Camera";

export interface ICameraRepository {
    findById(id: string): Promise<Camera | null>;
    findAll(): Promise<Camera[]>;
    create(camera: Camera): Promise<Camera>;
    update(id: string, camera: Partial<Camera>): Promise<Camera | null>;
    delete(id: string): Promise<boolean>;
}

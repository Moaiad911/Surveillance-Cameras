// src/repositories/MongoCameraRepository.ts
const CameraModel = require('../models/Camera');
import { ICameraRepository } from "../interfaces/ICameraRepository";
import { Camera } from "../entities/Camera";

export class MongoCameraRepository implements ICameraRepository {

    private toEntity(doc: any): Camera {
        return new Camera(
            doc._id.toString(),
            doc.name,
            doc.streamURL,
            doc.location,
            doc.status,
            doc.createdBy.toString()
        );
    }

    async findById(id: string, userId?: string): Promise<Camera | null> {
        const doc = await CameraModel.findById(id);
        return doc ? this.toEntity(doc) : null;
    }

    async findAll(): Promise<Camera[]> {
        const docs = await CameraModel.find();
        return docs.map(this.toEntity);
    }

    async create(camera: Camera): Promise<Camera> {
        const doc = await CameraModel.create(camera);
        return this.toEntity(doc);
    }

    async update(id: string, camera: Partial<Camera>): Promise<Camera | null> {
        const doc = await CameraModel.findByIdAndUpdate(id, camera, { new: true });
        return doc ? this.toEntity(doc) : null;
    }

    async delete(id: string): Promise<boolean> {
        const doc = await CameraModel.findByIdAndDelete(id);
        return !!doc;
    }
}

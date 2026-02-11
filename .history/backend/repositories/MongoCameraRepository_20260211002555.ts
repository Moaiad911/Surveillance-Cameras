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
        const query: any = { _id: id };
        if (userId) {
            query.createdBy = userId;
        }
        const doc = await CameraModel.findOne(query);
        return doc ? this.toEntity(doc) : null;
    }

    async findAll(userId?: string): Promise<Camera[]> {
        const query: any = {};
        if (userId) {
            query.createdBy = userId;
        }
        const docs = await CameraModel.find(query);
        return docs.map(this.toEntity);
    }

    async create(camera: Camera): Promise<Camera> {
        const doc = await CameraModel.create(camera);
        return this.toEntity(doc);
    }

    async update(id: string, camera: Partial<Camera>, userId?: string): Promise<Camera | null> {
        const query: any = { _id: id };
        if (userId) {
            query.createdBy = userId;
        }
        const doc = await CameraModel.findOneAndUpdate(query, camera, { new: true });
        return doc ? this.toEntity(doc) : null;
    }

    async delete(id: string, userId?: string): Promise<boolean> {
        const query: any = { _id: id };
        if (userId) {
            query.createdBy = userId;
        }
        const doc = await CameraModel.findOneAndDelete(query);
        return !!doc;
    }
}

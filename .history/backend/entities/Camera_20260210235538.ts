export class Camera {
    constructor(
        public id: string,
        public name: string,
        public streamURL: string,
        public location: string,
        public status: 'Active' | 'Inactive',
        public createdBy: string
    ) {}
}
لاحظ: مفيش mongoose هنا، مجرد class يمثل الـ Domain Object.

2️⃣ Interface – ICameraRepository
الـ Interface لتحديد الوظائف اللي الـ Service هتستخدمها:

// src/interfaces/ICameraRepository.ts
import { Camera } from "../entities/Camera";

export interface ICameraRepository {
    findById(id: string): Promise<Camera | null>;
    findAll(): Promise<Camera[]>;
    create(camera: Camera): Promise<Camera>;
    update(id: string, camera: Partial<Camera>): Promise<Camera | null>;
    delete(id: string): Promise<void>;
}
دي مجرد Contract، مفيش فيها DB logic.

3️⃣ Repository Implementation – MongoCameraRepository
هنا هنربط بين الـ Entity و الـ Mongoose Model:

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

    async findById(id: string): Promise<Camera | null> {
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

    async delete(id: string): Promise<void> {
        await CameraModel.findByIdAndDelete(id);
    }
}
هنا الـ Repository هو Mapper بين Entity و DB Model.

4️⃣ Service – CameraService
بتاخد Repository كـ Dependency، ومفيهاش معرفة بالـ DB:

// src/services/CameraService.ts
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

    async updateCamera(id: string, data: Partial<Camera>): Promise<Camera | null> {
        return this.cameraRepo.update(id, data);
    }

    async deleteCamera(id: string): Promise<void> {
        return this.cameraRepo.delete(id);
    }
}
لاحظ: Service لا تعرف شيء عن Mongoose، كلها تعتمد على Interface بس.

5️⃣ Route – camera.routes.ts
// src/routes/camera.routes.ts
import express from 'express';
import { CameraController } from '../controllers/CameraController';

const router = express.Router();
const controller = new CameraController();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
✅ دلوقتي عندك Camera Module كامل على Clean Architecture:

Entity

Interface (ICameraRepository)

MongoRepository

Service

Controller

Routes

لو تحب، أقدر أعمللك Template جاهز لكل Modules على نفس الاستراكشر بحيث تنقل الباقي بسهولة وتبقى الشجرة كلها جاهزة على البرانش الجديد.

تحب أعمله؟



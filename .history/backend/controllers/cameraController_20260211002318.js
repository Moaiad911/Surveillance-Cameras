// src/controllers/CameraController.ts
import { CameraService } from '../services/CameraService';
import { MongoCameraRepository } from '../repositories/MongoCameraRepository';

// انشاء Repository و Service
const cameraRepo = new MongoCameraRepository();
const cameraService = new CameraService(cameraRepo);

export class CameraController {

    // GET /cameras
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?._id as string;
            const cameras = await cameraService.getAllCameras(userId);
            res.status(200).json(cameras);
        } catch (error) {
            console.error('Get Cameras Error:', error);
            res.status(500).json({ message: 'Server error while fetching cameras' });
        }
    }

    // GET /cameras/:id
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const userId = req.user?._id as string;
            const camera = await cameraService.getCameraById(id, userId);

            if (!camera) {
                res.status(404).json({ message: 'Camera not found' });
                return;
            }

            res.status(200).json(camera);
        } catch (error) {
            console.error('Get Camera Error:', error);
            res.status(500).json({ message: 'Server error while fetching camera' });
        }
    }

    // POST /cameras
    async create(req: Request, res: Response): Promise<void> {
        try {
            const { name, streamURL, location, status } = req.body;

            if (!name || !streamURL || !location) {
                res.status(400).json({ message: 'Name, Stream URL, and Location are required' });
                return;
            }

            const userId = req.user?._id as string;

            const newCamera = await cameraService.createCamera({
                name,
                streamURL,
                location,
                status: status || 'Active',
                createdBy: userId
            });

            res.status(201).json({
                message: 'Camera created successfully',
                camera: newCamera
            });
        } catch (error) {
            console.error('Create Camera Error:', error);
            res.status(500).json({ message: 'Server error while creating camera' });
        }
    }

    // PUT /cameras/:id
    async update(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const userId = req.user?._id as string;

            const updatedCamera = await cameraService.updateCamera(id, req.body, userId);

            if (!updatedCamera) {
                res.status(404).json({ message: 'Camera not found or access denied' });
                return;
            }

            res.status(200).json({
                message: 'Camera updated successfully',
                camera: updatedCamera
            });
        } catch (error) {
            console.error('Update Camera Error:', error);
            res.status(500).json({ message: 'Server error while updating camera' });
        }
    }

    // DELETE /cameras/:id
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const userId = req.user?._id as string;

            const deleted = await cameraService.deleteCamera(id, userId);

            if (!deleted) {
                res.status(404).json({ message: 'Camera not found or access denied' });
                return;
            }

            res.status(200).json({ message: 'Camera deleted successfully' });
        } catch (error) {
            console.error('Delete Camera Error:', error);
            res.status(500).json({ message: 'Server error while deleting camera' });
        }
    }
}

// Export instance
export const cameraController = new CameraController();

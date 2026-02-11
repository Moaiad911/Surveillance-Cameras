// src/controllers/CameraController.ts
import { Request, Response } from 'express';
import { CameraService } from '../services/CameraService';

// هنا هنفترض إنك هتعمل Inject للـ Service من بره
const cameraService = new CameraService(/* هنا تمرر الـ Repository المناسب */);

export class CameraController {

    // GET /cameras
    async getAll(req: Request, res: Response) {
        try {
            const cameras = await cameraService.getAllCameras();
            res.status(200).json(cameras);
        } catch (error) {
            console.error('Get Cameras Error:', error);
            res.status(500).json({ message: 'Server error while fetching cameras' });
        }
    }

    // GET /cameras/:id
    async getById(req: Request, res: Response) {
        try {
            const camera = await cameraService.getCameraById(req.params.id);
            if (!camera) {
                return res.status(404).json({ message: 'Camera not found' });
            }
            res.status(200).json(camera);
        } catch (error) {
            console.error('Get Camera Error:', error);
            res.status(500).json({ message: 'Server error while fetching camera' });
        }
    }

    // POST /cameras
    async create(req: Request, res: Response) {
        try {
            const { name, streamURL, location, status } = req.body;

            // Validation
            if (!name || !streamURL || !location) {
                return res.status(400).json({ message: 'Name, Stream URL, and Location are required' });
            }

            // هنا Service هيعمل الـ Creation
            const newCamera = await cameraService.createCamera({
                name,
                streamURL,
                location,
                status: status || 'Active',
                createdBy: req.user._id
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
    async update(req: Request, res: Response) {
        try {
            const updatedCamera = await cameraService.updateCamera(req.params.id, req.body);
            if (!updatedCamera) {
                return res.status(404).json({ message: 'Camera not found or access denied' });
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
    async delete(req: Request, res: Response) {
        try {
            await cameraService.deleteCamera(req.params.id);
            res.status(200).json({ message: 'Camera deleted successfully' });
        } catch (error) {
            console.error('Delete Camera Error:', error);
            res.status(500).json({ message: 'Server error while deleting camera' });
        }
    }
}

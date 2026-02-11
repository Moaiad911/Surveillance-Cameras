/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */const { CameraService } = require('../services/CameraService');
const { MongoCameraRepository } = require('../repositories/MongoCameraRepository');
// انشاء Repository و Service
const cameraRepo = new MongoCameraRepository();
const cameraService = new CameraService(cameraRepo);

class CameraController {

    // GET /cameras
    async getAll(req, res) {
        try {
            // لو عايز تقيد بالكاميرات بتاعة اليوزر:
            const userId = req.user ? req.user._id : null;
            const cameras = await cameraService.getAllCameras(userId);
            res.status(200).json(cameras);
        } catch (error) {
            console.error('Get Cameras Error:', error);
            res.status(500).json({ message: 'Server error while fetching cameras' });
        }
    }

    // GET /cameras/:id
    async getById(req, res) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const userId = req.user ? req.user._id : null;
            const camera = await cameraService.getCameraById(id, userId);

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
    async create(req, res) {
        try {
            const { name, streamURL, location, status } = req.body;

            if (!name || !streamURL || !location) {
                return res.status(400).json({ message: 'Name, Stream URL, and Location are required' });
            }

            const userId = req.user ? req.user._id : null;

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
    async update(req, res) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const userId = req.user ? req.user._id : null;

            const updatedCamera = await cameraService.updateCamera(id, req.body, userId);

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
    async delete(req, res) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const userId = req.user ? req.user._id : null;

            const deleted = await cameraService.deleteCamera(id, userId);

            if (!deleted) {
                return res.status(404).json({ message: 'Camera not found or access denied' });
            }

            res.status(200).json({ message: 'Camera deleted successfully' });
        } catch (error) {
            console.error('Delete Camera Error:', error);
            res.status(500).json({ message: 'Server error while deleting camera' });
        }
    }
}

module.exports = { CameraController: new CameraController() };

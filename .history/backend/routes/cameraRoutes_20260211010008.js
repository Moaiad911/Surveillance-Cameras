const express = require('express');
const router = express.Router();
const cameraController = require('../controllers/cameraController');
const { verifyToken } = require('../middleware/authMiddleware');

// Protect all camera routes
router.use(verifyToken);

// Create a new camera
// @ts-ignore
router.post('/', cameraController.createCamera);

// Get all cameras
// @ts-ignore
router.get('/', cameraController.getAllCameras);

// Get a single camera by ID
// @ts-ignore
router.get('/:id', cameraController.getCameraById);

// Update a camera
// @ts-ignore
router.put('/:id', cameraController.updateCamera);

// Delete a camera
// @ts-ignore
router.delete('/:id', cameraController.deleteCamera);

module.exports = router;

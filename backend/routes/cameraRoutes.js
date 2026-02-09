const express = require('express');
const router = express.Router();
const cameraController = require('../controllers/cameraController');
const { verifyToken } = require('../middleware/authMiddleware');

// Protect all camera routes
router.use(verifyToken);

// Create a new camera
router.post('/', cameraController.createCamera);

// Get all cameras
router.get('/', cameraController.getAllCameras);

// Get a single camera by ID
router.get('/:id', cameraController.getCameraById);

// Update a camera
router.put('/:id', cameraController.updateCamera);

// Delete a camera
router.delete('/:id', cameraController.deleteCamera);

module.exports = router;

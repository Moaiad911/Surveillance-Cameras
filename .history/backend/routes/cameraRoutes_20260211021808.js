const express = require('express');
const router = express.Router();
const { CameraController } = require('../controllers/cameraController');
const { verifyToken } = require('../middleware/authMiddleware');

// Protect all camera routes
router.use(verifyToken);

// Create a new camera
router.post('/', CameraController.create);

// Get all cameras
router.get('/', CameraController.getAll);

// Get a single camera by ID
router.get('/:id', CameraController.getById);

// Update a camera
router.put('/:id', CameraController.update);

// Delete a camera
router.delete('/:id', CameraController.delete);

module.exports = router;

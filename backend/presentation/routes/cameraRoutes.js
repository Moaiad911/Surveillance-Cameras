const express = require('express');
const router = express.Router();
const cameraController = require('../controllers/cameraController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

/**
 * @swagger
 * /api/cameras:
 *   post:
 *     summary: Create a new camera
 *     tags: [Cameras]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, model, ipAddress, streamURL, location, resolution, frameRate]
 *             properties:
 *               name:
 *                 type: string
 *               model:
 *                 type: string
 *               ipAddress:
 *                 type: string
 *               streamURL:
 *                 type: string
 *               location:
 *                 type: string
 *               resolution:
 *                 type: string
 *                 enum: [1280x720, 1920x1080, 2560x1440, 3840x2160]
 *               frameRate:
 *                 type: number
 *               recording:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *     responses:
 *       201:
 *         description: Camera created successfully
 */
router.post('/', cameraController.createCamera);

/**
 * @swagger
 * /api/cameras:
 *   get:
 *     summary: Get all cameras
 *     tags: [Cameras]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cameras
 */
router.get('/', cameraController.getAllCameras);

/**
 * @swagger
 * /api/cameras/{id}:
 *   get:
 *     summary: Get camera by ID
 *     tags: [Cameras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Camera details
 *       404:
 *         description: Camera not found
 */
router.get('/:id', cameraController.getCameraById);

/**
 * @swagger
 * /api/cameras/{id}:
 *   put:
 *     summary: Update a camera
 *     tags: [Cameras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Camera updated successfully
 */
router.put('/:id', cameraController.updateCamera);

/**
 * @swagger
 * /api/cameras/{id}:
 *   delete:
 *     summary: Delete a camera
 *     tags: [Cameras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Camera deleted successfully
 */
router.delete('/:id', cameraController.deleteCamera);

module.exports = router;

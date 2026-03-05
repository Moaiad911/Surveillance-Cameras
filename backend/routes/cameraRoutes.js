const express = require('express');
const router = express.Router();
const { CameraController } = require('../controllers/cameraController');
const { verifyToken } = require('../middleware/authMiddleware');

// Protect all camera routes
router.use(verifyToken);

/**
 * @swagger
 * /cameras:
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
 *             required:
 *               - name
 *               - streamURL
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *               streamURL:
 *                 type: string
 *               location:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *                 default: Active
 *     responses:
 *       201:
 *         description: Camera created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', CameraController.create);

/**
 * @swagger
 * /cameras:
 *   get:
 *     summary: Get all cameras for the authenticated user
 *     tags: [Cameras]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cameras
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', CameraController.getAll);

/**
 * @swagger
 * /cameras/{id}:
 *   get:
 *     summary: Get a camera by ID
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
router.get('/:id', CameraController.getById);

/**
 * @swagger
 * /cameras/{id}:
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               streamURL:
 *                 type: string
 *               location:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *     responses:
 *       200:
 *         description: Camera updated successfully
 *       404:
 *         description: Camera not found
 */
router.put('/:id', CameraController.update);

/**
 * @swagger
 * /cameras/{id}:
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
 *       404:
 *         description: Camera not found
 */
router.delete('/:id', CameraController.delete);

module.exports = router;

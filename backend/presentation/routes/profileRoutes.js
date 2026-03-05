const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken);

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/', profileController.getProfile);

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update username or password
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Current password is incorrect
 *       409:
 *         description: Username already taken
 */
router.put('/', profileController.updateProfile);

/**
 * @swagger
 * /api/profile/role/{userId}:
 *   put:
 *     summary: Update user role (Admin only)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [Admin, Operator]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       403:
 *         description: Only admins can change roles
 */
router.put('/role/:userId', requireAdmin, profileController.updateRole);

module.exports = router;

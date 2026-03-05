const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCameras:
 *                   type: number
 *                 activeCameras:
 *                   type: number
 *                 totalEvents:
 *                   type: number
 *                 recentEvents:
 *                   type: number
 */
router.get('/stats', dashboardController.getStats);

/**
 * @swagger
 * /api/dashboard/events:
 *   get:
 *     summary: Get recent events for dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recent events
 */
router.get('/events', dashboardController.getRecentEvents);

module.exports = router;

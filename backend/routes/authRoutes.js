const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', authController.login);

// Admin-only routes (require authentication + admin role)
router.post('/signup', verifyToken, requireAdmin, authController.signup);

module.exports = router;

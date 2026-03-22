const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, profileController.getProfile);
router.put('/', verifyToken, requireAdmin, profileController.updateProfile);
router.put('/role/:userId', verifyToken, requireAdmin, profileController.updateRole);

module.exports = router;

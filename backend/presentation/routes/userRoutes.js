const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, requireAdmin, userController.getUsers);
router.delete('/:id', verifyToken, requireAdmin, userController.deleteUser);
router.put('/:id', verifyToken, requireAdmin, userController.updateUser);

module.exports = router;

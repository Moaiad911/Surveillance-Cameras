const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const UserController = require('../controllers/UserController');

router.post('/login', UserController.login);
router.post('/', verifyToken, requireAdmin, UserController.createUser);
router.get('/', verifyToken, requireAdmin, UserController.getAllUsers);
router.get('/:id', verifyToken, requireAdmin, UserController.getUserById);
router.put('/:id', verifyToken, requireAdmin, UserController.updateUser);
router.delete('/:id', verifyToken, requireAdmin, UserController.deleteUser);

module.exports = router;

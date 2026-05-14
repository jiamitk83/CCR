const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, isAdmin } = require('../middleware/auth');

// Registration is public (no auth required)
router.post('/register', userController.registerUser);

// Admin setup is public but should only be used once (consider adding a check)
router.post('/admin/setup', userController.setupAdmin);

// User management - admin only
router.get('/users', isAdmin, userController.getAllUsers);
router.delete('/users/:id', isAdmin, userController.deleteUser);

module.exports = router;

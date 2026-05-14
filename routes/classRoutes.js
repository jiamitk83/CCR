const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { requireAuth, isAdmin } = require('../middleware/auth');

// Read operations - any authenticated user
router.get('/', requireAuth, classController.getAllClasses);
router.get('/by-name/:name', requireAuth, classController.getClassByName);

// Write operations - admin only
router.post('/', isAdmin, classController.createClass);
router.put('/:oldName', isAdmin, classController.updateClass);
router.delete('/:name', isAdmin, classController.deleteClass);

module.exports = router;

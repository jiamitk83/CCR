const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const { requireAuth, isAdmin, isTeacherOrAdmin } = require('../middleware/auth');

// Get all notices
router.get('/', requireAuth, noticeController.getAll);

// Get active notices
router.get('/active', requireAuth, noticeController.getActive);

// Get notice by ID
router.get('/:id', requireAuth, noticeController.getByCategory);

// Get notices by category
router.get('/category/:category', requireAuth, noticeController.getByCategory);

// Create notice
router.post('/', requireAuth, isTeacherOrAdmin, noticeController.create);

// Update notice
router.put('/:id', requireAuth, isTeacherOrAdmin, noticeController.update);

// Delete notice
router.delete('/:id', requireAuth, isAdmin, noticeController.delete);

module.exports = router;

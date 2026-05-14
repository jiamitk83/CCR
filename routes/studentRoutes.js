const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { requireAuth, requireRole, isAdmin, isTeacherOrAdmin } = require('../middleware/auth');

// Get all students
router.get('/', requireAuth, studentController.getAll);

// Get student count
router.get('/count', requireAuth, studentController.count);

// Search students
router.get('/search', requireAuth, studentController.search);

// Get students by class
router.get('/class/:classId', requireAuth, studentController.getByClass);

// Get student by ID
router.get('/:id', requireAuth, studentController.getById);

// Create new student (admin only)
router.post('/', requireAuth, isAdmin, studentController.create);

// Update student (admin only)
router.put('/:id', requireAuth, isAdmin, studentController.update);

// Delete student (admin only)
router.delete('/:id', requireAuth, isAdmin, studentController.delete);

module.exports = router;

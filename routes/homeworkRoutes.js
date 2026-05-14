const express = require('express');
const router = express.Router();
const homeworkController = require('../controllers/homeworkController');
const { requireAuth, isAdmin, isTeacherOrAdmin } = require('../middleware/auth');

// Get all homework
router.get('/', requireAuth, homeworkController.getAll);

// Get homework by class
router.get('/class/:classId', requireAuth, homeworkController.getByClass);

// Get pending homework for student
router.get('/pending/:studentId', requireAuth, homeworkController.getPending);

// Get homework by ID
router.get('/:id', requireAuth, homeworkController.getById);

// Get submissions for homework
router.get('/:homeworkId/submissions', requireAuth, homeworkController.getSubmissions);

// Create homework (admin/teacher only)
router.post('/', requireAuth, isTeacherOrAdmin, homeworkController.create);

// Submit homework
router.post('/submit', requireAuth, homeworkController.submit);

// Grade submission (admin/teacher only)
router.put('/grade/:id', requireAuth, isTeacherOrAdmin, homeworkController.gradeSubmission);

// Update homework
router.put('/:id', requireAuth, isTeacherOrAdmin, homeworkController.update);

// Delete homework (admin only)
router.delete('/:id', requireAuth, isAdmin, homeworkController.delete);

module.exports = router;

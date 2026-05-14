const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { requireAuth, isAdmin, isTeacherOrAdmin } = require('../middleware/auth');

// Get all exams
router.get('/', requireAuth, examController.getAll);

// Get upcoming exams
router.get('/upcoming', requireAuth, examController.getUpcoming);

// Get exam by ID
router.get('/:id', requireAuth, examController.getById);

// Get exams by class
router.get('/class/:classId', requireAuth, examController.getByClass);

// Get exam results
router.get('/:examId/results', requireAuth, examController.getResults);

// Get exam statistics
router.get('/:examId/stats', requireAuth, examController.getExamStats);

// Get student results
router.get('/student/:studentId/results', requireAuth, examController.getStudentResults);

// Create exam (admin/teacher only)
router.post('/', requireAuth, isTeacherOrAdmin, examController.create);

// Add result (admin/teacher only)
router.post('/results', requireAuth, isTeacherOrAdmin, examController.addResult);

// Bulk add results
router.post('/results/bulk', requireAuth, isTeacherOrAdmin, examController.bulkAddResults);

// Update exam
router.put('/:id', requireAuth, isTeacherOrAdmin, examController.update);

// Delete exam (admin only)
router.delete('/:id', requireAuth, isAdmin, examController.delete);

// Delete result
router.delete('/results/:id', requireAuth, isTeacherOrAdmin, examController.deleteResult);

module.exports = router;

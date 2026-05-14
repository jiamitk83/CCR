const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');
const { requireAuth, isTeacherOrAdmin } = require('../middleware/auth');

// Read operations - any authenticated user
router.get('/all-status', requireAuth, statusController.getAllStatus);
router.get('/:className/:subjectName', requireAuth, statusController.getStatusByClassAndSubject);

// Write operations - admin and teacher only
router.put('/:className/:subjectName/:chapterNumber', isTeacherOrAdmin, statusController.updateStatus);
router.delete('/:className/:subjectName/:chapterNumber', isTeacherOrAdmin, statusController.deleteStatus);

module.exports = router;

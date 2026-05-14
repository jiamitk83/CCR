const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { requireAuth, isAdmin, isTeacherOrAdmin } = require('../middleware/auth');

// Get all attendance
router.get('/', requireAuth, attendanceController.getAll);

// Get attendance by date
router.get('/date/:date', requireAuth, attendanceController.getByDate);

// Get attendance by student
router.get('/student/:studentId', requireAuth, attendanceController.getByStudent);

// Get attendance by class
router.get('/class/:classId', requireAuth, attendanceController.getByClass);

// Get student attendance stats
router.get('/student/:studentId/stats', requireAuth, attendanceController.getStudentStats);

// Get class attendance stats
router.get('/class/:classId/stats', requireAuth, attendanceController.getClassStats);

// Mark attendance
router.post('/mark', requireAuth, isTeacherOrAdmin, attendanceController.markAttendance);

// Bulk mark attendance
router.post('/bulk', requireAuth, isTeacherOrAdmin, attendanceController.bulkMarkAttendance);

// Delete attendance
router.delete('/:id', requireAuth, isAdmin, attendanceController.delete);

module.exports = router;

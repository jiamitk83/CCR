const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const { requireAuth, isAdmin, isTeacherOrAdmin } = require('../middleware/auth');

// Get all timetables
router.get('/', requireAuth, timetableController.getAll);

// Get timetable by class
router.get('/class/:classId', requireAuth, timetableController.getByClass);

// Get timetable by class and day
router.get('/class/:classId/:day', requireAuth, timetableController.getByClassAndDay);

// Get periods
router.get('/periods', requireAuth, timetableController.getPeriods);

// Add timetable entry
router.post('/entry', requireAuth, isTeacherOrAdmin, timetableController.addEntry);

// Bulk add entries
router.post('/bulk', requireAuth, isTeacherOrAdmin, timetableController.bulkAddEntries);

// Add period
router.post('/periods', requireAuth, isAdmin, timetableController.addPeriod);

// Delete timetable entry
router.delete('/entry/:id', requireAuth, isTeacherOrAdmin, timetableController.deleteEntry);

// Delete class timetable
router.delete('/class/:classId', requireAuth, isAdmin, timetableController.deleteByClass);

// Delete period
router.delete('/periods/:id', requireAuth, isAdmin, timetableController.deletePeriod);

module.exports = router;

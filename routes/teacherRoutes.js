const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { requireAuth, isAdmin } = require('../middleware/auth');

// Read operations - any authenticated user
router.get('/', requireAuth, teacherController.getAllTeachers);

// Write operations - admin only
router.post('/', isAdmin, teacherController.createTeacher);
router.put('/:id', isAdmin, teacherController.updateTeacher);
router.delete('/:id', isAdmin, teacherController.deleteTeacher);

module.exports = router;

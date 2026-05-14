const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');
const { requireAuth, isAdmin, isTeacherOrAdmin } = require('../middleware/auth');

// Read operations - any authenticated user
router.get('/all-chapters', requireAuth, chapterController.getAllChapters);
router.get('/:className/:subjectName', requireAuth, chapterController.getChaptersByClassAndSubject);

// Write operations - admin and teacher only
router.post('/', isTeacherOrAdmin, chapterController.createChapter);
router.put('/:id', isTeacherOrAdmin, chapterController.updateChapter);
router.delete('/:id', isTeacherOrAdmin, chapterController.deleteChapter);

module.exports = router;

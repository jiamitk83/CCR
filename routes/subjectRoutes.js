const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { requireAuth, isAdmin } = require('../middleware/auth');

// Read operations - any authenticated user
router.get('/', requireAuth, subjectController.getAllSubjects);

// Write operations - admin only
router.post('/', isAdmin, subjectController.createSubject);
router.put('/:oldName', isAdmin, subjectController.updateSubject);
router.delete('/:name', isAdmin, subjectController.deleteSubject);

module.exports = router;

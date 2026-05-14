const express = require('express');
const router = express.Router();
const { getAllAllotments, createAllotment, deleteAllotment } = require('../controllers/teacherAllotmentController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, getAllAllotments);
router.post('/', requireAuth, createAllotment);
router.delete('/:id', requireAuth, deleteAllotment);

module.exports = router;

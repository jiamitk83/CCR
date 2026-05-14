const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { requireAuth } = require('../middleware/auth');

// Read operations - any authenticated user
router.get('/', requireAuth, statsController.getStats);

module.exports = router;

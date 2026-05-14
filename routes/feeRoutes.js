const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const { requireAuth, isAdmin } = require('../middleware/auth');

// Get all fees
router.get('/', requireAuth, feeController.getAll);

// Get fee by ID
router.get('/:id', requireAuth, feeController.getById);

// Get fees by student
router.get('/student/:studentId', requireAuth, feeController.getByStudent);

// Get fees by class
router.get('/class/:classId', requireAuth, feeController.getByClass);

// Get fee statistics
router.get('/stats/summary', requireAuth, feeController.getStats);

// Fee Structure routes
router.get('/structures', requireAuth, feeController.getFeeStructures);

// Create new fee (admin only)
router.post('/', requireAuth, isAdmin, feeController.create);

// Create fee structure (admin only)
router.post('/structures', requireAuth, isAdmin, feeController.createFeeStructure);

// Update fee
router.put('/:id', requireAuth, isAdmin, feeController.update);

// Update fee structure (admin only)
router.put('/structures/:id', requireAuth, isAdmin, feeController.updateFeeStructure);

// Delete fee (admin only)
router.delete('/:id', requireAuth, isAdmin, feeController.delete);

// Delete fee structure (admin only)
router.delete('/structures/:id', requireAuth, isAdmin, feeController.deleteFeeStructure);

module.exports = router;

const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');
const { requireAuth, isAdmin, isTeacherOrAdmin } = require('../middleware/auth');

// Get all books
router.get('/books', requireAuth, libraryController.getAllBooks);

// Get available books
router.get('/books/available', requireAuth, libraryController.getAvailableBooks);

// Search books
router.get('/books/search', requireAuth, libraryController.searchBooks);

// Get book issues
router.get('/issues', requireAuth, libraryController.getAllIssues);

// Get overdue books
router.get('/overdue', requireAuth, libraryController.getOverdue);

// Get library statistics
router.get('/stats', requireAuth, libraryController.getStats);

// Add book (admin/teacher only)
router.post('/books', requireAuth, isTeacherOrAdmin, libraryController.addBook);

// Issue book
router.post('/issue', requireAuth, isTeacherOrAdmin, libraryController.issueBook);

// Return book
router.put('/return/:id', requireAuth, isTeacherOrAdmin, libraryController.returnBook);

// Update book
router.put('/books/:id', requireAuth, isTeacherOrAdmin, libraryController.updateBook);

// Delete book (admin only)
router.delete('/books/:id', requireAuth, isAdmin, libraryController.deleteBook);

module.exports = router;

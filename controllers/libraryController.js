const { Book, BookIssue } = require('../models/Library');
const Student = require('../models/Student');
const { ObjectId } = require('mongodb');

const libraryController = {
    // Get all books
    async getAllBooks(req, res) {
        try {
            const books = await Book.getAll();
            res.json(books);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get available books
    async getAvailableBooks(req, res) {
        try {
            const books = await Book.getAvailable();
            res.json(books);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Search books
    async searchBooks(req, res) {
        try {
            const { query } = req.query;
            if (!query) {
                return res.status(400).json({ message: 'Search query is required' });
            }
            const books = await Book.search(query);
            res.json(books);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Add book
    async addBook(req, res) {
        try {
            const { title, author, isbn, category, publisher, edition, totalCopies } = req.body;
            
            if (!title || !author) {
                return res.status(400).json({ message: 'Title and author are required' });
            }

            const bookData = {
                title,
                author,
                isbn,
                category,
                publisher,
                edition,
                totalCopies: totalCopies || 1,
                availableCopies: totalCopies || 1
            };

            const result = await Book.create(bookData);
            res.status(201).json({ message: 'Book added successfully', bookId: result.insertedId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Update book
    async updateBook(req, res) {
        try {
            const { id } = req.params;
            const result = await Book.update(id, req.body);
            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Book not found' });
            }
            res.json({ message: 'Book updated successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Delete book
    async deleteBook(req, res) {
        try {
            const result = await Book.delete(req.params.id);
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Book not found' });
            }
            res.json({ message: 'Book deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get book issues
    async getAllIssues(req, res) {
        try {
            const issues = await BookIssue.getAll();
            const books = await Book.getAll();
            const students = await Student.getAll();
            
            const bookMap = {};
            books.forEach(b => bookMap[b._id.toString()] = b);
            const studentMap = {};
            students.forEach(s => studentMap[s._id.toString()] = s);
            
            const enriched = issues.map(i => ({
                ...i,
                bookTitle: bookMap[i.bookId.toString()]?.title || 'N/A',
                studentName: studentMap[i.studentId.toString()] ? 
                    `${studentMap[i.studentId.toString()].firstName} ${studentMap[i.studentId.toString()].lastName}` : 'N/A'
            }));
            
            res.json(enriched);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Issue book
    async issueBook(req, res) {
        try {
            const { bookId, studentId, dueDate } = req.body;
            
            if (!bookId || !studentId) {
                return res.status(400).json({ message: 'Book and student are required' });
            }

            const book = await Book.findById(bookId);
            if (!book || !book.available) {
                return res.status(400).json({ message: 'Book is not available' });
            }

            const issueData = {
                bookId: new ObjectId(bookId),
                studentId: new ObjectId(studentId),
                dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            };

            await BookIssue.create(issueData);
            await Book.update(bookId, { available: false });

            res.json({ message: 'Book issued successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Return book
    async returnBook(req, res) {
        try {
            const { id } = req.params;
            await BookIssue.returnBook(id);
            res.json({ message: 'Book returned successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get overdue books
    async getOverdue(req, res) {
        try {
            const issues = await BookIssue.getOverdue();
            const books = await Book.getAll();
            const students = await Student.getAll();
            
            const bookMap = {};
            books.forEach(b => bookMap[b._id.toString()] = b);
            const studentMap = {};
            students.forEach(s => studentMap[s._id.toString()] = s);
            
            const enriched = issues.map(i => ({
                ...i,
                bookTitle: bookMap[i.bookId.toString()]?.title || 'N/A',
                studentName: studentMap[i.studentId.toString()] ? 
                    `${studentMap[i.studentId.toString()].firstName} ${studentMap[i.studentId.toString()].lastName}` : 'N/A'
            }));
            
            res.json(enriched);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get library statistics
    async getStats(req, res) {
        try {
            const totalBooks = await Book.count();
            const availableBooks = await Book.countAvailable();
            const activeIssues = await BookIssue.getActive();
            const overdueIssues = await BookIssue.getOverdue();
            
            res.json({
                totalBooks,
                availableBooks,
                issuedBooks: activeIssues.length,
                overdueBooks: overdueIssues.length
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = libraryController;

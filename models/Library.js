const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Book {
    static async findOne(query) {
        const db = getDB();
        return await db.collection('books').findOne(query);
    }

    static async findById(id) {
        const db = getDB();
        return await db.collection('books').findOne({ _id: new ObjectId(id) });
    }

    static async getAll() {
        const db = getDB();
        return await db.collection('books').find({}).toArray();
    }

    static async getAvailable() {
        const db = getDB();
        return await db.collection('books').find({ available: true }).toArray();
    }

    static async search(query) {
        const db = getDB();
        return await db.collection('books').find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { author: { $regex: query, $options: 'i' } },
                { isbn: { $regex: query, $options: 'i' } }
            ]
        }).toArray();
    }

    static async create(bookData) {
        const db = getDB();
        bookData.createdAt = new Date();
        bookData.available = true;
        return await db.collection('books').insertOne(bookData);
    }

    static async update(id, bookData) {
        const db = getDB();
        return await db.collection('books').updateOne(
            { _id: new ObjectId(id) },
            { $set: bookData }
        );
    }

    static async delete(id) {
        const db = getDB();
        return await db.collection('books').deleteOne({ _id: new ObjectId(id) });
    }

    static async count() {
        const db = getDB();
        return await db.collection('books').countDocuments();
    }

    static async countAvailable() {
        const db = getDB();
        return await db.collection('books').countDocuments({ available: true });
    }
}

class BookIssue {
    static async findOne(query) {
        const db = getDB();
        return await db.collection('bookIssues').findOne(query);
    }

    static async getAll() {
        const db = getDB();
        return await db.collection('bookIssues').find({}).toArray();
    }

    static async getByStudent(studentId) {
        const db = getDB();
        return await db.collection('bookIssues').find({ studentId: new ObjectId(studentId) }).toArray();
    }

    static async getByBook(bookId) {
        const db = getDB();
        return await db.collection('bookIssues').find({ bookId: new ObjectId(bookId) }).toArray();
    }

    static async getActive() {
        const db = getDB();
        return await db.collection('bookIssues').find({ status: 'issued' }).toArray();
    }

    static async getOverdue() {
        const db = getDB();
        return await db.collection('bookIssues').find({
            status: 'issued',
            dueDate: { $lt: new Date() }
        }).toArray();
    }

    static async create(issueData) {
        const db = getDB();
        issueData.issueDate = new Date();
        issueData.status = 'issued';
        issueData.createdAt = new Date();
        return await db.collection('bookIssues').insertOne(issueData);
    }

    static async update(id, issueData) {
        const db = getDB();
        return await db.collection('bookIssues').updateOne(
            { _id: new ObjectId(id) },
            { $set: issueData }
        );
    }

    static async returnBook(id, returnDate) {
        const db = getDB();
        const issue = await db.collection('bookIssues').findOne({ _id: new ObjectId(id) });
        
        if (issue) {
            await db.collection('bookIssues').updateOne(
                { _id: new ObjectId(id) },
                { $set: { status: 'returned', returnDate: returnDate || new Date() } }
            );
            
            await db.collection('books').updateOne(
                { _id: issue.bookId },
                { $set: { available: true } }
            );
        }
    }

    static async delete(id) {
        const db = getDB();
        return await db.collection('bookIssues').deleteOne({ _id: new ObjectId(id) });
    }
}

module.exports = { Book, BookIssue };

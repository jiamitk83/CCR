const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Chapter {
    static async getAll() {
        const db = getDB();
        return await db.collection('chapters').find({}).toArray();
    }

    static async getByClassAndSubject(className, subjectName) {
        const db = getDB();
        return await db.collection('chapters').find({ className, subjectName }).sort({ chapterNumber: 1 }).toArray();
    }

    static async findById(id) {
        const db = getDB();
        return await db.collection('chapters').findOne({ _id: new ObjectId(id) });
    }

    static async create(chapterData) {
        const db = getDB();
        return await db.collection('chapters').insertOne(chapterData);
    }

    static async update(id, chapterData) {
        const db = getDB();
        return await db.collection('chapters').updateOne({ _id: new ObjectId(id) }, { $set: chapterData });
    }

    static async delete(id) {
        const db = getDB();
        return await db.collection('chapters').deleteOne({ _id: new ObjectId(id) });
    }
}

module.exports = Chapter;

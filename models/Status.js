const { getDB } = require('../config/db');

class Status {
    static async getAll() {
        const db = getDB();
        return await db.collection('status').find({}).toArray();
    }

    static async getByClassAndSubject(className, subjectName) {
        const db = getDB();
        return await db.collection('status').find({ className, subjectName }).toArray();
    }

    static async update(className, subjectName, chapterNumber, statusData) {
        const db = getDB();
        return await db.collection('status').updateOne(
            { className, subjectName, chapterNumber: parseInt(chapterNumber) },
            { $set: { ...statusData, className, subjectName, chapterNumber: parseInt(chapterNumber) } },
            { upsert: true }
        );
    }

    static async delete(className, subjectName, chapterNumber) {
        const db = getDB();
        return await db.collection('status').deleteOne({ className, subjectName, chapterNumber: parseInt(chapterNumber) });
    }
}

module.exports = Status;

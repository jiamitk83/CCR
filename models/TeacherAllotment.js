const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class TeacherAllotment {
    static async getAll() {
        const db = getDB();
        return await db.collection('teacherAllotments').find({}).toArray();
    }

    static async create(allotmentData) {
        const db = getDB();
        return await db.collection('teacherAllotments').insertOne(allotmentData);
    }

    static async delete(id) {
        const db = getDB();
        return await db.collection('teacherAllotments').deleteOne({ _id: new ObjectId(id) });
    }
}

module.exports = TeacherAllotment;

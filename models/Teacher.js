const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Teacher {
    static async getAll() {
        const db = getDB();
        return await db.collection('teachers').find({}).toArray();
    }

    static async create(teacherData) {
        const db = getDB();
        return await db.collection('teachers').insertOne(teacherData);
    }

    static async update(id, teacherData) {
        const db = getDB();
        return await db.collection('teachers').updateOne({ _id: new ObjectId(id) }, { $set: teacherData });
    }

    static async delete(id) {
        const db = getDB();
        return await db.collection('teachers').deleteOne({ _id: new ObjectId(id) });
    }
}

module.exports = Teacher;

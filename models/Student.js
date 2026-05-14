const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Student {
    static async findOne(query) {
        const db = getDB();
        return await db.collection('students').findOne(query);
    }

    static async findById(id) {
        const db = getDB();
        return await db.collection('students').findOne({ _id: new ObjectId(id) });
    }

    static async getAll() {
        const db = getDB();
        return await db.collection('students').find({}).toArray();
    }

    static async getByClass(classId) {
        const db = getDB();
        return await db.collection('students').find({ classId: new ObjectId(classId) }).toArray();
    }

    static async create(studentData) {
        const db = getDB();
        studentData.createdAt = new Date();
        studentData.updatedAt = new Date();
        return await db.collection('students').insertOne(studentData);
    }

    static async update(id, studentData) {
        const db = getDB();
        studentData.updatedAt = new Date();
        return await db.collection('students').updateOne(
            { _id: new ObjectId(id) },
            { $set: studentData }
        );
    }

    static async delete(id) {
        const db = getDB();
        return await db.collection('students').deleteOne({ _id: new ObjectId(id) });
    }

    static async count() {
        const db = getDB();
        return await db.collection('students').countDocuments();
    }

    static async countByClass(classId) {
        const db = getDB();
        return await db.collection('students').countDocuments({ classId: new ObjectId(classId) });
    }

    static async search(query) {
        const db = getDB();
        return await db.collection('students').find({
            $or: [
                { firstName: { $regex: query, $options: 'i' } },
                { lastName: { $regex: query, $options: 'i' } },
                { rollNumber: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).toArray();
    }
}

module.exports = Student;

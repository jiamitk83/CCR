const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Homework {
    static async findOne(query) {
        const db = getDB();
        return await db.collection('homework').findOne(query);
    }

    static async findById(id) {
        const db = getDB();
        return await db.collection('homework').findOne({ _id: new ObjectId(id) });
    }

    static async getAll() {
        const db = getDB();
        return await db.collection('homework').find({}).sort({ createdAt: -1 }).toArray();
    }

    static async getByClass(classId) {
        const db = getDB();
        return await db.collection('homework').find({ classId: new ObjectId(classId) }).sort({ createdAt: -1 }).toArray();
    }

    static async getBySubject(subjectId) {
        const db = getDB();
        return await db.collection('homework').find({ subjectId: new ObjectId(subjectId) }).sort({ createdAt: -1 }).toArray();
    }

    static async getPending(studentId) {
        const db = getDB();
        const student = await db.collection('students').findOne({ _id: new ObjectId(studentId) });
        if (!student) return [];
        
        return await db.collection('homework').find({
            classId: student.classId,
            dueDate: { $gte: new Date() }
        }).sort({ dueDate: 1 }).toArray();
    }

    static async create(homeworkData) {
        const db = getDB();
        homeworkData.createdAt = new Date();
        homeworkData.status = 'active';
        return await db.collection('homework').insertOne(homeworkData);
    }

    static async update(id, homeworkData) {
        const db = getDB();
        homeworkData.updatedAt = new Date();
        return await db.collection('homework').updateOne(
            { _id: new ObjectId(id) },
            { $set: homeworkData }
        );
    }

    static async delete(id) {
        const db = getDB();
        return await db.collection('homework').deleteOne({ _id: new ObjectId(id) });
    }

    static async close(id) {
        const db = getDB();
        return await db.collection('homework').updateOne(
            { _id: new ObjectId(id) },
            { $set: { status: 'closed', closedAt: new Date() } }
        );
    }
}

class HomeworkSubmission {
    static async findOne(query) {
        const db = getDB();
        return await db.collection('homeworkSubmissions').findOne(query);
    }

    static async getAll() {
        const db = getDB();
        return await db.collection('homeworkSubmissions').find({}).toArray();
    }

    static async getByHomework(homeworkId) {
        const db = getDB();
        return await db.collection('homeworkSubmissions').find({ homeworkId: new ObjectId(homeworkId) }).toArray();
    }

    static async getByStudent(studentId) {
        const db = getDB();
        return await db.collection('homeworkSubmissions').find({ studentId: new ObjectId(studentId) }).toArray();
    }

    static async getByStudentAndHomework(studentId, homeworkId) {
        const db = getDB();
        return await db.collection('homeworkSubmissions').findOne({
            studentId: new ObjectId(studentId),
            homeworkId: new ObjectId(homeworkId)
        });
    }

    static async create(submissionData) {
        const db = getDB();
        submissionData.submittedAt = new Date();
        submissionData.status = 'submitted';
        submissionData.createdAt = new Date();
        return await db.collection('homeworkSubmissions').insertOne(submissionData);
    }

    static async update(id, submissionData) {
        const db = getDB();
        submissionData.updatedAt = new Date();
        return await db.collection('homeworkSubmissions').updateOne(
            { _id: new ObjectId(id) },
            { $set: submissionData }
        );
    }

    static async grade(id, marks, feedback) {
        const db = getDB();
        return await db.collection('homeworkSubmissions').updateOne(
            { _id: new ObjectId(id) },
            { $set: { marks, feedback, gradedAt: new Date(), status: 'graded' } }
        );
    }

    static async delete(id) {
        const db = getDB();
        return await db.collection('homeworkSubmissions').deleteOne({ _id: new ObjectId(id) });
    }
}

module.exports = { Homework, HomeworkSubmission };

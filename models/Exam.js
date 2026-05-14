const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Exam {
    static async findOne(query) {
        const db = getDB();
        return await db.collection('exams').findOne(query);
    }

    static async findById(id) {
        const db = getDB();
        return await db.collection('exams').findOne({ _id: new ObjectId(id) });
    }

    static async getAll() {
        const db = getDB();
        return await db.collection('exams').find({}).toArray();
    }

    static async getByClass(classId) {
        const db = getDB();
        return await db.collection('exams').find({ classId: new ObjectId(classId) }).toArray();
    }

    static async getUpcoming() {
        const db = getDB();
        return await db.collection('exams').find({
            date: { $gte: new Date() }
        }).sort({ date: 1 }).toArray();
    }

    static async create(examData) {
        const db = getDB();
        examData.createdAt = new Date();
        examData.updatedAt = new Date();
        return await db.collection('exams').insertOne(examData);
    }

    static async update(id, examData) {
        const db = getDB();
        examData.updatedAt = new Date();
        return await db.collection('exams').updateOne(
            { _id: new ObjectId(id) },
            { $set: examData }
        );
    }

    static async delete(id) {
        const db = getDB();
        return await db.collection('exams').deleteOne({ _id: new ObjectId(id) });
    }
}

class ExamResult {
    static async findOne(query) {
        const db = getDB();
        return await db.collection('examResults').findOne(query);
    }

    static async findById(id) {
        const db = getDB();
        return await db.collection('examResults').findOne({ _id: new ObjectId(id) });
    }

    static async getAll() {
        const db = getDB();
        return await db.collection('examResults').find({}).toArray();
    }

    static async getByExam(examId) {
        const db = getDB();
        return await db.collection('examResults').find({ examId: new ObjectId(examId) }).toArray();
    }

    static async getByStudent(studentId) {
        const db = getDB();
        return await db.collection('examResults').find({ studentId: new ObjectId(studentId) }).toArray();
    }

    static async getByStudentAndExam(studentId, examId) {
        const db = getDB();
        return await db.collection('examResults').find({
            studentId: new ObjectId(studentId),
            examId: new ObjectId(examId)
        }).toArray();
    }

    static async create(resultData) {
        const db = getDB();
        resultData.createdAt = new Date();
        return await db.collection('examResults').insertOne(resultData);
    }

    static async createMany(results) {
        const db = getDB();
        results.forEach(r => r.createdAt = new Date());
        return await db.collection('examResults').insertMany(results);
    }

    static async update(id, resultData) {
        const db = getDB();
        return await db.collection('examResults').updateOne(
            { _id: new ObjectId(id) },
            { $set: resultData }
        );
    }

    static async upsert(examId, studentId, marks, grade, remark) {
        const db = getDB();
        return await db.collection('examResults').updateOne(
            { examId: new ObjectId(examId), studentId: new ObjectId(studentId) },
            {
                $set: {
                    examId: new ObjectId(examId),
                    studentId: new ObjectId(studentId),
                    marks,
                    grade,
                    remark,
                    updatedAt: new Date()
                }
            },
            { upsert: true }
        );
    }

    static async delete(id) {
        const db = getDB();
        return await db.collection('examResults').deleteOne({ _id: new ObjectId(id) });
    }

    static async getStudentResults(studentId) {
        const db = getDB();
        return await db.collection('examResults').aggregate([
            { $match: { studentId: new ObjectId(studentId) } },
            {
                $lookup: {
                    from: 'exams',
                    localField: 'examId',
                    foreignField: '_id',
                    as: 'exam'
                }
            },
            { $unwind: '$exam' },
            {
                $lookup: {
                    from: 'subjects',
                    localField: 'exam.subjectId',
                    foreignField: '_id',
                    as: 'subject'
                }
            },
            { $unwind: '$subject' }
        ]).toArray();
    }

    static async getExamStats(examId) {
        const db = getDB();
        const pipeline = [
            { $match: { examId: new ObjectId(examId) } },
            {
                $group: {
                    _id: null,
                    totalStudents: { $sum: 1 },
                    avgMarks: { $avg: '$marks' },
                    maxMarks: { $max: '$marks' },
                    minMarks: { $min: '$marks' }
                }
            }
        ];
        const result = await db.collection('examResults').aggregate(pipeline).toArray();
        return result[0] || { totalStudents: 0, avgMarks: 0, maxMarks: 0, minMarks: 0 };
    }
}

module.exports = { Exam, ExamResult };

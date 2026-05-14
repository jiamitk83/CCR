const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Timetable {
    static async findOne(query) {
        const db = getDB();
        return await db.collection('timetables').findOne(query);
    }

    static async findById(id) {
        const db = getDB();
        return await db.collection('timetables').findOne({ _id: new ObjectId(id) });
    }

    static async getAll() {
        const db = getDB();
        return await db.collection('timetables').find({}).toArray();
    }

    static async getByClass(classId) {
        const db = getDB();
        return await db.collection('timetables').find({ classId: new ObjectId(classId) }).toArray();
    }

    static async getByClassAndDay(classId, day) {
        const db = getDB();
        return await db.collection('timetables').find({ 
            classId: new ObjectId(classId),
            day: day
        }).sort({ period: 1 }).toArray();
    }

    static async create(timetableData) {
        const db = getDB();
        timetableData.createdAt = new Date();
        return await db.collection('timetables').insertOne(timetableData);
    }

    static async createMany(timetableRecords) {
        const db = getDB();
        timetableRecords.forEach(r => r.createdAt = new Date());
        return await db.collection('timetables').insertMany(timetableRecords);
    }

    static async update(id, timetableData) {
        const db = getDB();
        return await db.collection('timetables').updateOne(
            { _id: new ObjectId(id) },
            { $set: timetableData }
        );
    }

    static async upsert(classId, day, period, subjectId, teacherId, startTime, endTime, room) {
        const db = getDB();
        return await db.collection('timetables').updateOne(
            { classId: new ObjectId(classId), day, period },
            {
                $set: {
                    subjectId: subjectId ? new ObjectId(subjectId) : null,
                    teacherId: teacherId ? new ObjectId(teacherId) : null,
                    startTime,
                    endTime,
                    room
                }
            },
            { upsert: true }
        );
    }

    static async delete(id) {
        const db = getDB();
        return await db.collection('timetables').deleteOne({ _id: new ObjectId(id) });
    }

    static async deleteByClass(classId) {
        const db = getDB();
        return await db.collection('timetables').deleteMany({ classId: new ObjectId(classId) });
    }
}

class Period {
    static async getAll() {
        const db = getDB();
        return await db.collection('periods').find({}).sort({ startTime: 1 }).toArray();
    }

    static async create(periodData) {
        const db = getDB();
        return await db.collection('periods').insertOne(periodData);
    }

    static async update(id, periodData) {
        const db = getDB();
        return await db.collection('periods').updateOne(
            { _id: new ObjectId(id) },
            { $set: periodData }
        );
    }

    static async delete(id) {
        const db = getDB();
        return await db.collection('periods').deleteOne({ _id: new ObjectId(id) });
    }
}

module.exports = { Timetable, Period };

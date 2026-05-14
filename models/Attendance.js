const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Attendance {
    static async findOne(query) {
        const db = getDB();
        return await db.collection('attendance').findOne(query);
    }

    static async findById(id) {
        const db = getDB();
        return await db.collection('attendance').findOne({ _id: new ObjectId(id) });
    }

    static async getAll() {
        const db = getDB();
        return await db.collection('attendance').find({}).toArray();
    }

    static async getByDate(date) {
        const db = getDB();
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        return await db.collection('attendance').find({
            date: { $gte: startOfDay, $lte: endOfDay }
        }).toArray();
    }

    static async getByStudent(studentId, startDate, endDate) {
        const db = getDB();
        const query = { studentId: new ObjectId(studentId) };
        
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        return await db.collection('attendance').find(query).sort({ date: -1 }).toArray();
    }

    static async getByClass(classId, date) {
        const db = getDB();
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        return await db.collection('attendance').find({
            classId: new ObjectId(classId),
            date: { $gte: startOfDay, $lte: endOfDay }
        }).toArray();
    }

    static async create(attendanceData) {
        const db = getDB();
        attendanceData.createdAt = new Date();
        return await db.collection('attendance').insertOne(attendanceData);
    }

    static async createMany(attendanceRecords) {
        const db = getDB();
        attendanceRecords.forEach(r => r.createdAt = new Date());
        return await db.collection('attendance').insertMany(attendanceRecords);
    }

    static async update(id, attendanceData) {
        const db = getDB();
        return await db.collection('attendance').updateOne(
            { _id: new ObjectId(id) },
            { $set: attendanceData }
        );
    }

    static async upsert(studentId, classId, date, status, remark) {
        const db = getDB();
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);
        
        return await db.collection('attendance').updateOne(
            { studentId: new ObjectId(studentId), date: attendanceDate },
            {
                $set: {
                    classId: new ObjectId(classId),
                    status,
                    remark,
                    updatedAt: new Date()
                }
            },
            { upsert: true }
        );
    }

    static async delete(id) {
        const db = getDB();
        return await db.collection('attendance').deleteOne({ _id: new ObjectId(id) });
    }

    static async getStudentAttendanceStats(studentId, startDate, endDate) {
        const db = getDB();
        const pipeline = [
            {
                $match: {
                    studentId: new ObjectId(studentId),
                    date: { $gte: new Date(startDate), $lte: new Date(endDate) }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
                    absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
                    late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
                    excused: { $sum: { $cond: [{ $eq: ['$status', 'excused'] }, 1, 0] } }
                }
            }
        ];
        
        const result = await db.collection('attendance').aggregate(pipeline).toArray();
        return result[0] || { total: 0, present: 0, absent: 0, late: 0, excused: 0 };
    }

    static async getClassAttendanceStats(classId, date) {
        const db = getDB();
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const pipeline = [
            {
                $match: {
                    classId: new ObjectId(classId),
                    date: { $gte: startOfDay, $lte: endOfDay }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
                    absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
                    late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
                    excused: { $sum: { $cond: [{ $eq: ['$status', 'excused'] }, 1, 0] } }
                }
            }
        ];
        
        const result = await db.collection('attendance').aggregate(pipeline).toArray();
        return result[0] || { total: 0, present: 0, absent: 0, late: 0, excused: 0 };
    }
}

module.exports = Attendance;

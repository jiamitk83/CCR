const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Class = require('../models/Class');
const { ObjectId } = require('mongodb');

const attendanceController = {
    // Get all attendance
    async getAll(req, res) {
        try {
            const attendance = await Attendance.getAll();
            res.json(attendance);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get attendance by date
    async getByDate(req, res) {
        try {
            const { date } = req.params;
            const attendance = await Attendance.getByDate(date);
            
            // Enrich with student info
            const students = await Student.getAll();
            const studentMap = {};
            students.forEach(s => studentMap[s._id.toString()] = s);
            
            const enriched = attendance.map(a => ({
                ...a,
                studentName: studentMap[a.studentId.toString()] ? 
                    `${studentMap[a.studentId.toString()].firstName} ${studentMap[a.studentId.toString()].lastName}` : 'N/A',
                rollNumber: studentMap[a.studentId.toString()]?.rollNumber || 'N/A'
            }));
            
            res.json(enriched);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get attendance by student
    async getByStudent(req, res) {
        try {
            const { studentId } = req.params;
            const { startDate, endDate } = req.query;
            
            const attendance = await Attendance.getByStudent(studentId, startDate, endDate);
            res.json(attendance);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get attendance by class
    async getByClass(req, res) {
        try {
            const { classId } = req.params;
            const { date } = req.query;
            
            const attendance = await Attendance.getByClass(classId, date || new Date());
            
            // Enrich with student info
            const students = await Student.getByClass(classId);
            const studentMap = {};
            students.forEach(s => studentMap[s._id.toString()] = s);
            
            const enriched = attendance.map(a => ({
                ...a,
                studentName: studentMap[a.studentId.toString()] ? 
                    `${studentMap[a.studentId.toString()].firstName} ${studentMap[a.studentId.toString()].lastName}` : 'N/A',
                rollNumber: studentMap[a.studentId.toString()]?.rollNumber || 'N/A'
            }));
            
            res.json(enriched);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Mark attendance for a student
    async markAttendance(req, res) {
        try {
            const { studentId, classId, date, status, remark } = req.body;
            
            if (!studentId || !classId || !date || !status) {
                return res.status(400).json({ message: 'Student, class, date, and status are required' });
            }

            await Attendance.upsert(studentId, classId, date, status, remark);
            res.json({ message: 'Attendance marked successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Bulk mark attendance for a class
    async bulkMarkAttendance(req, res) {
        try {
            const { classId, date, attendanceRecords } = req.body;
            
            if (!classId || !date || !attendanceRecords || !Array.isArray(attendanceRecords)) {
                return res.status(400).json({ message: 'Class, date, and attendance records are required' });
            }

            const records = attendanceRecords.map(r => ({
                studentId: new ObjectId(r.studentId),
                classId: new ObjectId(classId),
                date: new Date(date),
                status: r.status,
                remark: r.remark || ''
            }));

            // For each record, upsert
            for (const record of records) {
                await Attendance.upsert(record.studentId, record.classId, record.date, record.status, record.remark);
            }

            res.json({ message: 'Attendance marked successfully for all students' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get student attendance statistics
    async getStudentStats(req, res) {
        try {
            const { studentId } = req.params;
            const { startDate, endDate } = req.query;
            
            const stats = await Attendance.getStudentAttendanceStats(
                studentId,
                startDate || new Date(new Date().setMonth(new Date().getMonth() - 1)),
                endDate || new Date()
            );
            
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get class attendance statistics
    async getClassStats(req, res) {
        try {
            const { classId } = req.params;
            const { date } = req.query;
            
            const stats = await Attendance.getClassAttendanceStats(classId, date || new Date());
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Delete attendance record
    async delete(req, res) {
        try {
            const result = await Attendance.delete(req.params.id);
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Attendance record not found' });
            }
            res.json({ message: 'Attendance deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = attendanceController;

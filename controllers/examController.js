const { Exam, ExamResult } = require('../models/Exam');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const { ObjectId } = require('mongodb');

const examController = {
    // Get all exams
    async getAll(req, res) {
        try {
            const exams = await Exam.getAll();
            const subjects = await Subject.getAll();
            const classes = await Class.getAll();
            
            const subjectMap = {};
            subjects.forEach(s => subjectMap[s._id.toString()] = s.name);
            const classMap = {};
            classes.forEach(c => classMap[c._id.toString()] = c.name);
            
            const enriched = exams.map(e => ({
                ...e,
                subjectName: e.subjectId ? subjectMap[e.subjectId.toString()] : 'N/A',
                className: e.classId ? classMap[e.classId.toString()] : 'N/A'
            }));
            
            res.json(enriched);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get exam by ID
    async getById(req, res) {
        try {
            const exam = await Exam.findById(req.params.id);
            if (!exam) {
                return res.status(404).json({ message: 'Exam not found' });
            }
            res.json(exam);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get exams by class
    async getByClass(req, res) {
        try {
            const exams = await Exam.getByClass(req.params.classId);
            res.json(exams);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get upcoming exams
    async getUpcoming(req, res) {
        try {
            const exams = await Exam.getUpcoming();
            res.json(exams);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Create exam
    async create(req, res) {
        try {
            const { title, classId, subjectId, examType, date, startTime, endTime, totalMarks, passingMarks } = req.body;
            
            if (!title || !classId || !subjectId || !date) {
                return res.status(400).json({ message: 'Title, class, subject, and date are required' });
            }

            const examData = {
                title,
                classId: new ObjectId(classId),
                subjectId: new ObjectId(subjectId),
                examType: examType || 'written',
                date: new Date(date),
                startTime,
                endTime,
                totalMarks: totalMarks || 100,
                passingMarks: passingMarks || 35,
                status: 'scheduled'
            };

            const result = await Exam.create(examData);
            res.status(201).json({ message: 'Exam created successfully', examId: result.insertedId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Update exam
    async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = { ...req.body };

            if (updateData.classId) updateData.classId = new ObjectId(updateData.classId);
            if (updateData.subjectId) updateData.subjectId = new ObjectId(updateData.subjectId);
            if (updateData.date) updateData.date = new Date(updateData.date);

            const result = await Exam.update(id, updateData);
            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Exam not found' });
            }
            res.json({ message: 'Exam updated successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Delete exam
    async delete(req, res) {
        try {
            const result = await Exam.delete(req.params.id);
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Exam not found' });
            }
            res.json({ message: 'Exam deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get exam results
    async getResults(req, res) {
        try {
            const { examId } = req.params;
            const results = await ExamResult.getByExam(examId);
            
            // Enrich with student info
            const students = await Student.getAll();
            const studentMap = {};
            students.forEach(s => studentMap[s._id.toString()] = s);
            
            const enriched = results.map(r => ({
                ...r,
                studentName: studentMap[r.studentId.toString()] ? 
                    `${studentMap[r.studentId.toString()].firstName} ${studentMap[r.studentId.toString()].lastName}` : 'N/A',
                rollNumber: studentMap[r.studentId.toString()]?.rollNumber || 'N/A'
            }));
            
            res.json(enriched);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get student results
    async getStudentResults(req, res) {
        try {
            const { studentId } = req.params;
            const results = await ExamResult.getStudentResults(studentId);
            res.json(results);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Add/Update exam result
    async addResult(req, res) {
        try {
            const { examId, studentId, marks, grade, remark } = req.body;
            
            if (!examId || !studentId || marks === undefined) {
                return res.status(400).json({ message: 'Exam, student, and marks are required' });
            }

            await ExamResult.upsert(examId, studentId, marks, grade, remark);
            res.json({ message: 'Result saved successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Bulk add results
    async bulkAddResults(req, res) {
        try {
            const { examId, results } = req.body;
            
            if (!examId || !results || !Array.isArray(results)) {
                return res.status(400).json({ message: 'Exam and results array are required' });
            }

            for (const r of results) {
                await ExamResult.upsert(examId, r.studentId, r.marks, r.grade, r.remark);
            }

            res.json({ message: 'Results saved successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get exam statistics
    async getExamStats(req, res) {
        try {
            const { examId } = req.params;
            const stats = await ExamResult.getExamStats(examId);
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Delete result
    async deleteResult(req, res) {
        try {
            const result = await ExamResult.delete(req.params.id);
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Result not found' });
            }
            res.json({ message: 'Result deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = examController;

const { Homework, HomeworkSubmission } = require('../models/Homework');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const { ObjectId } = require('mongodb');

const homeworkController = {
    // Get all homework
    async getAll(req, res) {
        try {
            const homework = await Homework.getAll();
            const enriched = await enrichHomework(homework);
            res.json(enriched);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get homework by class
    async getByClass(req, res) {
        try {
            const { classId } = req.params;
            const homework = await Homework.getByClass(classId);
            const enriched = await enrichHomework(homework);
            res.json(enriched);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get pending homework for student
    async getPending(req, res) {
        try {
            const { studentId } = req.params;
            const homework = await Homework.getPending(studentId);
            const enriched = await enrichHomework(homework);
            res.json(enriched);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get homework by ID
    async getById(req, res) {
        try {
            const homework = await Homework.findById(req.params.id);
            if (!homework) {
                return res.status(404).json({ message: 'Homework not found' });
            }
            res.json(homework);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Create homework
    async create(req, res) {
        try {
            const { classId, subjectId, title, description, dueDate, attachments } = req.body;
            
            if (!classId || !subjectId || !title || !dueDate) {
                return res.status(400).json({ message: 'Class, subject, title, and due date are required' });
            }

            const homeworkData = {
                classId: new ObjectId(classId),
                subjectId: new ObjectId(subjectId),
                title,
                description,
                dueDate: new Date(dueDate),
                attachments: attachments || []
            };

            const result = await Homework.create(homeworkData);
            res.status(201).json({ message: 'Homework created successfully', homeworkId: result.insertedId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Update homework
    async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = { ...req.body };

            if (updateData.classId) updateData.classId = new ObjectId(updateData.classId);
            if (updateData.subjectId) updateData.subjectId = new ObjectId(updateData.subjectId);
            if (updateData.dueDate) updateData.dueDate = new Date(updateData.dueDate);

            const result = await Homework.update(id, updateData);
            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Homework not found' });
            }
            res.json({ message: 'Homework updated successfully' });
        } catch (error) {
            res.status(500).json(500).json({ error: error.message });
        }
    },

    // Delete homework
    async delete(req, res) {
        try {
            const result = await Homework.delete(req.params.id);
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Homework not found' });
            }
            res.json({ message: 'Homework deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get submissions for homework
    async getSubmissions(req, res) {
        try {
            const { homeworkId } = req.params;
            const submissions = await HomeworkSubmission.getByHomework(homeworkId);
            
            // Enrich with student info
            const students = await Student.getAll();
            const studentMap = {};
            students.forEach(s => studentMap[s._id.toString()] = s);
            
            const enriched = submissions.map(sub => ({
                ...sub,
                studentName: studentMap[sub.studentId.toString()] ? 
                    `${studentMap[sub.studentId.toString()].firstName} ${studentMap[sub.studentId.toString()].lastName}` : 'N/A',
                rollNumber: studentMap[sub.studentId.toString()]?.rollNumber || 'N/A'
            }));
            
            res.json(enriched);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Submit homework
    async submit(req, res) {
        try {
            const { homeworkId, studentId, submissionText, attachments } = req.body;
            
            if (!homeworkId || !studentId) {
                return res.status(400).json({ message: 'Homework and student are required' });
            }

            // Check if already submitted
            const existing = await HomeworkSubmission.getByStudentAndHomework(studentId, homeworkId);
            if (existing) {
                return res.status(400).json({ message: 'Homework already submitted' });
            }

            const submissionData = {
                homeworkId: new ObjectId(homeworkId),
                studentId: new ObjectId(studentId),
                submissionText,
                attachments: attachments || []
            };

            await HomeworkSubmission.create(submissionData);
            res.json({ message: 'Homework submitted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Grade submission
    async gradeSubmission(req, res) {
        try {
            const { id } = req.params;
            const { marks, feedback } = req.body;
            
            if (marks === undefined) {
                return res.status(400).json({ message: 'Marks are required' });
            }

            await HomeworkSubmission.grade(id, marks, feedback);
            res.json({ message: 'Submission graded successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

// Helper function
async function enrichHomework(homework) {
    const subjects = await Subject.getAll();
    const classes = await Class.getAll();
    
    const subjectMap = {};
    subjects.forEach(s => subjectMap[s._id.toString()] = s.name);
    const classMap = {};
    classes.forEach(c => classMap[c._id.toString()] = c.name);

    return homework.map(h => ({
        ...h,
        subjectName: h.subjectId ? subjectMap[h.subjectId.toString()] : 'N/A',
        className: h.classId ? classMap[h.classId.toString()] : 'N/A'
    }));
}

module.exports = homeworkController;

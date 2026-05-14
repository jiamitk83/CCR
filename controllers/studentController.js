const Student = require('../models/Student');
const Class = require('../models/Class');
const { ObjectId } = require('mongodb');

const studentController = {
    // Get all students
    async getAll(req, res) {
        try {
            const students = await Student.getAll();
            // Enrich with class information
            const classes = await Class.getAll();
            const classMap = {};
            classes.forEach(c => classMap[c._id.toString()] = c.name);

            const enrichedStudents = students.map(s => ({
                ...s,
                className: s.classId ? classMap[s.classId.toString()] : 'N/A'
            }));

            res.json(enrichedStudents);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get student by ID
    async getById(req, res) {
        try {
            const student = await Student.findById(req.params.id);
            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }
            res.json(student);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get students by class
    async getByClass(req, res) {
        try {
            const students = await Student.getByClass(req.params.classId);
            res.json(students);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Create new student
    async create(req, res) {
        try {
            const {
                firstName, lastName, gender, dateOfBirth, email, phone,
                address, guardianName, guardianPhone, guardianRelation,
                classId, rollNumber, admissionDate
            } = req.body;

            // Validate required fields
            if (!firstName || !lastName || !classId || !rollNumber) {
                return res.status(400).json({ message: 'First name, last name, class, and roll number are required' });
            }

            // Check if roll number already exists in the class
            const existingStudent = await Student.findOne({ classId: new ObjectId(classId), rollNumber });
            if (existingStudent) {
                return res.status(400).json({ message: 'Roll number already exists in this class' });
            }

            const studentData = {
                firstName,
                lastName,
                gender: gender || 'Other',
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                email,
                phone,
                address,
                guardianName,
                guardianPhone,
                guardianRelation: guardianRelation || 'Parent',
                classId: new ObjectId(classId),
                rollNumber,
                admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
                status: 'active'
            };

            const result = await Student.create(studentData);
            res.status(201).json({ message: 'Student created successfully', studentId: result.insertedId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Update student
    async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = { ...req.body };

            // Convert classId to ObjectId if provided
            if (updateData.classId) {
                updateData.classId = new ObjectId(updateData.classId);
            }

            // Convert date fields
            if (updateData.dateOfBirth) {
                updateData.dateOfBirth = new Date(updateData.dateOfBirth);
            }
            if (updateData.admissionDate) {
                updateData.admissionDate = new Date(updateData.admissionDate);
            }

            const result = await Student.update(id, updateData);
            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Student not found' });
            }
            res.json({ message: 'Student updated successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Delete student
    async delete(req, res) {
        try {
            const result = await Student.delete(req.params.id);
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Student not found' });
            }
            res.json({ message: 'Student deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Search students
    async search(req, res) {
        try {
            const { query } = req.query;
            if (!query) {
                return res.status(400).json({ message: 'Search query is required' });
            }
            const students = await Student.search(query);
            res.json(students);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get student count
    async count(req, res) {
        try {
            const count = await Student.count();
            res.json({ count });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = studentController;

const { Fee, FeeStructure } = require('../models/Fee');
const Student = require('../models/Student');
const Class = require('../models/Class');
const { ObjectId } = require('mongodb');

const feeController = {
    // Get all fees
    async getAll(req, res) {
        try {
            const fees = await Fee.getAll();
            const students = await Student.getAll();
            const classes = await Class.getAll();
            
            const studentMap = {};
            students.forEach(s => studentMap[s._id.toString()] = s);
            const classMap = {};
            classes.forEach(c => classMap[c._id.toString()] = c.name);
            
            const enrichedFees = fees.map(f => ({
                ...f,
                studentName: f.studentId ? `${studentMap[f.studentId.toString()]?.firstName || ''} ${studentMap[f.studentId.toString()]?.lastName || ''}` : 'N/A',
                rollNumber: studentMap[f.studentId.toString()]?.rollNumber || 'N/A',
                className: f.classId ? classMap[f.classId.toString()] : 'N/A'
            }));
            
            res.json(enrichedFees);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get fee by ID
    async getById(req, res) {
        try {
            const fee = await Fee.findById(req.params.id);
            if (!fee) {
                return res.status(404).json({ message: 'Fee record not found' });
            }
            res.json(fee);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get fees by student
    async getByStudent(req, res) {
        try {
            const fees = await Fee.getByStudent(req.params.studentId);
            res.json(fees);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get fees by class
    async getByClass(req, res) {
        try {
            const fees = await Fee.getByClass(req.params.classId);
            res.json(fees);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Create new fee
    async create(req, res) {
        try {
            const {
                studentId, classId, feeType, amount, dueDate,
                description, paymentMethod
            } = req.body;

            if (!studentId || !classId || !feeType || !amount) {
                return res.status(400).json({ message: 'Student, class, fee type, and amount are required' });
            }

            const feeData = {
                studentId: new ObjectId(studentId),
                classId: new ObjectId(classId),
                feeType,
                amount: parseFloat(amount),
                dueDate: dueDate ? new Date(dueDate) : null,
                description,
                status: 'pending',
                paidAmount: 0,
                paymentMethod
            };

            const result = await Fee.create(feeData);
            res.status(201).json({ message: 'Fee created successfully', feeId: result.insertedId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Update fee (mark as paid, etc.)
    async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = { ...req.body };

            // Convert ObjectId fields
            if (updateData.studentId) updateData.studentId = new ObjectId(updateData.studentId);
            if (updateData.classId) updateData.classId = new ObjectId(updateData.classId);
            if (updateData.dueDate) updateData.dueDate = new Date(updateData.dueDate);
            if (updateData.paidDate) updateData.paidDate = new Date(updateData.paidDate);

            // Handle payment
            if (updateData.status === 'paid' && updateData.paidAmount) {
                const fee = await Fee.findById(id);
                if (fee) {
                    updateData.paidAmount = fee.paidAmount + parseFloat(updateData.paidAmount);
                    updateData.paidDate = new Date();
                    if (updateData.paidAmount >= fee.amount) {
                        updateData.status = 'paid';
                    } else {
                        updateData.status = 'partial';
                    }
                }
            }

            const result = await Fee.update(id, updateData);
            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Fee not found' });
            }
            res.json({ message: 'Fee updated successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Delete fee
    async delete(req, res) {
        try {
            const result = await Fee.delete(req.params.id);
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Fee not found' });
            }
            res.json({ message: 'Fee deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get fee statistics
    async getStats(req, res) {
        try {
            const totalPending = await Fee.getTotalPendingAmount();
            const totalCollected = await Fee.getTotalCollectedAmount();
            const pendingFees = await Fee.getPendingFees();
            
            res.json({
                totalPending,
                totalCollected,
                pendingCount: pendingFees.length,
                totalFees: await Fee.count()
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Fee Structure methods
    async getFeeStructures(req, res) {
        try {
            const structures = await FeeStructure.getAll();
            const classes = await Class.getAll();
            const classMap = {};
            classes.forEach(c => classMap[c._id.toString()] = c.name);
            
            const enrichedStructures = structures.map(s => ({
                ...s,
                className: s.classId ? classMap[s.classId.toString()] : 'N/A'
            }));
            
            res.json(enrichedStructures);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async createFeeStructure(req, res) {
        try {
            const { classId, feeType, amount, dueDate, description } = req.body;
            
            if (!classId || !feeType || !amount) {
                return res.status(400).json({ message: 'Class, fee type, and amount are required' });
            }

            const structureData = {
                classId: new ObjectId(classId),
                feeType,
                amount: parseFloat(amount),
                dueDate: dueDate ? new Date(dueDate) : null,
                description
            };

            const result = await FeeStructure.create(structureData);
            res.status(201).json({ message: 'Fee structure created successfully', structureId: result.insertedId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateFeeStructure(req, res) {
        try {
            const { id } = req.params;
            const updateData = { ...req.body };

            if (updateData.classId) updateData.classId = new ObjectId(updateData.classId);
            if (updateData.dueDate) updateData.dueDate = new Date(updateData.dueDate);
            if (updateData.amount) updateData.amount = parseFloat(updateData.amount);

            const result = await FeeStructure.update(id, updateData);
            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Fee structure not found' });
            }
            res.json({ message: 'Fee structure updated successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async deleteFeeStructure(req, res) {
        try {
            const result = await FeeStructure.delete(req.params.id);
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Fee structure not found' });
            }
            res.json({ message: 'Fee structure deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = feeController;

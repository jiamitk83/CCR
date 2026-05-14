const TeacherAllotment = require('../models/TeacherAllotment');

exports.getAllAllotments = async (req, res) => {
    try {
        const allotments = await TeacherAllotment.getAll();
        res.json(allotments.map(a => ({ ...a, _id: a._id.toString() })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createAllotment = async (req, res) => {
    try {
        const { className, subjectName, teacherName } = req.body;
        await TeacherAllotment.create({ className, subjectName, teacherName });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteAllotment = async (req, res) => {
    try {
        const { id } = req.params;
        await TeacherAllotment.delete(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const Teacher = require('../models/Teacher');

exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.getAll();
        res.json(teachers.map(t => ({ ...t, _id: t._id.toString() })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createTeacher = async (req, res) => {
    try {
        const teacher = req.body;
        await Teacher.create(teacher);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher = req.body;
        await Teacher.update(id, teacher);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        await Teacher.delete(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

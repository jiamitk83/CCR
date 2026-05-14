const Subject = require('../models/Subject');

exports.getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.getAll();
        res.json(subjects.map(s => s.name));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createSubject = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Subject name is required' });
        }

        const existingSubject = await Subject.findByName(name);
        if (existingSubject) {
            return res.status(409).json({ success: false, message: 'Subject with this name already exists' });
        }

        await Subject.create(name);
        res.status(201).json({ success: true, message: 'Subject created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateSubject = async (req, res) => {
    try {
        const { oldName } = req.params;
        const { name } = req.body;
        await Subject.update(oldName, name);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteSubject = async (req, res) => {
    try {
        const { name } = req.params;
        const result = await Subject.delete(name);
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }
        res.status(200).json({ success: true, message: 'Subject deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

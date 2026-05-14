const Class = require('../models/Class');

exports.getAllClasses = async (req, res) => {
    try {
        const classes = await Class.getAll();
        res.json(classes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getClassByName = async (req, res) => {
    try {
        const { name } = req.params;
        const classData = await Class.findByName(name);
        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }
        res.json(classData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createClass = async (req, res) => {
    try {
        const { name, subjects } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Class name is required' });
        }

        const existingClass = await Class.findByName(name);
        if (existingClass) {
            return res.status(409).json({ success: false, message: 'Class with this name already exists' });
        }

        await Class.create(name, subjects || []);
        res.status(201).json({ success: true, message: 'Class created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateClass = async (req, res) => {
    try {
        const { oldName } = req.params;
        const { name, subjects } = req.body;
        await Class.update(oldName, name, subjects);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteClass = async (req, res) => {
    try {
        const { name } = req.params;
        const result = await Class.delete(name);
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }
        res.status(200).json({ success: true, message: 'Class deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

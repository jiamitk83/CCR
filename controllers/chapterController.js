const Chapter = require('../models/Chapter');
const { ObjectId } = require('mongodb');

exports.getChaptersByClassAndSubject = async (req, res) => {
    try {
        const { className, subjectName } = req.params;
        const chapters = await Chapter.getByClassAndSubject(className, subjectName);
        res.json(chapters.map(ch => ({ ...ch, _id: ch._id.toString() })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createChapter = async (req, res) => {
    try {
        const { className, subjectName, chapterNumber, name } = req.body;
        if (!className || !subjectName || !chapterNumber || !name) {
            return res.status(400).json({ success: false, message: 'Missing required fields for chapter' });
        }
        const chapter = { className, subjectName, chapterNumber, name };
        await Chapter.create(chapter);
        res.status(201).json({ success: true, message: 'Chapter created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateChapter = async (req, res) => {
    try {
        const { id } = req.params;
        const chapter = req.body;
        await Chapter.update(id, chapter);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteChapter = async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid chapter ID format' });
        }
        const result = await Chapter.delete(id);
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Chapter not found' });
        }
        res.status(200).json({ success: true, message: 'Chapter deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllChapters = async (req, res) => {
    try {
        const chapters = await Chapter.getAll();
        res.json(chapters);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

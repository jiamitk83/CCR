const Status = require('../models/Status');

exports.getStatusByClassAndSubject = async (req, res) => {
    try {
        const { className, subjectName } = req.params;
        const status = await Status.getByClassAndSubject(className, subjectName);
        const statusMap = {};
        status.forEach(s => {
            statusMap[s.chapterNumber] = s;
        });
        res.json(statusMap);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { className, subjectName, chapterNumber } = req.params;
        const statusData = req.body;
        await Status.update(className, subjectName, chapterNumber, statusData);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteStatus = async (req, res) => {
    try {
        const { className, subjectName, chapterNumber } = req.params;
        await Status.delete(className, subjectName, chapterNumber);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllStatus = async (req, res) => {
    try {
        const status = await Status.getAll();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

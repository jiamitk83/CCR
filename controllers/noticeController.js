const Notice = require('../models/Notice');

const noticeController = {
    // Get all notices
    async getAll(req, res) {
        try {
            const notices = await Notice.getAll();
            res.json(notices);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get active notices
    async getActive(req, res) {
        try {
            const notices = await Notice.getActive();
            res.json(notices);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get notice by ID
    async getById(req, res) {
        try {
            const notice = await Notice.findById(req.params.id);
            if (!notice) {
                return res.status(404).json({ message: 'Notice not found' });
            }
            res.json(notice);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get notices by category
    async getByCategory(req, res) {
        try {
            const notices = await Notice.getByCategory(req.params.category);
            res.json(notices);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Create notice
    async create(req, res) {
        try {
            const { title, content, category, priority, expiryDate, targetAudience } = req.body;
            
            if (!title || !content) {
                return res.status(400).json({ message: 'Title and content are required' });
            }

            const noticeData = {
                title,
                content,
                category: category || 'general',
                priority: priority || 'normal',
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                targetAudience: targetAudience || 'all'
            };

            const result = await Notice.create(noticeData);
            res.status(201).json({ message: 'Notice created successfully', noticeId: result.insertedId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Update notice
    async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = { ...req.body };

            if (updateData.expiryDate) {
                updateData.expiryDate = new Date(updateData.expiryDate);
            }

            const result = await Notice.update(id, updateData);
            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Notice not found' });
            }
            res.json({ message: 'Notice updated successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Delete notice
    async delete(req, res) {
        try {
            const result = await Notice.delete(req.params.id);
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Notice not found' });
            }
            res.json({ message: 'Notice deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = noticeController;

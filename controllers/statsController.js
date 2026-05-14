const Stats = require('../models/Stats');

exports.getStats = async (req, res) => {
    try {
        const stats = await Stats.getCounts();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const { getDB } = require('../config/db');

class Stats {
    static async getCounts() {
        const db = getDB();
        const [users, classes, teachers, subjects] = await Promise.all([
            db.collection('users').countDocuments(),
            db.collection('classes').countDocuments(),
            db.collection('teachers').countDocuments(),
            db.collection('subjects').countDocuments()
        ]);
        return { users, classes, teachers, subjects };
    }
}

module.exports = Stats;

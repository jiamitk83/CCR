const { getDB } = require('../config/db');

class Subject {
    static async getAll() {
        const db = getDB();
        return await db.collection('subjects').find({}).toArray();
    }

    static async findByName(name) {
        const db = getDB();
        return await db.collection('subjects').findOne({ name });
    }

    static async create(name) {
        const db = getDB();
        return await db.collection('subjects').insertOne({ name });
    }

    static async update(oldName, newName) {
        const db = getDB();
        return await db.collection('subjects').updateOne({ name: oldName }, { $set: { name: newName } });
    }

    static async delete(name) {
        const db = getDB();
        return await db.collection('subjects').deleteOne({ name });
    }
}

module.exports = Subject;

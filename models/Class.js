const { getDB } = require('../config/db');

class Class {
    static async getAll() {
        const db = getDB();
        return await db.collection('classes').find({}).toArray();
    }

    static async findByName(name) {
        const db = getDB();
        return await db.collection('classes').findOne({ name });
    }

    static async create(name, subjects = []) {
        const db = getDB();
        return await db.collection('classes').insertOne({ name, subjects });
    }

    static async update(oldName, newName, subjects = null) {
        const db = getDB();
        const updateData = { name: newName };
        if (subjects !== null) {
            updateData.subjects = subjects;
        }
        return await db.collection('classes').updateOne({ name: oldName }, { $set: updateData });
    }

    static async delete(name) {
        const db = getDB();
        return await db.collection('classes').deleteOne({ name });
    }
}

module.exports = Class;

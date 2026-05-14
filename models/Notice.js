const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Notice {
    static async findOne(query) {
        const db = getDB();
        return await db.collection('notices').findOne(query);
    }

    static async findById(id) {
        const db = getDB();
        return await db.collection('notices').findOne({ _id: new ObjectId(id) });
    }

    static async getAll() {
        const db = getDB();
        return await db.collection('notices').find({}).sort({ createdAt: -1 }).toArray();
    }

    static async getActive() {
        const db = getDB();
        const now = new Date();
        return await db.collection('notices').find({
            $or: [
                { expiryDate: { $gte: now } },
                { expiryDate: null }
            ]
        }).sort({ createdAt: -1 }).toArray();
    }

    static async getByCategory(category) {
        const db = getDB();
        return await db.collection('notices').find({ category }).sort({ createdAt: -1 }).toArray();
    }

    static async create(noticeData) {
        const db = getDB();
        noticeData.createdAt = new Date();
        noticeData.createdBy = noticeData.createdBy || 'admin';
        return await db.collection('notices').insertOne(noticeData);
    }

    static async update(id, noticeData) {
        const db = getDB();
        noticeData.updatedAt = new Date();
        return await db.collection('notices').updateOne(
            { _id: new ObjectId(id) },
            { $set: noticeData }
        );
    }

    static async delete(id) {
        const db = getDB();
        return await db.collection('notices').deleteOne({ _id: new ObjectId(id) });
    }
}

module.exports = Notice;

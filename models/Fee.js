const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Fee {
    static async findOne(query) {
        const db = getDB();
        return await db.collection('fees').findOne(query);
    }

    static async findById(id) {
        const db = getDB();
        return await db.collection('fees').findOne({ _id: new ObjectId(id) });
    }

    static async getAll() {
        const db = getDB();
        return await db.collection('fees').find({}).toArray();
    }

    static async getByStudent(studentId) {
        const db = getDB();
        return await db.collection('fees').find({ studentId: new ObjectId(studentId) }).toArray();
    }

    static async getByClass(classId) {
        const db = getDB();
        return await db.collection('fees').find({ classId: new ObjectId(classId) }).toArray();
    }

    static async create(feeData) {
        const db = getDB();
        feeData.createdAt = new Date();
        feeData.updatedAt = new Date();
        return await db.collection('fees').insertOne(feeData);
    }

    static async update(id, feeData) {
        const db = getDB();
        feeData.updatedAt = new Date();
        return await db.collection('fees').updateOne(
            { _id: new ObjectId(id) },
            { $set: feeData }
        );
    }

    static async delete(id) {
        const db = getDB();
        return await db.collection('fees').deleteOne({ _id: new ObjectId(id) });
    }

    static async count() {
        const db = getDB();
        return await db.collection('fees').countDocuments();
    }

    static async getPendingFees() {
        const db = getDB();
        return await db.collection('fees').find({ status: 'pending' }).toArray();
    }

    static async getTotalPendingAmount() {
        const db = getDB();
        const result = await db.collection('fees').aggregate([
            { $match: { status: 'pending' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).toArray();
        return result[0]?.total || 0;
    }

    static async getTotalCollectedAmount() {
        const db = getDB();
        const result = await db.collection('fees').aggregate([
            { $match: { status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$paidAmount' } } }
        ]).toArray();
        return result[0]?.total || 0;
    }
}

class FeeStructure {
    static async getAll() {
        const db = getDB();
        return await db.collection('feeStructures').find({}).toArray();
    }

    static async getByClass(classId) {
        const db = getDB();
        return await db.collection('feeStructures').find({ classId: new ObjectId(classId) }).toArray();
    }

    static async create(feeStructureData) {
        const db = getDB();
        feeStructureData.createdAt = new Date();
        return await db.collection('feeStructures').insertOne(feeStructureData);
    }

    static async update(id, feeStructureData) {
        const db = getDB();
        return await db.collection('feeStructures').updateOne(
            { _id: new ObjectId(id) },
            { $set: feeStructureData }
        );
    }

    static async delete(id) {
        const db = getDB();
        return await db.collection('feeStructures').deleteOne({ _id: new ObjectId(id) });
    }
}

module.exports = { Fee, FeeStructure };

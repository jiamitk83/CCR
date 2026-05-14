const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Vehicle {
    static async findOne(query) {
        const db = getDB();
        return await db.collection('vehicles').findOne(query);
    }

    static async findById(id) {
        const db = getDB();
        return await db.collection('vehicles').findOne({ _id: new ObjectId(id) });
    }

    static async getAll() {
        const db = getDB();
        return await db.collection('vehicles').find({}).toArray();
    }

    static async getAvailable() {
        const db = getDB();
        return await db.collection('vehicles').find({ status: 'available' }).toArray();
    }

    static async create(vehicleData) {
        const db = getDB();
        vehicleData.createdAt = new Date();
        vehicleData.status = 'available';
        return await db.collection('vehicles').insertOne(vehicleData);
    }

    static async update(id, vehicleData) {
        const db = getDB();
        return await db.collection('vehicles').updateOne(
            { _id: new ObjectId(id) },
            { $set: vehicleData }
        );
    }

    static async delete(id) {
        const db = getDB();
        return await db.collection('vehicles').deleteOne({ _id: new ObjectId(id) });
    }
}

class Route {
    static async findOne(query) {
        const db = getDB();
        return await db.collection('routes').findOne(query);
    }

    static async findById(id) {
        const db = getDB();
        return await db.collection('routes').findOne({ _id: new ObjectId(id) });
    }

    static async getAll() {
        const db = getDB();
        return await db.collection('routes').find({}).toArray();
    }

    static async create(routeData) {
        const db = getDB();
        routeData.createdAt = new Date();
        return await db.collection('routes').insertOne(routeData);
    }

    static async update(id, routeData) {
        const db = getDB();
        return await db.collection('routes').updateOne(
            { _id: new ObjectId(id) },
            { $set: routeData }
        );
    }

    static async delete(id) {
        const db = getDB();
        return await db.collection('routes').deleteOne({ _id: new ObjectId(id) });
    }
}

class TransportAllocation {
    static async getAll() {
        const db = getDB();
        return await db.collection('transportAllocations').find({}).toArray();
    }

    static async getByStudent(studentId) {
        const db = getDB();
        return await db.collection('transportAllocations').find({ studentId: new ObjectId(studentId) }).toArray();
    }

    static async getByRoute(routeId) {
        const db = getDB();
        return await db.collection('transportAllocations').find({ routeId: new ObjectId(routeId) }).toArray();
    }

    static async create(allocationData) {
        const db = getDB();
        allocationData.createdAt = new Date();
        return await db.collection('transportAllocations').insertOne(allocationData);
    }

    static async update(id, allocationData) {
        const db = getDB();
        return await db.collection('transportAllocations').updateOne(
            { _id: new ObjectId(id) },
            { $set: allocationData }
        );
    }

    static async delete(id) {
        const db = getDB();
        return await db.collection('transportAllocations').deleteOne({ _id: new ObjectId(id) });
    }

    static async deleteByStudent(studentId) {
        const db = getDB();
        return await db.collection('transportAllocations').deleteMany({ studentId: new ObjectId(studentId) });
    }
}

module.exports = { Vehicle, Route, TransportAllocation };

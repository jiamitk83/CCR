const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

class User {
    static async findOne(query) {
        const db = getDB();
        return await db.collection('users').findOne(query);
    }

    static async findById(id) {
        const db = getDB();
        return await db.collection('users').findOne({ _id: new ObjectId(id) });
    }

    static async create(userData) {
        const db = getDB();
        
        // Hash password before storing
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, SALT_ROUNDS);
        }

        // Set default role if not provided
        if (!userData.role) {
            userData.role = 'student';
        }

        // Set default active status
        if (userData.isActive === undefined) {
            userData.isActive = true;
        }

        userData.createdAt = new Date();
        
        return await db.collection('users').insertOne(userData);
    }

    static async getAll() {
        const db = getDB();
        return await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
    }

    static async delete(id) {
        const db = getDB();
        return await db.collection('users').deleteOne({ _id: new ObjectId(id) });
    }
    
    static async count() {
        const db = getDB();
        return await db.collection('users').countDocuments();
    }

    static async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    static async updatePassword(userId, newPassword) {
        const db = getDB();
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        return await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { password: hashedPassword } }
        );
    }

    static async updateRole(userId, role) {
        const db = getDB();
        return await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { role } }
        );
    }

    static async toggleActive(userId) {
        const db = getDB();
        const user = await this.findById(userId);
        return await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { isActive: !user.isActive } }
        );
    }
}

module.exports = User;

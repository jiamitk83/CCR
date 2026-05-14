const User = require('../models/User');

exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Security: Always default to 'student' role - users cannot specify their own role
        // Admin role can only be created via /admin/setup endpoint
        const newUser = {
            username,
            email,
            password, // Will be hashed by User.create()
            role: 'student' // Always default to student
        };

        await User.create(newUser);
        res.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        res.json(users.map(u => ({ ...u, _id: u._id.toString() })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.delete(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.setupAdmin = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const adminUser = {
            username,
            email,
            password, // Will be hashed by User.create()
            role: 'admin'
        };

        await User.create(adminUser);
        res.json({ success: true, message: 'Admin created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

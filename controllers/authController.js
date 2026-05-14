const User = require('../models/User');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Find user by username or email
        const user = await User.findOne({ 
            $or: [{ username }, { email: username }] 
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Check if user is active
        if (user.isActive === false) {
            return res.status(403).json({ message: 'Account is deactivated. Please contact administrator.' });
        }

        // Verify password
        const isPasswordValid = await User.comparePassword(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Create session
        req.session.userId = user._id.toString();
        req.session.username = user.username;
        req.session.userRole = user.role || 'student';
        req.session.email = user.email;

        // Return user info (without password)
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                role: user.role || 'student'
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.logout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                return res.status(500).json({ message: 'Error logging out' });
            }
            res.json({ success: true, message: 'Logout successful' });
        });
    } catch (error) {
        console.error('Logout error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const user = await User.findById(req.session.userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role || 'student',
            isActive: user.isActive !== false
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.checkAuth = async (req, res) => {
    if (req.session && req.session.userId) {
        res.json({ 
            authenticated: true,
            user: {
                id: req.session.userId,
                username: req.session.username,
                role: req.session.userRole,
                email: req.session.email
            }
        });
    } else {
        res.json({ authenticated: false });
    }
};

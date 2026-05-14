// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'Please login to access this resource' 
        });
    }
};

// Middleware to check if user has required role(s)
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ 
                error: 'Unauthorized', 
                message: 'Please login to access this resource' 
            });
        }

        if (!req.session.userRole || !roles.includes(req.session.userRole)) {
            return res.status(403).json({ 
                error: 'Forbidden', 
                message: 'You do not have permission to access this resource' 
            });
        }

        next();
    };
};

// Shorthand middleware for admin-only routes
const isAdmin = requireRole('admin');

// Shorthand middleware for admin or teacher routes
const isTeacherOrAdmin = requireRole('admin', 'teacher');

module.exports = {
    requireAuth,
    requireRole,
    isAdmin,
    isTeacherOrAdmin
};

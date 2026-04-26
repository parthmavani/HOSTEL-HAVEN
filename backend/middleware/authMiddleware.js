const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const [rows] = await pool.query('SELECT user_id, full_name, email, role, is_sharing_location, profile_image_path FROM users WHERE user_id = ?', [decoded.id]);

            if (rows.length === 0) {
                return res.status(401).json({ message: 'User not found' });
            }

            req.user = rows[0];
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            console.log(`[AUTH] Access Denied: User ${req.user.user_id} with role ${req.user.role} tried to access ${req.originalUrl} (requires one of: ${roles.join(', ')})`);
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };

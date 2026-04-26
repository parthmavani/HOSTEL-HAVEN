const pool = require('../config/db');

// @desc    Get all students
// @route   GET /api/users/students
// @access  Private (Warden, Admin, Counsellor)
const getAllStudents = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT u.user_id, u.full_name, u.email, u.phone, u.profile_image_path,
                   s.enrollment_number, s.room_number, s.department, s.year_of_study
            FROM users u
            JOIN students s ON u.user_id = s.user_id
            WHERE u.role = 'student'
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT user_id, full_name, email, role, phone, profile_image_path FROM users WHERE user_id = ?', [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = rows[0];
        let additionalDetails = {};

        if (user.role === 'student') {
            const [studentRows] = await pool.query('SELECT * FROM students WHERE user_id = ?', [user.user_id]);
            if (studentRows.length > 0) additionalDetails = studentRows[0];
        } else if (['warden', 'counsellor', 'admin'].includes(user.role)) {
            const [authRows] = await pool.query('SELECT * FROM authorities WHERE user_id = ?', [user.user_id]);
            if (authRows.length > 0) additionalDetails = authRows[0];
        }

        res.json({ ...user, ...additionalDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filePath = `uploads/profiles/${req.file.filename}`;
        await pool.query('UPDATE users SET profile_image_path = ? WHERE user_id = ?', [filePath, req.user.user_id]);

        res.json({ message: 'Profile photo updated successfully', filePath });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllStudents,
    getUserById,
    updateProfilePhoto
};

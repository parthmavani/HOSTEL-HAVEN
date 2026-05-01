const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { generateOtp, hashOtp, saveOtp, sendEmail } = require('../services/otpService');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
        const { full_name, email, password, role, ...otherDetails } = req.body;

    if (!full_name || !email || !password || !role) {
        return res.status(400).json({ message: 'Please add all required fields' });
    }

    try {
        // Check if user exists
        const [userExists] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
        if (userExists.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user as inactive until OTP verified
        const [result] = await pool.query(
            'INSERT INTO users (full_name, email, password, role, is_active) VALUES (?, ?, ?, ?, FALSE)',
            [full_name, email.toLowerCase().trim(), hashedPassword, role]
        );

        const userId = result.insertId;

        // Handle role-specific tables
        if (role === 'student') {
            const { enrollment_number, room_number, department, year_of_study, parent_email } = otherDetails;
            if (!enrollment_number) {
                await pool.query('DELETE FROM users WHERE user_id = ?', [userId]);
                return res.status(400).json({ message: 'Enrollment number is required for students' });
            }

            const [studentResult] = await pool.query(
                'INSERT INTO students (user_id, enrollment_number, room_number, department, year_of_study) VALUES (?, ?, ?, ?, ?)',
                [userId, enrollment_number, room_number, department, year_of_study]
            );

            if (parent_email) {
                const [parentUser] = await pool.query('SELECT user_id FROM users WHERE email = ? AND role = "parent"', [parent_email.toLowerCase().trim()]);
                if (parentUser.length > 0) {
                    await pool.query(
                        'INSERT INTO parent_student (parent_id, student_id) VALUES (?, ?)',
                        [parentUser[0].user_id, studentResult.insertId]
                    );
                } else {
                    console.log(`Parent with email ${parent_email} not found.`);
                }
            }
        } else if (role === 'warden' || role === 'counsellor' || role === 'admin') {
            const { designation, office_location } = otherDetails;
            await pool.query(
                'INSERT INTO authorities (user_id, designation, office_location) VALUES (?, ?, ?)',
                [userId, designation, office_location]
            );
        }

        // Send OTP for email verification
        const otp = generateOtp();
        const otpHash = await hashOtp(otp);
        await saveOtp(userId, otpHash);
        
        let message = 'Account created. Verify OTP sent to your email.';
        try {
            await sendEmail(email.toLowerCase().trim(), otp);
        } catch (emailError) {
            console.error('Failed to send OTP email during registration:', emailError);
            message = 'Account created, but we could not send the OTP email. You can request a new one from the login page.';
        }

        res.status(201).json({
            user_id: userId,
            full_name,
            email: email.toLowerCase().trim(),
            role,
            is_active: false,
            message: message,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.is_active) {
            return res.status(403).json({ message: 'Account not activated. Verify OTP sent to your email.' });
        }

        if (await bcrypt.compare(password, user.password)) {
            res.json({
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                is_active: user.is_active,
                is_sharing_location: !!user.is_sharing_location,
                profile_image_path: user.profile_image_path,
                token: generateToken(user.user_id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getMe = async (req, res) => {
    // req.user is set by authMiddleware
    // Fetch additional details based on role
    let additionalDetails = {};
    if (req.user.role === 'student') {
        const [studentRows] = await pool.query('SELECT * FROM students WHERE user_id = ?', [req.user.user_id]);
        if (studentRows.length > 0) additionalDetails = studentRows[0];
    } else if (['warden', 'counsellor', 'admin'].includes(req.user.role)) {
        const [authRows] = await pool.query('SELECT * FROM authorities WHERE user_id = ?', [req.user.user_id]);
        if (authRows.length > 0) additionalDetails = authRows[0];
    }

    res.status(200).json({ ...req.user, ...additionalDetails });
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
};

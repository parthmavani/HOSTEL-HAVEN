const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { generateOtp, hashOtp, saveOtp, sendEmail } = require('../services/otpService');

// ─── Helper ───────────────────────────────────────────────────────────────────

const generateToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

// ─── POST /api/auth/request-otp ───────────────────────────────────────────────
/**
 * Body: { email: string }
 * Looks up user by email, generates a hashed OTP, stores it, and sends it via email.
 */
const requestOtp = async (req, res) => {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ message: 'A valid email address is required.' });
    }

    try {
        const [rows] = await pool.query(
            `SELECT user_id, email, is_active, is_sharing_location FROM users WHERE email = ?`,
            [email.toLowerCase().trim()]
        );

        // Generic response to prevent user enumeration
        if (rows.length === 0) {
            return res.status(200).json({ message: 'If an account exists, an OTP has been sent.' });
        }

        const user = rows[0];
        const otp = generateOtp();
        const otpHash = await hashOtp(otp);
        await saveOtp(user.user_id, otpHash);
        await sendEmail(user.email, otp);

        return res.status(200).json({ message: 'If an account exists, an OTP has been sent.' });
    } catch (error) {
        console.error('[requestOtp] Error:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────
/**
 * Body: { email: string, otp: string }
 * Validates OTP, marks it used, returns JWT + user info.
 */
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'email and otp are required.' });
    }

    if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({ message: 'OTP must be a 6-digit number.' });
    }

    try {
        // Resolve user
        const [userRows] = await pool.query(
            `SELECT user_id, full_name, email, role, is_active, is_sharing_location FROM users WHERE email = ?`,
            [email.toLowerCase().trim()]
        );

        if (userRows.length === 0) {
            return res.status(401).json({ message: 'Invalid or expired OTP.' });
        }

        const user = userRows[0];

        // Fetch latest valid OTP
        const [otpRows] = await pool.query(
            `SELECT id, otp_hash FROM otp_verifications
             WHERE user_id = ?
               AND otp_type = 'email'
               AND used = FALSE
               AND expires_at > NOW()
             ORDER BY created_at DESC
             LIMIT 1`,
            [user.user_id]
        );

        if (otpRows.length === 0) {
            return res.status(401).json({ message: 'Invalid or expired OTP.' });
        }

        const record = otpRows[0];
        const isValid = await bcrypt.compare(otp, record.otp_hash);

        if (!isValid) {
            return res.status(401).json({ message: 'Invalid or expired OTP.' });
        }

        // Mark as used
        await pool.query(
            'UPDATE otp_verifications SET used = TRUE WHERE id = ?',
            [record.id]
        );

        // Activate? If the user is not active yet, mark active.
        if (!user.is_active) {
            await pool.query('UPDATE users SET is_active = TRUE WHERE user_id = ?', [user.user_id]);
        }

        return res.status(200).json({
            user_id: user.user_id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            is_active: true,
            is_sharing_location: !!user.is_sharing_location,
            token: generateToken(user.user_id),
        });
    } catch (error) {
        console.error('[verifyOtp] Error:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

module.exports = { requestOtp, verifyOtp };

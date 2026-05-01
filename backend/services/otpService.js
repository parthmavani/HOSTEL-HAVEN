const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const pool = require('../config/db');

// ─── OTP Generation ───────────────────────────────────────────────────────────

/**
 * Generate a cryptographically random 6-digit OTP string.
 * @returns {string} e.g. "042819"
 */
const generateOtp = () => {
    return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
};

/**
 * Hash OTP using bcryptjs before storing.
 */
const hashOtp = async (otp) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(otp, salt);
};

// ─── Database ─────────────────────────────────────────────────────────────────

/**
 * Invalidate previous unused OTPs for this user, then persist the new hash.
 */
const saveOtp = async (userId, otpHash) => {
    const expireMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES || '10', 10);

    // Invalidate old OTPs
    await pool.query(
        `UPDATE otp_verifications SET used = TRUE WHERE user_id = ? AND used = FALSE`,
        [userId]
    );

    // Insert new OTP
    await pool.query(
        `INSERT INTO otp_verifications (user_id, otp_hash, otp_type, expires_at)
         VALUES (?, ?, 'email', DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
        [userId, otpHash, expireMinutes]
    );
};

// ─── Email Delivery (Nodemailer) ──────────────────────────────────────────────

const createTransporter = () => {
    const user = process.env.NODEMAILER_USER;
    const pass = process.env.NODEMAILER_PASS;

    if (!user || !pass) return null; // Dev fallback

    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // false for port 587 (uses STARTTLS)
        requireTLS: true, // Force TLS upgrade
        family: 4, // Force IPv4 explicitly at the socket layer to bypass Render IPv6 issues
        auth: { user, pass },
        connectionTimeout: 10000, // 10 seconds max wait
        greetingTimeout: 10000,
        socketTimeout: 10000,
    });
};

/**
 * Send OTP via email.
 * Falls back to console.log when NODEMAILER_USER / NODEMAILER_PASS are not set.
 */
const sendEmail = async (toAddress, otp) => {
    const transporter = createTransporter();

    if (!transporter) {
        console.log(`\n📧 [DEV MODE] OTP for ${toAddress}: ${otp}\n`);
        return;
    }

    await transporter.sendMail({
        from: `"Hostel Haven" <${process.env.NODEMAILER_USER}>`,
        to: toAddress,
        subject: 'Your Hostel Haven OTP Code',
        html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto;">
                <h2 style="color:#4f46e5;">Hostel Haven</h2>
                <p>Your one-time password is:</p>
                <h1 style="letter-spacing:8px;font-size:40px;color:#111;">${otp}</h1>
                <p>This code expires in <strong>${process.env.OTP_EXPIRE_MINUTES || 10} minutes</strong>.</p>
                <p style="color:#888;font-size:12px;">If you did not request this, please ignore this email.</p>
            </div>
        `,
    });
};

module.exports = { generateOtp, hashOtp, saveOtp, sendEmail };

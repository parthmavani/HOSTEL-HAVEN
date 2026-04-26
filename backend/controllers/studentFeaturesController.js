const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { generateOtp, hashOtp, saveOtp, sendEmail } = require('../services/otpService');

// ---------- GATE PASS ----------
const generateGatePass = async (req, res) => {
    const { leave_id } = req.body;
    try {
        const [student] = await pool.query('SELECT student_id FROM students WHERE user_id = ?', [req.user.user_id]);
        if (student.length === 0) return res.status(404).json({ message: 'Student not found' });

        const [leave] = await pool.query(
            "SELECT * FROM leave_requests WHERE leave_id = ? AND student_id = ? AND current_status = 'approved'",
            [leave_id, student[0].student_id]
        );
        if (leave.length === 0) return res.status(400).json({ message: 'Leave not found or not approved' });

        // Check if pass already exists
        const [existing] = await pool.query('SELECT * FROM gate_passes WHERE leave_id = ?', [leave_id]);
        if (existing.length > 0) return res.json(existing[0]);

        const qrData = JSON.stringify({
            pass_id: `GP-${Date.now()}`,
            student_id: student[0].student_id,
            leave_id,
            from: leave[0].from_date,
            to: leave[0].to_date,
            type: leave[0].leave_type,
        });

        const [result] = await pool.query(
            'INSERT INTO gate_passes (leave_id, student_id, qr_code) VALUES (?, ?, ?)',
            [leave_id, student[0].student_id, qrData]
        );

        res.json({ pass_id: result.insertId, leave_id, qr_code: qrData, status: 'active' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getGatePasses = async (req, res) => {
    try {
        const [student] = await pool.query('SELECT student_id FROM students WHERE user_id = ?', [req.user.user_id]);
        if (student.length === 0) return res.status(404).json({ message: 'Student not found' });

        const [passes] = await pool.query(
            `SELECT gp.*, lr.leave_type, lr.from_date, lr.to_date, lr.out_time, lr.expected_return_time
             FROM gate_passes gp
             JOIN leave_requests lr ON gp.leave_id = lr.leave_id
             WHERE gp.student_id = ?
             ORDER BY gp.created_at DESC`,
            [student[0].student_id]
        );
        res.json(passes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ---------- COMPLAINTS ----------
const createComplaint = async (req, res) => {
    const { subject, description, category, is_anonymous } = req.body;
    if (!subject || !description) return res.status(400).json({ message: 'Subject and description required' });
    try {
        const [result] = await pool.query(
            'INSERT INTO complaints (user_id, subject, description, category, is_anonymous) VALUES (?, ?, ?, ?, ?)',
            [req.user.user_id, subject, description, category || 'other', is_anonymous || false]
        );
        res.status(201).json({ complaint_id: result.insertId, message: 'Complaint submitted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getComplaints = async (req, res) => {
    try {
        const [complaints] = await pool.query(
            'SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.user_id]
        );
        res.json(complaints);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ---------- ANNOUNCEMENTS ----------
const getAnnouncements = async (req, res) => {
    try {
        const [announcements] = await pool.query(
            `SELECT a.*, u.full_name AS posted_by_name, u.role AS posted_by_role
             FROM announcements a
             JOIN users u ON a.posted_by = u.user_id
             ORDER BY a.created_at DESC LIMIT 20`
        );
        res.json(announcements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ---------- STUDENT STATS ----------
const getStudentStats = async (req, res) => {
    try {
        const [student] = await pool.query('SELECT student_id FROM students WHERE user_id = ?', [req.user.user_id]);
        if (student.length === 0) return res.status(404).json({ message: 'Student not found' });
        const sid = student[0].student_id;

        const [total] = await pool.query('SELECT COUNT(*) AS c FROM leave_requests WHERE student_id = ?', [sid]);
        const [approved] = await pool.query("SELECT COUNT(*) AS c FROM leave_requests WHERE student_id = ? AND current_status='approved'", [sid]);
        const [rejected] = await pool.query("SELECT COUNT(*) AS c FROM leave_requests WHERE student_id = ? AND current_status='rejected'", [sid]);
        const [pending] = await pool.query("SELECT COUNT(*) AS c FROM leave_requests WHERE student_id = ? AND current_status='pending'", [sid]);

        // Monthly breakdown for charts
        const [monthly] = await pool.query(`
            SELECT DATE_FORMAT(applied_at, '%b') AS month, DATE_FORMAT(applied_at, '%Y-%m') AS key_month,
                   COUNT(*) AS total,
                   SUM(CASE WHEN current_status='approved' THEN 1 ELSE 0 END) AS approved,
                   SUM(CASE WHEN current_status='rejected' THEN 1 ELSE 0 END) AS rejected
            FROM leave_requests WHERE student_id = ?
            AND applied_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY month, key_month ORDER BY key_month
        `, [sid]);

        // Leave type breakdown
        const [byType] = await pool.query(`
            SELECT leave_type, COUNT(*) AS count FROM leave_requests WHERE student_id = ? GROUP BY leave_type ORDER BY count DESC
        `, [sid]);

        res.json({
            total: total[0].c, approved: approved[0].c, rejected: rejected[0].c, pending: pending[0].c,
            monthly, by_type: byType,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ---------- PROFILE UPDATE ----------
const updateProfile = async (req, res) => {
    const { full_name, phone, room_number, department } = req.body;
    try {
        if (full_name || phone) {
            const updates = [];
            const vals = [];
            if (full_name) { updates.push('full_name = ?'); vals.push(full_name); }
            if (phone) { updates.push('phone = ?'); vals.push(phone); }
            vals.push(req.user.user_id);
            await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`, vals);
        }
        if (room_number || department) {
            const updates = [];
            const vals = [];
            if (room_number) { updates.push('room_number = ?'); vals.push(room_number); }
            if (department) { updates.push('department = ?'); vals.push(department); }
            vals.push(req.user.user_id);
            await pool.query(`UPDATE students SET ${updates.join(', ')} WHERE user_id = ?`, vals);
        }
        res.json({ message: 'Profile updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ---------- PASSWORD CHANGE (OTP-Verified) ----------

// Step 1: Validate current password, send OTP to user's email
const requestPasswordChangeOtp = async (req, res) => {
    const { current_password } = req.body;
    if (!current_password) return res.status(400).json({ message: 'Current password is required' });
    try {
        const [user] = await pool.query('SELECT password, email FROM users WHERE user_id = ?', [req.user.user_id]);
        if (user.length === 0) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(current_password, user[0].password);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

        // Generate and send OTP
        const otp = generateOtp();
        const otpHash = await hashOtp(otp);
        await saveOtp(req.user.user_id, otpHash);
        await sendEmail(user[0].email, otp);

        res.json({ message: 'OTP sent to your registered email address' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Step 2: Verify OTP and change password
const changePasswordWithOtp = async (req, res) => {
    const { current_password, new_password, otp } = req.body;
    if (!current_password || !new_password || !otp) {
        return res.status(400).json({ message: 'Current password, new password, and OTP are required' });
    }
    if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({ message: 'OTP must be a 6-digit number' });
    }
    try {
        // Re-validate current password
        const [user] = await pool.query('SELECT password FROM users WHERE user_id = ?', [req.user.user_id]);
        if (user.length === 0) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(current_password, user[0].password);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

        // Verify OTP
        const [otpRows] = await pool.query(
            `SELECT id, otp_hash FROM otp_verifications
             WHERE user_id = ? AND otp_type = 'email' AND used = FALSE AND expires_at > NOW()
             ORDER BY created_at DESC LIMIT 1`,
            [req.user.user_id]
        );
        if (otpRows.length === 0) {
            return res.status(401).json({ message: 'Invalid or expired OTP. Please request a new one.' });
        }

        const isValidOtp = await bcrypt.compare(otp, otpRows[0].otp_hash);
        if (!isValidOtp) {
            return res.status(401).json({ message: 'Invalid or expired OTP.' });
        }

        // Mark OTP as used
        await pool.query('UPDATE otp_verifications SET used = TRUE WHERE id = ?', [otpRows[0].id]);

        // Update password
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(new_password, salt);
        await pool.query('UPDATE users SET password = ? WHERE user_id = ?', [hashed, req.user.user_id]);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    generateGatePass, getGatePasses,
    createComplaint, getComplaints,
    getAnnouncements,
    getStudentStats,
    updateProfile, requestPasswordChangeOtp, changePasswordWithOtp,
};

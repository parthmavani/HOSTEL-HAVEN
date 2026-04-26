const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// ─── System Overview ───
const getSystemOverview = async (req, res) => {
    try {
        const [students] = await pool.query('SELECT COUNT(*) AS c FROM users WHERE role="student"');
        const [parents] = await pool.query('SELECT COUNT(*) AS c FROM users WHERE role="parent"');
        const [wardens] = await pool.query('SELECT COUNT(*) AS c FROM users WHERE role="warden"');
        const [guards] = await pool.query('SELECT COUNT(*) AS c FROM users WHERE role="guard"');
        const [admins] = await pool.query('SELECT COUNT(*) AS c FROM users WHERE role="admin"');
        const [totalRooms] = await pool.query('SELECT COUNT(DISTINCT room_number) AS c FROM students');
        const [activeLeaves] = await pool.query("SELECT COUNT(*) AS c FROM leave_requests WHERE current_status='approved' AND to_date >= CURDATE()");
        const [pendingLeaves] = await pool.query("SELECT COUNT(*) AS c FROM leave_requests WHERE current_status='pending'");
        const [todayLeaves] = await pool.query("SELECT COUNT(*) AS c FROM leave_requests WHERE DATE(applied_at)=CURDATE()");
        const occupancy = students[0].c > 0 ? Math.round(((students[0].c - activeLeaves[0].c) / students[0].c) * 100) : 100;
        res.json({ students: students[0].c, parents: parents[0].c, wardens: wardens[0].c, guards: guards[0].c, admins: admins[0].c, total_rooms: totalRooms[0].c, active_leaves: activeLeaves[0].c, pending_leaves: pendingLeaves[0].c, today_leaves: todayLeaves[0].c, occupancy_rate: occupancy });
    } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};

// ─── User Management: list users by role ───
const getUsersByRole = async (req, res) => {
    try {
        const role = req.params.role;
        const valid = ['student', 'parent', 'warden', 'counsellor', 'admin', 'guard'];
        if (!valid.includes(role)) return res.status(400).json({ message: 'Invalid role' });
        let q = 'SELECT u.user_id, u.full_name, u.email, u.phone, u.role, u.created_at FROM users u WHERE u.role = ?';
        if (role === 'student') q = `SELECT u.user_id, u.full_name, u.email, u.phone, u.role, u.created_at, s.enrollment_number, s.department, s.room_number, s.year_of_study FROM users u JOIN students s ON u.user_id = s.user_id WHERE u.role='student'`;
        const [rows] = await pool.query(q, [role]);
        res.json(rows);
    } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};

// ─── Delete User ───
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const [user] = await pool.query('SELECT role FROM users WHERE user_id = ?', [id]);
        if (user.length === 0) return res.status(404).json({ message: 'User not found' });
        if (user[0].role === 'student') await pool.query('DELETE FROM students WHERE user_id = ?', [id]);
        if (['warden', 'counsellor', 'admin'].includes(user[0].role)) await pool.query('DELETE FROM authorities WHERE user_id = ?', [id]);
        if (user[0].role === 'parent') await pool.query('DELETE FROM parents WHERE user_id = ?', [id]);
        await pool.query('DELETE FROM notifications WHERE user_id = ?', [id]);
        await pool.query('DELETE FROM users WHERE user_id = ?', [id]);
        res.json({ message: 'User deleted' });
    } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};

// ─── Reset Password ───
const resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const newPass = 'hostel@123';
        const hashed = await bcrypt.hash(newPass, 10);
        await pool.query('UPDATE users SET password = ? WHERE user_id = ?', [hashed, id]);
        res.json({ message: `Password reset to: ${newPass}` });
    } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};

// ─── Leave Management: all leaves with override ───
const getAllLeavesAdmin = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT lr.*, u.full_name AS student_name, s.department, s.enrollment_number
            FROM leave_requests lr JOIN students s ON lr.student_id = s.student_id JOIN users u ON s.user_id = u.user_id
            ORDER BY lr.applied_at DESC LIMIT 200
        `);
        res.json(rows);
    } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};

const overrideLeaveStatus = async (req, res) => {
    try {
        const { leaveId } = req.params;
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
        await pool.query('UPDATE leave_requests SET current_status = ? WHERE leave_id = ?', [status, leaveId]);
        await pool.query(`UPDATE leave_approvals SET decision = ?, decision_time = NOW(), approved_by = ? WHERE leave_id = ? AND decision = 'pending' LIMIT 1`, [status, req.user.user_id, leaveId]);
        res.json({ message: `Leave ${status} by admin override` });
    } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};

// ─── Security: login logs & activity ───
const getSecurityLogs = async (req, res) => {
    try {
        const [recentLogins] = await pool.query('SELECT u.user_id, u.full_name, u.role, u.email, u.created_at AS last_login FROM users u ORDER BY u.created_at DESC LIMIT 50');
        const [gateLogs] = await pool.query('SELECT gp.*, u.full_name FROM gate_passes gp JOIN users u ON gp.student_id = u.user_id ORDER BY gp.created_at DESC LIMIT 30');
        res.json({ recent_logins: recentLogins, gate_logs: gateLogs });
    } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};

// ─── Broadcast Announcement ───
const adminBroadcast = async (req, res) => {
    try {
        const { title, content, priority } = req.body;
        if (!title || !content) return res.status(400).json({ message: 'Title and content required' });
        await pool.query('INSERT INTO announcements (posted_by, title, content, priority) VALUES (?, ?, ?, ?)', [req.user.user_id, title, content, priority || 'normal']);
        res.status(201).json({ message: 'Announcement posted' });
    } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};

module.exports = { getSystemOverview, getUsersByRole, deleteUser, resetUserPassword, getAllLeavesAdmin, overrideLeaveStatus, getSecurityLogs, adminBroadcast };

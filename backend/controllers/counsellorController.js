const pool = require('../config/db');

// ─── Overview Dashboard Stats ───
const getCounsellorOverview = async (req, res) => {
    try {
        const [totalStudents] = await pool.query('SELECT COUNT(*) AS c FROM students');
        const [pendingLeaves] = await pool.query("SELECT COUNT(*) AS c FROM leave_requests WHERE current_status = 'pending' AND (approval_stage = 'counsellor' OR approval_stage = 'done')");
        const [activeLeaves] = await pool.query("SELECT COUNT(*) AS c FROM leave_requests WHERE current_status = 'approved' AND NOW() BETWEEN from_date AND to_date");
        const [emergencyLeaves] = await pool.query("SELECT COUNT(*) AS c FROM leave_requests WHERE leave_type = 'EMERGENCY' AND applied_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");

        // Recent high-frequency leave students
        const [frequentLeaveStudents] = await pool.query(`
            SELECT u.full_name, s.enrollment_number, s.department, COUNT(lr.leave_id) AS leave_count
            FROM leave_requests lr
            JOIN students s ON lr.student_id = s.student_id
            JOIN users u ON s.user_id = u.user_id
            WHERE lr.applied_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY s.student_id, u.full_name, s.enrollment_number, s.department
            HAVING leave_count >= 3
            ORDER BY leave_count DESC
            LIMIT 10
        `);

        res.json({
            total_students: totalStudents[0].c,
            pending_requests: pendingLeaves[0].c,
            active_leaves: activeLeaves[0].c,
            emergency_count: emergencyLeaves[0].c,
            high_risk_students: frequentLeaveStudents,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── All Students with Risk Indicators ───
const getAllStudentsWithRisk = async (req, res) => {
    try {
        const [students] = await pool.query(`
            SELECT u.user_id, u.full_name, u.email, s.student_id, s.enrollment_number, s.department, s.room_number, s.year_of_study,
                (SELECT COUNT(*) FROM leave_requests lr WHERE lr.student_id = s.student_id AND lr.applied_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS recent_leaves,
                (SELECT COUNT(*) FROM leave_requests lr WHERE lr.student_id = s.student_id AND lr.leave_type = 'EMERGENCY') AS emergency_count
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            ORDER BY recent_leaves DESC
        `);

        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── Student Profile Detail ───
const getStudentProfile = async (req, res) => {
    const { studentId } = req.params;
    try {
        const [student] = await pool.query(`
            SELECT u.user_id, u.full_name, u.email, s.*, 
                (SELECT COUNT(*) FROM leave_requests lr WHERE lr.student_id = s.student_id) AS total_leaves,
                (SELECT COUNT(*) FROM leave_requests lr WHERE lr.student_id = s.student_id AND lr.current_status = 'approved') AS approved_leaves,
                (SELECT COUNT(*) FROM leave_requests lr WHERE lr.student_id = s.student_id AND lr.current_status = 'rejected') AS rejected_leaves
            FROM students s JOIN users u ON s.user_id = u.user_id WHERE s.student_id = ?
        `, [studentId]);
        if (student.length === 0) return res.status(404).json({ message: 'Student not found' });

        const [recentLeaves] = await pool.query(
            'SELECT * FROM leave_requests WHERE student_id = ? ORDER BY applied_at DESC LIMIT 10', [studentId]
        );

        res.json({ ...student[0], recent_leaves: recentLeaves });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── Leave Monitoring ───
const getLeaveMonitoring = async (req, res) => {
    try {
        // Frequent leave students
        const [frequent] = await pool.query(`
            SELECT u.full_name, s.enrollment_number, s.department, COUNT(lr.leave_id) AS leave_count,
                SUM(CASE WHEN lr.leave_type = 'EMERGENCY' THEN 1 ELSE 0 END) AS emergency_count
            FROM leave_requests lr
            JOIN students s ON lr.student_id = s.student_id
            JOIN users u ON s.user_id = u.user_id
            WHERE lr.applied_at >= DATE_SUB(NOW(), INTERVAL 60 DAY)
            GROUP BY s.student_id, u.full_name, s.enrollment_number, s.department
            HAVING leave_count >= 3
            ORDER BY leave_count DESC
        `);

        // Leave pattern by type
        const [byType] = await pool.query(`
            SELECT leave_type, COUNT(*) AS count FROM leave_requests
            WHERE applied_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
            GROUP BY leave_type ORDER BY count DESC
        `);

        // Monthly trend
        const [monthly] = await pool.query(`
            SELECT DATE_FORMAT(applied_at, '%b') AS month, DATE_FORMAT(applied_at, '%Y-%m') AS key_month,
                COUNT(*) AS total,
                SUM(CASE WHEN leave_type = 'EMERGENCY' THEN 1 ELSE 0 END) AS emergency
            FROM leave_requests
            WHERE applied_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY month, key_month ORDER BY key_month
        `);

        // Complaints
        const [complaints] = await pool.query(`
            SELECT c.*, u.full_name FROM complaints c JOIN users u ON c.user_id = u.user_id
            ORDER BY c.created_at DESC LIMIT 20
        `);

        res.json({ frequent_students: frequent, by_type: byType, monthly_trend: monthly, complaints });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── Broadcast Announcement ───
const postAnnouncement = async (req, res) => {
    const { title, content, priority } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content required' });
    try {
        const [result] = await pool.query(
            'INSERT INTO announcements (posted_by, title, content, priority) VALUES (?, ?, ?, ?)',
            [req.user.user_id, title, content, priority || 'normal']
        );
        res.status(201).json({ announcement_id: result.insertId, message: 'Announcement posted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getCounsellorOverview,
    getAllStudentsWithRisk,
    getStudentProfile,
    getLeaveMonitoring,
    postAnnouncement,
};

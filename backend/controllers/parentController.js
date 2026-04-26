const pool = require('../config/db');

// ─── Get Parent's Children ───
const getChildrenIds = async (userId) => {
    const [rows] = await pool.query(
        `SELECT s.student_id, s.user_id, u.full_name, s.enrollment_number, s.department, s.room_number, s.year_of_study
         FROM parent_student ps
         JOIN students s ON ps.student_id = s.student_id
         JOIN users u ON s.user_id = u.user_id
         WHERE ps.parent_id = ?`, [userId]
    );
    return rows;
};

// ─── Overview ───
const getParentOverview = async (req, res) => {
    try {
        const children = await getChildrenIds(req.user.user_id);
        if (children.length === 0) return res.json({ children: [], stats: {} });
        const sids = children.map(c => c.student_id);

        const [activeLeaves] = await pool.query(
            `SELECT lr.*, u.full_name FROM leave_requests lr JOIN students s ON lr.student_id = s.student_id JOIN users u ON s.user_id = u.user_id
             WHERE lr.student_id IN (?) AND lr.current_status = 'approved' AND lr.to_date >= CURDATE()`, [sids]
        );
        const [totalLeaves] = await pool.query('SELECT COUNT(*) AS c FROM leave_requests WHERE student_id IN (?)', [sids]);
        const [pendingLeaves] = await pool.query("SELECT COUNT(*) AS c FROM leave_requests WHERE student_id IN (?) AND current_status = 'pending'", [sids]);
        const [recentNotifs] = await pool.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10', [req.user.user_id]
        );

        // Per-child stats
        const childStats = [];
        for (const child of children) {
            const [leaves] = await pool.query('SELECT COUNT(*) AS c FROM leave_requests WHERE student_id = ?', [child.student_id]);
            const [approved] = await pool.query("SELECT COUNT(*) AS c FROM leave_requests WHERE student_id = ? AND current_status = 'approved'", [child.student_id]);
            const isOnLeave = activeLeaves.some(l => l.student_id === child.student_id);
            childStats.push({ ...child, total_leaves: leaves[0].c, approved_leaves: approved[0].c, is_on_leave: isOnLeave });
        }

        res.json({
            children: childStats,
            active_leaves: activeLeaves,
            total_leaves: totalLeaves[0].c,
            pending_leaves: pendingLeaves[0].c,
            notifications: recentNotifs,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── Leave Monitoring ───
const getChildLeaves = async (req, res) => {
    try {
        const children = await getChildrenIds(req.user.user_id);
        if (children.length === 0) return res.json([]);
        const sids = children.map(c => c.student_id);

        const [leaves] = await pool.query(
            `SELECT lr.*, u.full_name AS student_name FROM leave_requests lr
             JOIN students s ON lr.student_id = s.student_id JOIN users u ON s.user_id = u.user_id
             WHERE lr.student_id IN (?) ORDER BY lr.applied_at DESC`, [sids]
        );

        // Monthly breakdown
        const [monthly] = await pool.query(`
            SELECT DATE_FORMAT(applied_at, '%b') AS month, DATE_FORMAT(applied_at, '%Y-%m') AS key_month,
                   COUNT(*) AS total,
                   SUM(CASE WHEN current_status='approved' THEN 1 ELSE 0 END) AS approved,
                   SUM(CASE WHEN leave_type='EMERGENCY' THEN 1 ELSE 0 END) AS emergency
            FROM leave_requests WHERE student_id IN (?)
            AND applied_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY month, key_month ORDER BY key_month
        `, [sids]);

        // Frequent leave check
        const [frequent] = await pool.query(`
            SELECT u.full_name, COUNT(lr.leave_id) AS leave_count
            FROM leave_requests lr JOIN students s ON lr.student_id = s.student_id JOIN users u ON s.user_id = u.user_id
            WHERE lr.student_id IN (?) AND lr.applied_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY s.student_id, u.full_name HAVING leave_count >= 3
        `, [sids]);

        res.json({ leaves, monthly, frequent_alerts: frequent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── Announcements for parent ───
const getParentAnnouncements = async (req, res) => {
    try {
        const [items] = await pool.query(
            `SELECT a.*, u.full_name AS posted_by_name FROM announcements a
             JOIN users u ON a.posted_by = u.user_id ORDER BY a.created_at DESC LIMIT 20`
        );
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getParentOverview, getChildLeaves, getParentAnnouncements };

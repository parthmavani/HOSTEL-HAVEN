const pool = require('../config/db');

// @desc    Get all analytics data for admin dashboard
// @route   GET /api/analytics
// @access  Private (Admin/Warden)
const getAnalytics = async (req, res) => {
    try {
        // 1. Overview KPIs
        const [totalLeaves] = await pool.query('SELECT COUNT(*) AS count FROM leave_requests');
        const [pendingLeaves] = await pool.query("SELECT COUNT(*) AS count FROM leave_requests WHERE current_status = 'pending'");
        const [approvedLeaves] = await pool.query("SELECT COUNT(*) AS count FROM leave_requests WHERE current_status = 'approved'");
        const [rejectedLeaves] = await pool.query("SELECT COUNT(*) AS count FROM leave_requests WHERE current_status = 'rejected'");
        const [totalStudents] = await pool.query('SELECT COUNT(*) AS count FROM students');

        // 2. Monthly leave trends (last 12 months)
        const [monthlyTrends] = await pool.query(`
            SELECT 
                DATE_FORMAT(applied_at, '%Y-%m') AS month,
                DATE_FORMAT(applied_at, '%b %Y') AS label,
                COUNT(*) AS total,
                SUM(CASE WHEN current_status = 'approved' THEN 1 ELSE 0 END) AS approved,
                SUM(CASE WHEN current_status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
                SUM(CASE WHEN current_status = 'pending' THEN 1 ELSE 0 END) AS pending
            FROM leave_requests
            WHERE applied_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY month, label
            ORDER BY month ASC
        `);

        // 3. Leave type distribution
        const [leaveTypeDistribution] = await pool.query(`
            SELECT 
                leave_type,
                COUNT(*) AS count,
                ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM leave_requests), 1) AS percentage
            FROM leave_requests
            GROUP BY leave_type
            ORDER BY count DESC
        `);

        // 4. Department-wise comparison
        const [departmentStats] = await pool.query(`
            SELECT 
                COALESCE(s.department, 'Unknown') AS department,
                COUNT(lr.leave_id) AS total_leaves,
                SUM(CASE WHEN lr.current_status = 'approved' THEN 1 ELSE 0 END) AS approved,
                SUM(CASE WHEN lr.current_status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
                SUM(CASE WHEN lr.current_status = 'pending' THEN 1 ELSE 0 END) AS pending
            FROM leave_requests lr
            JOIN students s ON lr.student_id = s.student_id
            GROUP BY s.department
            ORDER BY total_leaves DESC
        `);

        // 5. Day of week distribution
        const [dayOfWeekStats] = await pool.query(`
            SELECT 
                DAYNAME(applied_at) AS day_name,
                DAYOFWEEK(applied_at) AS day_num,
                COUNT(*) AS count
            FROM leave_requests
            GROUP BY day_name, day_num
            ORDER BY day_num
        `);

        // 6. Approval rate by role
        const [approvalRateByRole] = await pool.query(`
            SELECT 
                u.role AS approver_role,
                COUNT(*) AS total_decisions,
                SUM(CASE WHEN la.decision = 'approved' THEN 1 ELSE 0 END) AS approved,
                SUM(CASE WHEN la.decision = 'rejected' THEN 1 ELSE 0 END) AS rejected,
                ROUND(SUM(CASE WHEN la.decision = 'approved' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 1) AS approval_rate
            FROM leave_approvals la
            JOIN users u ON la.approved_by = u.user_id
            WHERE la.decision != 'pending'
            GROUP BY u.role
        `);

        // 7. Recent leave activity (last 10)
        const [recentActivity] = await pool.query(`
            SELECT 
                lr.leave_id, lr.leave_type, lr.current_status, lr.applied_at,
                u.full_name AS student_name, s.department
            FROM leave_requests lr
            JOIN students s ON lr.student_id = s.student_id
            JOIN users u ON s.user_id = u.user_id
            ORDER BY lr.applied_at DESC
            LIMIT 10
        `);

        // 8. Top students by leave count
        const [topStudents] = await pool.query(`
            SELECT 
                u.full_name, s.enrollment_number, s.department,
                COUNT(lr.leave_id) AS leave_count
            FROM leave_requests lr
            JOIN students s ON lr.student_id = s.student_id
            JOIN users u ON s.user_id = u.user_id
            GROUP BY s.student_id, u.full_name, s.enrollment_number, s.department
            ORDER BY leave_count DESC
            LIMIT 5
        `);

        // 9. Average approval time (from applied to final decision)
        const [avgApprovalTime] = await pool.query(`
            SELECT 
                ROUND(AVG(TIMESTAMPDIFF(HOUR, lr.applied_at, la.decision_time)), 1) AS avg_hours
            FROM leave_requests lr
            JOIN leave_approvals la ON lr.leave_id = la.leave_id
            WHERE la.decision != 'pending' AND la.decision_time IS NOT NULL
            AND lr.current_status != 'pending'
        `);

        res.json({
            kpis: {
                total_leaves: totalLeaves[0].count,
                pending: pendingLeaves[0].count,
                approved: approvedLeaves[0].count,
                rejected: rejectedLeaves[0].count,
                total_students: totalStudents[0].count,
                approval_rate: totalLeaves[0].count > 0
                    ? Math.round(approvedLeaves[0].count * 100 / totalLeaves[0].count)
                    : 0,
                avg_approval_hours: avgApprovalTime[0]?.avg_hours || 0,
            },
            monthly_trends: monthlyTrends,
            leave_type_distribution: leaveTypeDistribution,
            department_stats: departmentStats,
            day_of_week_stats: dayOfWeekStats,
            approval_rate_by_role: approvalRateByRole,
            recent_activity: recentActivity,
            top_students: topStudents,
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAnalytics };

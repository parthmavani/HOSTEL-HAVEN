const pool = require('../config/db');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.user_id]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE notification_id = ? AND user_id = ?',
            [req.params.id, req.user.user_id]
        );
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper: create a notification (used by leaveController)
const createNotification = async (userId, message) => {
    try {
        await pool.query(
            'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
            [userId, message]
        );
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    createNotification
};

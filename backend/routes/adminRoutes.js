const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getSystemOverview, getUsersByRole, deleteUser, resetUserPassword, getAllLeavesAdmin, overrideLeaveStatus, getSecurityLogs, adminBroadcast } = require('../controllers/adminController');

router.get('/overview', protect, authorize('admin', 'warden'), getSystemOverview);
router.get('/users/:role', protect, authorize('admin', 'warden'), getUsersByRole);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.put('/users/:id/reset-password', protect, authorize('admin'), resetUserPassword);
router.get('/leaves', protect, authorize('admin', 'warden'), getAllLeavesAdmin);
router.put('/leaves/:leaveId/override', protect, authorize('admin'), overrideLeaveStatus);
router.get('/security', protect, authorize('admin', 'warden'), getSecurityLogs);
router.post('/broadcast', protect, authorize('admin'), adminBroadcast);

module.exports = router;

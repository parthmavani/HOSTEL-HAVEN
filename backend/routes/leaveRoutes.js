const express = require('express');
const router = express.Router();
const { createLeaveRequest, getLeaveRequests, updateLeaveStatus } = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.post('/', protect, authorize('student'), upload.single('annexure'), createLeaveRequest);
router.get('/', protect, getLeaveRequests);
router.put('/:id/status', protect, authorize('warden', 'parent', 'counsellor', 'admin'), updateLeaveStatus);

module.exports = router;

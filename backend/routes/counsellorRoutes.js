const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getCounsellorOverview,
    getAllStudentsWithRisk,
    getStudentProfile,
    getLeaveMonitoring,
    postAnnouncement,
} = require('../controllers/counsellorController');

router.get('/overview', protect, authorize('counsellor', 'admin', 'warden'), getCounsellorOverview);
router.get('/students', protect, authorize('counsellor', 'admin', 'warden'), getAllStudentsWithRisk);
router.get('/students/:studentId', protect, authorize('counsellor', 'admin', 'warden'), getStudentProfile);
router.get('/leave-monitoring', protect, authorize('counsellor', 'admin', 'warden'), getLeaveMonitoring);
router.post('/announcements', protect, authorize('counsellor', 'admin', 'warden'), postAnnouncement);

module.exports = router;

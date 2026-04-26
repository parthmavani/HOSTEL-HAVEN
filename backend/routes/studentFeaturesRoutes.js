const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    generateGatePass, getGatePasses,
    createComplaint, getComplaints,
    getAnnouncements,
    getStudentStats,
    updateProfile, requestPasswordChangeOtp, changePasswordWithOtp,
} = require('../controllers/studentFeaturesController');

// Gate Pass
router.post('/gate-pass', protect, authorize('student'), generateGatePass);
router.get('/gate-passes', protect, authorize('student'), getGatePasses);

// Complaints
router.post('/complaints', protect, createComplaint);
router.get('/complaints', protect, getComplaints);

// Announcements
router.get('/announcements', protect, getAnnouncements);

// Stats
router.get('/stats', protect, authorize('student'), getStudentStats);

// Profile
router.put('/profile', protect, updateProfile);

// Password Change (OTP-verified)
router.post('/change-password/request-otp', protect, requestPasswordChangeOtp);
router.put('/change-password', protect, changePasswordWithOtp);

module.exports = router;


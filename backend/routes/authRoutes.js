const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { otpRequestLimiter, otpVerifyLimiter } = require('../middleware/rateLimiter');
const { requestOtp, verifyOtp } = require('../controllers/otpController');

// Existing auth
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getMe);

// OTP auth
router.post('/request-otp', otpRequestLimiter, requestOtp);
router.post('/verify-otp', otpVerifyLimiter, verifyOtp);

module.exports = router;

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for POST /api/auth/request-otp
 * Max 5 OTP requests per IP per 15 minutes
 */
const otpRequestLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many OTP requests from this IP, please try again after 15 minutes.',
    },
    skipSuccessfulRequests: false,
});

/**
 * Rate limiter for POST /api/auth/verify-otp
 * Max 10 verification attempts per IP per 15 minutes (prevent brute-force)
 */
const otpVerifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many verification attempts from this IP, please try again after 15 minutes.',
    },
    skipSuccessfulRequests: false,
});

module.exports = { otpRequestLimiter, otpVerifyLimiter };

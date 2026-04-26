-- OTP Verifications Table Migration
-- Run this against the hostel_leave_management database

USE hostel_leave_management;

CREATE TABLE IF NOT EXISTS otp_verifications (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    otp_hash    VARCHAR(255) NOT NULL,
    otp_type    ENUM('email', 'phone') NOT NULL,
    expires_at  DATETIME NOT NULL,
    used        BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_otp (user_id, used, expires_at)
);

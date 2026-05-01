CREATE DATABASE IF NOT EXISTS hostel_leave_management
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE hostel_leave_management;

-- ===============================
-- 1. USERS TABLE
-- ===============================

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student','parent','warden','counsellor','admin') NOT NULL,
    phone VARCHAR(15),
    profile_image_path VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_sharing_location BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- 2. STUDENTS TABLE
-- ===============================

CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    enrollment_number VARCHAR(50) NOT NULL,
    room_number VARCHAR(20),
    department VARCHAR(100),
    year_of_study INT
);

-- ===============================
-- 3. PARENT-STUDENT RELATION
-- ===============================

CREATE TABLE parent_student (
    parent_student_id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    student_id INT NOT NULL
);

-- ===============================
-- 4. AUTHORITIES TABLE
-- ===============================

CREATE TABLE authorities (
    authority_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    designation VARCHAR(100),
    office_location VARCHAR(100)
);

-- ===============================
-- 5. LEAVE REQUEST TABLE
-- ===============================

CREATE TABLE leave_requests (
    leave_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    out_time TIME,
    expected_return_time TIME,
    leave_type ENUM(
        'HOME',
        'COLLEGE',
        'HOME_COLLEGE',
        'THURSDAY',
        'SUNDAY',
        'MEDICAL',
        'EMERGENCY'
    ) NOT NULL,
    description TEXT NOT NULL,
    current_status ENUM('pending','approved','rejected') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- 6. LEAVE APPROVAL TABLE
-- ===============================

CREATE TABLE leave_approvals (
    approval_id INT AUTO_INCREMENT PRIMARY KEY,
    leave_id INT NOT NULL,
    approved_by INT NOT NULL,
    decision ENUM('approved','rejected','pending') DEFAULT 'pending',
    remarks TEXT,
    decision_time TIMESTAMP NULL
);

-- ===============================
-- 7. NOTIFICATIONS TABLE
-- ===============================

CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- 8. LEAVE HISTORY TABLE
-- ===============================

CREATE TABLE leave_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    leave_id INT NOT NULL,
    final_status ENUM('approved','rejected') NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


USE hostel_leave_management;

ALTER TABLE leave_requests
  MODIFY COLUMN leave_type ENUM('HOME','HOME_COLLEGE','COLLEGE','THURSDAY','SUNDAY') NOT NULL;
  ALTER TABLE leave_requests ADD COLUMN annexure_path VARCHAR(255) NULL;
 
 USE hostel_leave_management;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE leave_history;
TRUNCATE TABLE leave_approvals;
TRUNCATE TABLE leave_requests;
TRUNCATE TABLE notifications;
TRUNCATE TABLE parent_student;
TRUNCATE TABLE authorities;
TRUNCATE TABLE students;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

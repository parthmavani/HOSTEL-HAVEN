CREATE DATABASE IF NOT EXISTS hostel_leave_management
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE hostel_leave_management;

-- ===============================
-- 1. USERS TABLE
-- ===============================

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student','parent','warden','counsellor','admin','guard') NOT NULL,
    phone VARCHAR(15),
    profile_image_path VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- 2. STUDENTS TABLE
-- ===============================

CREATE TABLE IF NOT EXISTS students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    enrollment_number VARCHAR(50) NOT NULL UNIQUE,
    room_number VARCHAR(20),
    department VARCHAR(100),
    year_of_study INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ===============================
-- 3. PARENT-STUDENT RELATION
-- ===============================

CREATE TABLE IF NOT EXISTS parent_student (
    parent_student_id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    student_id INT NOT NULL,
    FOREIGN KEY (parent_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    UNIQUE (parent_id, student_id)
);

-- ===============================
-- 4. AUTHORITIES TABLE
-- ===============================

CREATE TABLE IF NOT EXISTS authorities (
    authority_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    designation VARCHAR(100),
    office_location VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ===============================
-- 5. LEAVE REQUEST TABLE
-- ===============================

CREATE TABLE IF NOT EXISTS leave_requests (
    leave_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    out_time TIME,
    expected_return_time TIME,
    leave_type ENUM(
        'HOME',
        'HOME_COLLEGE',
        'COLLEGE',
        'THURSDAY',
        'SUNDAY',
        'EMERGENCY',
        'MEDICAL',
        'OTHER'
    ) NOT NULL,
    description TEXT NOT NULL,
    current_status ENUM('pending','approved','rejected') DEFAULT 'pending',
    approval_stage ENUM('parent','counsellor','warden','done') DEFAULT 'parent',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CHECK (from_date <= to_date)
);

-- ===============================
-- 6. LEAVE APPROVAL TABLE
-- ===============================

CREATE TABLE IF NOT EXISTS leave_approvals (
    approval_id INT AUTO_INCREMENT PRIMARY KEY,
    leave_id INT NOT NULL,
    approved_by INT NOT NULL,
    decision ENUM('approved','rejected','pending') DEFAULT 'pending',
    remarks TEXT,
    decision_time TIMESTAMP NULL,
    FOREIGN KEY (leave_id) REFERENCES leave_requests(leave_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE (leave_id, approved_by)
);

-- ===============================
-- 7. NOTIFICATIONS TABLE
-- ===============================

CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ===============================
-- 8. LEAVE HISTORY TABLE
-- ===============================

CREATE TABLE IF NOT EXISTS leave_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    leave_id INT NOT NULL,
    final_status ENUM('approved','rejected') NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (leave_id) REFERENCES leave_requests(leave_id) ON DELETE CASCADE
);

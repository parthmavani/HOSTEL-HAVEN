USE hostel_leave_management;

-- ===============================
-- USERS CONSTRAINTS
-- ===============================

ALTER TABLE users
ADD CONSTRAINT unique_email UNIQUE (email);

-- ===============================
-- STUDENTS CONSTRAINTS
-- ===============================

ALTER TABLE students
ADD CONSTRAINT unique_enrollment UNIQUE (enrollment_number),
ADD CONSTRAINT unique_user_student UNIQUE (user_id),
ADD CONSTRAINT fk_student_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE;

-- ===============================
-- PARENT-STUDENT CONSTRAINTS
-- ===============================

ALTER TABLE parent_student
ADD CONSTRAINT fk_parent_user
    FOREIGN KEY (parent_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE,
ADD CONSTRAINT fk_parent_student
    FOREIGN KEY (student_id)
    REFERENCES students(student_id)
    ON DELETE CASCADE,
ADD CONSTRAINT unique_parent_student
    UNIQUE (parent_id, student_id);

-- ===============================
-- AUTHORITIES CONSTRAINTS
-- ===============================

ALTER TABLE authorities
ADD CONSTRAINT unique_authority_user UNIQUE (user_id),
ADD CONSTRAINT fk_authority_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE;

-- ===============================
-- LEAVE REQUEST CONSTRAINTS
-- ===============================

ALTER TABLE leave_requests
ADD CONSTRAINT fk_leave_student
    FOREIGN KEY (student_id)
    REFERENCES students(student_id)
    ON DELETE CASCADE,
ADD CONSTRAINT chk_leave_dates
    CHECK (from_date <= to_date);

-- ===============================
-- LEAVE APPROVAL CONSTRAINTS
-- ===============================

ALTER TABLE leave_approvals
ADD CONSTRAINT fk_approval_leave
    FOREIGN KEY (leave_id)
    REFERENCES leave_requests(leave_id)
    ON DELETE CASCADE,
ADD CONSTRAINT fk_approval_user
    FOREIGN KEY (approved_by)
    REFERENCES users(user_id)
    ON DELETE CASCADE,
ADD CONSTRAINT unique_leave_user
    UNIQUE (leave_id, approved_by);

-- ===============================
-- NOTIFICATION CONSTRAINTS
-- ===============================

ALTER TABLE notifications
ADD CONSTRAINT fk_notification_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE;

-- ===============================
-- LEAVE HISTORY CONSTRAINTS
-- ===============================

ALTER TABLE leave_history
ADD CONSTRAINT fk_history_leaveusers
    FOREIGN KEY (leave_id)
    REFERENCES leave_requests(leave_id)
    ON DELETE CASCADE;
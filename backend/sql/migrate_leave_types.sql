-- ===============================================================
-- Migration: Update leave_type ENUM to new 5 leave types
-- Run this ONCE against your hostel_leave_management database
-- ===============================================================

USE hostel_leave_management;

ALTER TABLE leave_requests
  MODIFY COLUMN leave_type ENUM('HOME', 'HOME_COLLEGE', 'COLLEGE', 'THURSDAY', 'SUNDAY') NOT NULL;

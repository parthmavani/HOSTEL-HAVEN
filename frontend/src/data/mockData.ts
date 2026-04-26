import { User, Student, LeaveRequest, Notification } from '@/types';

export const mockUsers: User[] = [
  { user_id: 1, full_name: 'Priya Sharma', email: 'priya@student.edu', role: 'student', phone: '9876543210', is_active: true },
  { user_id: 2, full_name: 'Anita Sharma', email: 'anita@parent.com', role: 'parent', phone: '9876543211', is_active: true },
  { user_id: 3, full_name: 'Dr. Meena Gupta', email: 'meena@hostel.edu', role: 'warden', phone: '9876543212', is_active: true },
  { user_id: 4, full_name: 'Prof. Rekha Singh', email: 'rekha@college.edu', role: 'counsellor', phone: '9876543213', is_active: true },
  { user_id: 5, full_name: 'Neha Verma', email: 'neha@student.edu', role: 'student', phone: '9876543214', is_active: true },
];

export const mockStudents: Student[] = [
  { student_id: 1, user_id: 1, enrollment_number: 'EN2024001', room_number: 'A-101', department: 'Computer Science', year_of_study: 2 },
  { student_id: 2, user_id: 5, enrollment_number: 'EN2024002', room_number: 'A-203', department: 'Electronics', year_of_study: 3 },
];

export const mockLeaveRequests: LeaveRequest[] = [
  {
    leave_id: 1, student_id: 1, student_name: 'Priya Sharma', enrollment_number: 'EN2024001',
    room_number: 'A-101', department: 'Computer Science',
    from_date: '2026-02-18', to_date: '2026-02-20', out_time: '09:00', expected_return_time: '18:00',
    leave_type: 'HOME', description: 'Going home for family function.',
    current_status: 'pending', applied_at: '2026-02-15T10:30:00',
    approvals: [
      { approval_id: 1, leave_id: 1, approved_by: 2, approver_name: 'Anita Sharma', approver_role: 'parent', decision: 'approved', remarks: 'Approved. Take care.', decision_time: '2026-02-15T11:00:00' },
      { approval_id: 2, leave_id: 1, approved_by: 3, approver_name: 'Dr. Meena Gupta', approver_role: 'warden', decision: 'pending', remarks: undefined, decision_time: undefined },
    ],
  },
  {
    leave_id: 2, student_id: 1, student_name: 'Priya Sharma', enrollment_number: 'EN2024001',
    room_number: 'A-101', department: 'Computer Science',
    from_date: '2026-02-10', to_date: '2026-02-10', out_time: '14:00', expected_return_time: '20:00',
    leave_type: 'COLLEGE', description: 'Project presentation at main campus.',
    current_status: 'approved', applied_at: '2026-02-08T09:00:00',
    approvals: [
      { approval_id: 3, leave_id: 2, approved_by: 2, approver_name: 'Anita Sharma', approver_role: 'parent', decision: 'approved', remarks: 'OK', decision_time: '2026-02-08T10:00:00' },
      { approval_id: 4, leave_id: 2, approved_by: 4, approver_name: 'Prof. Rekha Singh', approver_role: 'counsellor', decision: 'approved', remarks: 'Approved for project.', decision_time: '2026-02-08T11:00:00' },
      { approval_id: 5, leave_id: 2, approved_by: 3, approver_name: 'Dr. Meena Gupta', approver_role: 'warden', decision: 'approved', remarks: 'Approved', decision_time: '2026-02-08T12:00:00' },
    ],
  },
  {
    leave_id: 3, student_id: 2, student_name: 'Neha Verma', enrollment_number: 'EN2024002',
    room_number: 'A-203', department: 'Electronics',
    from_date: '2026-02-20', to_date: '2026-02-22', out_time: '08:00', expected_return_time: '20:00',
    leave_type: 'MEDICAL', description: 'Doctor appointment and follow-up.',
    current_status: 'pending', applied_at: '2026-02-14T16:00:00',
    approvals: [
      { approval_id: 6, leave_id: 3, approved_by: 2, approver_name: 'Anita Sharma', approver_role: 'parent', decision: 'pending', remarks: undefined, decision_time: undefined },
      { approval_id: 7, leave_id: 3, approved_by: 3, approver_name: 'Dr. Meena Gupta', approver_role: 'warden', decision: 'pending', remarks: undefined, decision_time: undefined },
    ],
  },
  {
    leave_id: 4, student_id: 1, student_name: 'Priya Sharma', enrollment_number: 'EN2024001',
    room_number: 'A-101', department: 'Computer Science',
    from_date: '2026-02-05', to_date: '2026-02-05',
    leave_type: 'THURSDAY', description: 'Weekly outing.',
    current_status: 'rejected', applied_at: '2026-02-03T08:00:00',
    approvals: [
      { approval_id: 8, leave_id: 4, approved_by: 2, approver_name: 'Anita Sharma', approver_role: 'parent', decision: 'rejected', remarks: 'Not this week.', decision_time: '2026-02-03T09:00:00' },
      { approval_id: 9, leave_id: 4, approved_by: 3, approver_name: 'Dr. Meena Gupta', approver_role: 'warden', decision: 'pending', remarks: undefined, decision_time: undefined },
    ],
  },
];

export const mockNotifications: Notification[] = [
  { notification_id: 1, user_id: 1, message: 'Your leave request for HOME (Feb 18-20) has been approved by parent.', is_read: false, created_at: '2026-02-15T11:00:00' },
  { notification_id: 2, user_id: 1, message: 'Your COLLEGE leave (Feb 10) has been fully approved.', is_read: true, created_at: '2026-02-08T12:00:00' },
  { notification_id: 3, user_id: 3, message: 'New leave request from Priya Sharma (HOME) awaiting your approval.', is_read: false, created_at: '2026-02-15T10:30:00' },
  { notification_id: 4, user_id: 3, message: 'New leave request from Neha Verma (MEDICAL) awaiting your approval.', is_read: false, created_at: '2026-02-14T16:00:00' },
  { notification_id: 5, user_id: 2, message: 'Neha Verma has applied for MEDICAL leave (Feb 20-22).', is_read: false, created_at: '2026-02-14T16:00:00' },
];

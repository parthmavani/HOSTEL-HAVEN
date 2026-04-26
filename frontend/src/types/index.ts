export type Role = 'student' | 'parent' | 'warden' | 'counsellor' | 'admin' | 'guard';

export type LeaveType = 'HOME' | 'HOME_COLLEGE' | 'COLLEGE' | 'THURSDAY' | 'SUNDAY';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type ApprovalStage = 'parent' | 'counsellor' | 'warden' | 'done';


export interface User {
  user_id: number;
  full_name: string;
  email: string;
  role: Role;
  phone?: string;
  profile_image_path?: string;
  is_active: boolean;
}

export interface Student {
  student_id: number;
  user_id: number;
  enrollment_number: string;
  room_number?: string;
  department?: string;
  year_of_study?: number;
}

export interface LeaveRequest {
  leave_id: number;
  student_id: number;
  student_name: string;
  enrollment_number: string;
  room_number?: string;
  department?: string;
  from_date: string;
  to_date: string;
  out_time?: string;
  expected_return_time?: string;
  leave_type: LeaveType;
  description: string;
  current_status: LeaveStatus;
  approval_stage: ApprovalStage;
  share_with_parent: boolean;
  share_with_counsellor: boolean;
  applied_at: string;
  approvals: LeaveApproval[];
}

export interface LeaveApproval {
  approval_id: number;
  leave_id: number;
  approved_by: number;
  approver_name: string;
  approver_role: Role;
  decision: LeaveStatus;
  remarks?: string;
  decision_time?: string;
}

export interface Notification {
  notification_id: number;
  user_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}


// ── OTP Authentication ─────────────────────────────────────────────────────────

export interface RequestOtpPayload {
  email: string;
}

export interface RequestOtpResponse {
  message: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  user_id: number;
  full_name: string;
  email: string;
  role: Role;
  is_active: boolean;
  token: string;
}




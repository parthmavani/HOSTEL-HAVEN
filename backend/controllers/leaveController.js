const pool = require('../config/db');
const { createNotification } = require('./notificationController');

// Determine the approval chain based on leave type
// HOME, THURSDAY, SUNDAY → parent → warden (sequential AND gate)
// COLLEGE, HOME_COLLEGE  → parent → (counsellor OR warden) — OR gate
//   approval_stage stays at 'counsellor' until either counsellor OR warden approves
function getApprovalChain(leaveType) {
    if (['COLLEGE', 'HOME_COLLEGE'].includes(leaveType)) {
        return ['parent', 'counsellor'];
    }
    return ['parent', 'warden'];
}

// Get the next stage in the chain after the current one
function getNextStage(chain, currentStage) {
    const idx = chain.indexOf(currentStage);
    if (idx === -1 || idx === chain.length - 1) return 'done';
    return chain[idx + 1];
}

// @desc    Create a leave request
// @route   POST /api/leaves
// @access  Private (Student)
const createLeaveRequest = async (req, res) => {
    let { from_date, to_date, leave_type, description, out_time, expected_return_time } = req.body;

    // Validate leave type
    const validLeaveTypes = ['HOME', 'HOME_COLLEGE', 'COLLEGE', 'THURSDAY', 'SUNDAY'];
    if (!validLeaveTypes.includes(leave_type)) {
        return res.status(400).json({ message: `Invalid leave type. Must be one of: ${validLeaveTypes.join(', ')}` });
    }

    // Auto-set times for THURSDAY and SUNDAY leaves
    if (leave_type === 'THURSDAY') {
        out_time = '16:00:00';
        expected_return_time = '18:00:00';
        to_date = from_date; // single day only
    }
    if (leave_type === 'SUNDAY') {
        out_time = '09:00:00';
        expected_return_time = '18:00:00';
        to_date = from_date; // single day only
    }

    try {
        // Get student record
        const [student] = await pool.query(
            'SELECT student_id FROM students WHERE user_id = ?',
            [req.user.user_id]
        );

        if (student.length === 0) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const studentId = student[0].student_id;
        const chain = getApprovalChain(leave_type);
        const firstStage = chain[0]; // always 'parent'

        // Insert the leave request with approval_stage
        const [result] = await pool.query(
            `INSERT INTO leave_requests 
             (student_id, from_date, to_date, leave_type, description, out_time, expected_return_time, approval_stage) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [studentId, from_date, to_date, leave_type, description, out_time, expected_return_time, firstStage]
        );

        const leaveId = result.insertId;

        // Find parent(s) linked to this student and create approval rows + notifications
        const [parents] = await pool.query(
            `SELECT u.user_id, u.full_name FROM parent_student ps 
             JOIN users u ON ps.parent_id = u.user_id 
             WHERE ps.student_id = ?`,
            [studentId]
        );

        for (const parent of parents) {
            await pool.query(
                'INSERT INTO leave_approvals (leave_id, approved_by, decision) VALUES (?, ?, ?)',
                [leaveId, parent.user_id, 'pending']
            );
            await createNotification(
                parent.user_id,
                `New leave request from ${req.user.full_name} (${leave_type}) awaiting your approval.`
            );
        }

        // Pre-create approval rows for counsellors (if in chain)
        if (chain.includes('counsellor')) {
            const [counsellors] = await pool.query(
                "SELECT user_id FROM users WHERE role = 'counsellor' AND is_active = TRUE"
            );
            for (const c of counsellors) {
                await pool.query(
                    'INSERT INTO leave_approvals (leave_id, approved_by, decision) VALUES (?, ?, ?)',
                    [leaveId, c.user_id, 'pending']
                );
            }
        }

        // Pre-create approval rows for wardens
        const [wardens] = await pool.query(
            "SELECT user_id FROM users WHERE role = 'warden' AND is_active = TRUE"
        );
        for (const w of wardens) {
            await pool.query(
                'INSERT INTO leave_approvals (leave_id, approved_by, decision) VALUES (?, ?, ?)',
                [leaveId, w.user_id, 'pending']
            );
        }

        res.status(201).json({ message: 'Leave request submitted successfully', leave_id: leaveId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all leave requests (filtered by role)
// @route   GET /api/leaves
// @access  Private
const getLeaveRequests = async (req, res) => {
    try {
        let query = `
            SELECT lr.*, s.enrollment_number, s.room_number, s.department, u.full_name AS student_name, u.email
            FROM leave_requests lr
            JOIN students s ON lr.student_id = s.student_id
            JOIN users u ON s.user_id = u.user_id
        `;
        let params = [];

        if (req.user.role === 'student') {
            // Students see their own requests
            query += ' WHERE u.user_id = ?';
            params.push(req.user.user_id);
        } else if (req.user.role === 'parent') {
            // Parents see their children's requests where approval_stage is 'parent' (pending for them)
            // OR leaves they already acted on (history)
            query += `
                WHERE s.student_id IN (
                    SELECT student_id FROM parent_student WHERE parent_id = ?
                )
            `;
            params.push(req.user.user_id);
        } else if (req.user.role === 'counsellor') {
            // Counsellors see leaves for students assigned to them
            // Fallback: If student has no counsellor assigned, it remains visible (optional, but requested for visibility)
            query += `
                WHERE s.counsellor_id = ? OR s.counsellor_id IS NULL
            `;
            params.push(req.user.user_id);
        } else if (req.user.role === 'warden') {
            // Wardens see all leaves
        }

        query += ' ORDER BY lr.applied_at DESC';

        const [rows] = await pool.query(query, params);

        // For each leave, fetch its approvals
        for (const leave of rows) {
            const [approvals] = await pool.query(
                `SELECT la.approval_id, la.leave_id, la.approved_by, la.decision, la.remarks, la.decision_time,
                        u.full_name AS approver_name, u.role AS approver_role
                 FROM leave_approvals la
                 JOIN users u ON la.approved_by = u.user_id
                 WHERE la.leave_id = ?
                 ORDER BY FIELD(u.role, 'parent', 'counsellor', 'warden')`,
                [leave.leave_id]
            );
            leave.approvals = approvals;
        }

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update leave status (Approve/Reject) with chain enforcement
// @route   PUT /api/leaves/:id/status
// @access  Private (Warden/Parent/Counsellor)
const updateLeaveStatus = async (req, res) => {
    const { status, remarks } = req.body; // status: 'approved' | 'rejected'
    const leaveId = req.params.id;
    const approverId = req.user.user_id;
    const approverRole = req.user.role;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        // Get the leave request to check approval_stage
        const [leaveRows] = await pool.query(
            'SELECT lr.*, s.student_id, su.user_id AS student_user_id, su.full_name AS student_name FROM leave_requests lr JOIN students s ON lr.student_id = s.student_id JOIN users su ON s.user_id = su.user_id WHERE lr.leave_id = ?',
            [leaveId]
        );

        if (leaveRows.length === 0) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        const leave = leaveRows[0];

        // Check if leave is still pending
        if (leave.current_status !== 'pending') {
            return res.status(400).json({ message: 'This leave request has already been decided' });
        }

        // Check if it's this role's turn to approve
        // OR gate: for COLLEGE/HOME_COLLEGE at 'counsellor' stage,
        // output = 1 if counsellor = 1 OR warden = 1 (either approval = leave approved)
        const isOrGateStage =
            leave.approval_stage === 'counsellor' &&
            ['COLLEGE', 'HOME_COLLEGE'].includes(leave.leave_type) &&
            ['counsellor', 'warden'].includes(approverRole);

        if (leave.approval_stage !== approverRole && !isOrGateStage) {
            return res.status(403).json({
                message: `It's not your turn to approve. Current stage: ${leave.approval_stage}`
            });
        }

        // For parents, also verify they are linked to this student
        if (approverRole === 'parent') {
            const [link] = await pool.query(
                'SELECT * FROM parent_student WHERE parent_id = ? AND student_id = ?',
                [approverId, leave.student_id]
            );
            if (link.length === 0) {
                return res.status(403).json({ message: 'You are not linked to this student' });
            }
        }

        // Record the approval decision
        await pool.query(
            `INSERT INTO leave_approvals (leave_id, approved_by, decision, remarks, decision_time) 
             VALUES (?, ?, ?, ?, NOW()) 
             ON DUPLICATE KEY UPDATE decision = ?, remarks = ?, decision_time = NOW()`,
            [leaveId, approverId, status, remarks, status, remarks]
        );

        const chain = getApprovalChain(leave.leave_type);

        if (status === 'rejected') {
            // Rejected at any stage → final rejection
            await pool.query(
                'UPDATE leave_requests SET current_status = ?, approval_stage = ? WHERE leave_id = ?',
                ['rejected', 'done', leaveId]
            );

            // Notify student
            await createNotification(
                leave.student_user_id,
                `Your ${leave.leave_type} leave (${leave.from_date} to ${leave.to_date}) was rejected by ${approverRole}.`
            );

            return res.json({ message: 'Leave request rejected' });
        }

        // Approved — advance to next stage
        // OR gate output: counsellor approved OR warden approved → leave = approved
        let nextStage;
        if (isOrGateStage) {
            nextStage = 'done';
        } else {
            nextStage = getNextStage(chain, approverRole);
        }

        if (nextStage === 'done') {
            // Final approval (warden approved)
            await pool.query(
                'UPDATE leave_requests SET current_status = ?, approval_stage = ? WHERE leave_id = ?',
                ['approved', 'done', leaveId]
            );

            // Notify student of final approval
            await createNotification(
                leave.student_user_id,
                `Your ${leave.leave_type} leave (${leave.from_date} to ${leave.to_date}) has been fully approved!`
            );
        } else {
            // Advance to next stage
            await pool.query(
                'UPDATE leave_requests SET approval_stage = ? WHERE leave_id = ?',
                [nextStage, leaveId]
            );

            // Notify student of progress
            await createNotification(
                leave.student_user_id,
                `Your ${leave.leave_type} leave was approved by ${approverRole}. Now waiting for ${nextStage} approval.`
            );

            // Notify next approver(s)
            // For COLLEGE/HOME_COLLEGE advancing to 'counsellor' stage:
            // notify BOTH counsellors AND wardens (OR gate — either can approve)
            let nextApprovers = [];
            if (nextStage === 'counsellor') {
                const [counsellors] = await pool.query(
                    "SELECT user_id FROM users WHERE role = 'counsellor' AND is_active = TRUE"
                );
                const [wardens] = await pool.query(
                    "SELECT user_id FROM users WHERE role = 'warden' AND is_active = TRUE"
                );
                nextApprovers = [...counsellors, ...wardens];
            } else if (nextStage === 'warden') {
                const [rows] = await pool.query(
                    "SELECT user_id FROM users WHERE role = 'warden' AND is_active = TRUE"
                );
                nextApprovers = rows;
            }

            for (const approver of nextApprovers) {
                await createNotification(
                    approver.user_id,
                    `Leave request from ${leave.student_name} (${leave.leave_type}) is now awaiting your approval.`
                );
            }
        }

        res.json({ message: `Leave request approved. ${nextStage === 'done' ? 'Fully approved!' : `Now pending ${nextStage} approval.`}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createLeaveRequest,
    getLeaveRequests,
    updateLeaveStatus
};

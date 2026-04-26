import { LeaveRequest, Role, ApprovalStage } from '@/types';
import { StatusBadge } from './StatusBadge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, BookOpen, User, ChevronRight, CheckCircle2, XCircle, CircleDot, QrCode } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LeaveCardProps {
  leave: LeaveRequest;
  viewerRole: Role;
  viewerUserId: number;
  onApprove?: (leaveId: number, remarks: string) => void;
  onReject?: (leaveId: number, remarks: string) => void;
}

const leaveTypeLabels: Record<string, string> = {
  HOME: 'Home Leave',
  HOME_COLLEGE: 'Home-College Leave',
  COLLEGE: 'College Leave',
  THURSDAY: 'Thursday Leave',
  SUNDAY: 'Sunday Leave',
};

function getChainForLeave(leaveType: string): ApprovalStage[] {
  // COLLEGE and HOME_COLLEGE: parent → (counsellor OR warden) — OR gate, show as 2 steps
  if (['COLLEGE', 'HOME_COLLEGE'].includes(leaveType)) {
    return ['parent', 'counsellor'];
  }
  // HOME, THURSDAY, SUNDAY → parent → warden only
  return ['parent', 'warden'];
}

const stageLabels: Record<string, string> = {
  parent: 'Parent',
  counsellor: 'Counsellor / Warden',
  warden: 'Warden',
};

export const LeaveCard = ({ leave, viewerRole, viewerUserId, onApprove, onReject }: LeaveCardProps) => {
  const [remarks, setRemarks] = useState('');
  const navigate = useNavigate();

  const chain = getChainForLeave(leave.leave_type);
  // OR gate: warden can also approve counsellor-stage COLLEGE/HOME_COLLEGE leaves
  const isOrGate =
    leave.approval_stage === 'counsellor' &&
    ['COLLEGE', 'HOME_COLLEGE'].includes(leave.leave_type) &&
    viewerRole === 'warden';

  const canAct = leave.current_status === 'pending' && (leave.approval_stage === viewerRole || isOrGate);

  // Build chain progress display
  const getStageStatus = (stage: ApprovalStage) => {
    if (leave.current_status === 'rejected') {
      // Find who rejected
      const rejector = leave.approvals?.find(a => a.decision === 'rejected');
      if (rejector && rejector.approver_role === stage) return 'rejected';
      // Stages before the rejector are approved
      const stageIdx = chain.indexOf(stage);
      const rejectorIdx = rejector ? chain.indexOf(rejector.approver_role as ApprovalStage) : -1;
      if (stageIdx < rejectorIdx) return 'approved';
      return 'skipped';
    }
    if (leave.approval_stage === 'done' && leave.current_status === 'approved') return 'approved';
    const stageIdx = chain.indexOf(stage);
    const currentIdx = chain.indexOf(leave.approval_stage);
    if (stageIdx < currentIdx) return 'approved';
    if (stageIdx === currentIdx) return 'current';
    return 'waiting';
  };

  return (
    <Card className="animate-fade-in hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            {viewerRole !== 'student' && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">{leave.student_name}</span>
                <span>({leave.enrollment_number})</span>
              </div>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                {leaveTypeLabels[leave.leave_type]}
              </span>
              <StatusBadge status={leave.current_status} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{leave.description}</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{leave.from_date} → {leave.to_date}</span>
          </div>
          {leave.out_time && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{leave.out_time} – {leave.expected_return_time}</span>
            </div>
          )}
          {leave.room_number && (
            <div className="flex items-center gap-1.5">
              <span>Room {leave.room_number}</span>
            </div>
          )}
          {leave.department && (
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{leave.department}</span>
            </div>
          )}
        </div>

        {/* Approval Chain Progress */}
        <div className="border-t pt-3 mt-3">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Approval Chain</p>
          <div className="flex items-center gap-1">
            {chain.map((stage, idx) => {
              const status = getStageStatus(stage);
              return (
                <div key={stage} className="flex items-center gap-1">
                  <div className="flex items-center gap-1">
                    {status === 'approved' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                    {status === 'rejected' && <XCircle className="h-3.5 w-3.5 text-red-500" />}
                    {status === 'current' && <CircleDot className="h-3.5 w-3.5 text-yellow-500 animate-pulse" />}
                    {(status === 'waiting' || status === 'skipped') && <CircleDot className="h-3.5 w-3.5 text-gray-300" />}
                    <span className={`text-xs ${status === 'approved' ? 'text-green-600 font-medium' :
                      status === 'rejected' ? 'text-red-600 font-medium' :
                        status === 'current' ? 'text-yellow-600 font-medium' :
                          'text-gray-400'
                      }`}>
                      {stageLabels[stage]}
                    </span>
                  </div>
                  {idx < chain.length - 1 && <ChevronRight className="h-3 w-3 text-gray-300" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Approval Details */}
        {leave.approvals && leave.approvals.length > 0 && (
          <div className="border-t pt-3 mt-1">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Approval Details</p>
            <div className="space-y-1.5">
              {leave.approvals.filter(a => a.decision !== 'pending').map(a => (
                <div key={a.approval_id} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground capitalize">{a.approver_role}: {a.approver_name}</span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={a.decision} />
                    {a.remarks && <span className="text-muted-foreground italic">"{a.remarks}"</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gate Pass Shortcut for Students */}
        {leave.current_status === 'approved' && viewerRole === 'student' && (
          <div className="border-t pt-3 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 border-primary text-primary hover:bg-primary/5"
              onClick={() => navigate('/student/gate-pass')}
            >
              <QrCode className="h-4 w-4" /> View Gate Pass / QR Code
            </Button>
          </div>
        )}

        {/* Action buttons for approvers */}
        {canAct && onApprove && onReject && (
          <div className="border-t pt-3 mt-3 space-y-2">
            <Textarea
              placeholder="Add remarks (optional)..."
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="text-sm min-h-[60px]"
            />
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => onApprove(leave.leave_id, remarks)}>
                Approve
              </Button>
              <Button size="sm" variant="destructive" className="flex-1" onClick={() => onReject(leave.leave_id, remarks)}>
                Reject
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

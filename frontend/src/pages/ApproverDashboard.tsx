import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { API_BASE_URL } from '@/config';
import { LeaveCard } from '@/components/LeaveCard';
import { useAuth } from '@/contexts/AuthContext';
import { LeaveRequest } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const roleTitles: Record<string, string> = {
  parent: 'Parent Dashboard',
  warden: 'Warden Dashboard',
  counsellor: 'Counsellor Dashboard',
};

const ApproverDashboard = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/leaves`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
      } else {
        toast.error('Failed to fetch leave requests');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching leaves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Filter: leaves pending at MY stage
  const pendingForMe = leaves.filter(l => {
    if (l.current_status !== 'pending') return false;
    if (l.approval_stage === user?.role) return true;
    // Warden can jump in if counsellor stage and leave type is COLLEGE/HOME_COLLEGE
    if (
      user?.role === 'warden' &&
      l.approval_stage === 'counsellor' &&
      ['COLLEGE', 'HOME_COLLEGE'].includes(l.leave_type)
    ) return true;
    return false;
  });

  // History: ONLY non-pending leaves
  const history = leaves.filter(l => l.current_status !== 'pending');

  const handleDecision = async (leaveId: number, decision: 'approved' | 'rejected', remarks: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/leaves/${leaveId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: decision, remarks })
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || `Leave ${decision} successfully`);
        fetchLeaves(); // Refresh data
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error updating status');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <DashboardLayout title={roleTitles[user?.role || 'warden']}>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold">{pendingForMe.length}</p>
                <p className="text-xs text-muted-foreground">Awaiting My Action</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">{leaves.filter(l => l.current_status === 'approved').length}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <XCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{leaves.filter(l => l.current_status === 'rejected').length}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Awaiting Action ({pendingForMe.length})</TabsTrigger>
            <TabsTrigger value="history">History ({history.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4">
            {pendingForMe.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests awaiting your action.</p>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {pendingForMe.map(l => (
                  <LeaveCard
                    key={l.leave_id}
                    leave={l}
                    viewerRole={user!.role}
                    viewerUserId={user!.user_id}
                    onApprove={(id, rem) => handleDecision(id, 'approved', rem)}
                    onReject={(id, rem) => handleDecision(id, 'rejected', rem)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No history yet.</p>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {history.map(l => (
                  <LeaveCard
                    key={l.leave_id}
                    leave={l}
                    viewerRole={user!.role}
                    viewerUserId={user!.user_id}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ApproverDashboard;

import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { StudentSidebar } from '@/components/StudentSidebar';
import { LeaveCard } from '@/components/LeaveCard';
import { useAuth } from '@/contexts/AuthContext';
import { LeaveRequest } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import {
  FileText, CheckCircle, XCircle, Clock, Plus, TrendingUp, QrCode,
  Calendar as CalendarIcon, Camera,
  Send, Bell, Activity, Download, Phone, Lock, User, Megaphone, Menu,
} from 'lucide-react';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { toast } from 'sonner';

import { API_BASE_URL as API } from '@/config';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
const leaveTypeLabels: Record<string, string> = {
  HOME: 'Home Leave', HOME_COLLEGE: 'Home-College Leave', COLLEGE: 'College Leave',
  THURSDAY: 'Thursday Leave', SUNDAY: 'Sunday Leave',
};

// =============== SUB-PAGES ===============

// Dashboard Overview
const OverviewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/leaves`, { headers: headers() })
      .then(r => r.json()).then(setLeaves).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const pending = leaves.filter(l => l.current_status === 'pending').length;
  const approved = leaves.filter(l => l.current_status === 'approved').length;
  const rejected = leaves.filter(l => l.current_status === 'rejected').length;

  if (loading) return <div className="p-8 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-8">
      <div className="flex flex-row justify-between items-center border-b border-border/50 pb-4 sm:pb-6 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0 h-9 w-9 bg-primary/5 hover:bg-primary/10 rounded-xl"
            onClick={() => (window as any).toggleMobileMenu?.()}
          >
            <Menu className="h-5 w-5 text-primary" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-display font-bold text-primary italic truncate">
              {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'},
              <span className="text-slate-900 dark:text-white ml-2 block sm:inline not-italic">{user?.full_name?.split(' ')[0]}</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-body mt-0.5 uppercase tracking-widest opacity-70">
              Hostel Resident • Block A-102
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl border-2 border-primary/20 p-0.5 shadow-sm transition-transform hover:scale-105">
            {user?.profile_image_path ? (
              <img
                src={`${API.replace('/api', '')}/${user.profile_image_path}`}
                alt="Profile"
                className="w-full h-full rounded-[14px] object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-display font-bold text-sm">
                {user?.full_name?.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: leaves.length, icon: FileText, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Pending Review', value: pending, icon: Clock, color: 'text-accent', bg: 'bg-accent/5' },
          { label: 'Approved', value: approved, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Rejected', value: rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(s => (
          <Card key={s.label} className="border-none shadow-sm bg-white/50 backdrop-blur-sm group hover:bg-white transition-all duration-300">
            <CardContent className="p-5">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className="text-3xl font-display font-bold text-primary">{s.value}</p>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        <Button className="h-11 px-6 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold transition-all shadow-md shadow-primary/20 gap-2" onClick={() => navigate('/apply-leave')}>
          <Plus className="h-4 w-4" /> New Leave Application
        </Button>
        <Button variant="outline" className="h-11 px-6 rounded-lg border-primary text-primary hover:bg-primary/5 font-semibold transition-all gap-2" onClick={() => navigate('/student/leave-calendar')}>
          <CalendarIcon className="h-4 w-4" /> View Calendar
        </Button>
      </div>

      <div>
        <h2 className="text-lg font-display font-semibold mb-3">Recent Leave Requests</h2>
        {leaves.length === 0 ? (
          <p className="text-sm text-muted-foreground">No leave requests yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {leaves.slice(0, 4).map(l => (
              <LeaveCard key={l.leave_id} leave={l} viewerRole="student" viewerUserId={user!.user_id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ──── Leave Status Summary ────
const LeaveStatusPage = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  useEffect(() => { fetch(`${API}/leaves`, { headers: headers() }).then(r => r.json()).then(setLeaves).catch(() => { }); }, []);

  const groups = { pending: leaves.filter(l => l.current_status === 'pending'), approved: leaves.filter(l => l.current_status === 'approved'), rejected: leaves.filter(l => l.current_status === 'rejected') };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Leave Status Summary</h1>
      {Object.entries(groups).map(([status, list]) => (
        <div key={status}>
          <h2 className="text-sm font-semibold capitalize mb-2 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${status === 'approved' ? 'bg-emerald-500' : status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}`} />
            {status} ({list.length})
          </h2>
          {list.length === 0 ? <p className="text-xs text-muted-foreground ml-5">None</p> :
            <div className="grid gap-3 md:grid-cols-2">{list.map(l => <LeaveCard key={l.leave_id} leave={l} viewerRole="student" viewerUserId={user!.user_id} />)}</div>
          }
        </div>
      ))}
    </div>
  );
};

// ──── Notifications ────
const NotificationsPage = () => {
  const [notifs, setNotifs] = useState<any[]>([]);
  const { user } = useAuth();

  const fetchNotifs = () => {
    fetch(`${API}/notifications`, { headers: headers() })
      .then(r => r.json())
      .then(setNotifs)
      .catch(() => { });
  };

  useEffect(() => { fetchNotifs(); }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Bell className="h-6 w-6" /> Notifications</h1>
      {notifs.length === 0 ? <p className="text-muted-foreground text-sm">No notifications</p> :
        notifs.map((n: any, i: number) => (
          <Card key={i} className={`${n.is_read ? 'opacity-60' : ''} border-l-4 border-l-transparent`}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${n.is_read ? 'bg-muted' : 'bg-primary'}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{n.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ))
      }
    </div>
  );
};

// ──── Quick Stats ────
const QuickStatsPage = () => {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { fetch(`${API}/student/stats`, { headers: headers() }).then(r => r.json()).then(setStats).catch(() => { }); }, []);
  if (!stats) return <div className="p-8 text-muted-foreground">Loading...</div>;

  const pieData = stats.by_type?.map((t: any) => ({ name: leaveTypeLabels[t.leave_type] || t.leave_type, value: t.count })) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Quick Stats</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'from-indigo-500 to-indigo-600', icon: FileText },
          { label: 'Approved', value: stats.approved, color: 'from-emerald-500 to-emerald-600', icon: CheckCircle },
          { label: 'Pending', value: stats.pending, color: 'from-amber-500 to-amber-600', icon: Clock },
          { label: 'Rejected', value: stats.rejected, color: 'from-red-500 to-red-600', icon: XCircle },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-2`}><s.icon className="h-4 w-4 text-white" /></div>
            <p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p>
          </CardContent></Card>
        ))}
      </div>
      {pieData.length > 0 && (
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Leave Type Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                {pieData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie><Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} /></PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-2">{pieData.map((d: any, i: number) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} /><span className="text-muted-foreground">{d.name}</span><span className="font-semibold ml-auto">{d.value}</span></div>
            ))}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ──── Leave History ────
const LeaveHistoryPage = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  useEffect(() => { fetch(`${API}/leaves`, { headers: headers() }).then(r => r.json()).then(setLeaves).catch(() => { }); }, []);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-bold">Leave History</h1>
      {leaves.length === 0 ? <p className="text-sm text-muted-foreground">No leave history.</p> :
        <div className="grid gap-4 md:grid-cols-2">{leaves.map(l => <LeaveCard key={l.leave_id} leave={l} viewerRole="student" viewerUserId={user!.user_id} />)}</div>
      }
    </div>
  );
};

// ──── Leave Calendar View ────
const LeaveCalendarPage = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  useEffect(() => { fetch(`${API}/leaves`, { headers: headers() }).then(r => r.json()).then(setLeaves).catch(() => { }); }, []);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getLeavesForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return leaves.filter(l => {
      const from = l.from_date?.split('T')[0];
      const to = l.to_date?.split('T')[0];
      return from && to && dateStr >= from && dateStr <= to;
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2"><CalendarIcon className="h-6 w-6" /> Leave Calendar</h1>
      <Card>
        <CardHeader><CardTitle className="text-center">{monthName}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="font-semibold text-muted-foreground py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {days.map(day => {
              const dayLeaves = getLeavesForDay(day);
              const isToday = day === now.getDate();
              return (
                <div key={day} className={`relative p-1.5 rounded-lg text-center text-xs min-h-[40px] ${isToday ? 'ring-2 ring-primary' : ''} ${dayLeaves.length > 0 ? 'bg-primary/10' : 'hover:bg-muted/50'}`}>
                  <span className={`${isToday ? 'font-bold text-primary' : ''}`}>{day}</span>
                  {dayLeaves.length > 0 && (
                    <div className="flex gap-0.5 justify-center mt-0.5">
                      {dayLeaves.slice(0, 3).map(l => (
                        <span key={l.leave_id} className={`w-1.5 h-1.5 rounded-full ${l.current_status === 'approved' ? 'bg-emerald-500' : l.current_status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}`} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-4 text-[10px]">
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Approved</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Pending</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Rejected</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ──── Leave Pattern Analysis ────
const LeavePatternPage = () => {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { fetch(`${API}/student/stats`, { headers: headers() }).then(r => r.json()).then(setStats).catch(() => { }); }, []);
  if (!stats) return <div className="p-8 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2"><TrendingUp className="h-6 w-6" /> Leave Pattern Analysis</h1>
      {stats.monthly?.length > 0 && (
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Trends</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.monthly}>
                <defs>
                  <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="total" stroke="#6366f1" fill="url(#gT)" strokeWidth={2} name="Total" />
                <Area type="monotone" dataKey="approved" stroke="#10b981" fill="url(#gA)" strokeWidth={2} name="Approved" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      {stats.by_type?.length > 0 && (
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Leave by Type</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.by_type.map((t: any) => ({ name: leaveTypeLabels[t.leave_type] || t.leave_type, count: t.count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>{stats.by_type.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ──── Gate Pass ────
const GatePassPage = () => {
  const [passes, setPasses] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [selectedPass, setSelectedPass] = useState<any>(null);

  useEffect(() => {
    fetch(`${API}/student/gate-passes`, { headers: headers() }).then(r => r.json()).then(setPasses).catch(() => { });
    fetch(`${API}/leaves`, { headers: headers() }).then(r => r.json()).then(setLeaves).catch(() => { });
  }, []);

  const generatePass = async (leaveId: number) => {
    try {
      const res = await fetch(`${API}/student/gate-pass`, { method: 'POST', headers: headers(), body: JSON.stringify({ leave_id: leaveId }) });
      if (res.ok) { const data = await res.json(); setPasses([data, ...passes]); toast.success('Gate pass generated!'); } else toast.error('Failed');
    } catch { toast.error('Error'); }
  };

  const approvedLeaves = leaves.filter(l => l.current_status === 'approved');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2"><QrCode className="h-6 w-6" /> Gate Pass</h1>

      {approvedLeaves.length > 0 && (
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Generate Gate Pass</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {approvedLeaves.map(l => (
              <div key={l.leave_id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                <div><p className="text-sm font-medium">{leaveTypeLabels[l.leave_type]}</p><p className="text-[10px] text-muted-foreground">{l.from_date?.split('T')[0]} → {l.to_date?.split('T')[0]}</p></div>
                <Button size="sm" onClick={() => generatePass(l.leave_id)} className="gap-1"><QrCode className="h-3 w-3" /> Generate</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-sm font-semibold mb-2">My Gate Passes</h2>
        {passes.length === 0 ? <p className="text-sm text-muted-foreground">No gate passes generated yet.</p> :
          <div className="grid gap-3 md:grid-cols-2">{passes.map((p, i) => (
            <Card key={i} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedPass(p)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-lg border border-border shadow-sm">
                    {p.qr_code ? (
                      <QRCodeCanvas value={p.qr_code} size={64} level="H" includeMargin={false} />
                    ) : (
                      <div className="w-16 h-16 bg-muted flex items-center justify-center rounded-lg"><QrCode className="h-8 w-8 text-muted-foreground" /></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Pass #{p.pass_id || i + 1}</p>
                    <p className="text-xs text-muted-foreground">{leaveTypeLabels[p.leave_type] || 'Leave'}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>{p.status}</span>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1"><Download className="h-3 w-3" /> View Details</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}</div>
        }
      </div>

      {selectedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setSelectedPass(null)}>
          <Card className="w-full max-w-sm overflow-hidden transform animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <CardHeader className="text-center border-b bg-primary/5">
              <CardTitle className="text-xl font-display text-primary">Hostel Haven Gate Pass</CardTitle>
              <p className="text-xs text-muted-foreground">Show this QR at the security gate</p>
            </CardHeader>
            <CardContent className="p-8 flex flex-col items-center space-y-6">
              <div className="bg-white p-4 rounded-3xl border-4 border-primary/20 shadow-xl">
                <QRCodeCanvas value={selectedPass.qr_code} size={200} level="H" includeMargin={true} />
              </div>
              <div className="w-full space-y-3 bg-muted/40 p-4 rounded-xl">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Student</span><span className="font-semibold">{headers().Authorization.split(' ')[0]} User</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Leave Type</span><span className="font-semibold">{leaveTypeLabels[selectedPass.leave_type]}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">From</span><span className="font-semibold">{selectedPass.from_date?.split('T')[0]}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Return</span><span className="font-semibold">{selectedPass.to_date?.split('T')[0]}</span></div>
              </div>
              <Button onClick={() => setSelectedPass(null)} className="w-full">Close Pass</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// ──── Scan Logs / Late Returns ────
const ScanLogsPage = () => (
  <div className="space-y-4">
    <h1 className="text-2xl font-display font-bold">Scan Entry/Exit Logs</h1>
    <Card><CardContent className="p-8 text-center text-muted-foreground"><p className="text-sm">Your gate scan history will appear here once you start using your gate pass QR codes.</p></CardContent></Card>
  </div>
);

const LateReturnsPage = () => (
  <div className="space-y-4">
    <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Clock className="h-6 w-6 text-amber-500" /> Late Return Record</h1>
    <Card><CardContent className="p-8 text-center text-muted-foreground"><p className="text-sm">No late return records. Keep up the good work! ✨</p></CardContent></Card>
  </div>
);


// ──── Communication ────
const AnnouncementsPage = () => {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { fetch(`${API}/student/announcements`, { headers: headers() }).then(r => r.json()).then(setItems).catch(() => { }); }, []);
  const priorityColors: Record<string, string> = { urgent: 'border-red-300 bg-red-50', high: 'border-amber-300 bg-amber-50', normal: '', low: 'opacity-70' };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Megaphone className="h-6 w-6 text-indigo-500" /> Announcements</h1>
      {items.length === 0 ? <Card><CardContent className="p-6 text-center text-muted-foreground text-sm">No announcements yet.</CardContent></Card> :
        items.map((a: any) => (
          <Card key={a.announcement_id} className={priorityColors[a.priority] || ''}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start"><h3 className="text-sm font-semibold">{a.title}</h3>{a.priority !== 'normal' && <span className={`text-[10px] px-2 py-0.5 rounded-full ${a.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{a.priority}</span>}</div>
              <p className="text-xs text-muted-foreground mt-1">{a.content}</p>
              <p className="text-[10px] text-muted-foreground mt-2">By {a.posted_by_name} · {new Date(a.created_at).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))
      }
    </div>
  );
};

const RaiseComplaintPage = () => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');

  const handleSubmit = async () => {
    if (!subject || !description) return toast.error('Fill all fields');
    try {
      const res = await fetch(`${API}/student/complaints`, { method: 'POST', headers: headers(), body: JSON.stringify({ subject, description, category }) });
      if (res.ok) { toast.success('Complaint submitted!'); setSubject(''); setDescription(''); } else toast.error('Failed');
    } catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Send className="h-6 w-6 text-blue-500" /> Raise Complaint (Leave Related)</h1>
      <Card><CardContent className="p-6 space-y-4">
        <div className="space-y-2"><Label>Category</Label>
          <Select onValueChange={setCategory} defaultValue="leave"><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="leave">Leave Request Issue</SelectItem><SelectItem value="gate">Gate Pass Issue</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Subject</Label><Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief subject..." /></div>
        <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe in detail..." rows={4} /></div>
        <Button onClick={handleSubmit} className="w-full">Submit Complaint</Button>
      </CardContent></Card>
    </div>
  );
};

const MyComplaintsPage = () => {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { fetch(`${API}/student/complaints`, { headers: headers() }).then(r => r.json()).then(setItems).catch(() => { }); }, []);
  const statusColors: Record<string, string> = { open: 'bg-amber-100 text-amber-700', in_progress: 'bg-blue-100 text-blue-700', resolved: 'bg-emerald-100 text-emerald-700', closed: 'bg-muted text-muted-foreground' };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-bold">My Complaints</h1>
      {items.length === 0 ? <Card><CardContent className="p-6 text-center text-muted-foreground text-sm">No complaints submitted.</CardContent></Card> :
        items.map((c: any) => (
          <Card key={c.complaint_id}><CardContent className="p-4 flex justify-between items-start">
            <div><p className="text-sm font-medium">{c.subject}</p><p className="text-xs text-muted-foreground mt-1">{c.description}</p><p className="text-[10px] text-muted-foreground mt-1">Category: {c.category} · {new Date(c.created_at).toLocaleDateString()}</p></div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${statusColors[c.status] || ''}`}>{c.status?.replace('_', ' ')}</span>
          </CardContent></Card>
        ))
      }
    </div>
  );
};

// ──── Profile Settings ────
const ProfilePage = () => {
  const { user, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({ full_name: user?.full_name || '', phone: '', room_number: '', department: '' });
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    try {
      const res = await fetch(`${API}/student/profile`, { method: 'PUT', headers: headers(), body: JSON.stringify(formData) });
      if (res.ok) {
        toast.success('Profile updated!');
        refreshProfile();
      } else toast.error('Failed');
    } catch { toast.error('Error'); }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    setUploading(true);
    try {
      const res = await fetch(`${API}/users/profile-photo`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });

      if (res.ok) {
        toast.success('Photo updated!');
        refreshProfile();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Upload failed');
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2"><User className="h-6 w-6" /> Profile</h1>
      <Card><CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full border-4 border-primary/20 p-1 shadow-inner overflow-hidden">
              {user?.profile_image_path ? (
                <img
                  src={`${API.replace('/api', '')}/${user.profile_image_path}`}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.full_name?.charAt(0)}
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
              <Camera className="h-4 w-4" />
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
            </label>
            {uploading && (
              <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div>
            <p className="font-bold text-lg text-primary">{user?.full_name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <span className="mt-1 inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full capitalize">{user?.role}</span>
          </div>
        </div>
        <div className="space-y-2"><Label>Full Name</Label><Input value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} /></div>
        <div className="space-y-2"><Label>Phone</Label><Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91-xxxxxxxxxx" /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Room Number</Label><Input value={formData.room_number} onChange={e => setFormData({ ...formData, room_number: e.target.value })} /></div>
          <div className="space-y-2"><Label>Department</Label><Input value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} /></div>
        </div>
        <Button onClick={handleSave} className="w-full h-11 font-semibold">Save Profile Changes</Button>
      </CardContent></Card>
    </div>
  );
};

const ChangePasswordPage = () => {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleRequestOtp = async () => {
    if (!current) return toast.error('Enter current password');
    if (newPass !== confirm) return toast.error('Passwords do not match');
    if (newPass.length < 6) return toast.error('Minimum 6 characters');
    setLoading(true);
    try {
      const res = await fetch(`${API}/student/change-password/request-otp`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ current_password: current }),
      });
      const d = await res.json();
      if (res.ok) { toast.success('OTP sent to your email!'); setStep(2); setResendTimer(60); }
      else toast.error(d.message || 'Failed');
    } catch { toast.error('Error'); }
    finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/student/change-password/request-otp`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ current_password: current }),
      });
      if (res.ok) { toast.success('OTP resent!'); setResendTimer(60); }
      else { const d = await res.json(); toast.error(d.message || 'Failed'); }
    } catch { toast.error('Error'); }
    finally { setLoading(false); }
  };

  const handleVerifyAndChange = async () => {
    if (!otp || otp.length !== 6) return toast.error('Enter 6-digit OTP');
    setLoading(true);
    try {
      const res = await fetch(`${API}/student/change-password`, {
        method: 'PUT', headers: headers(),
        body: JSON.stringify({ current_password: current, new_password: newPass, otp }),
      });
      const d = await res.json();
      if (res.ok) { toast.success('Password changed successfully!'); setCurrent(''); setNewPass(''); setConfirm(''); setOtp(''); setStep(1); }
      else toast.error(d.message || 'Failed');
    } catch { toast.error('Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Lock className="h-6 w-6" /> Change Password</h1>
      <Card><CardContent className="p-6 space-y-4">
        {step === 1 ? (
          <>
            <div className="space-y-2"><Label>Current Password</Label><Input type="password" value={current} onChange={e => setCurrent(e.target.value)} placeholder="Enter current password" /></div>
            <div className="space-y-2"><Label>New Password</Label><Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Minimum 6 characters" /></div>
            <div className="space-y-2"><Label>Confirm New Password</Label><Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter new password" /></div>
            <Button onClick={handleRequestOtp} className="w-full gap-2" disabled={loading}>
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="h-4 w-4" />}
              Send OTP to Email
            </Button>
          </>
        ) : (
          <>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-center">
              <p className="text-sm text-muted-foreground">A 6-digit OTP has been sent to your registered email.</p>
            </div>
            <div className="space-y-2">
              <Label>Enter OTP</Label>
              <Input
                type="text" maxLength={6} value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="______" className="text-center text-2xl tracking-[0.5em] font-mono"
              />
            </div>
            <Button onClick={handleVerifyAndChange} className="w-full gap-2" disabled={loading}>
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Lock className="h-4 w-4" />}
              Verify & Change Password
            </Button>
            <div className="flex items-center justify-between text-xs">
              <button
                onClick={() => { setStep(1); setOtp(''); }}
                className="text-muted-foreground hover:text-primary transition-colors"
              >← Back</button>
              <button
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || loading}
                className={`${resendTimer > 0 ? 'text-muted-foreground' : 'text-primary hover:underline'} transition-colors`}
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>
          </>
        )}
      </CardContent></Card>
    </div>
  );
};

// ──── Reports & Analytics ────
const LeaveStatsPage = () => {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { fetch(`${API}/student/stats`, { headers: headers() }).then(r => r.json()).then(setStats).catch(() => { }); }, []);
  if (!stats) return <div className="p-8 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Leave Statistics</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l: 'Total', v: stats.total, c: 'from-indigo-500 to-indigo-600' },
          { l: 'Approved', v: stats.approved, c: 'from-emerald-500 to-emerald-600' },
          { l: 'Pending', v: stats.pending, c: 'from-amber-500 to-amber-600' },
          { l: 'Rejected', v: stats.rejected, c: 'from-red-500 to-red-600' },
        ].map(s => (
          <Card key={s.l}><CardContent className="p-4 text-center"><p className="text-3xl font-bold bg-gradient-to-br bg-clip-text text-transparent ${s.c}">{s.v}</p><p className="text-xs text-muted-foreground">{s.l}</p></CardContent></Card>
        ))}
      </div>
      {stats.monthly?.length > 0 && (
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">6-Month Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} /><Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="approved" fill="#10b981" name="Approved" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const AttendanceGraphPage = () => (
  <div className="space-y-4">
    <h1 className="text-2xl font-display font-bold">Attendance Graph</h1>
    <Card><CardContent className="p-6 text-center text-muted-foreground text-sm">Attendance data visualization will be available once synced with the hostel management system.</CardContent></Card>
  </div>
);

const MonthlyReportPage = () => (
  <div className="space-y-4">
    <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Download className="h-6 w-6 text-blue-500" /> Monthly Report</h1>
    <Card><CardContent className="p-6 text-center space-y-3"><p className="text-sm text-muted-foreground">Download your monthly activity report as PDF.</p><Button className="gap-2"><Download className="h-4 w-4" /> Download Report</Button></CardContent></Card>
  </div>
);

// =============== MAIN LAYOUT ===============

const NewStudentDashboard = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Expose toggle to sub-pages via window for simplicity (could use context/props)
  useEffect(() => {
    (window as any).toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
    return () => { delete (window as any).toggleMobileMenu; };
  }, [mobileMenuOpen]);

  return (
    <div className="flex min-h-screen bg-background pb-24 lg:pb-0">
      <StudentSidebar isOpen={mobileMenuOpen} onToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <main className="flex-1 min-w-0 w-full overflow-y-auto">
        <div className="max-w-full sm:max-w-5xl mx-0 sm:mx-auto p-4 sm:p-6 pb-20 sm:pb-6 mobile-left-align">
          <Routes>
            <Route index element={<OverviewPage />} />
            <Route path="leave-status" element={<LeaveStatusPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="quick-stats" element={<QuickStatsPage />} />
            <Route path="leave-history" element={<LeaveHistoryPage />} />
            <Route path="leave-calendar" element={<LeaveCalendarPage />} />
            <Route path="leave-patterns" element={<LeavePatternPage />} />
            <Route path="leave-stats" element={<QuickStatsPage />} />
            <Route path="gate-pass" element={<GatePassPage />} />
            <Route path="scan-logs" element={<ScanLogsPage />} />
            <Route path="late-returns" element={<LateReturnsPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="complaints" element={<RaiseComplaintPage />} />
            <Route path="my-complaints" element={<MyComplaintsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="change-password" element={<ChangePasswordPage />} />
          </Routes>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default NewStudentDashboard;

import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { CounsellorSidebar } from '@/components/CounsellorSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { LeaveRequest } from '@/types';
import { LeaveCard } from '@/components/LeaveCard';
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
    FileText, Phone, Send, Megaphone, Download, Lock, User, Eye, Camera, Menu, X, Users, Bell, CheckCircle, AlertTriangle, TrendingUp
} from 'lucide-react';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

import { API_BASE_URL as API } from '@/config';
const h = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });
const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
const riskBadge = (r: string) => r === 'high' ? 'bg-red-100 text-red-700' : r === 'watch' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';
const riskDot = (r: string) => r === 'high' ? '🔴' : r === 'watch' ? '🟡' : '🟢';

// ──── Overview ────
const OverviewPage = () => {
    const { user } = useAuth();
    const [d, setD] = useState<any>(null);
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

    const fetchData = () => {
        fetch(`${API}/counsellor/overview`, { headers: h() }).then(r => r.json()).then(setD).catch(() => { });
        fetch(`${API}/leaves`, { headers: h() }).then(r => r.json()).then(setLeaves).catch(() => { });
    };

    useEffect(() => { fetchData(); }, []);

    const handleApprove = async (id: number, remarks: string) => {
        try {
            const res = await fetch(`${API}/leaves/${id}/status`, {
                method: 'PUT',
                headers: h(),
                body: JSON.stringify({ status: 'approved', remarks })
            });
            if (res.ok) {
                toast.success('Leave approved');
                fetchData();
            } else {
                toast.error('Failed to approve');
            }
        } catch {
            toast.error('Error');
        }
    };

    const handleReject = async (id: number, remarks: string) => {
        try {
            const res = await fetch(`${API}/leaves/${id}/status`, {
                method: 'PUT',
                headers: h(),
                body: JSON.stringify({ status: 'rejected', remarks })
            });
            if (res.ok) {
                toast.success('Leave rejected');
                fetchData();
            } else {
                toast.error('Failed to reject');
            }
        } catch {
            toast.error('Error');
        }
    };

    if (!d) return <div className="p-8 text-muted-foreground">Loading...</div>;

    const pending = leaves.filter(l => l.current_status === 'pending');
    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in pb-8">
            <div className="flex flex-row justify-between items-center border-b border-border/50 pb-4 sm:pb-6 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden shrink-0 h-9 w-9 bg-primary/5 hover:bg-primary/10 rounded-xl"
                        onClick={() => (window as any).toggleCounsellorMobileMenu?.()}
                    >
                        <Menu className="h-5 w-5 text-primary" />
                    </Button>
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-3xl font-display font-bold text-primary italic truncate">Counsellor View</h1>
                        <p className="text-[10px] sm:text-xs text-muted-foreground font-body mt-0.5 uppercase tracking-widest opacity-70">Leave Monitoring • Hub</p>
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
                            <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-violet-500 to-indigo-700 flex items-center justify-center text-white font-display font-bold text-sm">
                                {user?.full_name?.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {[{ l: 'Total Students', v: d.total_students, g: 'from-indigo-500 to-indigo-600', i: Users },
                { l: 'Pending Requests', v: d.pending_requests, g: 'from-amber-500 to-amber-600', i: Bell },
                { l: 'Active Leaves', v: d.active_leaves || 0, g: 'from-emerald-500 to-emerald-600', i: CheckCircle },
                ].map(s => (
                    <Card key={s.l}><CardContent className="p-4"><div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.g} flex items-center justify-center mb-2`}><s.i className="h-4 w-4 text-white" /></div><p className="text-2xl font-bold">{s.v}</p><p className="text-xs text-muted-foreground">{s.l}</p></CardContent></Card>
                ))}
            </div>
            {d.high_risk_students?.length > 0 && (
                <Card className="border-red-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-red-600 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Frequent Leave Students (Last 30 Days)</CardTitle></CardHeader>
                    <CardContent className="space-y-2">{d.high_risk_students.map((s: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-red-50">
                            <div><p className="text-xs font-medium">{s.full_name}</p><p className="text-[10px] text-muted-foreground">{s.enrollment_number} · {s.department}</p></div>
                            <span className="text-xs font-bold text-red-600">{s.leave_count} leaves</span>
                        </div>
                    ))}</CardContent>
                </Card>
            )}

            {/* Pending Requests Section */}
            {pending.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2 italic">
                        <Bell className="h-5 w-5 text-amber-500" /> Action Required: Pending Requests ({pending.length})
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {pending.map(l => (
                            <LeaveCard
                                key={l.leave_id}
                                leave={l}
                                viewerRole="counsellor"
                                viewerUserId={user!.user_id}
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


// ──── Students with Risk ────
const StudentsPage = () => {
    const [students, setStudents] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    useEffect(() => { fetch(`${API}/counsellor/students`, { headers: h() }).then(r => r.json()).then(setStudents).catch(() => { }); }, []);
    const filtered = students.filter(s => s.full_name?.toLowerCase().includes(search.toLowerCase()) || s.enrollment_number?.includes(search));
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-display font-bold">All Students</h1>
            <Input placeholder="Search by name or enrollment..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
            <div className="space-y-4">{filtered.map((s: any) => (
                <Card key={s.student_id} className="overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">{s.full_name?.charAt(0)}</div>
                                <div><p className="text-sm font-bold tracking-tight">{s.full_name}</p><p className="text-[10px] text-muted-foreground font-medium">{s.enrollment_number} · Room {s.room_number}</p></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-tight ${riskBadge(s.risk_level)} shadow-sm`}>{riskDot(s.risk_level)} {s.risk_level} Pattern</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                            {s.is_on_leave ? '📍 Currently on Leave' : '🏠 Currently in Hostel'}
                        </div>
                    </CardContent>
                </Card>
            ))}</div>
        </div>
    );
};

const SearchStudentPage = () => <StudentsPage />;

// ──── Pending Leaves ────
const PendingPage = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const fetchLeaves = () => fetch(`${API}/leaves`, { headers: h() }).then(r => r.json()).then(setLeaves).catch(() => { });

    useEffect(() => { fetchLeaves(); }, []);

    const handleApprove = async (id: number, remarks: string) => {
        try {
            const res = await fetch(`${API}/leaves/${id}/status`, {
                method: 'PUT',
                headers: h(),
                body: JSON.stringify({ status: 'approved', remarks })
            });
            if (res.ok) {
                toast.success('Leave approved successfully');
                fetchLeaves();
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to approve');
            }
        } catch {
            toast.error('Error approving leave');
        }
    };

    const handleReject = async (id: number, remarks: string) => {
        try {
            const res = await fetch(`${API}/leaves/${id}/status`, {
                method: 'PUT',
                headers: h(),
                body: JSON.stringify({ status: 'rejected', remarks })
            });
            if (res.ok) {
                toast.success('Leave rejected');
                fetchLeaves();
            } else {
                toast.error('Failed to reject');
            }
        } catch {
            toast.error('Error rejecting leave');
        }
    };

    const pending = leaves.filter(l => l.current_status === 'pending');
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-display font-bold">Pending Requests ({pending.length})</h1>
            {pending.length === 0 ? <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No pending requests</CardContent></Card> :
                <div className="grid gap-3 md:grid-cols-2">
                    {pending.map(l => (
                        <LeaveCard
                            key={l.leave_id}
                            leave={l}
                            viewerRole="counsellor"
                            viewerUserId={user!.user_id}
                            onApprove={handleApprove}
                            onReject={handleReject}
                        />
                    ))}
                </div>
            }
        </div>
    );
};

// ──── Leave Monitoring ────
const LeaveMonitoringPage = ({ view }: { view: string }) => {
    const [d, setD] = useState<any>(null);
    useEffect(() => { fetch(`${API}/counsellor/leave-monitoring`, { headers: h() }).then(r => r.json()).then(setD).catch(() => { }); }, []);
    if (!d) return <div className="p-8 text-muted-foreground">Loading...</div>;
    const ltLabels: Record<string, string> = { HOME: 'Home', COLLEGE: 'College', EMERGENCY: 'Emergency', MEDICAL: 'Medical', HOME_COLLEGE: 'Home & College', THURSDAY: 'Thursday', SUNDAY: 'Sunday' };

    if (view === 'frequent') return (
        <div className="space-y-4">
            <h1 className="text-2xl font-display font-bold text-amber-600 flex items-center gap-2"><AlertTriangle className="h-6 w-6" /> Frequent Leave Students</h1>
            {d.frequent_students?.length === 0 ? <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No flagged students</CardContent></Card> :
                d.frequent_students?.map((s: any, i: number) => (
                    <Card key={i} className={s.emergency_count >= 2 ? 'border-red-200' : ''}><CardContent className="p-3 flex items-center justify-between">
                        <div><p className="text-sm font-medium">{s.full_name}</p><p className="text-[10px] text-muted-foreground">{s.enrollment_number} · {s.department}</p></div>
                        <div className="text-right"><p className="text-sm font-bold">{s.leave_count} leaves</p>{s.emergency_count > 0 && <p className="text-[10px] text-red-600">{s.emergency_count} emergency</p>}</div>
                    </CardContent></Card>
                ))
            }
        </div>
    );

    if (view === 'patterns') return (
        <div className="space-y-6">
            <h1 className="text-2xl font-display font-bold flex items-center gap-2"><TrendingUp className="h-6 w-6" /> Leave Pattern Analysis</h1>
            {d.monthly_trend?.length > 0 && (
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Trend</CardTitle></CardHeader>
                    <CardContent><ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={d.monthly_trend}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} /><Area type="monotone" dataKey="total" stroke="#6366f1" fill="#6366f120" strokeWidth={2} name="Total" /><Area type="monotone" dataKey="emergency" stroke="#ef4444" fill="#ef444420" strokeWidth={2} name="Emergency" />
                        </AreaChart></ResponsiveContainer></CardContent></Card>
            )}
            {d.by_type?.length > 0 && (
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Leave Type Distribution</CardTitle></CardHeader>
                    <CardContent><ResponsiveContainer width="100%" height={220}>
                        <PieChart><Pie data={d.by_type.map((t: any) => ({ name: ltLabels[t.leave_type] || t.leave_type, value: t.count }))} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value">
                            {d.by_type.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} /></PieChart>
                    </ResponsiveContainer></CardContent></Card>
            )}
        </div>
    );

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-display font-bold">Complaint Records</h1>
            {d.complaints?.length === 0 ? <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No complaints</CardContent></Card> :
                d.complaints?.map((c: any) => (
                    <Card key={c.complaint_id}><CardContent className="p-4"><div className="flex justify-between"><div><p className="text-sm font-medium">{c.subject}</p><p className="text-xs text-muted-foreground mt-1">{c.description}</p><p className="text-[10px] text-muted-foreground mt-1">{c.is_anonymous ? 'Anonymous' : c.full_name} · {c.category} · {new Date(c.created_at).toLocaleDateString()}</p></div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full h-fit ${c.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{c.status}</span></div></CardContent></Card>
                ))
            }
        </div>
    );
};



// ──── Broadcast ────

// ──── Broadcast ────

// ──── Broadcast ────
const BroadcastPage = () => {
    const [title, setTitle] = useState(''); const [content, setContent] = useState(''); const [priority, setPriority] = useState('normal');
    const handlePost = async () => {
        if (!title || !content) return toast.error('Fill all fields');
        try { const r = await fetch(`${API}/counsellor/announcements`, { method: 'POST', headers: h(), body: JSON.stringify({ title, content, priority }) }); if (r.ok) { toast.success('Posted!'); setTitle(''); setContent(''); } else toast.error('Failed'); } catch { toast.error('Error'); }
    };
    return (
        <div className="space-y-4 max-w-lg">
            <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Megaphone className="h-6 w-6 text-indigo-500" /> Broadcast Notice</h1>
            <Card><CardContent className="p-6 space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Notice title..." /></div>
                <div className="space-y-2"><Label>Content</Label><Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Notice content..." rows={4} /></div>
                <div className="space-y-2"><Label>Priority</Label><Select onValueChange={setPriority} defaultValue="normal"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="normal">Normal</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select></div>
                <Button onClick={handlePost} className="w-full">Post Announcement</Button>
            </CardContent></Card>
        </div>
    );
};

// ──── Profile & Change Password ────
const ProfilePage = () => {
    const { user, refreshProfile } = useAuth();
    const [uploading, setUploading] = useState(false);

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
            <h1 className="text-2xl font-display font-bold">My Profile</h1>
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 pb-4 border-b">
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-full border-4 border-primary/20 p-1 shadow-inner overflow-hidden">
                                {user?.profile_image_path ? (
                                    <img
                                        src={`${API.replace('/api', '')}/${user.profile_image_path}`}
                                        alt="Profile"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
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
                </CardContent>
            </Card>
        </div>
    );
};

const ChangePasswordPage = () => {
    const [c, setC] = useState(''); const [n, setN] = useState(''); const [cf, setCf] = useState('');
    const [otp, setOtp] = useState(''); const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false); const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => { if (resendTimer > 0) { const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000); return () => clearTimeout(t); } }, [resendTimer]);

    const requestOtp = async () => {
        if (!c) return toast.error('Enter current password');
        if (n !== cf) return toast.error('Mismatch');
        if (n.length < 6) return toast.error('Minimum 6 characters');
        setLoading(true);
        try { const r = await fetch(`${API}/student/change-password/request-otp`, { method: 'POST', headers: h(), body: JSON.stringify({ current_password: c }) }); const d = await r.json(); if (r.ok) { toast.success('OTP sent to your email!'); setStep(2); setResendTimer(60); } else toast.error(d.message || 'Failed'); } catch { toast.error('Error'); } finally { setLoading(false); }
    };
    const resendOtp = async () => {
        if (resendTimer > 0) return; setLoading(true);
        try { const r = await fetch(`${API}/student/change-password/request-otp`, { method: 'POST', headers: h(), body: JSON.stringify({ current_password: c }) }); if (r.ok) { toast.success('OTP resent!'); setResendTimer(60); } else { const d = await r.json(); toast.error(d.message || 'Failed'); } } catch { toast.error('Error'); } finally { setLoading(false); }
    };
    const verifyAndChange = async () => {
        if (!otp || otp.length !== 6) return toast.error('Enter 6-digit OTP'); setLoading(true);
        try { const r = await fetch(`${API}/student/change-password`, { method: 'PUT', headers: h(), body: JSON.stringify({ current_password: c, new_password: n, otp }) }); const d = await r.json(); if (r.ok) { toast.success('Changed!'); setC(''); setN(''); setCf(''); setOtp(''); setStep(1); } else toast.error(d.message || 'Failed'); } catch { toast.error('Error'); } finally { setLoading(false); }
    };

    return (
        <div className="space-y-4 max-w-lg"><h1 className="text-2xl font-display font-bold flex items-center gap-2"><Lock className="h-6 w-6" /> Change Password</h1>
            <Card><CardContent className="p-6 space-y-4">
                {step === 1 ? (<>
                    <div className="space-y-2"><Label>Current Password</Label><Input type="password" value={c} onChange={e => setC(e.target.value)} placeholder="Enter current password" /></div>
                    <div className="space-y-2"><Label>New Password</Label><Input type="password" value={n} onChange={e => setN(e.target.value)} placeholder="Minimum 6 characters" /></div>
                    <div className="space-y-2"><Label>Confirm</Label><Input type="password" value={cf} onChange={e => setCf(e.target.value)} placeholder="Re-enter new password" /></div>
                    <Button onClick={requestOtp} className="w-full gap-2" disabled={loading}>{loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="h-4 w-4" />} Send OTP to Email</Button>
                </>) : (<>
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-center"><p className="text-sm text-muted-foreground">A 6-digit OTP has been sent to your registered email.</p></div>
                    <div className="space-y-2"><Label>Enter OTP</Label><Input type="text" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="______" className="text-center text-2xl tracking-[0.5em] font-mono" /></div>
                    <Button onClick={verifyAndChange} className="w-full gap-2" disabled={loading}>{loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Lock className="h-4 w-4" />} Verify & Change Password</Button>
                    <div className="flex items-center justify-between text-xs">
                        <button onClick={() => { setStep(1); setOtp(''); }} className="text-muted-foreground hover:text-primary transition-colors">← Back</button>
                        <button onClick={resendOtp} disabled={resendTimer > 0 || loading} className={`${resendTimer > 0 ? 'text-muted-foreground' : 'text-primary hover:underline'} transition-colors`}>{resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}</button>
                    </div>
                </>)}
            </CardContent></Card>
        </div>
    );
};

// ──── Simple Pages ────
const SimplePage = ({ title, icon: Icon, color, message }: { title: string; icon: React.ElementType; color: string; message: string }) => (
    <div className="space-y-4"><h1 className="text-2xl font-display font-bold flex items-center gap-2"><Icon className={`h-6 w-6 ${color}`} />{title}</h1>
        <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">{message}</CardContent></Card></div>
);

// ──── MAIN ────
const CounsellorDashboard = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        (window as any).toggleCounsellorMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
        return () => { delete (window as any).toggleCounsellorMobileMenu; };
    }, [mobileMenuOpen]);

    return (
        <div className="flex min-h-screen bg-background pb-24 lg:pb-0">
            <CounsellorSidebar isOpen={mobileMenuOpen} onToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
            <main className="flex-1 min-w-0 w-full overflow-y-auto">
                <div className="max-w-full sm:max-w-6xl mx-0 sm:mx-auto p-4 sm:p-6 pb-20 sm:pb-6 mobile-left-align">
                    <Routes>
                        <Route index element={<OverviewPage />} />
                        <Route path="pending" element={<PendingPage />} />
                        <Route path="students" element={<StudentsPage />} />
                        <Route path="search-student" element={<SearchStudentPage />} />
                        <Route path="frequent-leaves" element={<LeaveMonitoringPage view="frequent" />} />
                        <Route path="emergency-leaves" element={<LeaveMonitoringPage view="frequent" />} />
                        <Route path="leave-patterns" element={<LeaveMonitoringPage view="patterns" />} />
                        <Route path="complaints" element={<LeaveMonitoringPage view="complaints" />} />
                        <Route path="broadcast" element={<BroadcastPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="change-password" element={<ChangePasswordPage />} />
                    </Routes>
                </div>
            </main>
            <MobileBottomNav />
        </div>
    );
};

export default CounsellorDashboard;

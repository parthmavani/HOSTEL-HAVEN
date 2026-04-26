import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import {
    Eye, Database, Phone, Trash2, RotateCcw, XCircle, Camera, Menu, X, Users, Shield, Building, TrendingUp, Megaphone, Clock, FileText, Activity, Lock, Send
} from 'lucide-react';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { toast } from 'sonner';

import { API_BASE_URL as API } from '@/config';
const hd = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });
const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];
const ltLabel: Record<string, string> = { HOME: 'Home', COLLEGE: 'College', EMERGENCY: 'Emergency', MEDICAL: 'Medical' };
const statusClr: Record<string, string> = { approved: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700', pending: 'bg-amber-100 text-amber-700' };

// ──── System Overview ────
const SystemOverviewPage = () => {
    const { user } = useAuth();
    const [d, setD] = useState<any>(null);
    const [a, setA] = useState<any>(null);
    const [leaves, setLeaves] = useState<any[]>([]);

    const fetchData = () => {
        fetch(`${API}/admin/overview`, { headers: hd() }).then(r => r.json()).then(setD).catch(() => { });
        fetch(`${API}/analytics`, { headers: hd() }).then(r => r.json()).then(setA).catch(() => { });
        fetch(`${API}/admin/leaves`, { headers: hd() }).then(r => r.json()).then(setLeaves).catch(() => { });
    };

    useEffect(() => { fetchData(); }, []);

    const handleOverride = async (leaveId: number, status: string) => {
        if (!confirm(`Override to ${status}?`)) return;
        try {
            const r = await fetch(`${API}/admin/leaves/${leaveId}/override`, {
                method: 'PUT',
                headers: hd(),
                body: JSON.stringify({ status })
            });
            if (r.ok) {
                toast.success(`Leave ${status}`);
                fetchData();
            } else toast.error('Failed');
        } catch { toast.error('Error'); }
    };

    if (!d) return <div className="p-8 text-muted-foreground">Loading...</div>;

    const pendingLeaves = leaves.filter(l => l.current_status === 'pending');

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in font-body pb-8">
            <div className="flex flex-row justify-between items-center border-b border-border/50 pb-4 sm:pb-6 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden shrink-0 h-9 w-9 bg-primary/5 hover:bg-primary/10 rounded-xl"
                        onClick={() => (window as any).toggleAdminMobileMenu?.()}
                    >
                        <Menu className="h-5 w-5 text-primary" />
                    </Button>
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-3xl font-display font-bold text-primary italic truncate">Registrar Overview</h1>
                        <p className="text-[10px] sm:text-xs text-muted-foreground font-body mt-0.5 uppercase tracking-widest opacity-70">Administrative Hub • Session 24-25</p>
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
                            <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-indigo-500 to-slate-800 flex items-center justify-center text-white font-display font-bold text-sm">
                                {user?.full_name?.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[{ l: 'Total Scholars', v: d.students, i: Users, c: 'text-primary', b: 'bg-primary/5' },
                { l: 'Guarantors Linked', v: d.parents, i: Users, c: 'text-accent', b: 'bg-accent/5' },
                { l: 'Faculty/Staff', v: d.wardens, i: Shield, c: 'text-emerald-600', b: 'bg-emerald-50' },
                { l: 'Occupancy Rate', v: `${d.occupancy_rate}%`, i: Building, c: 'text-blue-600', b: 'bg-blue-50' },
                ].map(s => (
                    <Card key={s.l} className="border-none shadow-sm bg-white/50 backdrop-blur-sm group hover:bg-white transition-all duration-300">
                        <CardContent className="p-5">
                            <div className={`w-10 h-10 rounded-lg ${s.b} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <s.i className={`h-5 w-5 ${s.c}`} />
                            </div>
                            <p className="text-3xl font-display font-bold text-primary">{s.v}</p>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mt-1">{s.l}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pending Approvals (New Section) */}
            {pendingLeaves.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-lg font-display font-bold text-primary flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-500" /> Pending Admin Override ({pendingLeaves.length})
                        </h2>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {pendingLeaves.map(l => (
                            <Card key={l.leave_id} className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-all">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-bold">{l.student_name}</p>
                                            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{l.enrollment_number}</p>
                                        </div>
                                        <Badge variant="outline" className="text-[9px] bg-orange-50 text-orange-700 border-orange-200">Pending</Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-primary/80">{ltLabel[l.leave_type] || l.leave_type}</p>
                                        <p className="text-[10px] text-muted-foreground">{l.from_date?.split('T')[0]} → {l.to_date?.split('T')[0]}</p>
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <Button size="sm" className="h-7 text-[10px] flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleOverride(l.leave_id, 'approved')}>✓ Approve</Button>
                                        <Button size="sm" variant="destructive" className="h-7 text-[10px] flex-1" onClick={() => handleOverride(l.leave_id, 'rejected')}>✗ Reject</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-3 gap-3">
                {[{ l: 'Active Leaves', v: d.active_leaves, c: 'text-accent' }, { l: 'Pending', v: d.pending_leaves, c: 'text-orange-600' }, { l: 'Today', v: d.today_leaves, c: 'text-blue-600' }].map(s => (
                    <Card key={s.l}><CardContent className="p-4 text-center"><p className={`text-2xl font-bold ${s.c}`}>{s.v}</p><p className="text-xs text-muted-foreground">{s.l}</p></CardContent></Card>
                ))}
            </div>
            
            {a?.monthly_trends?.length > 0 && (
                <Card className="border-none shadow-sm"><CardHeader className="pb-4"><CardTitle className="text-sm font-semibold text-primary uppercase tracking-wider">Academic Period Leave Trends</CardTitle></CardHeader>
                    <CardContent><ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={a.monthly_trends}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} /><Area type="monotone" dataKey="total" stroke="#1A2238" fill="#1A223820" strokeWidth={2} name="Total" /><Area type="monotone" dataKey="approved" stroke="#941B0C" fill="#941B0C20" strokeWidth={2} name="Approved" /></AreaChart>
                    </ResponsiveContainer></CardContent></Card>
            )}
        </div>
    );
};

// ──── User Management ────
const UserManagementPage = ({ role }: { role: string }) => {
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    useEffect(() => { fetch(`${API}/admin/users/${role}`, { headers: hd() }).then(r => r.json()).then(setUsers).catch(() => { }); }, [role]);
    const filtered = users.filter(u => u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.includes(search));

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this user?')) return;
        try { const r = await fetch(`${API}/admin/users/${id}`, { method: 'DELETE', headers: hd() }); if (r.ok) { toast.success('Deleted'); setUsers(users.filter(u => u.user_id !== id)); } else toast.error('Failed'); } catch { toast.error('Error'); }
    };
    const handleReset = async (id: string) => {
        if (!confirm('Reset password to hostel@123?')) return;
        try { const r = await fetch(`${API}/admin/users/${id}/reset-password`, { method: 'PUT', headers: hd() }); if (r.ok) toast.success('Password reset to hostel@123'); else toast.error('Failed'); } catch { toast.error('Error'); }
    };

    const roleName = role.charAt(0).toUpperCase() + role.slice(1) + 's';
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-display font-bold">Manage {roleName} ({filtered.length})</h1>
            <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
            <div className="space-y-2">{filtered.map(u => (
                <Card key={u.user_id}><CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">{u.full_name?.charAt(0)}</div>
                        <div><p className="text-sm font-medium">{u.full_name}</p><p className="text-[10px] text-muted-foreground">{u.email}{u.enrollment_number ? ` · ${u.enrollment_number}` : ''}{u.department ? ` · ${u.department}` : ''}</p></div>
                    </div>
                    <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleReset(u.user_id)}><RotateCcw className="h-3 w-3 mr-1" />Reset</Button>
                        <Button size="sm" variant="destructive" className="h-7 text-[10px]" onClick={() => handleDelete(u.user_id)}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                    </div>
                </CardContent></Card>
            ))}</div>
        </div>
    );
};

// ──── All Leaves with Override ────
const AllLeavesPage = () => {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [filter, setFilter] = useState('all');
    useEffect(() => { fetch(`${API}/admin/leaves`, { headers: hd() }).then(r => r.json()).then(setLeaves).catch(() => { }); }, []);
    
    // Filter out pending leaves if they should ONLY be on overview? 
    // Actually, historical view should show everything. 
    // But the user said "leave history should contain only the history".
    // "History" usually means NOT pending.
    const history = leaves.filter(l => l.current_status !== 'pending');
    const filtered = filter === 'all' ? history : history.filter(l => l.current_status === filter);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-display font-bold">Processed Leave History ({filtered.length})</h1>
                <div className="flex gap-1">
                    {['all', 'approved', 'rejected'].map(f => (
                        <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} className="h-7 text-[10px] capitalize" onClick={() => setFilter(f)}>{f}</Button>
                    ))}
                </div>
            </div>
            <div className="space-y-2">
                {filtered.map(l => (
                    <Card key={l.leave_id}>
                        <CardContent className="p-3 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">{l.student_name} — {ltLabel[l.leave_type] || l.leave_type}</p>
                                <p className="text-[10px] text-muted-foreground">{l.enrollment_number} · {l.department} · {l.from_date?.split('T')[0]} → {l.to_date?.split('T')[0]}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className={`text-[10px] px-2 py-0.5 ${statusClr[l.current_status] || ''}`}>{l.current_status}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

// ──── Leave Analytics (charts) ────
const LeaveAnalyticsPage = () => {
    const [a, setA] = useState<any>(null);
    useEffect(() => { fetch(`${API}/analytics`, { headers: hd() }).then(r => r.json()).then(setA).catch(() => { }); }, []);
    if (!a) return <div className="p-8 text-muted-foreground">Loading...</div>;
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-display font-bold flex items-center gap-2"><TrendingUp className="h-6 w-6" /> Leave Analytics</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[{ l: 'Total', v: a.kpis?.total_leaves, c: 'text-indigo-600' }, { l: 'Approved', v: a.kpis?.approved, c: 'text-emerald-600' }, { l: 'Rejected', v: a.kpis?.rejected, c: 'text-red-600' }, { l: 'Approval Rate', v: `${a.kpis?.approval_rate}%`, c: 'text-violet-600' }].map(s => (
                    <Card key={s.l}><CardContent className="p-4 text-center"><p className={`text-2xl font-bold ${s.c}`}>{s.v}</p><p className="text-xs text-muted-foreground">{s.l}</p></CardContent></Card>
                ))}
            </div>
            {a.leave_type_distribution?.length > 0 && (
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Leave Type Distribution</CardTitle></CardHeader>
                    <CardContent><ResponsiveContainer width="100%" height={240}>
                        <PieChart><Pie data={a.leave_type_distribution.map((t: any) => ({ name: ltLabel[t.leave_type] || t.leave_type, value: t.count }))} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                            {a.leave_type_distribution.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} /></PieChart>
                    </ResponsiveContainer></CardContent></Card>
            )}
            {a.day_of_week_stats?.length > 0 && (
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Applications by Day of Week</CardTitle></CardHeader>
                    <CardContent><ResponsiveContainer width="100%" height={220}>
                        <BarChart data={a.day_of_week_stats}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="day_name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} /><Bar dataKey="count" name="Applications" radius={[6, 6, 0, 0]}>{a.day_of_week_stats.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar></BarChart>
                    </ResponsiveContainer></CardContent></Card>
            )}
        </div>
    );
};

const DeptAnalysisPage = () => {
    const [a, setA] = useState<any>(null);
    useEffect(() => { fetch(`${API}/analytics`, { headers: hd() }).then(r => r.json()).then(setA).catch(() => { }); }, []);
    if (!a) return <div className="p-8 text-muted-foreground">Loading...</div>;
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-display font-bold">Department-wise Analysis</h1>
            {a.department_stats?.length > 0 && (
                <Card><CardContent className="pt-6"><ResponsiveContainer width="100%" height={280}>
                    <BarChart data={a.department_stats}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="department" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} /><Bar dataKey="approved" name="Approved" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" /><Bar dataKey="rejected" name="Rejected" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" /><Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" /></BarChart>
                </ResponsiveContainer></CardContent></Card>
            )}
            {a.department_stats?.map((dept: any) => (
                <Card key={dept.department}><CardContent className="p-3 flex items-center justify-between">
                    <div><p className="text-sm font-semibold">{dept.department}</p><p className="text-[10px] text-muted-foreground">{dept.total_leaves} total leaves</p></div>
                    <div className="flex gap-2 text-[10px]"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{dept.approved} approved</span><span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700">{dept.rejected} rejected</span><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{dept.pending} pending</span></div>
                </CardContent></Card>
            ))}
        </div>
    );
};

// ──── Security Logs ────
const SecurityLogsPage = ({ view }: { view: string }) => {
    const [d, setD] = useState<any>(null);
    useEffect(() => { fetch(`${API}/admin/security`, { headers: hd() }).then(r => r.json()).then(setD).catch(() => { }); }, []);
    if (!d) return <div className="p-8 text-muted-foreground">Loading...</div>;

    if (view === 'gate') return (
        <div className="space-y-4">
            <h1 className="text-2xl font-display font-bold">Gate Scan Logs</h1>
            {d.gate_logs?.length === 0 ? <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No gate scan records</CardContent></Card> :
                d.gate_logs?.map((g: any) => (
                    <Card key={g.pass_id}><CardContent className="p-3 flex items-center justify-between">
                        <div><p className="text-sm font-medium">{g.full_name}</p><p className="text-[10px] text-muted-foreground">QR: {g.qr_code?.slice(0, 12)}... · {g.purpose}</p></div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${g.status === 'used' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{g.status}</span>
                    </CardContent></Card>
                ))
            }
        </div>
    );

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Eye className="h-6 w-6" /> {view === 'login' ? 'Login History' : 'System Activity Logs'}</h1>
            {d.recent_logins?.map((u: any) => (
                <Card key={u.user_id}><CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-bold">{u.full_name?.charAt(0)}</div>
                        <div><p className="text-xs font-medium">{u.full_name}</p><p className="text-[10px] text-muted-foreground">{u.email}</p></div></div>
                    <div className="text-right"><span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{u.role}</span><p className="text-[10px] text-muted-foreground mt-0.5">{new Date(u.last_login).toLocaleDateString()}</p></div>
                </CardContent></Card>
            ))}
        </div>
    );
};

// ──── Broadcast ────
const BroadcastPage = () => {
    const [title, setTitle] = useState(''); const [content, setContent] = useState(''); const [priority, setPriority] = useState('normal');
    const handlePost = async () => {
        if (!title || !content) return toast.error('Fill all fields');
        try { const r = await fetch(`${API}/admin/broadcast`, { method: 'POST', headers: hd(), body: JSON.stringify({ title, content, priority }) }); if (r.ok) { toast.success('Broadcast sent!'); setTitle(''); setContent(''); } else toast.error('Failed'); } catch { toast.error('Error'); }
    };
    return (
        <div className="space-y-4 max-w-lg">
            <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Megaphone className="h-6 w-6 text-indigo-500" /> Broadcast Announcement</h1>
            <Card><CardContent className="p-6 space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title..." /></div>
                <div className="space-y-2"><Label>Content</Label><Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Announcement content..." rows={4} /></div>
                <div className="space-y-2"><Label>Priority</Label><Select onValueChange={setPriority} defaultValue="normal"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="normal">Normal</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select></div>
                <Button onClick={handlePost} className="w-full">Broadcast Now</Button>
            </CardContent></Card>
        </div>
    );
};

// ──── Profile & Password ────
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
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-2xl font-bold">
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
        try { const r = await fetch(`${API}/student/change-password/request-otp`, { method: 'POST', headers: hd(), body: JSON.stringify({ current_password: c }) }); const d = await r.json(); if (r.ok) { toast.success('OTP sent to your email!'); setStep(2); setResendTimer(60); } else toast.error(d.message || 'Failed'); } catch { toast.error('Error'); } finally { setLoading(false); }
    };
    const resendOtp = async () => {
        if (resendTimer > 0) return; setLoading(true);
        try { const r = await fetch(`${API}/student/change-password/request-otp`, { method: 'POST', headers: hd(), body: JSON.stringify({ current_password: c }) }); if (r.ok) { toast.success('OTP resent!'); setResendTimer(60); } else { const d = await r.json(); toast.error(d.message || 'Failed'); } } catch { toast.error('Error'); } finally { setLoading(false); }
    };
    const verifyAndChange = async () => {
        if (!otp || otp.length !== 6) return toast.error('Enter 6-digit OTP'); setLoading(true);
        try { const r = await fetch(`${API}/student/change-password`, { method: 'PUT', headers: hd(), body: JSON.stringify({ current_password: c, new_password: n, otp }) }); const d = await r.json(); if (r.ok) { toast.success('Changed!'); setC(''); setN(''); setCf(''); setOtp(''); setStep(1); } else toast.error(d.message || 'Failed'); } catch { toast.error('Error'); } finally { setLoading(false); }
    };

    return (
        <div className="space-y-4 max-w-lg"><h1 className="text-2xl font-display font-bold flex items-center gap-2"><Lock className="h-6 w-6" /> Change Password</h1>
            <Card><CardContent className="p-6 space-y-4">
                {step === 1 ? (<>
                    <div className="space-y-2"><Label>Current</Label><Input type="password" value={c} onChange={e => setC(e.target.value)} placeholder="Enter current password" /></div>
                    <div className="space-y-2"><Label>New</Label><Input type="password" value={n} onChange={e => setN(e.target.value)} placeholder="Minimum 6 characters" /></div>
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
            </CardContent></Card></div>
    );
};

// ──── Simple Placeholder Pages ────
const SimplePage = ({ title, icon: Icon, color, message }: { title: string; icon: React.ElementType; color: string; message: string }) => (
    <div className="space-y-4"><h1 className="text-2xl font-display font-bold flex items-center gap-2"><Icon className={`h-6 w-6 ${color}`} />{title}</h1>
        <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">{message}</CardContent></Card></div>
);

const AdminDashboard = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        (window as any).toggleAdminMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
        return () => { delete (window as any).toggleAdminMobileMenu; };
    }, [mobileMenuOpen]);

    return (
        <div className="flex min-h-screen bg-background pb-24 lg:pb-0">
            <AdminSidebar isOpen={mobileMenuOpen} onToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
            <main className="flex-1 min-w-0 w-full overflow-y-auto">
                <div className="max-w-full sm:max-w-7xl mx-0 sm:mx-auto p-4 sm:p-6 pb-20 sm:pb-6 mobile-left-align">
                    <Routes>
                        <Route index element={<SystemOverviewPage />} />
                        <Route path="students" element={<UserManagementPage role="student" />} />
                        <Route path="parents" element={<UserManagementPage role="parent" />} />
                        <Route path="counselors" element={<UserManagementPage role="counsellor" />} />
                        <Route path="wardens" element={<UserManagementPage role="warden" />} />
                        <Route path="gate-logs" element={<SecurityLogsPage view="gate" />} />
                        <Route path="rooms" element={<SimplePage title="Room Management" icon={Building} color="text-indigo-500" message="Manage hostel blocks, room allocation, and capacity settings." />} />
                        <Route path="curfew" element={<SimplePage title="Curfew Timing Settings" icon={Clock} color="text-amber-500" message="Configure hostel curfew timings and violation rules." />} />
                        <Route path="gate-qr" element={<SimplePage title="Gate Pass QR Settings" icon={Shield} color="text-violet-500" message="Configure QR code generation and scanning parameters." />} />
                        <Route path="broadcast" element={<BroadcastPage />} />
                        <Route path="emergency-alert" element={<SimplePage title="Emergency Alert System" icon={Phone} color="text-red-500" message="Send emergency alerts to all students, parents, and staff." />} />
                        <Route path="message-logs" element={<SimplePage title="Message Logs" icon={FileText} color="text-blue-500" message="View all communication history and broadcast logs." />} />
                        <Route path="app-settings" element={<SimplePage title="App Settings" icon={Activity} color="text-indigo-500" message="Configure application behavior, API settings, and system preferences." />} />
                        <Route path="backup" element={<SimplePage title="Backup & Restore" icon={Database} color="text-emerald-500" message="Create database backups and restore from previous snapshots." />} />
                        <Route path="theme" element={<SimplePage title="Theme Settings" icon={Eye} color="text-violet-500" message="Configure Dark/Light mode and brand color preferences." />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="change-password" element={<ChangePasswordPage />} />
                    </Routes>
                </div>
            </main>
            <MobileBottomNav />
        </div>
    );
};

export default AdminDashboard;

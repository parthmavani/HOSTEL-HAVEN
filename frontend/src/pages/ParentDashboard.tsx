import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ParentSidebar } from '@/components/ParentSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import {
    Eye, FileText, Calendar as CalIcon, XCircle, Menu, X, Users, Clock, CheckCircle, TrendingUp, Megaphone, Send, Bell, AlertTriangle, Lock
} from 'lucide-react';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { Info } from 'lucide-react';

import { API_BASE_URL as API } from '@/config';
const hd = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });
const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
const ltLabel: Record<string, string> = { HOME: 'Home Leave', HOME_COLLEGE: 'Home-College Leave', COLLEGE: 'College Leave', THURSDAY: 'Thursday Leave', SUNDAY: 'Sunday Leave' };


// ──── Overview ────
const OverviewPage = () => {
    const { user } = useAuth();
    const [d, setD] = useState<any>(null);
    const [leaves, setLeaves] = useState<any[]>([]);
    const [remarks, setRemarks] = useState<Record<number, string>>({});

    const fetchData = () => {
        fetch(`${API}/parent/overview`, { headers: hd() }).then(r => r.json()).then(setD).catch(() => { });
        fetch(`${API}/parent/leaves`, { headers: hd() }).then(r => r.json()).then(data => setLeaves(data.leaves || [])).catch(() => { });
    };

    useEffect(() => { fetchData(); }, []);

    const handleDecision = async (leaveId: number, decision: 'approved' | 'rejected') => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API}/leaves/${leaveId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status: decision, remarks: remarks[leaveId] || '' }),
        });
        if (res.ok) {
            toast.success(`Leave ${decision}`);
            fetchData();
        } else {
            const e = await res.json();
            toast.error(e.message || 'Failed');
        }
    };

    if (!d) return <div className="p-8 text-muted-foreground">Loading...</div>;

    const pendingForMe = leaves.filter((l: any) => l.current_status === 'pending' && l.approval_stage === 'parent');

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in font-body pb-8">
            <div className="flex flex-row justify-between items-center border-b border-border/50 pb-4 sm:pb-6 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden shrink-0 h-9 w-9 bg-primary/5 hover:bg-primary/10 rounded-xl"
                        onClick={() => (window as any).toggleParentMobileMenu?.()}
                    >
                        <Menu className="h-5 w-5 text-primary" />
                    </Button>
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-3xl font-display font-bold text-primary italic truncate">Guarantor Center</h1>
                        <p className="text-[10px] sm:text-xs text-muted-foreground font-body mt-0.5 uppercase tracking-widest opacity-70">Ward Monitoring • Session 24-25</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl border-2 border-primary/20 p-0.5 shadow-sm transition-transform hover:scale-105">
                        <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white font-display font-bold text-sm">
                            {user?.full_name?.charAt(0)}
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[{ l: 'Scholars', v: d.children?.length || 0, i: Users, c: 'text-primary', b: 'bg-primary/5' },
                { l: 'Total Requests', v: d.total_leaves || 0, i: FileText, c: 'text-accent', b: 'bg-accent/5' },
                { l: 'Awaiting Action', v: d.pending_leaves || 0, i: Clock, c: 'text-amber-600', b: 'bg-amber-50' },
                { l: 'Active Leaves', v: d.active_leaves?.length || 0, i: CheckCircle, c: 'text-emerald-600', b: 'bg-emerald-50' },
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

            {d.children?.map((child: any) => (
                <Card key={child.student_id} className={child.is_on_leave ? 'border-amber-200' : 'border-emerald-200 shadow-sm overflow-hidden'}>
                    <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-base shadow-sm">{child.full_name?.charAt(0)}</div>
                                <div><p className="text-sm font-bold tracking-tight">{child.full_name}</p><p className="text-[10px] text-muted-foreground font-medium uppercase">{child.enrollment_number} · Room {child.room_number}</p></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-tight shadow-sm ${child.is_on_leave ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {child.is_on_leave ? 'On Leave' : 'In Hostel'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {d.active_leaves?.length > 0 && (
                <Card className="border-amber-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-amber-700">Active Leaves</CardTitle></CardHeader>
                    <CardContent className="space-y-2">{d.active_leaves.map((l: any) => (
                        <div key={l.leave_id} className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50">
                            <div><p className="text-xs font-medium">{l.full_name} — {ltLabel[l.leave_type] || l.leave_type}</p><p className="text-[10px] text-muted-foreground">{l.from_date?.split('T')[0]} → {l.to_date?.split('T')[0]}</p></div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{l.current_status}</span>
                        </div>
                    ))}</CardContent>
                </Card>
            )}

            {/* Pending Approvals Section */}
            {pendingForMe.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-display font-bold text-amber-600 flex items-center gap-2 italic">
                        <Clock className="h-5 w-5" /> Pending Your Approval ({pendingForMe.length})
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {pendingForMe.map((l: any) => (
                            <Card key={l.leave_id} className="border-amber-200 shadow-md hover:shadow-lg transition-shadow bg-amber-50/30">
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                                                {l.student_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{l.student_name}</p>
                                                <p className="text-[11px] font-semibold text-muted-foreground uppercase">{ltLabel[l.leave_type] || l.leave_type}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 uppercase text-[9px]">Awaiting You</Badge>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <CalIcon className="h-3 w-3" />
                                            <span>{l.from_date?.split('T')[0]} → {l.to_date?.split('T')[0]}</span>
                                        </div>
                                        <p className="text-xs italic text-muted-foreground bg-white/50 p-2 rounded border border-amber-100/50">
                                            "{l.description || 'No reason provided'}"
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Input
                                            placeholder="Add remarks..."
                                            className="h-8 text-[11px] bg-white border-amber-100 focus-visible:ring-amber-500"
                                            value={remarks[l.leave_id] || ''}
                                            onChange={e => setRemarks(prev => ({ ...prev, [l.leave_id]: e.target.value }))}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleDecision(l.leave_id, 'approved')}
                                                className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleDecision(l.leave_id, 'rejected')}
                                                className="flex-1 h-9 border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs"
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ──── Student Status ────
const StudentStatusPage = () => {
    const [d, setD] = useState<any>(null);
    useEffect(() => { fetch(`${API}/parent/overview`, { headers: hd() }).then(r => r.json()).then(setD).catch(() => { }); }, []);
    if (!d) return <div className="p-8 text-muted-foreground">Loading...</div>;
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Eye className="h-6 w-6" /> Student Status</h1>
            {d.children?.map((c: any) => (
                <Card key={c.student_id}><CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm">{c.full_name?.charAt(0)}</div>
                            <div><p className="text-sm font-semibold">{c.full_name}</p><p className="text-[10px] text-muted-foreground">{c.enrollment_number}</p></div></div>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${c.is_on_leave ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{c.is_on_leave ? 'On Leave' : 'In Hostel'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded-lg bg-muted/40 text-center"><p className="text-lg font-bold">{c.total_leaves}</p><p className="text-[10px] text-muted-foreground">Total Leaves</p></div>
                        <div className="p-2 rounded-lg bg-muted/40 text-center"><p className="text-lg font-bold">{c.approved_leaves}</p><p className="text-[10px] text-muted-foreground">Approved</p></div>
                    </div>
                </CardContent></Card>
            ))}
        </div>
    );
};

// ──── Notifications ────
const NotificationsPage = () => {
    const [notifs, setNotifs] = useState<any[]>([]);
    useEffect(() => { fetch(`${API}/notifications`, { headers: hd() }).then(r => r.json()).then(setNotifs).catch(() => { }); }, []);
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Bell className="h-6 w-6" /> Notifications</h1>
            {notifs.length === 0 ? <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No notifications</CardContent></Card> :
                notifs.map((n: any, i: number) => (
                    <Card key={i} className={n.is_read ? 'opacity-60' : ''}><CardContent className="p-4 flex items-start gap-3">
                        <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${n.is_read ? 'bg-muted' : 'bg-primary'}`} />
                        <div><p className="text-sm">{n.message}</p><p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p></div>
                    </CardContent></Card>
                ))
            }
        </div>
    );
};

// ──── Leave History ────
const LeaveHistoryPage = () => {
    const [d, setD] = useState<any>(null);
    useEffect(() => { fetch(`${API}/parent/leaves`, { headers: hd() }).then(r => r.json()).then(setD).catch(() => { }); }, []);
    if (!d) return <div className="p-8 text-muted-foreground">Loading...</div>;

    const history = d.leaves?.filter((l: any) => !(l.current_status === 'pending' && l.approval_stage === 'parent')) || [];
    const statusClr: Record<string, string> = { approved: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700', pending: 'bg-amber-100 text-amber-700' };

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-display font-bold">Leave History</h1>
            <p className="text-xs text-muted-foreground italic -mt-2 opacity-70">Showing previously decided and processed leave requests.</p>

            {history.length === 0
                ? <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No history records found.</CardContent></Card>
                : history.map((l: any) => (
                    <Card key={l.leave_id} className="hover:bg-accent/5 transition-colors">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold">{l.student_name} — <span className="text-primary">{ltLabel[l.leave_type] || l.leave_type}</span></p>
                                <p className="text-[10px] font-medium text-muted-foreground mt-0.5">
                                    {l.from_date?.split('T')[0]} → {l.to_date?.split('T')[0]}
                                </p>
                                {l.remarks && <p className="text-[10px] text-primary italic mt-1 font-medium">Remarks: {l.remarks}</p>}
                            </div>
                            <Badge className={`text-[10px] px-2.5 py-1 ${statusClr[l.current_status] || ''}`}>
                                {l.current_status}
                            </Badge>
                        </CardContent>
                    </Card>
                ))
            }
        </div>
    );
};

// ──── Current Leave ────
const CurrentLeavePage = () => {
    const [d, setD] = useState<any>(null);
    useEffect(() => { fetch(`${API}/parent/leaves`, { headers: hd() }).then(r => r.json()).then(setD).catch(() => { }); }, []);
    if (!d) return <div className="p-8 text-muted-foreground">Loading...</div>;
    const active = d.leaves?.filter((l: any) => l.current_status === 'approved' && new Date(l.to_date) >= new Date()) || [];
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-display font-bold">Current Active Leaves</h1>
            {active.length === 0 ? <Card><CardContent className="p-6 text-center text-emerald-600 text-sm">✅ No active leaves — all children in hostel</CardContent></Card> :
                active.map((l: any) => (
                    <Card key={l.leave_id} className="border-amber-200"><CardContent className="p-4">
                        <p className="text-sm font-semibold">{l.student_name}</p>
                        <p className="text-xs text-muted-foreground">{ltLabel[l.leave_type] || l.leave_type} · {l.from_date?.split('T')[0]} → {l.to_date?.split('T')[0]}</p>
                    </CardContent></Card>
                ))
            }
        </div>
    );
};


// ──── Leave Calendar ────
const LeaveCalendarPage = () => {
    const [d, setD] = useState<any>(null);
    useEffect(() => { fetch(`${API}/parent/leaves`, { headers: hd() }).then(r => r.json()).then(setD).catch(() => { }); }, []);
    const now = new Date(); const year = now.getFullYear(); const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate(); const firstDay = new Date(year, month, 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const getLeavesForDay = (day: number) => {
        const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return (d?.leaves || []).filter((l: any) => { const f = l.from_date?.split('T')[0]; const t = l.to_date?.split('T')[0]; return f && t && ds >= f && ds <= t; });
    };
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-display font-bold flex items-center gap-2"><CalIcon className="h-6 w-6" /> Leave Calendar</h1>
            <Card><CardHeader><CardTitle className="text-center">{now.toLocaleString('default', { month: 'long', year: 'numeric' })}</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(x => <div key={x} className="font-semibold text-muted-foreground py-1">{x}</div>)}</div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                        {days.map(day => {
                            const dl = getLeavesForDay(day); const isToday = day === now.getDate(); return (
                                <div key={day} className={`p-1.5 rounded-lg text-center text-xs min-h-[40px] ${isToday ? 'ring-2 ring-primary' : ''} ${dl.length > 0 ? 'bg-amber-50' : ''}`}>
                                    <span className={isToday ? 'font-bold text-primary' : ''}>{day}</span>
                                    {dl.length > 0 && <div className="flex gap-0.5 justify-center mt-0.5">{dl.slice(0, 3).map((l: any) => <span key={l.leave_id} className={`w-1.5 h-1.5 rounded-full ${l.current_status === 'approved' ? 'bg-emerald-500' : l.current_status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}`} />)}</div>}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// ──── Leave Alerts & Patterns ────
const LeaveAlertsPage = () => {
    const [d, setD] = useState<any>(null);
    useEffect(() => { fetch(`${API}/parent/leaves`, { headers: hd() }).then(r => r.json()).then(setD).catch(() => { }); }, []);
    if (!d) return <div className="p-8 text-muted-foreground">Loading...</div>;
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-display font-bold text-amber-600 flex items-center gap-2"><AlertTriangle className="h-6 w-6" /> Leave Alerts</h1>
            {(!d.frequent_alerts || d.frequent_alerts.length === 0) ? <Card><CardContent className="p-6 text-center text-emerald-600 text-sm">✅ No leave alerts — everything normal</CardContent></Card> :
                d.frequent_alerts.map((s: any, i: number) => {
                    const risk = s.leave_count >= 5 ? 'high' : s.leave_count >= 3 ? 'watch' : 'normal';
                    return (
                        <Card key={i} className={risk === 'high' ? 'border-red-200' : risk === 'watch' ? 'border-amber-200' : ''}><CardContent className="p-4 flex items-center justify-between">
                            <div><p className="text-sm font-medium">{s.full_name}</p><p className="text-xs text-muted-foreground">{s.leave_count} leaves in 30 days</p></div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${risk === 'high' ? 'bg-red-100 text-red-700' : risk === 'watch' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {risk === 'high' ? '🔴 High Concern' : risk === 'watch' ? '🟡 Needs Attention' : '🟢 Normal'}
                            </span>
                        </CardContent></Card>
                    );
                })
            }
        </div>
    );
};

const LeavePatternsPage = () => {
    const [d, setD] = useState<any>(null);
    useEffect(() => { fetch(`${API}/parent/leaves`, { headers: hd() }).then(r => r.json()).then(setD).catch(() => { }); }, []);
    if (!d) return <div className="p-8 text-muted-foreground">Loading...</div>;
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-display font-bold flex items-center gap-2"><TrendingUp className="h-6 w-6" /> Leave Patterns</h1>
            {d.monthly?.length > 0 && (
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Leave Trend</CardTitle></CardHeader>
                    <CardContent><ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={d.monthly}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                            <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} /><Area type="monotone" dataKey="total" stroke="#6366f1" fill="#6366f120" strokeWidth={2} name="Total" />
                            <Area type="monotone" dataKey="emergency" stroke="#ef4444" fill="#ef444420" strokeWidth={2} name="Emergency" /></AreaChart>
                    </ResponsiveContainer></CardContent></Card>
            )}
        </div>
    );
};

// ──── Communication ────
const AnnouncementsPage = () => {
    const [items, setItems] = useState<any[]>([]);
    useEffect(() => { fetch(`${API}/parent/announcements`, { headers: hd() }).then(r => r.json()).then(setItems).catch(() => { }); }, []);
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Megaphone className="h-6 w-6 text-indigo-500" /> Announcements</h1>
            {items.length === 0 ? <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No announcements</CardContent></Card> :
                items.map((a: any) => (
                    <Card key={a.announcement_id} className={a.priority === 'urgent' ? 'border-red-200' : a.priority === 'high' ? 'border-amber-200' : ''}>
                        <CardContent className="p-4"><div className="flex justify-between items-start"><h3 className="text-sm font-semibold">{a.title}</h3>
                            {a.priority !== 'normal' && <span className={`text-[10px] px-2 py-0.5 rounded-full ${a.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{a.priority}</span>}</div>
                            <p className="text-xs text-muted-foreground mt-1">{a.content}</p>
                            <p className="text-[10px] text-muted-foreground mt-2">By {a.posted_by_name} · {new Date(a.created_at).toLocaleDateString()}</p>
                        </CardContent></Card>
                ))
            }
        </div>
    );
};

const RaiseConcernPage = () => {
    const [subject, setSubject] = useState(''); const [description, setDescription] = useState('');
    const handleSubmit = async () => {
        if (!subject || !description) return toast.error('Fill all fields');
        try { const r = await fetch(`${API}/student/complaints`, { method: 'POST', headers: hd(), body: JSON.stringify({ subject, description, category: 'other' }) }); if (r.ok) { toast.success('Concern submitted!'); setSubject(''); setDescription(''); } else toast.error('Failed'); } catch { toast.error('Error'); }
    };
    return (
        <div className="space-y-4 max-w-lg">
            <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Send className="h-6 w-6 text-blue-500" /> Raise Concern</h1>
            <Card><CardContent className="p-6 space-y-4">
                <div className="space-y-2"><Label>Subject</Label><Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief subject..." /></div>
                <div className="space-y-2"><Label>Details</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your concern..." rows={4} /></div>
                <Button onClick={handleSubmit} className="w-full">Submit Concern</Button>
            </CardContent></Card>
        </div>
    );
};

// ──── Profile & Password ────
const ProfilePage = () => {
    const { user } = useAuth();
    return (
        <div className="space-y-4 max-w-lg">
            <h1 className="text-2xl font-display font-bold">My Profile</h1>
            <Card><CardContent className="p-6"><div className="flex items-center gap-4 pb-4 border-b"><div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">{user?.full_name?.charAt(0)}</div>
                <div><p className="font-semibold">{user?.full_name}</p><p className="text-xs text-muted-foreground">{user?.email}</p><p className="text-xs text-muted-foreground capitalize">{user?.role}</p></div></div></CardContent></Card>
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
        if (n !== cf) return toast.error('Passwords do not match');
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
        try { const r = await fetch(`${API}/student/change-password`, { method: 'PUT', headers: hd(), body: JSON.stringify({ current_password: c, new_password: n, otp }) }); const d = await r.json(); if (r.ok) { toast.success('Password changed!'); setC(''); setN(''); setCf(''); setOtp(''); setStep(1); } else toast.error(d.message || 'Failed'); } catch { toast.error('Error'); } finally { setLoading(false); }
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
const ParentDashboard = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        (window as any).toggleParentMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
        return () => { delete (window as any).toggleParentMobileMenu; };
    }, [mobileMenuOpen]);

    return (
        <div className="flex min-h-screen bg-background pb-24 lg:pb-0">
            <ParentSidebar isOpen={mobileMenuOpen} onToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
            <main className="flex-1 min-w-0 w-full overflow-y-auto">
                <div className="max-w-full sm:max-w-5xl mx-0 sm:mx-auto p-4 sm:p-6 pb-20 sm:pb-6 mobile-left-align">
                    <Routes>
                        <Route index element={<OverviewPage />} />
                        <Route path="status" element={<StudentStatusPage />} />
                        <Route path="notifications" element={<NotificationsPage />} />
                        <Route path="quick-stats" element={<OverviewPage />} />
                        <Route path="leave-history" element={<LeaveHistoryPage />} />
                        <Route path="current-leave" element={<CurrentLeavePage />} />
                        <Route path="leave-calendar" element={<LeaveCalendarPage />} />
                        <Route path="leave-alerts" element={<LeaveAlertsPage />} />
                        <Route path="leave-patterns" element={<LeavePatternsPage />} />
                        <Route path="announcements" element={<AnnouncementsPage />} />
                        <Route path="raise-concern" element={<RaiseConcernPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="change-password" element={<ChangePasswordPage />} />
                    </Routes>
                </div>
            </main>
            <MobileBottomNav />
        </div>
    );
};

export default ParentDashboard;

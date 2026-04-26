import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard, Users, FileText, BarChart3, Brain, Shield,
    Building, MessageSquare, Settings, UserCog, ChevronDown, ChevronRight, LogOut,
    Clock, Bell, Activity, TrendingUp, Lock, User, Megaphone, Download,
    AlertTriangle, Database, Eye, History, Sliders, QrCode, Palette,
    Globe, CreditCard, Phone, Send, X
} from 'lucide-react';

interface NavItem {
    label: string;
    icon: React.ElementType;
    children?: { label: string; icon: React.ElementType; path: string }[];
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard Overview', icon: LayoutDashboard,
        children: [
            { label: 'System Overview', icon: LayoutDashboard, path: '/admin' },
            { label: 'User Statistics', icon: Users, path: '/admin/user-stats' },
            { label: 'Active Leaves', icon: Clock, path: '/admin/active-leaves' },
            { label: 'Occupancy Rate', icon: Building, path: '/admin/occupancy' },
            { label: 'Gate Scan Analytics', icon: QrCode, path: '/admin/gate-logs' },
        ],
    },
    {
        label: 'User Management', icon: Users,
        children: [
            { label: 'Manage Students', icon: Users, path: '/admin/students' },
            { label: 'Manage Parents', icon: Users, path: '/admin/parents' },
            { label: 'Manage Counselors', icon: Users, path: '/admin/counselors' },
            { label: 'Manage Wardens', icon: Users, path: '/admin/wardens' },
            { label: 'Reset Password', icon: Lock, path: '/admin/reset-password' },
        ],
    },
    {
        label: 'Leave Management', icon: FileText,
        children: [
            { label: 'Leave History', icon: History, path: '/admin/all-leaves' },
            { label: 'Emergency Leaves', icon: AlertTriangle, path: '/admin/emergency-leaves' },
            { label: 'Leave Trend Analysis', icon: TrendingUp, path: '/admin/leave-trends' },
        ],
    },
    {
        label: 'Policy & Infrastructure', icon: Building,
        children: [
            { label: 'Hostel Blocks', icon: Building, path: '/admin/rooms' },
            { label: 'Curfew Timing', icon: Clock, path: '/admin/curfew' },
            { label: 'Leave Policy Rules', icon: FileText, path: '/admin/app-settings' },
        ],
    },
    {
        label: 'Security & Logs', icon: Shield,
        children: [
            { label: 'Gate Scan Logs', icon: QrCode, path: '/admin/gate-logs' },
            { label: 'Emergency Log Records', icon: History, path: '/admin/message-logs' },
            { label: 'Login History', icon: History, path: '/admin/login-history' },
        ],
    },
    {
        label: 'System Management', icon: Settings,
        children: [
            { label: 'Database Backup', icon: Database, path: '/admin/backup' },
            { label: 'Emergency Broadcast', icon: Megaphone, path: '/admin/broadcast' },
        ],
    },
    {
        label: 'Profile & Admin', icon: UserCog,
        children: [
            { label: 'My Profile', icon: User, path: '/admin/profile' },
            { label: 'Change Password', icon: Lock, path: '/admin/change-password' },
        ],
    },
];

export const AdminSidebar = ({ isOpen, onToggle }: { isOpen: boolean, onToggle: () => void }) => {
    const [openSections, setOpenSections] = useState<Set<string>>(new Set(['Dashboard Overview']));
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const toggle = (label: string) => {
        const next = new Set(openSections);
        next.has(label) ? next.delete(label) : next.add(label);
        setOpenSections(next);
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={onToggle}
                />
            )}

            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 lg:static 
                    ${isOpen ? 'translate-x-0 flex' : '-translate-x-full lg:translate-x-0 hidden lg:flex'}
                    ${collapsed ? 'lg:w-16' : 'lg:w-64 w-72'} 
                    bg-card border-r border-border flex flex-col transition-all duration-300 shrink-0 h-screen sticky top-0
                `}
            >
                <div className="p-5 border-b border-border flex items-center justify-between gap-3 bg-primary/5">
                    {(!collapsed || isOpen) ? (
                        <div className="flex-1 min-w-0">
                            <h2 className="font-display font-bold text-sm tracking-widest text-primary uppercase">Hostel Haven</h2>
                        </div>
                    ) : (
                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center shrink-0">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                    )}

                    <button
                        onClick={() => isOpen ? onToggle() : setCollapsed(!collapsed)}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    >
                        {isOpen ? (
                            <X className="h-4 w-4" />
                        ) : (
                            <ChevronRight className={`h-4 w-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
                        )}
                    </button>
                </div>

                {/* Relocated Logout Button */}
                {(!collapsed || isOpen) && (
                    <div className="px-3 py-2 border-b border-border bg-muted/30">
                        <button
                            onClick={() => {
                                const btn = document.getElementById('logout-btn-admin');
                                if (btn) btn.style.backgroundColor = 'var(--background)';
                                setTimeout(() => {
                                    logout();
                                    navigate('/');
                                }, 150);
                            }}
                            id="logout-btn-admin"
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-sm"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                )}
                <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
                    {navItems.map(section => {
                        const filteredChildren = section.children?.filter(child => {
                            if (user?.role === 'warden') {
                                const allowedPaths = [
                                    '/admin', '/admin/active-leaves', '/admin/all-leaves',
                                    '/admin/leave-trends', '/admin/gate-logs', '/admin/profile', '/admin/change-password'
                                ];
                                return allowedPaths.includes(child.path);
                            }
                            return true;
                        });

                        if (user?.role === 'warden' && (!filteredChildren || filteredChildren.length === 0)) {
                            return null;
                        }

                        return (
                            <div key={section.label}>
                                <button onClick={() => toggle(section.label)} className="w-full flex items-center gap-2.5 px-3 py-2.5 lg:py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                                    <section.icon className="h-4 w-4 shrink-0" />
                                    {(!collapsed || isOpen) && (
                                        <>
                                            <span className="flex-1 text-left truncate">{section.label}</span>
                                            {section.children && (
                                                <ChevronDown className={`h-3 w-3 transition-transform ${openSections.has(section.label) ? 'rotate-180' : ''}`} />
                                            )}
                                        </>
                                    )}
                                </button>
                                {(!collapsed || isOpen) && section.children && openSections.has(section.label) && (
                                    <div className="ml-4 lg:ml-4 pl-3 border-l border-border/50 space-y-0.5 mt-0.5">
                                        {(filteredChildren || []).map(child => {
                                            const isActive = location.pathname === child.path;
                                            return (
                                                <button
                                                    key={child.path}
                                                    onClick={() => {
                                                        navigate(child.path);
                                                        if (window.innerWidth < 1024) onToggle();
                                                    }}
                                                    className={`w-full flex items-center gap-2 px-2.5 py-2 lg:py-1.5 rounded-md text-[11px] transition-all ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}`}
                                                >
                                                    <child.icon className="h-3 w-3 shrink-0" />
                                                    <span className="truncate">{child.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
};

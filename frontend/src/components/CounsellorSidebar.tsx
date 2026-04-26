import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard, Users, BookOpen, FileText, Brain, Calendar,
    AlertTriangle, BarChart3, MessageSquare, UserCog, ChevronDown, ChevronRight, LogOut,
    Eye, Clock, Bell, Activity, Search, User, ClipboardCheck, History,
    Heart, TrendingUp, Phone, Download, Send, Megaphone, Lock,
    Star, Smile, AlertCircle, Settings, X
} from 'lucide-react';

interface NavItem {
    label: string;
    icon: React.ElementType;
    children?: { label: string; icon: React.ElementType; path: string }[];
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard', icon: LayoutDashboard,
        children: [
            { label: 'Overview', icon: LayoutDashboard, path: '/counsellor' },
            { label: 'Quick Statistics', icon: Activity, path: '/counsellor/quick-stats' },
        ],
    },
    {
        label: 'Student Leaves', icon: Users,
        children: [
            { label: 'View All Students', icon: Users, path: '/counsellor/students' },
            { label: 'Search Student', icon: Search, path: '/counsellor/search-student' },
        ],
    },
    {
        label: 'Leave Monitoring', icon: FileText,
        children: [

            { label: 'Frequent Leave Students', icon: AlertCircle, path: '/counsellor/frequent-leaves' },
            { label: 'Emergency Leaves', icon: AlertTriangle, path: '/counsellor/emergency-leaves' },
            { label: 'Leave Pattern Analysis', icon: TrendingUp, path: '/counsellor/leave-patterns' },
        ],
    },
    {
        label: 'Alerts & SOS', icon: AlertTriangle,
        children: [
            { label: 'SOS Requests', icon: Phone, path: '/counsellor/sos-requests' },
            { label: 'High-Risk Students', icon: AlertTriangle, path: '/counsellor/high-risk' },
        ],
    },
    {
        label: 'Communication', icon: MessageSquare,
        children: [
            { label: 'Broadcast Notice', icon: Megaphone, path: '/counsellor/broadcast' },
            { label: 'Complaint Records', icon: MessageSquare, path: '/counsellor/complaints' },
        ],
    },
    {
        label: 'Profile & Settings', icon: UserCog,
        children: [
            { label: 'My Profile', icon: User, path: '/counsellor/profile' },
            { label: 'Change Password', icon: Lock, path: '/counsellor/change-password' },
        ],
    },
];

export const CounsellorSidebar = ({ isOpen, onToggle }: { isOpen: boolean, onToggle: () => void }) => {
    const [openSections, setOpenSections] = useState<Set<string>>(new Set(['Dashboard']));
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
                <div className="p-4 border-b border-border flex items-center justify-between gap-3">
                    {(!collapsed || isOpen) ? (
                        <div className="flex-1 min-w-0">
                            <h2 className="font-display font-bold text-sm truncate text-primary uppercase">Hostel Haven</h2>
                            <p className="text-[10px] text-muted-foreground truncate">Counsellor Panel · {user?.full_name}</p>
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
                                const btn = document.getElementById('logout-btn-counsellor');
                                if (btn) btn.style.backgroundColor = 'var(--background)';
                                setTimeout(() => {
                                    logout();
                                    navigate('/');
                                }, 150);
                            }}
                            id="logout-btn-counsellor"
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-sm"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                )}

                <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
                    {navItems.map(section => (
                        <div key={section.label}>
                            <button onClick={() => toggle(section.label)} className="w-full flex items-center gap-2.5 px-3 py-2.5 lg:py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                                <section.icon className="h-4 w-4 shrink-0" />
                                {(!collapsed || isOpen) && (
                                    <>
                                        <span className="flex-1 text-left truncate">{section.label}</span>
                                        {section.children && <ChevronDown className={`h-3 w-3 transition-transform ${openSections.has(section.label) ? 'rotate-180' : ''}`} />}
                                    </>
                                )}
                            </button>
                            {(!collapsed || isOpen) && section.children && openSections.has(section.label) && (
                                <div className="ml-4 lg:ml-4 pl-3 border-l border-border/50 space-y-0.5 mt-0.5">
                                    {section.children.map(child => {
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
                    ))}
                </nav>

            </aside>
        </>
    );
};

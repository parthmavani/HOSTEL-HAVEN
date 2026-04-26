import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, PlusCircle, Bell, User,
    Shield, Settings, Users, LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const MobileBottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    if (!user) return null;

    const navItems = [
        {
            label: 'Home',
            icon: LayoutDashboard,
            path: user.role === 'student' ? '/student' :
                user.role === 'parent' ? '/parent' :
                    user.role === 'admin' ? '/admin' :
                        user.role === 'counsellor' ? '/counsellor' :
                            user.role === 'guard' ? '/guard' : '/warden',
            show: true
        },
        {
            label: 'Apply',
            icon: PlusCircle,
            path: '/apply-leave',
            show: user.role === 'student'
        },
        {
            label: 'Users',
            icon: Users,
            path: '/admin/students',
            show: user.role === 'admin'
        },
        {
            label: 'Inbox',
            icon: Bell,
            path: user.role === 'student' ? '/student/notifications' : '/parent/notifications',
            show: ['student', 'parent'].includes(user.role)
        },
        {
            label: 'Security',
            icon: Shield,
            path: '/admin/gate-logs',
            show: user.role === 'admin'
        },
        {
            label: 'Profile',
            icon: User,
            path: `/${user.role}/profile`,
            show: true
        },
    ].filter(item => item.show);

    return (
        <nav className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-sm">
            <div className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 shadow-[0_12px_48px_-12px_rgba(0,0,0,0.3)] rounded-3xl px-6 py-2.5 flex items-center justify-between">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className={`relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground'
                                }`}
                        >
                            <div className={`transition-all duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : 'scale-100 opacity-70'}`}>
                                <item.icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-tight mt-1 transition-all duration-300 ${isActive ? 'opacity-100 max-h-4' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="absolute -top-1 w-8 h-1 bg-primary/10 blur-sm rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

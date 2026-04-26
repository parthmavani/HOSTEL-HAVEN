import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config';
import { Button } from '@/components/ui/button';
import { LogOut, Bell, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const roleLabels = {
  student: 'Student',
  parent: 'Parent',
  warden: 'Warden',
  counsellor: 'Counsellor',
  admin: 'Admin',
};

export const DashboardLayout = ({ children, title }: { children: ReactNode; title: string }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };
    fetchNotifications();
  }, []);

  const unread = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev =>
        prev.map(n => n.notification_id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary flex items-center justify-center">
              <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-semibold font-display leading-none truncate">{title}</h1>
              <p className="text-[9px] sm:text-xs text-muted-foreground truncate mt-0.5">{user?.full_name} · {roleLabels[user?.role || 'student']}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                      {unread}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <p className="text-sm font-semibold mb-2">Notifications</p>
                {notifications.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No notifications.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map(n => (
                      <div
                        key={n.notification_id}
                        className={`text-xs p-2 rounded-md cursor-pointer ${n.is_read ? 'bg-muted/50' : 'bg-primary/5 border border-primary/20'}`}
                        onClick={() => !n.is_read && markAsRead(n.notification_id)}
                      >
                        {n.message}
                      </div>
                    ))}
                  </div>
                )}
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">{children}</main>
    </div>
  );
};

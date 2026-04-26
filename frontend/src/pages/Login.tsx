import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Role } from '@/types';
import { toast } from 'sonner';
import { Shield, Eye, EyeOff, ArrowRight, Sparkles, GraduationCap, Home, BarChart3, LayoutDashboard, ClipboardCheck, Lock, Smartphone, CheckCircle2 } from 'lucide-react';

const dashboardRoutes: Record<Role, string> = {
  student: '/student',
  parent: '/parent',
  warden: '/warden',
  counsellor: '/counsellor',
  admin: '/admin',
  guard: '/guard',
};

const features = [
  { icon: LayoutDashboard, label: 'Role-Based Dashboards', desc: 'Specific views for Students, Parents, Wardens, and Admins' },
  { icon: ClipboardCheck, label: 'Leave Management', desc: 'Streamlined request & approval workflow' },
  { icon: BarChart3, label: 'Real-time Analytics', desc: 'Visual insights powered by Recharts' },
  { icon: Lock, label: 'Secure Authentication', desc: 'JWT-protected routes & password hashing' },
  { icon: Smartphone, label: 'PWA & Responsive', desc: 'Installable app with offline support' },
];

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  // Redirect removed to allow navigating to index even when logged in
  /* 
  useEffect(() => {
    if (user) {
      const route = dashboardRoutes[user.role];
      if (route) navigate(route);
    }
  }, [user, navigate]);
  */

  useEffect(() => {
    const interval = setInterval(() => setActiveFeature(p => (p + 1) % features.length), 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser) {
        toast.success('Welcome back! 🎉');
        const role = loggedInUser.role as Role;
        const route = dashboardRoutes[role];
        if (role && route) {
          navigate(route);
        } else {
          navigate('/');
        }
      } else {
        toast.error('Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* ── Background Orbs ── */}
      <div className="orb orb-purple w-96 h-96 -top-48 -left-48 animate-float" />
      <div className="orb orb-blue w-72 h-72 top-1/3 right-0 animate-float-delayed" />
      <div className="orb orb-pink w-60 h-60 bottom-0 left-1/3 animate-float" />

      {/* ── Left Panel: Branding ── */}
      <div className="hidden lg:flex lg:w-[55%] relative gradient-dark overflow-hidden">
        {/* Mesh background */}
        <div className="absolute inset-0 gradient-mesh-dark" />

        {/* Floating grid lines */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(hsl(250 75% 58%) 1px, transparent 1px), linear-gradient(90deg, hsl(250 75% 58%) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        {/* Animated orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-600/10 blur-3xl animate-float" />
        <div className="absolute bottom-32 right-16 w-64 h-64 rounded-full bg-gradient-to-br from-blue-500/15 to-cyan-500/10 blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-violet-500/10 to-pink-500/5 blur-3xl animate-pulse-slow" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 animate-slide-up">
            <div className="w-14 h-14 rounded-xl bg-accent-gold flex items-center justify-center shadow-lg shadow-black/40 ring-4 ring-primary/50 relative">
              <GraduationCap className="h-8 w-8 text-primary" />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                <Home className="h-3 w-3 text-accent" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-white tracking-widest uppercase">Hostel Haven</h2>

            </div>
          </div>

          {/* Main headline */}
          <div className="space-y-8 animate-slide-up-delayed">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-dark text-xs border border-white/10 text-white/70">
                <Shield className="h-3 w-3 text-accent-gold" />
                <span>Ivy League Standard Residency</span>
              </div>
              <h1 className="text-5xl xl:text-6xl font-heading font-bold text-white leading-tight italic">
                The Standard of<br />
                <span className="text-accent-gold not-italic">Academic Living.</span>
              </h1>
              <p className="text-lg text-white/70 max-w-sm leading-relaxed font-body">
                A state-of-the-art, full-stack hostel management solution designed for elite academic institutions. Built with premium aesthetics, security, and a seamless user experience.
              </p>
            </div>

            {/* Feature carousel */}
            <div className="space-y-4">
              {features.map((f, i) => (
                <div
                  key={f.label}
                  className={`flex items-center gap-5 p-4 rounded-2xl transition-all duration-500 cursor-default border-l-4 ${i === activeFeature
                    ? 'glass-dark border-accent-gold scale-[1.02] opacity-100 shadow-[0_0_40px_rgba(234,179,8,0.15)] bg-white/[0.03]'
                    : 'border-transparent opacity-30 scale-100'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${i === activeFeature ? 'gradient-primary shadow-lg ring-2 ring-white/20' : 'bg-white/5'
                    }`}>
                    <f.icon className={`h-6 w-6 ${i === activeFeature ? 'text-white' : 'text-white/40'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold transition-colors duration-500 ${i === activeFeature ? 'text-white' : 'text-white/40'}`}>{f.label}</p>
                    <p className={`text-xs transition-colors duration-500 ${i === activeFeature ? 'text-white/60' : 'text-white/20'}`}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom stats */}
          <div className="flex gap-8 animate-slide-up-delayed-2 border-t border-white/5 pt-8">
            {[
              { v: 'JWT', l: 'Secure Auth' },
              { v: 'PWA', l: 'Ready' },
              { v: '24/7', l: 'Monitoring' },
            ].map(s => (
              <div key={s.l} className="text-left">
                <p className="text-2xl font-bold text-white tracking-tight">{s.v}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background relative">
        <div className="absolute inset-0 gradient-mesh opacity-50" />

        <div className="w-full max-w-sm relative z-10 space-y-8">
          {/* Mobile logo & Branding */}
          <div className="lg:hidden text-center animate-slide-up space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider border border-accent/20">
              <Shield className="h-3 w-3" />
              <span>Ivy League Standard</span>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl mx-auto border-2 border-accent-gold transform rotate-3">
              <GraduationCap className="h-8 w-8 text-accent-gold -rotate-3" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-heading font-extrabold tracking-tight text-primary uppercase italic">Hostel <span className="text-accent not-italic">Haven</span></h2>
              <p className="text-[11px] text-muted-foreground font-medium max-w-[200px] mx-auto leading-tight">The Standard of Academic Living.</p>
            </div>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left animate-slide-up">
            <h2 className="text-3xl font-heading font-bold text-foreground tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground mt-2 text-sm">Sign in to continue to your dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5 animate-slide-up-delayed">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</Label>
              <div className="input-glow rounded-lg transition-all duration-300">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@university.edu"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-lg border-border bg-white text-sm px-4 focus-visible:ring-primary/20 transition-all placeholder:text-muted-foreground/40 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</Label>
              <div className="input-glow rounded-xl transition-all duration-300 relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-border/60 bg-card/50 backdrop-blur-sm text-sm px-4 pr-11 focus-visible:ring-primary/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl btn-premium text-white font-semibold text-sm tracking-wide group"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-background px-2 text-muted-foreground/60">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/otp-login')}
              className="w-full h-12 rounded-xl border-border/60 bg-card/50 hover:bg-accent text-foreground text-sm font-medium"
            >
              Sign in with OTP
            </Button>
          </form>

          {/* Links */}
          <div className="text-center space-y-3 animate-slide-up-delayed-2">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-semibold hover:underline underline-offset-4 decoration-primary/40 transition-all">
                Create Account
              </Link>
            </p>
            <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/60">
              <Shield className="h-3 w-3" />
              <span>End-to-end encrypted · Secured with JWT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

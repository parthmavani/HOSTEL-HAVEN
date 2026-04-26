import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Role } from '@/types';
import { toast } from 'sonner';
import { Home, ArrowRight, Shield, Eye, EyeOff, User, Mail, Phone, GraduationCap, Briefcase, Brain } from 'lucide-react';

const roleInfo: Record<string, { emoji: string; color: string; icon: any }> = {
    student: { emoji: '🎓', color: 'from-primary to-primary-foreground', icon: GraduationCap },
    parent: { emoji: '👨‍👩', color: 'from-accent to-accent/80', icon: User },
    warden: { emoji: '🛡️', color: 'from-accent-gold to-accent-gold/80', icon: Shield },
    counsellor: { emoji: '🧠', color: 'from-blue-600 to-blue-400', icon: Brain },
    admin: { emoji: '⚙️', color: 'from-slate-700 to-slate-500', icon: Briefcase },
};

const SignUp = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState<Role>('student');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '', email: '', password: '', confirm_password: '', phone: '+91',
        enrollment_number: '', room_number: '', department: '', year_of_study: '',
        parent_email: '', designation: '', office_location: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirm_password) {
            return toast.error('Passwords do not match');
        }
        setIsLoading(true);
        try {
            const { success, email, message } = await register({ ...formData, role });
            if (success) {
                toast.success(message || 'Account created! Verify OTP sent to your email.');
                if (email) {
                    navigate(`/otp-login?email=${encodeURIComponent(email)}`);
                } else {
                    navigate('/otp-login');
                }
            } else {
                toast.error(message || 'Registration failed. Please try again.');
            }
        } finally { setIsLoading(false); }
    };

    const info = roleInfo[role];

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* Background orbs */}
            <div className="orb orb-purple w-80 h-80 -top-40 -right-40 animate-float" />
            <div className="orb orb-blue w-64 h-64 bottom-20 -left-32 animate-float-delayed" />
            <div className="absolute inset-0 gradient-mesh opacity-40" />

            {/* ── Left: Branding (desktop) ── */}
            <div className="hidden lg:flex lg:w-[42%] relative gradient-dark overflow-hidden">
                <div className="absolute inset-0 gradient-mesh-dark" />
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `linear-gradient(hsl(250 75% 58%) 1px, transparent 1px), linear-gradient(90deg, hsl(250 75% 58%) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }} />
                <div className="absolute top-20 left-16 w-60 h-60 rounded-full bg-gradient-to-br from-purple-500/15 to-violet-600/10 blur-3xl animate-float" />
                <div className="absolute bottom-40 right-12 w-52 h-52 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-3xl animate-float-delayed" />

                <div className="relative z-10 flex flex-col justify-between p-10 w-full">
                    <div className="flex items-center gap-3 animate-slide-up">
                        <div className="w-12 h-12 rounded-xl bg-accent-gold flex items-center justify-center shadow-lg shadow-black/40 ring-4 ring-primary/50 relative">
                            <GraduationCap className="h-6 w-6 text-primary" />
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                <Home className="h-2.5 w-2.5 text-accent" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-heading font-bold text-white tracking-widest uppercase">Hostel Haven</h2>

                        </div>
                    </div>

                    <div className="space-y-6 animate-slide-up-delayed">
                        {/* <h1 className="text-4xl font-heading font-bold text-white leading-tight italic">
                            Become part of the<br /><span className="text-accent-gold not-italic">Ivy Legacy.</span>
                        </h1> */}
                        <p className="text-sm text-white/50 max-w-xs leading-relaxed font-body">
                            Join an elite community of scholars in a residency managed by premium academic standards.
                        </p>
                        <div className="space-y-3">
                            {Object.entries(roleInfo).map(([r, info]) => (
                                <div key={r} className={`flex items-center gap-3 p-2.5 rounded-lg transition-all duration-300 ${role === r ? 'glass-dark opacity-100' : 'opacity-25'}`}>
                                    <span className="text-lg">{info.emoji}</span>
                                    <span className="text-sm text-white capitalize font-medium">{r}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-white/30 animate-slide-up-delayed-2">
                        <Shield className="h-3 w-3" /><span>Secured · Encrypted · Privacy-first</span>
                    </div>
                </div>
            </div>

            {/* ── Right: Sign Up Form ── */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative z-10">
                <div className="w-full max-w-md space-y-6">
                    {/* Mobile header */}
                    <div className="lg:hidden text-center animate-slide-up space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider border border-accent/20">
                            <Shield className="h-3 w-3" />
                            <span>Elite Scholar Program</span>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-xl border border-accent-gold transform -rotate-3">
                            <GraduationCap className="h-7 w-7 text-accent-gold rotate-3" />
                        </div>
                        <h2 className="font-heading font-extrabold text-xl text-primary uppercase tracking-tight italic">Hostel <span className="text-accent not-italic">Haven</span></h2>
                    </div>

                    <div className="animate-slide-up">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-2xl">{info.emoji}</span>
                            <h2 className="text-2xl font-heading font-bold text-foreground">Create Account</h2>
                        </div>
                        <p className="text-sm text-muted-foreground">Fill in your details to get started</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up-delayed">
                        {/* Role selector */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">I am a</Label>
                            <Select onValueChange={(v) => setRole(v as Role)} defaultValue="student">
                                <SelectTrigger className="h-11 rounded-lg border-border bg-white shadow-sm focus:ring-primary/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(roleInfo).map(([r, i]) => (
                                        <SelectItem key={r} value={r}><span className="flex items-center gap-2">{i.emoji} <span className="capitalize">{r}</span></span></SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Common fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="full_name" className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Full Name</Label>
                                <div className="input-glow rounded-lg transition-all"><Input id="full_name" placeholder="John Doe" required onChange={handleChange} className="h-11 rounded-lg border-border bg-white text-sm shadow-sm" /></div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Phone</Label>
                                <div className="input-glow rounded-xl transition-all flex items-center h-11 rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
                                    <div className="px-3 text-sm font-semibold text-muted-foreground bg-muted/20 border-r border-border/60 h-full flex items-center select-none bg-muted/10 min-w-[50px] justify-center">+91</div>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        maxLength={10}
                                        placeholder="9876543210"
                                        onChange={(e) => {
                                            const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setFormData({ ...formData, phone: '+91' + digits });
                                        }}
                                        className="h-full border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Email</Label>
                            <div className="input-glow rounded-xl transition-all"><Input id="email" type="email" placeholder="you@college.edu" required onChange={handleChange} className="h-11 rounded-xl border-border/60 bg-card/50 backdrop-blur-sm text-sm" /></div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Password</Label>
                            <div className="input-glow rounded-xl transition-all relative">
                                <Input id="password" type={showPassword ? 'text' : 'password'} required onChange={handleChange} className="h-11 rounded-xl border-border/60 bg-card/50 backdrop-blur-sm text-sm pr-10" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="confirm_password" className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Confirm Password</Label>
                            <div className="input-glow rounded-xl transition-all relative">
                                <Input id="confirm_password" type={showPassword ? 'text' : 'password'} required onChange={handleChange} className="h-11 rounded-xl border-border/60 bg-card/50 backdrop-blur-sm text-sm pr-10" />
                            </div>
                        </div>

                        {/* Student fields */}
                        {role === 'student' && (
                            <div className="space-y-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/50">
                                <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-widest flex items-center gap-1"><GraduationCap className="h-3 w-3" /> Student Details</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1"><Label htmlFor="enrollment_number" className="text-[10px] text-muted-foreground">Enrollment No</Label><Input id="enrollment_number" required onChange={handleChange} className="h-10 rounded-lg text-sm bg-white/80" /></div>
                                    <div className="space-y-1"><Label htmlFor="room_number" className="text-[10px] text-muted-foreground">Room No</Label><Input id="room_number" onChange={handleChange} className="h-10 rounded-lg text-sm bg-white/80" /></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1"><Label htmlFor="department" className="text-[10px] text-muted-foreground">Department</Label><Input id="department" onChange={handleChange} className="h-10 rounded-lg text-sm bg-white/80" /></div>
                                    <div className="space-y-1"><Label htmlFor="year_of_study" className="text-[10px] text-muted-foreground">Year</Label><Input id="year_of_study" type="number" onChange={handleChange} className="h-10 rounded-lg text-sm bg-white/80" /></div>
                                </div>
                                <div className="space-y-1"><Label htmlFor="parent_email" className="text-[10px] text-muted-foreground">Parent Email (for linking)</Label><Input id="parent_email" type="email" placeholder="parent@email.com" onChange={handleChange} className="h-10 rounded-lg text-sm bg-white/80" /></div>
                            </div>
                        )}

                        {/* Authority fields */}
                        {(role === 'warden' || role === 'counsellor' || role === 'admin') && (
                            <div className="space-y-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100/50">
                                <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-widest flex items-center gap-1"><Briefcase className="h-3 w-3" /> Professional Details</p>
                                <div className="space-y-1"><Label htmlFor="designation" className="text-[10px] text-muted-foreground">Designation</Label><Input id="designation" onChange={handleChange} className="h-10 rounded-lg text-sm bg-white/80" /></div>
                                <div className="space-y-1"><Label htmlFor="office_location" className="text-[10px] text-muted-foreground">Office Location</Label><Input id="office_location" onChange={handleChange} className="h-10 rounded-lg text-sm bg-white/80" /></div>
                            </div>
                        )}

                        <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl btn-premium text-white font-semibold text-sm tracking-wide group">
                            {isLoading ? (
                                <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Creating...</span></div>
                            ) : (
                                <div className="flex items-center gap-2"><span>Create Account</span><ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></div>
                            )}
                        </Button>
                    </form>

                    <div className="text-center space-y-2 animate-slide-up-delayed-2">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link to="/" className="text-primary font-semibold hover:underline underline-offset-4 decoration-primary/40">Sign In</Link>
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                            Prefer a faster way?{' '}
                            <Link to="/otp-login" className="text-indigo-400 font-medium hover:underline underline-offset-4 decoration-indigo-400/40">Sign in with OTP</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';
import { useRequestOtp, useVerifyOtp } from '@/hooks/useOtpAuth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import type { Role, VerifyOtpResponse } from '@/types';

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const step1Schema = z.object({
    email: z.string().email('Enter a valid email address'),
});

const step2Schema = z.object({
    otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'Numbers only'),
});

type Step1Form = z.infer<typeof step1Schema>;
type Step2Form = z.infer<typeof step2Schema>;

// ─── Role → Route Map ─────────────────────────────────────────────────────────

const ROLE_ROUTES: Record<Role, string> = {
    student: '/student',
    parent: '/parent',
    warden: '/warden',
    counsellor: '/counsellor',
    admin: '/admin',
};

// ─── OtpLoginPage ─────────────────────────────────────────────────────────────

export default function OtpLoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { loginWithToken } = useAuth();
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState(searchParams.get('email') || '');

    const requestOtpMutation = useRequestOtp();
    const verifyOtpMutation = useVerifyOtp();

    // ── Step 1 ───────────────────────────────────────────────────────────────────
    const step1 = useForm<Step1Form>({
        resolver: zodResolver(step1Schema),
        defaultValues: { email: searchParams.get('email') || '' },
    });

    const onStep1Submit = (data: Step1Form) => {
        setEmail(data.email);
        requestOtpMutation.mutate(
            { email: data.email },
            { onSuccess: () => setStep(2) }
        );
    };

    // ── Step 2 ───────────────────────────────────────────────────────────────────
    const step2 = useForm<Step2Form>({
        resolver: zodResolver(step2Schema),
        defaultValues: { otp: '' },
    });

    const onStep2Submit = (data: Step2Form) => {
        verifyOtpMutation.mutate(
            { email, otp: data.otp },
            {
                onSuccess: (res: VerifyOtpResponse) => {
                    loginWithToken(res);
                    toast.success(`Welcome, ${res.full_name}!`);
                    navigate(ROLE_ROUTES[res.role] ?? '/');
                },
            }
        );
    };

    const resendOtp = () => {
        requestOtpMutation.mutate({ email });
        step2.reset();
    };

    // ─── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-4">
            <div className="w-full max-w-md">

                {/* Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4 shadow-lg shadow-indigo-500/30">
                        <span className="text-2xl">🏠</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Hostel Haven</h1>
                    <p className="text-slate-400 text-sm mt-1">Secure Email OTP Login</p>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2 mb-6">
                    {([{ label: 'Email', n: 1 }, { label: 'Verify', n: 2 }] as const).map(({ label, n }) => (
                        <div key={n} className="flex-1 flex flex-col items-center gap-1">
                            <div className={`h-1.5 w-full rounded-full transition-colors duration-300 ${step >= n ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                            <span className={`text-xs font-medium ${step >= n ? 'text-indigo-400' : 'text-slate-600'}`}>{label}</span>
                        </div>
                    ))}
                </div>

                {/* ── Step 1: Email ─────────────────────────────────────────────────────── */}
                {step === 1 && (
                    <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-sm shadow-2xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-white text-xl">Sign in with OTP</CardTitle>
                            <CardDescription className="text-slate-400">
                                Enter your registered email and we'll send you a one-time code.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={step1.handleSubmit(onStep1Submit)} className="space-y-5">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-slate-300 text-sm">Email address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@college.edu"
                                        autoComplete="email"
                                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                                        {...step1.register('email')}
                                    />
                                    {step1.formState.errors.email && (
                                        <p className="text-red-400 text-xs">{step1.formState.errors.email.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={requestOtpMutation.isPending}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-indigo-600/30"
                                >
                                    {requestOtpMutation.isPending ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Sending…
                                        </span>
                                    ) : (
                                        'Send OTP →'
                                    )}
                                </Button>
                            </form>

                            <p className="text-center text-slate-500 text-sm mt-5">
                                Use password instead?{' '}
                                <Link to="/" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                                    Sign in
                                </Link>
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* ── Step 2: OTP ─────────────────────────────────────────────────────── */}
                {step === 2 && (
                    <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-sm shadow-2xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-white text-xl">Enter OTP</CardTitle>
                            <CardDescription className="text-slate-400">
                                We sent a 6-digit code to{' '}
                                <span className="text-indigo-400 font-medium">{email}</span>.
                                It expires in 10 minutes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={step2.handleSubmit(onStep2Submit)} className="space-y-6">
                                <div className="flex flex-col items-center gap-3">
                                    <InputOTP
                                        maxLength={6}
                                        value={step2.watch('otp')}
                                        onChange={(val) => step2.setValue('otp', val, { shouldValidate: true })}
                                    >
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} className="bg-slate-800 border-slate-700 text-white text-lg w-12 h-12" />
                                            <InputOTPSlot index={1} className="bg-slate-800 border-slate-700 text-white text-lg w-12 h-12" />
                                            <InputOTPSlot index={2} className="bg-slate-800 border-slate-700 text-white text-lg w-12 h-12" />
                                        </InputOTPGroup>
                                        <InputOTPSeparator />
                                        <InputOTPGroup>
                                            <InputOTPSlot index={3} className="bg-slate-800 border-slate-700 text-white text-lg w-12 h-12" />
                                            <InputOTPSlot index={4} className="bg-slate-800 border-slate-700 text-white text-lg w-12 h-12" />
                                            <InputOTPSlot index={5} className="bg-slate-800 border-slate-700 text-white text-lg w-12 h-12" />
                                        </InputOTPGroup>
                                    </InputOTP>
                                    {step2.formState.errors.otp && (
                                        <p className="text-red-400 text-xs">{step2.formState.errors.otp.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={verifyOtpMutation.isPending || step2.watch('otp').length < 6}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                                >
                                    {verifyOtpMutation.isPending ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Verifying…
                                        </span>
                                    ) : (
                                        'Verify & Sign In ✓'
                                    )}
                                </Button>
                            </form>

                            <div className="flex items-center justify-between mt-5 text-sm">
                                <button
                                    type="button"
                                    onClick={() => { setStep(1); step2.reset(); }}
                                    className="text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    ← Change email
                                </button>
                                <button
                                    type="button"
                                    onClick={resendOtp}
                                    disabled={requestOtpMutation.isPending}
                                    className="text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
                                >
                                    Resend OTP
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <p className="text-center text-slate-600 text-xs mt-6">
                    Hostel Haven © {new Date().getFullYear()} · Leave Management System
                </p>
            </div>
        </div>
    );
}

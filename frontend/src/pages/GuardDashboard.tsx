import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    QrCode, CheckCircle2, XCircle, LogOut, LogIn,
    User, Hash, MapPin, Calendar, Clock, Loader2,
    Shield, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL as API } from '@/config';

const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
});

import { MobileBottomNav } from '@/components/MobileBottomNav';

const GuardDashboard = () => {
    const { user, logout } = useAuth();
    const [scanning, setScanning] = useState(true);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        if (scanning && !scannerRef.current) {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            );

            scanner.render(onScanSuccess, onScanFailure);
            scannerRef.current = scanner;
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
            }
        };
    }, [scanning]);

    const onScanSuccess = async (decodedText: string) => {
        if (loading) return;

        setLoading(true);
        setScanning(false);
        setError(null);

        // Pause scanner
        if (scannerRef.current) {
            await scannerRef.current.clear();
            scannerRef.current = null;
        }

        try {
            const res = await fetch(`${API}/guard/scan`, {
                method: 'POST',
                headers: headers(),
                body: JSON.stringify({ qr_data: decodedText })
            });

            const data = await res.json();

            if (res.ok) {
                setResult(data);
                toast.success(`Marked ${data.action} for ${data.student.name}`);
            } else {
                setError(data.message || 'Verification failed');
                toast.error(data.message || 'Scan failed');
            }
        } catch (err) {
            console.error(err);
            setError('Connection to server failed');
            toast.error('Server connection error');
        } finally {
            setLoading(false);
        }
    };

    const onScanFailure = (error: any) => {
        // Silently handle scan failures (usually just continuous scanning)
    };

    const resetScanner = () => {
        setResult(null);
        setError(null);
        setScanning(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center pb-24 lg:pb-8 text-center sm:text-left">
            {/* Header */}
            <div className="w-full max-w-2xl flex justify-between items-center mb-6 sm:mb-8">
                <div className="text-left">
                    <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-800 flex items-center gap-2">
                        <QrCode className="text-primary h-5 w-5 sm:h-6 sm:w-6" /> Guard Terminal
                    </h1>
                    <p className="text-[10px] sm:text-sm text-slate-500 uppercase tracking-wider font-semibold opacity-70">Security Gate System</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-slate-700 uppercase">{user?.full_name}</p>
                        <p className="text-[10px] text-slate-500">Authorized Personnel</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => logout()} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-9 w-9 sm:h-10 sm:w-10">
                        <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                </div>
            </div>

            <div className="w-full max-w-md space-y-6">
                {/* Scanner Section */}
                {scanning ? (
                    <Card className="border-2 border-primary/20 shadow-xl overflow-hidden bg-black">
                        <div id="reader" className="aspect-square max-h-[300px] sm:max-h-none mx-auto overflow-hidden"></div>
                        <CardContent className="p-4 text-center">
                            <p className="text-sm font-medium animate-pulse text-primary flex items-center justify-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary" />
                                Scanning for Student QR...
                            </p>
                        </CardContent>
                    </Card>
                ) : loading ? (
                    <Card className="p-12 flex flex-col items-center justify-center gap-4 text-center border-2 border-slate-200">
                        <Loader2 className="h-12 w-12 text-primary animate-spin" />
                        <p className="text-lg font-medium text-slate-600">Verifying Pass...</p>
                    </Card>
                ) : result ? (
                    /* Success Result View */
                    <Card className="border-2 border-emerald-500 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-emerald-500 p-6 flex flex-col items-center text-white text-center">
                            <div className="bg-white/20 p-3 rounded-full mb-3 backdrop-blur-sm">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">SCAN SUCCESSFUL</h2>
                            <div className="mt-3 px-4 py-1.5 bg-white text-emerald-600 rounded-full text-xs font-black tracking-widest uppercase shadow-sm flex items-center gap-2">
                                <Shield className="h-3 w-3" /> APPROVED
                            </div>
                        </div>

                        <CardContent className="p-0 bg-white">
                            {/* Action Bar */}
                            <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Current Action</span>
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 font-bold">
                                    {result.action === 'EXIT' ? 'MARKING EXIT' : 'MARKING RETURN'}
                                </Badge>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Student Profile */}
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-primary shadow-inner">
                                        <User className="h-7 w-7" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xl font-display font-bold text-slate-800 tracking-tight">{result.student.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                            <Badge variant="outline" className="text-[10px] py-0">{result.student.enrollment}</Badge>
                                            <span>•</span>
                                            <span>{result.student.department}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-left">
                                    <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                                        <p className="text-[9px] text-emerald-600/70 uppercase font-black mb-1.5 tracking-tighter">Room Number</p>
                                        <div className="flex items-center gap-2 text-slate-700 font-bold">
                                            <Hash className="h-4 w-4 text-emerald-500" /> {result.student.room}
                                        </div>
                                    </div>
                                    <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                                        <p className="text-[9px] text-emerald-600/70 uppercase font-black mb-1.5 tracking-tighter">Leave Type</p>
                                        <div className="flex items-center gap-2 text-slate-700 font-bold">
                                            <MapPin className="h-4 w-4 text-emerald-500" /> {result.leave.type}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-left">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                            <span>Leave From</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">{new Date(result.leave.from).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                    <div className="w-full h-px bg-slate-200/50" />
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                                            <span>Expected Return</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">{new Date(result.leave.to).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                </div>

                                <Button onClick={resetScanner} className="w-full h-14 text-base font-bold btn-premium shadow-lg shadow-primary/20 group">
                                    READY FOR NEXT SCAN
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : error ? (
                    /* Error Result View */
                    <Card className="border-2 border-red-500 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-red-500 p-6 flex flex-col items-center text-white text-center">
                            <XCircle className="h-16 w-16 mb-2" />
                            <h2 className="text-2xl font-bold uppercase">Invalid Pass</h2>
                            <p className="mt-2 text-red-100 text-sm max-w-[250px]">{error}</p>
                        </div>
                        <CardContent className="p-6 bg-white">
                            <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-6 text-center">
                                <p className="text-red-800 font-medium">Access Denied at Gate</p>
                                <p className="text-xs text-red-600 mt-1">Please direct the student to Warden Office</p>
                            </div>
                            <Button onClick={resetScanner} variant="destructive" className="w-full h-12 text-lg font-bold">
                                RETRY SCAN
                            </Button>
                        </CardContent>
                    </Card>
                ) : null}

                {/* Scan Log History - Minimal */}
                <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-3">Recent Station History</p>
                    <div className="space-y-2">
                        <div className="text-[10px] text-center text-slate-400 bg-slate-100 py-4 rounded-lg italic">
                            Terminal logs only show current session verification status for maximum security.
                        </div>
                    </div>
                </div>
            </div>
            <MobileBottomNav />
        </div>
    );
};

export default GuardDashboard;

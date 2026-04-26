import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { API_BASE_URL } from '@/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft, Paperclip, X, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { LeaveType } from '@/types';
import { toast } from 'sonner';

const leaveTypes: { value: LeaveType; label: string }[] = [
  { value: 'HOME', label: 'Home Leave' },
  { value: 'HOME_COLLEGE', label: 'Home-College Leave' },
  { value: 'COLLEGE', label: 'College Leave' },
  { value: 'THURSDAY', label: 'Thursday Leave (Girls only)' },
  { value: 'SUNDAY', label: 'Sunday Leave' },
];

// Times that are auto-locked for THURSDAY and SUNDAY leaves
const AUTO_TIME_TYPES: LeaveType[] = ['THURSDAY', 'SUNDAY'];
const AUTO_TIMES: Record<string, { out: string; ret: string }> = {
  THURSDAY: { out: '16:00', ret: '18:00' },
  SUNDAY: { out: '09:00', ret: '18:00' },
};

const ApplyLeave = () => {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [leaveType, setLeaveType] = useState<LeaveType>();
  const [description, setDescription] = useState('');
  const [outTime, setOutTime] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [annexure, setAnnexure] = useState<File | null>(null);
  const [showAnnexure, setShowAnnexure] = useState(false);

  const isAutoTime = leaveType ? AUTO_TIME_TYPES.includes(leaveType) : false;
  const isSingleDay = leaveType === 'THURSDAY' || leaveType === 'SUNDAY';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate || !leaveType || !description) {
      toast.error('Please fill all required fields.');
      return;
    }
    // Skip date order check for single-day leaves (from == to)
    if (!isSingleDay && fromDate > toDate) {
      toast.error('From date must be before To date.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/leaves`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          from_date: format(fromDate, 'yyyy-MM-dd'),
          to_date: format(toDate, 'yyyy-MM-dd'),
          leave_type: leaveType,
          description,
          out_time: outTime || null,
          expected_return_time: returnTime || null,
        }),
      });

      if (res.ok) {
        toast.success('Leave application submitted successfully!');
        navigate('/student');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to submit leave request');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error submitting leave request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Apply for Leave">
      <Button variant="ghost" size="sm" className="mb-4 gap-1" onClick={() => navigate('/student')}>
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-display">New Leave Application</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Leave Type *</Label>
              <Select onValueChange={v => {
                const type = v as LeaveType;
                setLeaveType(type);
                if (AUTO_TIME_TYPES.includes(type)) {
                  setOutTime(AUTO_TIMES[type].out);
                  setReturnTime(AUTO_TIMES[type].ret);
                } else {
                  setOutTime('');
                  setReturnTime('');
                }
                // Reset toDate when switching leave types
                if (type !== 'THURSDAY' && type !== 'SUNDAY') setToDate(undefined);
              }}>
                <SelectTrigger><SelectValue placeholder="Select leave type" /></SelectTrigger>
                <SelectContent>
                  {leaveTypes.map(lt => (
                    <SelectItem key={lt.value} value={lt.value}>{lt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !fromDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, 'PPP') : 'Pick date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={fromDate} onSelect={(d) => {
                      setFromDate(d);
                      if (isSingleDay && d) setToDate(d); // auto-sync
                    }} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>To Date {isSingleDay && <span className="text-xs text-amber-600 font-normal">(auto-set)</span>}</Label>
                {isSingleDay ? (
                  <Button variant="outline" disabled className="w-full justify-start text-left font-normal opacity-70 cursor-not-allowed">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, 'PPP') : 'Same as From Date'}
                  </Button>
                ) : (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !toDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {toDate ? format(toDate, 'PPP') : 'Pick date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={toDate} onSelect={setToDate} className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Out Time {isAutoTime && <span className="text-xs text-amber-600 font-normal">(auto-set)</span>}</Label>
                <Input
                  type="time"
                  value={outTime}
                  onChange={e => setOutTime(e.target.value)}
                  disabled={isAutoTime}
                  className={isAutoTime ? 'bg-muted cursor-not-allowed opacity-70' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label>Expected Return Time {isAutoTime && <span className="text-xs text-amber-600 font-normal">(auto-set)</span>}</Label>
                <Input
                  type="time"
                  value={returnTime}
                  onChange={e => setReturnTime(e.target.value)}
                  disabled={isAutoTime}
                  className={isAutoTime ? 'bg-muted cursor-not-allowed opacity-70' : ''}
                />
              </div>
            </div>
            {isAutoTime && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                🕓 {leaveType === 'THURSDAY' ? 'Out: 4:00 PM, Return: 6:00 PM' : 'Out: 9:00 AM, Return: 6:00 PM'} — fixed for this leave type.
              </p>
            )}

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                placeholder="Reason for leave..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {leaveType && (
              <div className="p-3 rounded-lg bg-muted text-xs text-muted-foreground">
                <strong>Approval chain:</strong>{' '}
                {['COLLEGE', 'HOME_COLLEGE'].includes(leaveType)
                  ? 'Parent → Counsellor / Warden (whoever acts first)'
                  : 'Parent → Warden'}
              </div>
            )}

            {/* ── Medical Certificate Annexure ── */}
            <div className={`rounded-xl border-2 transition-all duration-200 ${showAnnexure ? 'border-blue-300 bg-blue-50/50' : 'border-dashed border-border bg-muted/20'
              }`}>
              <button
                type="button"
                onClick={() => { setShowAnnexure(!showAnnexure); if (showAnnexure) setAnnexure(null); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${showAnnexure ? 'bg-blue-500' : 'bg-muted'
                  }`}>
                  <Paperclip className={`h-4 w-4 ${showAnnexure ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Medical Certificate (Annexure)</p>
                  <p className="text-xs text-muted-foreground">Attach if leave is for medical reasons — optional but recommended</p>
                </div>
                {showAnnexure && <X className="h-4 w-4 text-muted-foreground" />}
              </button>

              {showAnnexure && (
                <div className="px-4 pb-4 space-y-2">
                  <div
                    className="border-2 border-dashed border-blue-200 rounded-lg p-4 text-center cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => document.getElementById('annexure-upload')?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setAnnexure(f); }}
                  >
                    <input
                      id="annexure-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={e => setAnnexure(e.target.files?.[0] ?? null)}
                    />
                    {annexure ? (
                      <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                        <Paperclip className="h-4 w-4" />
                        <span className="font-medium truncate max-w-xs">{annexure.name}</span>
                        <button type="button" onClick={e => { e.stopPropagation(); setAnnexure(null); }}
                          className="text-muted-foreground hover:text-destructive ml-1">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Paperclip className="h-6 w-6 mx-auto text-blue-400 mb-1" />
                        <p className="text-xs text-muted-foreground">Click or drag & drop to upload</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">PDF, JPG, PNG accepted</p>
                      </>
                    )}
                  </div>
                  <p className="text-[10px] text-blue-600 bg-blue-50 rounded-md px-3 py-1.5">
                    📋 The certificate will be reviewed by the Warden before approval.
                  </p>
                </div>
              )}
            </div>



            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ApplyLeave;

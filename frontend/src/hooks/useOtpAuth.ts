import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config';
import type {
    RequestOtpPayload,
    RequestOtpResponse,
    VerifyOtpPayload,
    VerifyOtpResponse,
} from '@/types';

const API_BASE = `${API_BASE_URL}/auth`;

// ─── API functions ─────────────────────────────────────────────────────────────

const requestOtpApi = async (payload: RequestOtpPayload): Promise<RequestOtpResponse> => {
    const res = await fetch(`${API_BASE}/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
    return data as RequestOtpResponse;
};

const verifyOtpApi = async (payload: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
    const res = await fetch(`${API_BASE}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'OTP verification failed');
    return data as VerifyOtpResponse;
};

// ─── Mutation Hooks ────────────────────────────────────────────────────────────

export const useRequestOtp = () =>
    useMutation<RequestOtpResponse, Error, RequestOtpPayload>({
        mutationFn: requestOtpApi,
        onSuccess: () => {
            toast.success('OTP sent!', {
                description: 'Check your email inbox. The code expires in 10 minutes.',
            });
        },
        onError: (error) => {
            toast.error('Failed to send OTP', { description: error.message });
        },
    });

export const useVerifyOtp = () =>
    useMutation<VerifyOtpResponse, Error, VerifyOtpPayload>({
        mutationFn: verifyOtpApi,
        onError: (error) => {
            toast.error('Verification failed', { description: error.message });
        },
    });

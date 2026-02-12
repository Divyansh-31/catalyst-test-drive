import { OTP_CONFIG } from '@/config/otpConfig';

export interface OTPResponse {
    message: string;
    code: string;
    details?: string;
}

/**
 * Send an OTP to the given mobile number via the Twilio backend.
 * The backend formats the number to E.164 automatically.
 */
export async function sendOTP(mobile: string): Promise<OTPResponse> {
    const res = await fetch(`${OTP_CONFIG.BASE_URL}${OTP_CONFIG.ENDPOINTS.SEND_OTP}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
    });

    const data: OTPResponse = await res.json();

    if (!res.ok) {
        throw new OTPError(data.message, data.code, res.status);
    }

    return data;
}

/**
 * Verify an OTP code for the given mobile number.
 */
export async function verifyOTP(mobile: string, otp: string): Promise<OTPResponse> {
    const res = await fetch(`${OTP_CONFIG.BASE_URL}${OTP_CONFIG.ENDPOINTS.VERIFY_OTP}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp }),
    });

    const data: OTPResponse = await res.json();

    if (!res.ok) {
        throw new OTPError(data.message, data.code, res.status);
    }

    return data;
}

/**
 * Custom error class for OTP-related failures.
 * Carries the backend error code for programmatic handling.
 */
export class OTPError extends Error {
    code: string;
    status: number;

    constructor(message: string, code: string, status: number) {
        super(message);
        this.name = 'OTPError';
        this.code = code;
        this.status = status;
    }
}

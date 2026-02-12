import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Shield, Loader2, CheckCircle, XCircle, Phone } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { sendOTP, verifyOTP, OTPError } from '@/services/otpService';

interface TransactionOTPModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (code: string) => Promise<boolean>;
  amount: number;
  phone: string;
}

export const TransactionOTPModal = ({
  open,
  onOpenChange,
  onVerify,
  amount,
  phone,
}: TransactionOTPModalProps) => {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 min (matches backend)
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Send OTP when modal opens
  useEffect(() => {
    if (!open) {
      setCode('');
      setStatus('idle');
      setCountdown(300);
      setErrorMessage('');
      return;
    }

    // Fire off the OTP SMS
    const doSend = async () => {
      if (!phone) return;
      setIsSending(true);
      setStatus('sending');
      try {
        await sendOTP(phone);
        setStatus('idle');
        setCountdown(300);
      } catch (err) {
        const otpErr = err instanceof OTPError ? err : null;
        console.error('[OTP] Send failed:', otpErr?.message || err);
        setStatus('error');
        setErrorMessage(otpErr?.message || 'Failed to send OTP');
      } finally {
        setIsSending(false);
      }
    };

    doSend();
  }, [open, phone]);

  // Countdown timer
  useEffect(() => {
    if (!open || status !== 'idle') return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [open, status]);

  const handleVerify = async () => {
    if (code.length !== 6) return;

    setIsVerifying(true);
    setErrorMessage('');

    try {
      // Verify against the Twilio backend
      await verifyOTP(phone, code);

      // Also call the parent onVerify callback for post-verification logic
      const result = await onVerify(code);

      if (result) {
        setStatus('success');
        setTimeout(() => {
          onOpenChange(false);
        }, 1500);
      }
    } catch (err) {
      const otpErr = err instanceof OTPError ? err : null;
      setStatus('error');
      setErrorMessage(otpErr?.message || 'Verification failed');
      setTimeout(() => {
        setStatus('idle');
        setCode('');
        setErrorMessage('');
      }, 2000);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!phone) return;
    setIsSending(true);
    setErrorMessage('');
    try {
      await sendOTP(phone);
      setCountdown(300);
      setCode('');
    } catch (err) {
      const otpErr = err instanceof OTPError ? err : null;
      setErrorMessage(otpErr?.message || 'Failed to resend OTP');
    } finally {
      setIsSending(false);
    }
  };

  // Mask phone number for display: +91987****210
  const maskedPhone = phone
    ? phone.replace(/(\+?\d{2,4})(\d{3})(\d+)(\d{3})/, '$1$2****$4')
    : '';

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full gradient-primary flex items-center justify-center">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
          <DialogTitle className="text-center">Verify Transaction</DialogTitle>
          <DialogDescription className="text-center">
            {status === 'sending' ? (
              'Sending OTP to your phone…'
            ) : (
              <>
                Enter the 6-digit code sent to{' '}
                <span className="font-semibold text-foreground inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {maskedPhone}
                </span>{' '}
                to confirm your purchase of{' '}
                <span className="font-semibold text-foreground">{formatCurrency(amount)}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-6">
          {status === 'sending' ? (
            <div className="flex flex-col items-center animate-fadeIn">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">Sending OTP via SMS…</p>
            </div>
          ) : status === 'success' ? (
            <div className="flex flex-col items-center animate-fadeIn">
              <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mb-3">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <p className="font-medium text-success">Verified Successfully</p>
            </div>
          ) : status === 'error' ? (
            <div className="flex flex-col items-center animate-fadeIn">
              <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center mb-3">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <p className="font-medium text-destructive">{errorMessage || 'Invalid Code'}</p>
            </div>
          ) : (
            <>
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(value) => setCode(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              <p className="text-sm text-muted-foreground mt-4">
                {countdown > 0 ? (
                  <>
                    Resend code in{' '}
                    <span className={countdown <= 30 ? 'text-destructive pulse-urgent' : 'text-primary'}>
                      {formatTime(countdown)}
                    </span>
                  </>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={isSending}
                    className="text-primary hover:underline disabled:opacity-50"
                  >
                    {isSending ? 'Sending…' : 'Resend code'}
                  </button>
                )}
              </p>
            </>
          )}
        </div>

        {status === 'idle' && (
          <Button
            className="w-full gradient-primary border-0"
            disabled={code.length !== 6 || isVerifying || isSending}
            onClick={handleVerify}
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Confirm Payment'
            )}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

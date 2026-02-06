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
import { Shield, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';

interface TransactionOTPModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (code: string) => Promise<boolean>;
  amount: number;
}

export const TransactionOTPModal = ({
  open,
  onOpenChange,
  onVerify,
  amount,
}: TransactionOTPModalProps) => {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!open) {
      setCode('');
      setStatus('idle');
      setCountdown(60);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  const handleVerify = async () => {
    if (code.length !== 6) return;

    setIsVerifying(true);
    const result = await onVerify(code);
    setIsVerifying(false);

    if (result) {
      setStatus('success');
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } else {
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
        setCode('');
      }, 2000);
    }
  };

  const handleResend = () => {
    setCountdown(60);
    // Trigger resend logic
    console.log('[Demo] New OTP: 123456');
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
            Enter the 6-digit code sent to your phone to confirm your purchase of{' '}
            <span className="font-semibold text-foreground">{formatCurrency(amount)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-6">
          {status === 'success' ? (
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
              <p className="font-medium text-destructive">Invalid Code</p>
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
                    <span className={countdown <= 10 ? 'text-destructive pulse-urgent' : 'text-primary'}>
                      {countdown}s
                    </span>
                  </>
                ) : (
                  <button
                    onClick={handleResend}
                    className="text-primary hover:underline"
                  >
                    Resend code
                  </button>
                )}
              </p>

              <p className="text-xs text-muted-foreground mt-2">
                Demo code: <code className="bg-muted px-1.5 py-0.5 rounded">123456</code>
              </p>
            </>
          )}
        </div>

        {status === 'idle' && (
          <Button
            className="w-full gradient-primary border-0"
            disabled={code.length !== 6 || isVerifying}
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

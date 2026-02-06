import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { useGeofraud } from '@/hooks/useGeofraud';
import { Shield, Mail, Lock, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

type Step = 'credentials' | 'otp';

const Login = () => {
  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { login, sendOTP, verifyOTP, isAuthenticated } = useAuth();
  const { captureGeolocation } = useGeofraud();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect);
    }
  }, [isAuthenticated, navigate, redirect]);

  useEffect(() => {
    if (step === 'otp' && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, countdown]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Silently capture geolocation for FraudX
    await captureGeolocation();

    const result = await login(email, password);
    
    if (result.success && result.requiresOTP) {
      await sendOTP(email);
      setStep('otp');
      setCountdown(60);
    } else if (!result.success) {
      setError('Invalid credentials. Please try again.');
    }

    setIsLoading(false);
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await verifyOTP(otp);
    
    if (!success) {
      setError('Invalid code. Please try again.');
    }

    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    await sendOTP(email);
    setCountdown(60);
    setOtp('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-dark opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.1),transparent_50%)]" />

      <Card className="w-full max-w-md relative bg-card/80 backdrop-blur-xl border-border/50 shadow-soft">
        <CardHeader className="text-center pb-2">
          <Link to="/" className="inline-flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <span className="text-primary-foreground font-bold text-xl">C</span>
            </div>
          </Link>
          <CardTitle className="text-2xl">
            {step === 'credentials' ? 'Welcome back' : 'Verify your identity'}
          </CardTitle>
          <CardDescription>
            {step === 'credentials' 
              ? 'Sign in to your Catalyst Market account'
              : `Enter the 6-digit code sent to ${email}`
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full gradient-primary border-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>

              <Separator className="my-6" />

              <p className="text-xs text-muted-foreground text-center">
                Demo credentials: any email + password (min 6 chars)
              </p>
            </form>
          ) : (
            <form onSubmit={handleOTPSubmit} className="space-y-6">
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <div className="flex flex-col items-center py-4">
                <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Shield className="h-7 w-7 text-primary" />
                </div>

                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
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
                      <span className={countdown <= 10 ? 'text-destructive' : 'text-primary'}>
                        {countdown}s
                      </span>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-primary hover:underline"
                    >
                      Resend code
                    </button>
                  )}
                </p>

                <p className="text-xs text-muted-foreground mt-2">
                  Demo code: <code className="bg-muted px-1.5 py-0.5 rounded">123456</code>
                </p>
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full gradient-primary border-0"
                disabled={otp.length !== 6 || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify & Sign In
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

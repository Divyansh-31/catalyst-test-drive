import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, AuthState, OTPState, RiskMetadata } from '@/types';
import { useGeofraud } from '@/hooks/useGeofraud';
import { sendOTP as apiSendOTP, verifyOTP as apiVerifyOTP, OTPError } from '@/services/otpService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; requiresOTP: boolean }>;
  sendOTP: (email: string) => Promise<boolean>;
  verifyOTP: (code: string) => Promise<boolean>;
  logout: () => void;
  otpState: OTPState;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Mock user for demo
const mockUser: User = {
  id: 'usr_demo_001',
  email: 'demo@catalyst.market',
  name: 'Alex Morgan',
  verified: true,
  createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  riskProfile: 'low',
  metadata: {} as RiskMetadata,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [otpState, setOtpState] = useState<OTPState>({
    sent: false,
    expiresAt: 0,
    attemptsRemaining: 3,
  });

  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [pendingPhone, setPendingPhone] = useState<string>('');
  const { getRiskMetadata, logTransaction } = useGeofraud();

  // Check for existing session
  useEffect(() => {
    const storedUser = localStorage.getItem('catalyst_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({ user, isAuthenticated: true, isLoading: false });
      } catch {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; requiresOTP: boolean }> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Log auth attempt to FraudX
    logTransaction({
      type: 'auth_attempt',
      email,
      timestamp: Date.now(),
    });

    // For demo, accept any email/password
    if (email && password.length >= 6) {
      setPendingEmail(email);
      return { success: true, requiresOTP: true };
    }

    return { success: false, requiresOTP: false };
  }, [logTransaction]);

  const sendOTP = useCallback(async (email: string, phone?: string): Promise<boolean> => {
    // Store phones for verify step
    if (phone) setPendingPhone(phone);

    const mobileNumber = phone || pendingPhone;

    try {
      if (mobileNumber) {
        // Send real OTP via Twilio backend
        await apiSendOTP(mobileNumber);
        console.log(`[OTP] SMS sent to ${mobileNumber}`);
      } else {
        // Fallback: no phone available (login flow without phone)
        console.log('[OTP] No phone number available — using demo mode');
      }

      logTransaction({
        type: 'otp_sent',
        email,
        phone: mobileNumber,
        timestamp: Date.now(),
      });

      setOtpState({
        sent: true,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes (matches backend)
        attemptsRemaining: 3,
      });

      return true;
    } catch (err) {
      console.error('[OTP] Failed to send:', err);
      return false;
    }
  }, [logTransaction, pendingPhone]);

  const verifyOTP = useCallback(async (code: string): Promise<boolean> => {
    try {
      if (pendingPhone) {
        // Verify via real Twilio backend
        await apiVerifyOTP(pendingPhone, code);
      } else {
        // Fallback demo mode: accept 123456
        if (code !== '123456') throw new OTPError('Invalid OTP', 'INVALID_OTP', 400);
      }

      const user: User = {
        ...mockUser,
        email: pendingEmail || mockUser.email,
        phone: pendingPhone || undefined,
        metadata: getRiskMetadata(),
      };

      logTransaction({
        type: 'auth_success',
        userId: user.id,
        email: user.email,
        timestamp: Date.now(),
      });

      localStorage.setItem('catalyst_user', JSON.stringify(user));
      setAuthState({ user, isAuthenticated: true, isLoading: false });
      setOtpState({ sent: false, expiresAt: 0, attemptsRemaining: 3 });
      return true;
    } catch (err) {
      const otpErr = err instanceof OTPError ? err : null;
      console.error('[OTP] Verification failed:', otpErr?.message || err);

      setOtpState((prev) => ({
        ...prev,
        attemptsRemaining: prev.attemptsRemaining - 1,
      }));

      logTransaction({
        type: 'otp_failed',
        email: pendingEmail,
        errorCode: otpErr?.code,
        attemptsRemaining: otpState.attemptsRemaining - 1,
        timestamp: Date.now(),
      });

      return false;
    }
  }, [pendingEmail, pendingPhone, getRiskMetadata, logTransaction, otpState.attemptsRemaining]);

  const logout = useCallback(() => {
    logTransaction({
      type: 'logout',
      userId: authState.user?.id,
      timestamp: Date.now(),
    });

    localStorage.removeItem('catalyst_user');
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  }, [authState.user?.id, logTransaction]);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        sendOTP,
        verifyOTP,
        logout,
        otpState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

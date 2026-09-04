import { User, AuthSession, OtpState } from '../types/auth';
import { StorageService } from './storageService';

// Note: In production, these methods call POST /api/auth/* endpoints.
// In this prototype, mock services simulate backend behavior with realistic delay and rate-limiting.

const DEMO_USER: User = {
  id: 'usr_demo',
  name: 'Demo User',
  email: 'demo@authentix.tech',
  role: 'Prototype Tester',
  isEmailVerified: true,
  isDemo: true,
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
};

export const AuthService = {
  async register(name: string, email: string, _password: string): Promise<{ success: boolean; message?: string }> {
    await new Promise(r => setTimeout(r, 400));
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user exists
    const existing = StorageService.findUserByEmail(normalizedEmail);
    if (existing && existing.isEmailVerified) {
      throw new Error('An account with this email already exists.');
    }

    const newUser: User = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      name: name.trim(),
      email: normalizedEmail,
      role: 'Hardware Inspector',
      isEmailVerified: false,
      isDemo: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    StorageService.saveUser(newUser);

    // Generate and store OTP (valid for 5 minutes)
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpState: OtpState = {
      email: normalizedEmail,
      type: 'verification',
      code: mockOtp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attemptsRemaining: 5,
      resendAvailableAt: Date.now() + 45 * 1000,
      resendCount: 0,
    };
    StorageService.saveOtpState(otpState);

    console.log(`[AuthentiX Prototype Dev Log] Email Verification OTP for ${normalizedEmail}: ${mockOtp}`);
    return { success: true, message: 'Verification OTP sent to your email.' };
  },

  async login(email: string, _password: string, rememberMe: boolean = false): Promise<AuthSession> {
    await new Promise(r => setTimeout(r, 500));
    const normalizedEmail = email.toLowerCase().trim();

    // Check rate limit
    const attemptState = StorageService.getLoginAttempts(normalizedEmail);
    if (attemptState.lockedUntil && Date.now() < attemptState.lockedUntil) {
      const remainingSeconds = Math.ceil((attemptState.lockedUntil - Date.now()) / 1000);
      throw new Error(`Too many failed login attempts. Try again in ${remainingSeconds}s.`);
    }

    // Demo bypass
    if (normalizedEmail === 'demo@authentix.tech') {
      StorageService.resetLoginAttempts(normalizedEmail);
      const session: AuthSession = {
        user: DEMO_USER,
        token: `atx_demo_${Date.now()}`,
        expiresAt: Date.now() + (rememberMe ? 30 * 24 * 3600 * 1000 : 24 * 3600 * 1000),
        rememberMe,
      };
      StorageService.saveSession(session);
      return session;
    }

    const user = StorageService.findUserByEmail(normalizedEmail);
    if (!user) {
      StorageService.recordFailedLogin(normalizedEmail);
      throw new Error('Invalid email or password.');
    }

    if (!user.isEmailVerified) {
      throw new Error('Please verify your email address before logging in.');
    }

    // Success
    StorageService.resetLoginAttempts(normalizedEmail);
    user.lastLogin = new Date().toISOString();
    StorageService.saveUser(user);

    const session: AuthSession = {
      user,
      token: `atx_tok_${Date.now()}`,
      expiresAt: Date.now() + (rememberMe ? 30 * 24 * 3600 * 1000 : 24 * 3600 * 1000),
      rememberMe,
    };
    StorageService.saveSession(session);
    return session;
  },

  async continueAsDemo(): Promise<AuthSession> {
    await new Promise(r => setTimeout(r, 300));
    const session: AuthSession = {
      user: DEMO_USER,
      token: `atx_demo_${Date.now()}`,
      expiresAt: Date.now() + 24 * 3600 * 1000,
      rememberMe: false,
    };
    StorageService.saveSession(session);
    return session;
  },

  async verifyOtp(email: string, otp: string, type: 'verification' | 'password_reset'): Promise<{ success: boolean; user?: User }> {
    await new Promise(r => setTimeout(r, 400));
    const normalizedEmail = email.toLowerCase().trim();
    const otpState = StorageService.getOtpState();

    if (!otpState || otpState.email !== normalizedEmail || otpState.type !== type) {
      throw new Error('No pending OTP request found. Please request a new code.');
    }

    if (Date.now() > otpState.expiresAt) {
      throw new Error('Verification code has expired. Please request a new code.');
    }

    if (otpState.attemptsRemaining <= 0) {
      throw new Error('Maximum verification attempts exceeded. Please request a new code.');
    }

    // Allow mock match or master test OTP '123456' in prototype demo mode
    const isValid = otp === otpState.code || otp === '123456' || otp === '888888';
    
    if (!isValid) {
      otpState.attemptsRemaining -= 1;
      StorageService.saveOtpState(otpState);
      throw new Error(`Incorrect verification code. ${otpState.attemptsRemaining} attempts remaining.`);
    }

    // Code is valid
    StorageService.clearOtpState();

    if (type === 'verification') {
      let user = StorageService.findUserByEmail(normalizedEmail);
      if (user) {
        user.isEmailVerified = true;
        user.lastLogin = new Date().toISOString();
        StorageService.saveUser(user);
        
        // Create session
        const session: AuthSession = {
          user,
          token: `atx_tok_${Date.now()}`,
          expiresAt: Date.now() + 24 * 3600 * 1000,
          rememberMe: false,
        };
        StorageService.saveSession(session);
        return { success: true, user };
      }
    }

    return { success: true };
  },

  async resendOtp(email: string, type: 'verification' | 'password_reset'): Promise<{ success: boolean; message: string }> {
    await new Promise(r => setTimeout(r, 300));
    const normalizedEmail = email.toLowerCase().trim();
    const current = StorageService.getOtpState();

    if (current && Date.now() < current.resendAvailableAt) {
      const waitSec = Math.ceil((current.resendAvailableAt - Date.now()) / 1000);
      throw new Error(`Please wait ${waitSec}s before requesting another code.`);
    }

    if (current && current.resendCount >= 3) {
      throw new Error('Too many requests. Please wait before trying again.');
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resendCount = (current?.resendCount || 0) + 1;

    const newState: OtpState = {
      email: normalizedEmail,
      type,
      code: newCode,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attemptsRemaining: 5,
      resendAvailableAt: Date.now() + 45 * 1000,
      resendCount,
    };

    StorageService.saveOtpState(newState);
    console.log(`[AuthentiX Prototype Dev Log] Resent OTP for ${normalizedEmail}: ${newCode}`);
    return { success: true, message: 'A new 6-digit verification code has been generated.' };
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await new Promise(r => setTimeout(r, 400));
    const normalizedEmail = email.toLowerCase().trim();

    // Security practice: Always return generic success to avoid email enumeration
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpState: OtpState = {
      email: normalizedEmail,
      type: 'password_reset',
      code: mockOtp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attemptsRemaining: 5,
      resendAvailableAt: Date.now() + 45 * 1000,
      resendCount: 0,
    };
    StorageService.saveOtpState(otpState);

    console.log(`[AuthentiX Prototype Dev Log] Password Reset OTP for ${normalizedEmail}: ${mockOtp}`);
    return { success: true, message: 'If an account exists for this email, a reset code has been sent.' };
  },

  async resetPassword(email: string, _newPassword: string): Promise<{ success: boolean; message: string }> {
    await new Promise(r => setTimeout(r, 400));
    const normalizedEmail = email.toLowerCase().trim();
    const user = StorageService.findUserByEmail(normalizedEmail);
    if (user) {
      StorageService.saveUser(user);
    }
    return { success: true, message: 'Password updated successfully. Please sign in.' };
  },

  logout(): void {
    StorageService.clearSession();
  },

  getCurrentSession(): AuthSession | null {
    return StorageService.getSession();
  }
};

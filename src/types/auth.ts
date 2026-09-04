export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  isDemo: boolean;
  avatarUrl?: string;
  createdAt: string;
  lastLogin: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
  rememberMe: boolean;
}

export interface OtpState {
  email: string;
  type: 'verification' | 'password_reset';
  code: string; // for prototype dev testing
  expiresAt: number;
  attemptsRemaining: number;
  resendAvailableAt: number;
  resendCount: number;
}

export interface LoginAttemptState {
  failedAttempts: number;
  lockedUntil: number | null;
}

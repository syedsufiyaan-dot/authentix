import { supabase } from '../lib/supabase';
import type { User, AuthSession } from '../types/auth';

const SESSION_KEY = 'authentix_session';

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

function mapSupabaseUser(sbUser: any): User {
  return {
    id: sbUser.id,
    name:
      sbUser.user_metadata?.name ||
      sbUser.user_metadata?.full_name ||
      sbUser.email?.split('@')[0] ||
      'AuthentiX User',
    email: sbUser.email || '',
    role: 'Hardware Inspector',
    isEmailVerified: !!sbUser.email_confirmed_at,
    isDemo: false,
    avatarUrl: sbUser.user_metadata?.avatar_url,
    createdAt: sbUser.created_at || new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };
}

function saveLocalSession(session: AuthSession): void {
  const storage = session.rememberMe ? localStorage : sessionStorage;

  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);

  storage.setItem(SESSION_KEY, JSON.stringify(session));
}

function readLocalSession(): AuthSession | null {
  try {
    const raw =
      localStorage.getItem(SESSION_KEY) ||
      sessionStorage.getItem(SESSION_KEY);

    if (!raw) return null;

    const session = JSON.parse(raw) as AuthSession;

    if (session.expiresAt && Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

function clearLocalSession(): void {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export const AuthService = {
  async register(
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    const { error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name: name.trim(),
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: 'Verification code sent to your email.',
    };
  },

  async login(
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<AuthSession> {
    const normalizedEmail = email.toLowerCase().trim();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Unable to sign in.');
    }

    const user = mapSupabaseUser(data.user);

    if (!user.isEmailVerified) {
      await supabase.auth.signOut();
      throw new Error(
        'Please verify your email address before logging in.'
      );
    }

    const session: AuthSession = {
      user,
      token: data.session?.access_token || '',
      expiresAt:
        data.session?.expires_at
          ? data.session.expires_at * 1000
          : Date.now() + 24 * 60 * 60 * 1000,
      rememberMe,
    };

    saveLocalSession(session);

    return session;
  },

  async continueAsDemo(): Promise<AuthSession> {
    const session: AuthSession = {
      user: DEMO_USER,
      token: `atx_demo_${Date.now()}`,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      rememberMe: false,
    };

    saveLocalSession(session);

    return session;
  },

  async verifyOtp(
    email: string,
    otp: string,
    type: 'verification' | 'password_reset'
  ): Promise<{ success: boolean; user?: User }> {
    const normalizedEmail = email.toLowerCase().trim();

    const { data, error } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: otp,
      type: type === 'verification' ? 'signup' : 'recovery',
    });

    if (error) {
      throw new Error(error.message);
    }

    if (type === 'verification' && data.user) {
      const user = mapSupabaseUser(data.user);

      const session: AuthSession = {
        user,
        token: data.session?.access_token || '',
        expiresAt:
          data.session?.expires_at
            ? data.session.expires_at * 1000
            : Date.now() + 24 * 60 * 60 * 1000,
        rememberMe: false,
      };

      saveLocalSession(session);

      return {
        success: true,
        user,
      };
    }

    return {
      success: true,
    };
  },

  async resendOtp(
    email: string,
    type: 'verification' | 'password_reset'
  ): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    if (type === 'verification') {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: normalizedEmail,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: 'A new verification code has been sent.',
      };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: 'A new password reset code has been sent.',
    };
  },

  async forgotPassword(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message:
        'If an account exists for this email, a reset code has been sent.',
    };
  },

  async resetPassword(
    _email: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }

    clearLocalSession();

    await supabase.auth.signOut();

    return {
      success: true,
      message: 'Password updated successfully. Please sign in.',
    };
  },

  logout(): void {
    clearLocalSession();
    void supabase.auth.signOut();
  },

  getCurrentSession(): AuthSession | null {
    return readLocalSession();
  },
};

export const authService = AuthService;

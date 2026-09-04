import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthSession } from '../types/auth';
import { AuthService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isDemo: boolean;
  loading: boolean;
  authTransition: boolean;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  verifyOtp: (email: string, otp: string, type: 'verification' | 'password_reset') => Promise<void>;
  resendOtp: (email: string, type: 'verification' | 'password_reset') => Promise<string>;
  continueAsDemo: () => Promise<void>;
  logout: () => void;
  updateUserProfile: (name: string, email: string) => void;
  setAuthTransition: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authTransition, setAuthTransition] = useState<boolean>(false);

  useEffect(() => {
    const active = AuthService.getCurrentSession();
    if (active) {
      setSession(active);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string, rememberMe: boolean = false) => {
    const newSession = await AuthService.login(email, pass, rememberMe);
    setAuthTransition(true);
    setTimeout(() => {
      setSession(newSession);
      setAuthTransition(false);
    }, 1200);
  };

  const register = async (name: string, email: string, pass: string) => {
    await AuthService.register(name, email, pass);
  };

  const verifyOtp = async (email: string, otp: string, type: 'verification' | 'password_reset') => {
    const result = await AuthService.verifyOtp(email, otp, type);
    if (result.user) {
      setAuthTransition(true);
      setTimeout(() => {
        setSession({
          user: result.user!,
          token: `atx_tok_${Date.now()}`,
          expiresAt: Date.now() + 24 * 3600 * 1000,
          rememberMe: false
        });
        setAuthTransition(false);
      }, 1200);
    }
  };

  const resendOtp = async (email: string, type: 'verification' | 'password_reset') => {
    const res = await AuthService.resendOtp(email, type);
    return res.message;
  };

  const continueAsDemo = async () => {
    const demoSession = await AuthService.continueAsDemo();
    setAuthTransition(true);
    setTimeout(() => {
      setSession(demoSession);
      setAuthTransition(false);
    }, 1000);
  };

  const logout = () => {
    AuthService.logout();
    setSession(null);
  };

  const updateUserProfile = (name: string, email: string) => {
    if (session && session.user) {
      const updatedUser = { ...session.user, name, email };
      const updatedSession = { ...session, user: updatedUser };
      setSession(updatedSession);
      AuthService.login(email, '', session.rememberMe).catch(() => {});
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        isAuthenticated: !!session?.user,
        isEmailVerified: !!session?.user?.isEmailVerified,
        isDemo: !!session?.user?.isDemo,
        loading,
        authTransition,
        login,
        register,
        verifyOtp,
        resendOtp,
        continueAsDemo,
        logout,
        updateUserProfile,
        setAuthTransition,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

import React, { createContext, useContext, useEffect, useState } from 'react';
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
  verifyOtp: (
    email: string,
    otp: string,
    type: 'verification' | 'password_reset'
  ) => Promise<void>;
  resendOtp: (
    email: string,
    type: 'verification' | 'password_reset'
  ) => Promise<string>;
  continueAsDemo: () => Promise<void>;
  logout: () => void;
  updateUserProfile: (name: string, email: string) => void;
  setAuthTransition: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [authTransition, setAuthTransition] = useState(false);

  useEffect(() => {
    const active = AuthService.getCurrentSession();

    if (active) {
      setSession(active);
    }

    setLoading(false);
  }, []);

  const login = async (
    email: string,
    pass: string,
    rememberMe: boolean = false
  ) => {
    const newSession = await AuthService.login(
      email,
      pass,
      rememberMe
    );

    // IMPORTANT:
    // Set authentication immediately so ProtectedRoute
    // does not redirect back to /login.
    setSession(newSession);

    // Transition is visual only.
    setAuthTransition(true);

    setTimeout(() => {
      setAuthTransition(false);
    }, 900);
  };

  const register = async (
    name: string,
    email: string,
    pass: string
  ) => {
    await AuthService.register(name, email, pass);
  };

  const verifyOtp = async (
    email: string,
    otp: string,
    type: 'verification' | 'password_reset'
  ) => {
    const result = await AuthService.verifyOtp(
      email,
      otp,
      type
    );

    if (result.user) {
      const savedSession = AuthService.getCurrentSession();

      if (savedSession) {
        // Set session immediately after OTP verification.
        setSession(savedSession);
      }

      setAuthTransition(true);

      setTimeout(() => {
        setAuthTransition(false);
      }, 900);
    }
  };

  const resendOtp = async (
    email: string,
    type: 'verification' | 'password_reset'
  ) => {
    const res = await AuthService.resendOtp(email, type);
    return res.message;
  };

  const continueAsDemo = async () => {
    const demoSession = await AuthService.continueAsDemo();

    // Immediate authentication
    setSession(demoSession);

    setAuthTransition(true);

    setTimeout(() => {
      setAuthTransition(false);
    }, 800);
  };

  const logout = () => {
    AuthService.logout();
    setSession(null);
    setAuthTransition(false);
  };

  const updateUserProfile = (
    name: string,
    email: string
  ) => {
    if (!session) return;

    const updatedUser: User = {
      ...session.user,
      name,
      email,
    };

    setSession({
      ...session,
      user: updatedUser,
    });
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

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { AuthentixLogo } from '../components/common/AuthentixLogo';
import { PhoneModel3D } from '../components/three/PhoneModel3D';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login, continueAsDemo } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password, rememberMe);
      toast('Signed in successfully.', 'success');
      navigate('/app/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setErrorMessage(msg);
      toast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    try {
      await continueAsDemo();
      toast('Welcome to AuthentiX Demo Mode!', 'info');
      navigate('/app/dashboard');
    } catch {
      toast('Failed to launch demo session.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-darkest text-text-primary flex flex-col justify-between select-none">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-bg-border/50">
        <AuthentixLogo variant="full" size={32} />
        <Link
          to="/"
          className="text-xs font-mono text-text-muted hover:text-white transition-colors"
        >
          ← Back to Overview
        </Link>
      </header>

      {/* Main Split Screen */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl w-full mx-auto p-6 md:p-12 items-center gap-12">
        {/* Left Side: 3D Diagnostic Visualizer */}
        <div className="hidden lg:flex lg:col-span-6 flex-col items-center justify-center space-y-6">
          <div className="w-full h-[460px] relative rounded-3xl glass-panel p-4 flex items-center justify-center">
            <PhoneModel3D isScanning={true} />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-white font-mono">AUTHENTIX DIAGNOSTIC TERMINAL</h3>
            <p className="text-xs text-text-muted">High-precision mobile hardware authentication & telemetry</p>
          </div>
        </div>

        {/* Right Side: Authentication Glass Panel */}
        <div className="lg:col-span-6 max-w-md w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl glass-panel-glow border border-accent-teal/20 space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
              <p className="text-xs text-text-muted">
                Sign in to your AuthentiX diagnostic workstation.
              </p>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-status-critical/10 border border-status-critical/30 flex items-start gap-2.5 text-xs text-status-critical">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-muted">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-text-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="inspector@authentix.tech"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:border-accent-teal"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-text-muted">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-accent-cyan hover:underline font-mono"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyDown}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-sm focus:border-accent-teal"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-dim hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {capsLockActive && (
                  <p className="text-[11px] text-status-warning font-mono">⚠️ Caps Lock is active</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-text-muted">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-bg-card border-bg-border text-accent-teal focus:ring-0"
                  />
                  <span>Remember this workstation</span>
                </label>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-accent-teal text-bg-darkest font-bold text-sm hover:bg-accent-teal/90 transition-all shadow-teal-glow flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-bg-darkest border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-bg-border w-full" />
              <span className="bg-bg-card px-3 text-[10px] font-mono text-text-dim uppercase absolute">
                OR
              </span>
            </div>

            {/* Continue as Demo */}
            <button
              onClick={handleDemoLogin}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl glass-panel hover:border-accent-cyan/50 text-accent-cyan font-mono font-medium text-xs transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Continue as Demo Account</span>
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-text-muted">Don't have an account? </span>
              <Link to="/register" className="text-xs font-semibold text-accent-teal hover:underline">
                Create Account
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-text-dim font-mono border-t border-bg-border/30">
        AuthentiX Secure Diagnostic Environment • 256-Bit Session Protection
      </footer>
    </div>
  );
};

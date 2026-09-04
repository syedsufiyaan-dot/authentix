import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { AuthentixLogo } from '../components/common/AuthentixLogo';
import { PasswordStrengthMeter } from '../components/auth/PasswordStrengthMeter';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { validateEmail } from '../utils/validation';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }
    if (!validateEmail(email)) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must contain at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(fullName, email, password);
      toast('Verification code sent! Please verify your email.', 'info');
      navigate('/verify-email', { state: { email } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setErrorMessage(msg);
      toast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-darkest text-text-primary flex flex-col justify-between select-none">
      <header className="px-6 py-4 flex items-center justify-between border-b border-bg-border/50">
        <AuthentixLogo variant="full" size={32} />
        <Link to="/login" className="text-xs font-mono text-text-muted hover:text-white transition-colors">
          Already have an account? Sign In →
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full p-8 rounded-3xl glass-panel-glow border border-accent-teal/20 space-y-6"
        >
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">Create an Account</h2>
            <p className="text-xs text-text-muted">
              Register to access comprehensive hardware diagnostic telemetry.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-status-critical/10 border border-status-critical/30 flex items-start gap-2.5 text-xs text-status-critical">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-text-muted">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-text-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Sarah Connor"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:border-accent-teal"
                  required
                />
              </div>
            </div>

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
              <label className="text-xs font-mono text-text-muted">Create Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <PasswordStrengthMeter password={password} />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-text-muted">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:border-accent-teal"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-accent-teal text-bg-darkest font-bold text-sm hover:bg-accent-teal/90 transition-all shadow-teal-glow flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-bg-darkest border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-xs text-text-muted">Already registered? </span>
            <Link to="/login" className="text-xs font-semibold text-accent-teal hover:underline">
              Sign In
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-text-dim font-mono border-t border-bg-border/30">
        AuthentiX Diagnostic Systems • Automated Security Gateway
      </footer>
    </div>
  );
};

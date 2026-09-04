import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthentixLogo } from '../components/common/AuthentixLogo';
import { PasswordStrengthMeter } from '../components/auth/PasswordStrengthMeter';
import { useToast } from '../components/common/Toast';
import { AuthService } from '../services/authService';

export const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as { email?: string })?.email || 'inspector@authentix.tech';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await AuthService.resetPassword(email, password);
      toast(res.message, 'success');
      navigate('/login');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-darkest text-text-primary flex flex-col justify-between select-none">
      <header className="px-6 py-4 flex items-center justify-between border-b border-bg-border/50">
        <AuthentixLogo variant="full" size={32} />
        <Link to="/login" className="text-xs font-mono text-text-muted hover:text-white transition-colors">
          Return to Sign In
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full p-8 rounded-3xl glass-panel-glow border border-accent-teal/20 space-y-6"
        >
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">Create New Password</h2>
            <p className="text-xs text-text-muted">
              Choose a secure password for <strong className="text-accent-teal font-mono">{email}</strong>.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-status-critical/10 border border-status-critical/30 flex items-start gap-2.5 text-xs text-status-critical">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-text-muted">New Password</label>
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

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-text-muted">Confirm New Password</label>
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
                'Reset Password'
              )}
            </button>
          </form>
        </motion.div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-text-dim font-mono border-t border-bg-border/30">
        AuthentiX Account Recovery Gateway
      </footer>
    </div>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { AuthentixLogo } from '../components/common/AuthentixLogo';
import { useToast } from '../components/common/Toast';
import { AuthService } from '../services/authService';
import { validateEmail } from '../utils/validation';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await AuthService.forgotPassword(email);
      toast(res.message, 'info');
      navigate('/reset-otp', { state: { email } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Request failed.';
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
            <div className="w-12 h-12 rounded-2xl bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center mx-auto text-accent-teal">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Forgot Your Password?</h2>
            <p className="text-xs text-text-muted">
              Enter your verified email to receive a password reset verification code.
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
              <label className="text-xs font-mono text-text-muted">Account Email</label>
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-accent-teal text-bg-darkest font-bold text-sm hover:bg-accent-teal/90 transition-all shadow-teal-glow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-bg-darkest border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Reset Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link to="/login" className="text-xs text-text-muted hover:text-white font-mono">
              ← Back to Sign In
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-text-dim font-mono border-t border-bg-border/30">
        AuthentiX Account Recovery Gateway
      </footer>
    </div>
  );
};

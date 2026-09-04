import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { AuthentixLogo } from '../components/common/AuthentixLogo';
import { OtpInput } from '../components/auth/OtpInput';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { formatSeconds } from '../utils/validation';

export const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as { email?: string })?.email || 'inspector@authentix.tech';

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [expirySeconds, setExpirySeconds] = useState<number>(300); // 5 mins
  const [resendCooldown, setResendCooldown] = useState<number>(45);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const { verifyOtp, resendOtp } = useAuth();
  const { toast } = useToast();

  // Expiry Countdown
  useEffect(() => {
    if (expirySeconds <= 0) return;
    const timer = setInterval(() => setExpirySeconds((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [expirySeconds]);

  // Resend Cooldown Countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = async (codeOverride?: string) => {
    const code = codeOverride || otp.join('');
    setErrorMessage('');

    if (code.length < 6) {
      setErrorMessage('Please enter the complete 6-digit code.');
      return;
    }
    if (expirySeconds <= 0) {
      setErrorMessage('Verification code has expired. Please request a new code.');
      return;
    }

    setIsVerifying(true);
    try {
      await verifyOtp(email, code, 'verification');
      setIsSuccess(true);
      toast('Email verified successfully!', 'success');
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid verification code.';
      setErrorMessage(msg);
      toast(msg, 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto-submit when all 6 digits entered
  const handleOtpChange = (newOtp: string[]) => {
    setOtp(newOtp);
    if (newOtp.every((d) => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    setErrorMessage('');
    try {
      const msg = await resendOtp(email, 'verification');
      setExpirySeconds(300);
      setResendCooldown(45);
      setOtp(['', '', '', '', '', '']);
      toast(msg, 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to resend code.';
      setErrorMessage(msg);
      toast(msg, 'error');
    } finally {
      setIsResending(false);
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
          className="max-w-md w-full p-8 rounded-3xl glass-panel-glow border border-accent-teal/20 space-y-6 text-center"
        >
          {isSuccess ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-8 space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-status-success/20 border border-status-success/40 flex items-center justify-center mx-auto text-status-success">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">EMAIL VERIFIED</h2>
              <p className="text-xs text-text-muted font-mono">
                WELCOME TO AUTHENTIX • Redirecting to workstation...
              </p>
            </motion.div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center mx-auto text-accent-teal">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Verify Your Email</h2>
                <p className="text-xs text-text-muted">
                  We sent a 6-digit verification code to: <br />
                  <strong className="text-accent-teal font-mono">{email}</strong>
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-status-critical/10 border border-status-critical/30 flex items-start gap-2.5 text-xs text-status-critical text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 6-box OTP input */}
              <div className="py-2">
                <OtpInput value={otp} onChange={handleOtpChange} disabled={isVerifying} />
              </div>

              {/* Expiry Countdown */}
              <div className="flex items-center justify-between text-xs font-mono text-text-muted">
                <span>
                  {expirySeconds > 0 ? (
                    `Code expires in ${formatSeconds(expirySeconds)}`
                  ) : (
                    <span className="text-status-critical">Code expired</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isResending}
                  className="text-accent-cyan hover:underline disabled:text-text-dim disabled:no-underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>

              {/* Verify Action */}
              <button
                type="button"
                onClick={() => handleVerify()}
                disabled={isVerifying || otp.some((d) => !d) || expirySeconds <= 0}
                className="w-full py-3 rounded-xl bg-accent-teal text-bg-darkest font-bold text-sm hover:bg-accent-teal/90 transition-all shadow-teal-glow flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifying ? (
                  <div className="w-4 h-4 border-2 border-bg-darkest border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Verify Email'
                )}
              </button>

              <p className="text-[11px] text-text-dim font-mono">
                Prototype hint: Dev testing master OTP is <code className="text-accent-teal">123456</code>
              </p>
            </>
          )}
        </motion.div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-text-dim font-mono border-t border-bg-border/30">
        AuthentiX Verification Gateway • Rate-Limited Encryption
      </footer>
    </div>
  );
};

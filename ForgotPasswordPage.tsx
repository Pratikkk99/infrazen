
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, KeyRound, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { Logo } from './components/Logo';
import { Input } from './components/Input';
import { Button } from './components/Button';
import { apiClient } from './utils/apiClient';

import { simulateAction, showToast } from './utils/demo';

interface ForgotPasswordPageProps {
  onBack: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBack }) => {
  const [step, setStep] = useState<'input' | 'otp' | 'success'>('input');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const validateIdentifier = (val: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return emailRegex.test(val) || phoneRegex.test(val);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier) {
      showToast.error('Email or mobile is required.');
      return;
    }

    if (!validateIdentifier(identifier)) {
      showToast.error('Please enter a valid email or phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post("/api/auth/reset-password-request", { identifier });
      setStep('otp');
      setResendTimer(30);
      showToast.success("OTP sent successfully!");
    } catch (error: any) {
      showToast.error(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length < 6) {
      showToast.error('Please enter a valid 6-digit OTP.');
      return;
    }

    if (newPassword.length < 8) {
      showToast.error('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post("/api/auth/reset-password", { identifier, otp, newPassword });
      setStep('success');
      showToast.success("Password reset successfully!");
    } catch (error: any) {
      showToast.error(error.message || "Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    const loadingToast = showToast.loading("Resending OTP...");
    try {
      await apiClient.post("/api/auth/reset-password-request", { identifier });
      setResendTimer(30);
      showToast.dismiss(loadingToast);
      showToast.success("OTP resent successfully!");
    } catch (error: any) {
      showToast.dismiss(loadingToast);
      showToast.error(error.message || "Failed to resend OTP.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-teal-50 selection:text-teal-900">
      {/* Navigation Header */}
      <div className="p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors font-medium group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          {step === 'success' ? 'Go to Login' : 'Back to Login'}
        </button>
      </div>

      <div className="flex-grow flex items-center justify-center p-6 pb-24">
        <div className="w-full max-w-[460px] relative">

          <AnimatePresence mode="wait">
            {step === 'input' && (
              <motion.div
                key="input-step"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <div className="text-center">
                  <div className="inline-block mb-8">
                    <Logo />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-display">Forgot Password</h1>
                  <p className="text-slate-500 mt-3 font-medium px-4">
                    Enter your registered email or mobile number to receive a reset OTP.
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="bg-white border border-slate-100 p-10 rounded-[2.5rem] zen-shadow space-y-8">
                  <div className="space-y-2">
                    <Input
                      label="Email / Mobile"
                      placeholder="example@domain.com or +91XXXXXXXXXX"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-5 text-lg shadow-2xl shadow-teal-500/10 rounded-2xl"
                    loading={isSubmitting}
                  >
                    Send OTP
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={onBack}
                      className="text-sm text-slate-400 font-bold hover:text-teal-600 transition-colors uppercase tracking-widest"
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <div className="text-center">
                  <div className="inline-block mb-8">
                    <Logo />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-display">Verify Identity</h1>
                  <p className="text-slate-500 mt-3 font-medium">
                    We've sent a 6-digit code to <span className="text-slate-900 font-bold underline decoration-teal-500 decoration-2 underline-offset-4">{identifier}</span>.
                  </p>
                </div>

                <form onSubmit={handleVerifyAndReset} className="bg-white border border-slate-100 p-10 rounded-[3rem] zen-shadow space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Input
                        label="OTP Code"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        className="text-center tracking-[1em] font-mono text-2xl"
                      />
                      <div className="flex justify-between items-center px-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Default: 123456</p>
                        <button
                          type="button"
                          onClick={handleResend}
                          disabled={resendTimer > 0}
                          className={`text-xs font-bold uppercase tracking-wider transition-colors ${resendTimer > 0 ? 'text-slate-300' : 'text-teal-600 hover:text-teal-700 underline'
                            }`}
                        >
                          {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Input
                        label="New Password"
                        type="password"
                        placeholder="Min 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>

                  </div>

                  <Button
                    type="submit"
                    className="w-full py-5 text-lg shadow-2xl shadow-teal-500/10 rounded-2xl"
                    loading={isSubmitting}
                  >
                    Verify & Reset Password
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-10"
              >
                <div className="w-24 h-24 bg-teal-50 rounded-[2.5rem] flex items-center justify-center text-teal-600 mx-auto shadow-xl shadow-teal-500/10 border-4 border-white">
                  <CheckCircle2 size={48} />
                </div>

                <div className="space-y-4">
                  <h1 className="text-3xl font-black text-slate-900 font-display tracking-tight">Password Reset!</h1>
                  <p className="text-lg text-slate-500 font-medium px-8 leading-relaxed">
                    Your password has been successfully updated. You can now log in to your dashboard.
                  </p>
                </div>

                <div className="bg-white border border-slate-100 p-8 rounded-[3rem] zen-shadow">
                  <Button
                    onClick={onBack}
                    className="w-full py-5 text-lg font-display font-black shadow-2xl shadow-teal-500/10 rounded-2xl"
                  >
                    Return to Login
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Secure indicator */}
          <div className="mt-12 flex items-center justify-center gap-3 text-slate-300">
            <div className="h-px w-8 bg-slate-100" />
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Secure Reset</span>
            <div className="h-px w-8 bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
};

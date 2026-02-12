
import React, { useState } from 'react';
import { Logo } from './components/Logo';
import { Input } from './components/Input';
import { Button } from './components/Button';
import { ArrowLeft, LockKeyhole, Info } from 'lucide-react';

import { simulateAction, showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';

interface LoginPageProps {
  onBack: () => void;
  onSignUp: () => void;
  onForgotPassword: () => void;
  onLoginSuccess: (role?: 'admin' | 'org' | 'expert') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBack, onSignUp, onForgotPassword, onLoginSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('admin@infra2zen.com');
  const [password, setPassword] = useState('Infratech@1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast.error("Email and password are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const { token, user } = await apiClient.post('/auth/login', { email, password });

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      let role: 'admin' | 'org' | 'expert' = 'admin';
      if (user.role === 'EXPERT') role = 'expert';
      else if (user.role === 'ORG_ADMIN' || user.role === 'ORG_MEMBER' || user.role === 'INDIVIDUAL_OWNER') role = 'org';

      showToast.success(`Welcome back, ${user.name}!`);
      onLoginSuccess(role);
    } catch (error: any) {
      showToast.error(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation Header */}
      <div className="p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors font-medium group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>
      </div>

      <div className="flex-grow flex items-center justify-center p-6 pb-24">
        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-10">
            <div className="inline-block mb-8">
              <Logo />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Login</h1>
            <p className="text-slate-500 mt-2">Welcome back to infra2zen.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-slate-100 p-8 rounded-[2rem] zen-shadow space-y-6">
            <div className="bg-teal-50 border border-teal-100 p-3 rounded-xl flex gap-3 items-start">
              <Info size={18} className="text-teal-600 shrink-0 mt-0.5" />
              <div className="text-xs text-teal-800 leading-relaxed">
                <p className="font-bold mb-1">Access Info:</p>
                <ul className="list-disc ml-4 space-y-0.5">
                  <li><strong>Admin:</strong> admin@infra2zen.com / Infratech@1</li>
                  <li><strong>Others:</strong> Use your registered credentials.</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Email or Mobile"
                placeholder="admin@infra2zen.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="space-y-1">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-xs font-semibold text-teal-600 hover:underline underline-offset-4"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-4 text-lg shadow-xl shadow-teal-500/10"
              loading={isSubmitting}
            >
              Login to Dashboard
            </Button>

            <div className="text-center pt-2">
              <p className="text-sm text-slate-500">
                Don’t have an account?{' '}
                <button
                  onClick={onSignUp}
                  type="button"
                  className="text-teal-600 font-bold hover:underline underline-offset-4"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </form>

          {/* Secure indicator */}
          <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
            <LockKeyhole size={14} />
            <span className="text-xs font-medium uppercase tracking-widest">Secure Cloud Gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
};

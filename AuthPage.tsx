
import React, { useState } from 'react';
import { Logo } from './components/Logo';
import { Input } from './components/Input';
import { Button } from './components/Button';
import { RadioGroup } from './components/RadioGroup';
import { ArrowLeft, Send } from 'lucide-react';

import { simulateAction, showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';

interface AuthPageProps {
  onBack: () => void;
  onLogin: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBack, onLogin }) => {
  const [userType, setUserType] = useState('organization');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    try {
      await apiClient.post("/api/auth/reset-password-request", { identifier: email });
      setOtpSent(true);
      showToast.success("Verification code sent to " + email);
    } catch (error: any) {
      showToast.error(error.message || "Failed to send code. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Map userType to primary_role
      const roleMap: any = {
        'organization': 'ORG_ADMIN',
        'individual': 'INDIVIDUAL_OWNER',
        'expert': 'EXPERT'
      };

      await apiClient.post('/auth/register', {
        name,
        email,
        password,
        role: roleMap[userType]
      });

      showToast.success("Account created successfully!");
      onLogin(); // Redirect to login after successful signup
    } catch (error: any) {
      showToast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const userOptions = [
    { id: 'organization', label: 'Organization User' },
    { id: 'individual', label: 'Individual Owner' },
    { id: 'expert', label: 'Audit Expert' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Mini Header for Navigation */}
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
        <div className="w-full max-w-[480px] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-10">
            <div className="inline-block mb-8">
              <Logo />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create Account</h1>
            <p className="text-slate-500 mt-2">Join infra2zen for verified infrastructure audits.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-slate-100 p-8 rounded-[2rem] zen-shadow space-y-6">
            <div className="space-y-4">
              <Input
                label="Full Name"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Email or Mobile"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <RadioGroup
              label="I am:"
              options={userOptions}
              value={userType}
              onChange={setUserType}
            />

            <div className="pt-2 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              By joining, you agree to the Infra2zen Terms of Service
            </div>

            <Button
              type="submit"
              className="w-full py-4 text-lg mt-4 shadow-xl shadow-teal-500/10"
              loading={isSubmitting}
            >
              Create Account
            </Button>

            <div className="text-center pt-2">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onLogin}
                  className="text-teal-600 font-bold hover:underline underline-offset-4"
                >
                  Login
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

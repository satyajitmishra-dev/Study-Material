'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff, Check, X, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/core';
import { resetPasswordAction } from '@/lib/actions/authActions';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const requirements = [
    { label: 'Minimum 8 characters', test: (pw: string) => pw.length >= 8 },
    { label: 'One uppercase letter (A-Z)', test: (pw: string) => /[A-Z]/.test(pw) },
    { label: 'One lowercase letter (a-z)', test: (pw: string) => /[a-z]/.test(pw) },
    { label: 'One number (0-9)', test: (pw: string) => /[0-9]/.test(pw) },
    { label: 'One special character', test: (pw: string) => /[^A-Za-z0-9]/.test(pw) }
  ];

  const getStrength = () => {
    if (!password) return { score: 0, label: 'None', color: 'bg-stone/20', text: 'text-stone' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (password.length >= 12) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-accent-pink', text: 'text-accent-pink' };
    if (score <= 4) return { score, label: 'Fair', color: 'bg-accent-amber', text: 'text-accent-amber' };
    if (score === 5) return { score, label: 'Good', color: 'bg-accent-cyan', text: 'text-accent-cyan' };
    return { score, label: 'Strong', color: 'bg-accent-emerald', text: 'text-accent-emerald' };
  };

  const strength = getStrength();
  const allRequirementsMet = requirements.every(r => r.test(password));
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRequirementsMet || !passwordsMatch || !token) return;

    setLoading(true);
    setError('');

    try {
      const result = await resetPasswordAction({ token, password });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 3000);
      } else {
        const errorMap: Record<string, string> = {
          INVALID_OR_EXPIRED_TOKEN: 'This reset link is invalid or has expired. Please request a new one.',
          VALIDATION_FAILED: 'Password does not meet security requirements.',
          USER_NOT_FOUND: 'Account not found.',
        };
        setError(errorMap[result.error!] || 'Password reset failed. Please try again.');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-onyx text-warm-white font-sans px-6 relative">
        <div className="absolute inset-0 grid-background opacity-15 pointer-events-none" />
        <div className="w-full max-w-md bg-charcoal/30 border border-white/5 rounded-2xl p-8 backdrop-blur-xl shadow-premium relative z-10 space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent-pink/10 border border-accent-pink/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 text-accent-pink" />
          </div>
          <h2 className="text-xl font-black tracking-tight">Invalid Reset Link</h2>
          <p className="text-[12.5px] text-stone font-light">
            This password reset link is missing or malformed. Please request a new one.
          </p>
          <Link href="/forgot-password" className="text-accent-cyan hover:underline text-[12px] font-bold font-mono">
            Request New Reset Link →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-onyx text-warm-white font-sans px-6 relative overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-15 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-accent-cyan glow-glow pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-charcoal/30 border border-white/5 rounded-2xl p-8 backdrop-blur-xl shadow-premium relative z-10 space-y-6"
      >
        <Link href="/login" className="flex items-center gap-1.5 text-[11px] text-stone hover:text-warm-white transition-colors font-mono">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 py-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7 text-accent-emerald" />
            </div>
            <h2 className="text-xl font-black tracking-tight">Password Reset!</h2>
            <p className="text-[12.5px] text-stone font-light leading-relaxed">
              Your password has been updated successfully. All other active sessions have been logged out. Redirecting to login...
            </p>
            <div className="w-6 h-6 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin mx-auto" />
          </motion.div>
        ) : (
          <>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center mx-auto">
                <KeyRound className="w-7 h-7 text-accent-cyan" />
              </div>
              <h1 className="text-xl font-black tracking-tight mt-3">Set New Password</h1>
              <p className="text-[12.5px] text-stone font-light">
                Create a strong password for your account.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-accent-pink/10 border border-accent-pink/20 text-accent-pink text-[12px] rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-stone uppercase tracking-wider font-bold">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoFocus
                    className="w-full bg-charcoal/40 border border-white/5 rounded-xl pl-10 pr-10 py-2.5 text-[13px] text-warm-white outline-none focus:border-white/10 font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone hover:text-warm-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Strength Meter + Requirements */}
              {password.length > 0 && (
                <div className="p-3 bg-charcoal/20 border border-white/5 rounded-xl space-y-3 text-[11px] font-mono">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-stone uppercase font-bold tracking-wider">Strength:</span>
                      <span className={`text-[10px] font-bold ${strength.text}`}>{strength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-charcoal/80 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${Math.min(100, (strength.score / 6) * 100)}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1 border-t border-white/5 pt-2">
                    {requirements.map((req, idx) => {
                      const passed = req.test(password);
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          {passed ? <Check className="w-3.5 h-3.5 text-accent-emerald shrink-0" /> : <X className="w-3.5 h-3.5 text-stone/40 shrink-0" />}
                          <span className={passed ? 'text-stone' : 'text-stone/60'}>{req.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-stone uppercase tracking-wider font-bold">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-charcoal/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-warm-white outline-none focus:border-white/10 font-sans"
                  />
                </div>
                {password && confirmPassword && !passwordsMatch && (
                  <span className="text-[10px] text-accent-pink font-mono block">✕ Passwords do not match</span>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading || !allRequirementsMet || !passwordsMatch}
                className="w-full justify-center text-[12.5px] py-2.5 font-bold uppercase tracking-wider"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-onyx text-warm-white">
        <div className="w-8 h-8 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

'use client';

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/core';
import { verifyEmailAction, resendVerificationAction } from '@/lib/actions/authActions';
import Link from 'next/link';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    const fullCode = newCode.join('');
    if (fullCode.length === 6 && newCode.every(d => d !== '')) {
      handleVerify(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 0) return;

    const newCode = [...code];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pasted[i] || '';
    }
    setCode(newCode);

    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();

    if (pasted.length === 6) {
      handleVerify(pasted);
    }
  };

  const handleVerify = useCallback(async (fullCode: string) => {
    if (!emailParam) {
      setError('Email address is missing. Please register again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await verifyEmailAction(emailParam, fullCode);

      if (result.success) {
        setSuccess(true);
        // Auto-redirect to login after brief success display
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        const errorMap: Record<string, string> = {
          INVALID_CODE: 'The verification code is incorrect. Please check and try again.',
          MAX_ATTEMPTS_EXCEEDED: 'Maximum attempts exceeded. Please request a new verification code.',
          EXPIRED: 'This verification code has expired. Please request a new one.',
          USER_NOT_FOUND: 'No account found for this email address.',
          RATE_LIMIT_EXCEEDED: `Too many attempts. Please try again after ${result.timeLeft || 60} seconds.`,
        };
        setError(errorMap[result.error!] || 'Verification failed. Please try again.');
        // Clear all inputs on failure
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [emailParam, router]);

  const handleResend = async () => {
    if (resendCooldown > 0 || !emailParam) return;
    setResending(true);
    setError('');

    try {
      const result = await resendVerificationAction(emailParam);
      
      if (result.success) {
        setResendCooldown(60); // 60 second cooldown
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        if (result.error === 'COOLDOWN_ACTIVE') {
          setResendCooldown(result.timeLeft || 60);
          setError(`Please wait ${result.timeLeft || 60} seconds before requesting again.`);
        } else {
          setError('Failed to resend verification code.');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-onyx text-warm-white font-sans px-6 relative overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-15 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent-cyan glow-glow pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent-violet glow-glow pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-charcoal/30 border border-white/5 rounded-2xl p-8 backdrop-blur-xl shadow-premium relative z-10 space-y-6"
      >
        {/* Back to Login */}
        <Link href="/login" className="flex items-center gap-1.5 text-[11px] text-stone hover:text-warm-white transition-colors font-mono">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>

        {success ? (
          /* Success State */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 py-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-accent-emerald" />
            </div>
            <h2 className="text-xl font-black tracking-tight">Email Verified!</h2>
            <p className="text-[12.5px] text-stone font-light">
              Your account has been verified successfully. Redirecting to login...
            </p>
            <div className="w-6 h-6 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin mx-auto" />
          </motion.div>
        ) : (
          /* Verification Form */
          <>
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7 text-accent-cyan" />
              </div>
              <h1 className="text-xl font-black tracking-tight mt-3">Verify Your Email</h1>
              <p className="text-[12.5px] text-stone font-light leading-relaxed">
                We sent a 6-digit verification code to{' '}
                <span className="text-warm-white font-bold">{emailParam || 'your email'}</span>.
                <br />Enter the code below to activate your account.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-accent-pink/10 border border-accent-pink/20 text-accent-pink text-[12px] rounded-xl flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* 6-Digit Code Input */}
            <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading}
                  className={`
                    w-12 h-14 text-center text-xl font-bold rounded-xl border outline-none transition-all
                    bg-charcoal/40 text-warm-white font-mono
                    ${digit ? 'border-accent-cyan/40' : 'border-white/5'}
                    focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/20
                    disabled:opacity-50
                  `}
                />
              ))}
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center justify-center gap-2 text-[11px] text-stone font-mono">
                <div className="w-4 h-4 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
                <span>Verifying code...</span>
              </div>
            )}

            {/* Resend Section */}
            <div className="text-center space-y-2 pt-2 border-t border-white/5">
              <p className="text-[11px] text-stone font-mono pt-3">
                Didn&apos;t receive the code?
              </p>
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0 || resending}
                className={`
                  inline-flex items-center gap-1.5 text-[11px] font-bold font-mono transition-colors cursor-pointer
                  ${resendCooldown > 0 ? 'text-stone/40' : 'text-accent-cyan hover:underline'}
                `}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                {resendCooldown > 0
                  ? `Resend available in ${resendCooldown}s`
                  : resending
                    ? 'Sending...'
                    : 'Resend Verification Code'
                }
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-onyx text-warm-white">
        <div className="w-8 h-8 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

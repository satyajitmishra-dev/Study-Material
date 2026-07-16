'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, RefreshCw, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/core';
import { resendVerificationAction } from '@/lib/actions/authActions';
import Link from 'next/link';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

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

  const handleResend = async () => {
    if (resendCooldown > 0 || !emailParam) return;
    setResending(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await resendVerificationAction(emailParam);
      
      if (result.success) {
        setResendCooldown(60); // 60 second cooldown
        setSuccessMessage('A new verification email has been dispatched. Please check your inbox.');
      } else {
        if (result.error === 'COOLDOWN_ACTIVE') {
          setResendCooldown(result.timeLeft || 60);
          setError(`Please wait ${result.timeLeft || 60} seconds before requesting another email.`);
        } else {
          setError('Failed to resend verification email. Please try again.');
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

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center mx-auto">
            <Mail className="w-7 h-7 text-accent-cyan" />
          </div>
          <h1 className="text-xl font-black tracking-tight mt-3">Check Your Inbox</h1>
          <p className="text-[12.5px] text-stone font-light leading-relaxed">
            We sent a secure verification link to{' '}
            <span className="text-warm-white font-bold">{emailParam || 'your email'}</span>.
            <br /><br />
            Please open the email and click the verification button to activate your account.
          </p>
        </div>

        {/* Alerts Banner */}
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

        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-[12px] rounded-xl flex items-start gap-2"
          >
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </motion.div>
        )}

        {/* Resend Section */}
        <div className="text-center space-y-2 pt-2 border-t border-white/5">
          <p className="text-[11px] text-stone font-mono pt-3">
            Didn&apos;t receive the email?
          </p>
          
          <Button
            onClick={handleResend}
            variant="secondary"
            disabled={resendCooldown > 0 || resending}
            className="w-full justify-center text-[12px] py-2 flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            <span>
              {resendCooldown > 0
                ? `Resend available in ${resendCooldown}s`
                : resending
                  ? 'Sending...'
                  : 'Resend Verification Email'
              }
            </span>
          </Button>
        </div>
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

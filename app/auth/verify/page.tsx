'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/core';
import { verifyEmailTokenAction, resendVerificationAction } from '@/lib/actions/authActions';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Resend states in case of failure/expiration
  const [emailInput, setEmailInput] = useState('');
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  // Handle countdown cooldown
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

  useEffect(() => {
    if (!token) {
      setError('Verification token is missing or malformed.');
      setVerifying(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const result = await verifyEmailTokenAction(token);
        if (result.success) {
          setSuccess(true);
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          const errorMap: Record<string, string> = {
            INVALID_OR_EXPIRED_TOKEN: 'This verification link is invalid or has already been used.',
            EXPIRED: 'This verification link has expired.',
            USER_NOT_FOUND: 'No user account was found associated with this token.',
            RATE_LIMIT_EXCEEDED: 'Too many verification attempts. Please wait a few minutes and try again.',
          };
          setError(errorMap[result.error!] || 'Email verification failed. Please try again.');
        }
      } catch (err) {
        setError('A network error occurred. Please try again.');
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token, router]);

  const handleResendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.includes('@')) return;

    setResending(true);
    setResendError('');
    setResendMessage('');

    try {
      const result = await resendVerificationAction(emailInput.trim().toLowerCase());
      if (result.success) {
        setResendCooldown(60);
        setResendMessage('A new verification email has been dispatched. Please check your inbox.');
      } else {
        if (result.error === 'COOLDOWN_ACTIVE') {
          setResendCooldown(result.timeLeft || 60);
          setResendError(`Please wait ${result.timeLeft || 60} seconds before requesting another email.`);
        } else {
          setResendError('Failed to resend verification email. Please try again.');
        }
      }
    } catch (err) {
      setResendError('A network error occurred. Please try again.');
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
        <Link href="/login" className="flex items-center gap-1.5 text-[11px] text-stone hover:text-warm-white transition-colors font-mono">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>

        {verifying && (
          <div className="text-center space-y-4 py-8">
            <Loader2 className="w-10 h-10 text-accent-cyan animate-spin mx-auto" />
            <h2 className="text-lg font-bold tracking-tight">Verifying Your Email</h2>
            <p className="text-[12.5px] text-stone font-light">
              Checking token validity and activating your Creator workspace...
            </p>
          </div>
        )}

        {!verifying && success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 py-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-accent-emerald" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-warm-white">Email Verified!</h2>
            <p className="text-[12.5px] text-stone font-light">
              Your email address has been verified successfully. Redirecting you to login page...
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button variant="primary" className="w-full justify-center text-[12.5px] py-2.5 font-bold uppercase tracking-wider">
                  Continue to Login
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {!verifying && error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-accent-pink/10 border border-accent-pink/20 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7 text-accent-pink" />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-warm-white mt-3">Verification Failed</h2>
              <p className="text-[12.5px] text-stone font-light leading-relaxed">
                {error}
              </p>
            </div>

            {/* Resend utility for expired/invalid token cases */}
            <div className="border-t border-white/5 pt-4 space-y-4">
              <h3 className="text-[11.5px] font-mono text-stone uppercase tracking-wider font-bold">
                Request a new verification link
              </h3>
              
              {resendMessage && (
                <div className="p-3 bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-[12px] rounded-xl">
                  {resendMessage}
                </div>
              )}

              {resendError && (
                <div className="p-3 bg-accent-pink/10 border border-accent-pink/20 text-accent-pink text-[12px] rounded-xl">
                  {resendError}
                </div>
              )}

              <form onSubmit={handleResendSubmit} className="space-y-3">
                <input 
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your registration email"
                  className="w-full bg-charcoal/40 border border-white/5 rounded-xl px-4 py-2.5 text-[13px] text-warm-white outline-none focus:border-white/10"
                />
                
                <Button 
                  type="submit" 
                  variant="secondary"
                  disabled={resending || resendCooldown > 0 || !emailInput.includes('@')}
                  className="w-full justify-center text-[12px] py-2 flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldown > 0 
                      ? `Resend available in ${resendCooldown}s` 
                      : resending 
                        ? 'Sending Link...' 
                        : 'Send Verification Email'
                    }
                  </span>
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-onyx text-warm-white">
        <Loader2 className="w-8 h-8 text-accent-cyan animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}

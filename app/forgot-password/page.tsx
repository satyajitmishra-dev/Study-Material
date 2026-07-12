'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/core';
import { forgotPasswordAction } from '@/lib/actions/authActions';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;

    setLoading(true);
    setError('');

    try {
      const result = await forgotPasswordAction(email.toLowerCase().trim());
      
      if (result.success) {
        setSubmitted(true);
      } else {
        if (result.error === 'RATE_LIMIT_EXCEEDED') {
          setError(`Too many requests. Please try again after ${result.timeLeft || 60} seconds.`);
        } else {
          setError('Something went wrong. Please try again.');
        }
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-onyx text-warm-white font-sans px-6 relative overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-15 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-accent-amber glow-glow pointer-events-none" />

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

        {submitted ? (
          /* Success State — Same message regardless of email existence (enumeration protection) */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 py-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7 text-accent-emerald" />
            </div>
            <h2 className="text-xl font-black tracking-tight">Check Your Inbox</h2>
            <p className="text-[12.5px] text-stone font-light leading-relaxed max-w-xs mx-auto">
              If an account exists for <span className="text-warm-white font-bold">{email}</span>, 
              we&apos;ve sent password reset instructions. The link expires in 1 hour.
            </p>
            <div className="pt-2 space-y-2">
              <Link 
                href="/login" 
                className="block text-[11px] text-accent-cyan hover:underline font-bold font-mono"
              >
                Return to Login
              </Link>
              <button
                onClick={() => { setSubmitted(false); setEmail(''); }}
                className="text-[11px] text-stone hover:text-warm-white transition-colors font-mono cursor-pointer"
              >
                Try a different email
              </button>
            </div>
          </motion.div>
        ) : (
          /* Form */
          <>
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center mx-auto">
                <KeyRound className="w-7 h-7 text-accent-amber" />
              </div>
              <h1 className="text-xl font-black tracking-tight mt-3">Forgot Password</h1>
              <p className="text-[12.5px] text-stone font-light leading-relaxed">
                Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-accent-pink/10 border border-accent-pink/20 text-accent-pink text-[12px] rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-stone uppercase tracking-wider font-bold">Email address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    autoFocus
                    className="w-full bg-charcoal/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-warm-white outline-none focus:border-white/10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading || !email.includes('@')}
                className="w-full justify-center text-[12.5px] py-2.5 font-bold uppercase tracking-wider"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

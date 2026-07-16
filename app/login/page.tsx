'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Github, 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Sparkles,
  BookOpen,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/core';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [verificationRequired, setVerificationRequired] = useState(false);

  // Resend email verification states
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState('');

  // Handle countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const isSandboxEnabled = 
    process.env.NODE_ENV === 'development' || 
    process.env.NEXT_PUBLIC_ENABLE_SANDBOX === 'true';

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setErrorMessage('');
    setVerificationRequired(false);
    setResendSuccess('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/'
      });

      if (res?.error) {
        if (res.error.includes('VERIFICATION_REQUIRED') || res.code === 'VERIFICATION_REQUIRED') {
          setVerificationRequired(true);
          setErrorMessage('Your email address has not been verified yet.');
        } else if (res.error.includes('USER_DISABLED') || res.code === 'USER_DISABLED') {
          setErrorMessage('Your account has been suspended.');
        } else if (res.error.includes('RATE_LIMIT_EXCEEDED') || res.code === 'RATE_LIMIT_EXCEEDED') {
          setErrorMessage('Too many login attempts. Please wait 15 minutes.');
        } else if (res.error.includes('DISPOSABLE_EMAIL_BLOCKED') || res.code === 'DISPOSABLE_EMAIL_BLOCKED') {
          setErrorMessage('Disposable email addresses are not permitted.');
        } else {
          setErrorMessage('Invalid email or password.');
        }
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      setErrorMessage('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;
    setResending(true);
    setResendSuccess('');
    setErrorMessage('');
    
    try {
      const { resendVerificationAction } = await import('@/lib/actions/authActions');
      const res = await resendVerificationAction(email.toLowerCase().trim());
      if (res.success) {
        setResendCooldown(60);
        setResendSuccess('A new email verification link has been dispatched.');
      } else {
        setErrorMessage(res.error || 'Failed to send verification link.');
      }
    } catch (err) {
      setErrorMessage('Failed to send verification link.');
    } finally {
      setResending(false);
    }
  };

  const handleOAuthSignIn = (provider: 'google' | 'github') => {
    signIn(provider, { callbackUrl: '/' });
  };

  const isFormValid = email.includes('@') && password.length >= 6;

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-onyx text-warm-white font-sans overflow-hidden">
      
      {/* LEFT COLUMN: BRAND SHOWCASE (Desktop only) */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 bg-charcoal/10 border-r border-white/5 overflow-hidden">
        {/* Background grids */}
        <div className="absolute inset-0 grid-background opacity-20 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-accent-cyan glow-glow pointer-events-none" />
        
        {/* Top Header */}
        <div className="flex items-center gap-2 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold">
            📚
          </div>
          <span className="font-bold text-[16px] tracking-tight">StudyMaterial</span>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-8 relative z-10 my-auto">
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-accent-cyan uppercase tracking-wider font-bold">Developer OS</span>
            <h2 className="text-3xl font-black leading-tight tracking-tight">
              Engage. Learn. Build.<br />Showcase your journey.
            </h2>
          </div>

          <div className="space-y-5 text-[13px] font-light text-stone leading-relaxed">
            <div className="flex gap-3">
              <BookOpen className="w-5 h-5 text-accent-cyan shrink-0" />
              <p>**Second Brain Workspace**: Organize study lecture notes, subject semesters, and tag files in nested folders.</p>
            </div>
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-accent-pink shrink-0" />
              <p>**Verified Creator Badges**: Showcase AWS, Google, and LeetCode certifications directly to verified recruiters.</p>
            </div>
            <div className="flex gap-3">
              <Github className="w-5 h-5 text-accent-violet shrink-0" />
              <p>**Repository Integrations**: Sync project release logs and timeline metrics automatically from GitHub.</p>
            </div>
          </div>
        </div>

        {/* Quote Block */}
        <div className="border-t border-white/5 pt-6 relative z-10 text-[12px] text-stone">
          <p className="italic font-light">"StudyMaterial is the ultimate developer operating system. It completely replaced my fragmented note apps and static portfolio sites."</p>
          <span className="block font-bold text-warm-white mt-1.5">— Dan Abramov, Principal UI Architect</span>
        </div>
      </div>

      {/* RIGHT COLUMN: AUTHENTICATION FORM CARD */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute inset-0 grid-background opacity-10 pointer-events-none lg:hidden" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-accent-pink glow-glow pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-charcoal/30 border border-white/5 rounded-2xl p-8 backdrop-blur-xl shadow-premium relative z-10 space-y-6"
        >
          {verificationRequired ? (
            /* VERIFICATION REQUIRED STATE */
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center mx-auto">
                  <Mail className="w-7 h-7 text-accent-cyan" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-warm-white">Verify Your Email</h1>
                <p className="text-[13px] text-stone leading-relaxed font-light mt-1">
                  Your email address has not been verified yet. Please click below to resend the verification link.
                </p>
              </div>

              {resendSuccess && (
                <div className="p-3.5 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-[12.5px] font-mono">
                  {resendSuccess}
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-accent-pink/10 border border-accent-pink/20 text-accent-pink text-[12.5px] font-mono">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <Button
                  variant="primary"
                  onClick={handleResendVerification}
                  disabled={resending || resendCooldown > 0}
                  className="w-full justify-center text-[12.5px] py-2.5 font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : resending
                        ? 'Sending Link...'
                        : 'Resend Verification Email'
                    }
                  </span>
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => {
                    setVerificationRequired(false);
                    setErrorMessage('');
                    setResendSuccess('');
                  }}
                  className="w-full justify-center text-[12.5px] py-2.5 font-bold uppercase tracking-wider"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          ) : (
            /* ORIGINAL LOGIN FORM */
            <>
              {/* Form Header */}
              <div className="space-y-1.5 text-center lg:text-left">
                <h1 className="text-2xl font-black tracking-tight text-warm-white">Welcome back</h1>
                <p className="text-[12.5px] text-stone font-light">
                  Enter your credentials or continue using OAuth providers.
                </p>
              </div>

              {/* Inline Alert Message */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-accent-pink/10 border border-accent-pink/20 text-accent-pink text-[12px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Email / Password Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
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
                      className="w-full bg-charcoal/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-warm-white outline-none focus:border-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono text-stone uppercase tracking-wider font-bold">Password</label>
                    <Link href="/forgot-password" className="text-[10.5px] text-stone hover:text-accent-cyan hover:underline font-mono">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone absolute left-3 top-3" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
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

                {/* Remember Me */}
                <div className="flex items-center justify-between text-[11px] text-stone font-mono select-none">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-white/5 bg-charcoal/40 text-accent-cyan"
                    />
                    <span>Remember me</span>
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || !isFormValid}
                  className="w-full justify-center text-[12.5px] py-2.5 font-bold uppercase tracking-wider"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-stone text-[10px] uppercase font-mono font-bold tracking-widest">or continue with</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              {/* Social OAuth Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleOAuthSignIn('google')}
                  className="flex justify-center items-center gap-2 py-2 px-4 rounded-xl border border-white/5 hover:border-white/10 bg-charcoal/20 text-[12px] text-stone hover:text-warm-white transition-all cursor-pointer font-bold font-mono"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Google</span>
                </button>
                <button
                  onClick={() => handleOAuthSignIn('github')}
                  className="flex justify-center items-center gap-2 py-2 px-4 rounded-xl border border-white/5 hover:border-white/10 bg-charcoal/20 text-[12px] text-stone hover:text-warm-white transition-all cursor-pointer font-bold font-mono"
                >
                  <Github className="w-4 h-4 text-accent-violet" />
                  <span>GitHub</span>
                </button>
              </div>

              {/* Link to Sign Up */}
              <div className="text-center text-[12px] text-stone font-light">
                Don't have an account?{' '}
                <Link href="/signup" className="text-accent-cyan hover:underline font-bold">
                  Sign up
                </Link>
              </div>

              {/* Sandbox Toggle */}
              {isSandboxEnabled && (
                <div className="pt-4 border-t border-white/5 text-center">
                  <Link 
                    href="/login/sandbox" 
                    className="text-[10px] text-stone/50 hover:text-accent-cyan hover:underline transition-colors uppercase tracking-widest font-mono"
                  >
                    Local Sandbox Mode
                  </Link>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

    </div>
  );
}

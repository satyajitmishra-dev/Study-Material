'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Check, 
  X,
  Sparkles,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/core';
import { signUpAction } from '@/lib/actions/authActions';

export default function SignupPage() {
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Username status
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameSuggestion, setUsernameSuggestion] = useState('');

  // Password requirements checklist
  const requirements = [
    { label: 'Minimum 8 characters', test: (pw: string) => pw.length >= 8 },
    { label: 'One uppercase letter (A-Z)', test: (pw: string) => /[A-Z]/.test(pw) },
    { label: 'One lowercase letter (a-z)', test: (pw: string) => /[a-z]/.test(pw) },
    { label: 'One number (0-9)', test: (pw: string) => /[0-9]/.test(pw) },
    { label: 'One special character (@, #, $, etc.)', test: (pw: string) => /[^A-Za-z0-9]/.test(pw) }
  ];

  // Live password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: 'None', color: 'bg-stone/20' };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    if (password.length >= 12) score += 1; // Extra credit

    if (score <= 2) return { score, label: 'Weak', color: 'bg-accent-pink', text: 'text-accent-pink' };
    if (score <= 4) return { score, label: 'Fair', color: 'bg-accent-amber', text: 'text-accent-amber' };
    if (score === 5) return { score, label: 'Good', color: 'bg-accent-cyan', text: 'text-accent-cyan' };
    return { score, label: 'Strong', color: 'bg-accent-emerald', text: 'text-accent-emerald' };
  };

  const strength = getPasswordStrength();

  // Check Username availability
  useEffect(() => {
    if (!username.trim() || username.length < 3) {
      setUsernameStatus('idle');
      setUsernameSuggestion('');
      return;
    }
    setUsernameStatus('checking');

    const handler = setTimeout(() => {
      // Simulate/mock API check or check username structure
      const reservedUsernames = ['admin', 'api', 'support', 'login', 'root', 'studymaterial'];
      const isTaken = reservedUsernames.includes(username.toLowerCase()) || username.toLowerCase() === 'test';
      
      if (isTaken) {
        setUsernameStatus('taken');
        setUsernameSuggestion(`${username.toLowerCase()}_dev_${Math.floor(Math.random() * 90) + 10}`);
      } else {
        setUsernameStatus('available');
        setUsernameSuggestion('');
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [username]);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setFieldErrors({});

    if (!fullName.trim()) return;
    if (usernameStatus !== 'available') return;
    if (password !== confirmPassword) return;
    if (!acceptTerms) return;

    setLoading(true);

    try {
      const result = await signUpAction({
        fullName,
        username,
        email,
        password
      });

      if (result.success) {
        // Redirect to Email Verification Page
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        if (result.error === 'RATE_LIMIT_EXCEEDED') {
          setErrorMessage(`Too many requests. Please try again after ${result.timeLeft} seconds.`);
        } else if (result.error === 'EMAIL_TAKEN') {
          setFieldErrors({ email: 'This email is already registered.' });
        } else if (result.error === 'USERNAME_TAKEN') {
          setFieldErrors({ username: 'This username is already taken.' });
        } else if (result.error === 'VALIDATION_FAILED' && result.details) {
          // Parse Zod error details
          const fieldMap: Record<string, string> = {};
          Object.entries(result.details.fieldErrors).forEach(([field, messages]: any) => {
            fieldMap[field] = messages[0];
          });
          setFieldErrors(fieldMap);
        } else {
          setErrorMessage(result.error || 'Failed to complete registration.');
        }
      }
    } catch (err: any) {
      setErrorMessage('An unexpected system error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    const pwValid = requirements.every(req => req.test(password));
    const matchValid = password === confirmPassword;
    const userValid = usernameStatus === 'available';
    return fullName.trim() && userValid && email.includes('@') && pwValid && matchValid && acceptTerms;
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-onyx text-warm-white font-sans overflow-hidden">
      
      {/* LEFT COLUMN: BRAND SHOWCASE */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 bg-charcoal/10 border-r border-white/5 overflow-hidden">
        <div className="absolute inset-0 grid-background opacity-20 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-accent-violet glow-glow pointer-events-none" />
        
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
            <span className="text-[10px] font-mono text-accent-violet uppercase tracking-wider font-bold">Secure Gateway</span>
            <h2 className="text-3xl font-black leading-tight tracking-tight">
              Create your secure<br />developer account.
            </h2>
          </div>

          <div className="space-y-5 text-[13px] font-light text-stone leading-relaxed">
            <div className="flex gap-3">
              <BookOpen className="w-5 h-5 text-accent-violet shrink-0" />
              <p>**Publish Technical Material**: Distribute course logs, code notes, event sheets, and slides securely.</p>
            </div>
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-accent-pink shrink-0" />
              <p>**Manage Active Devices**: Track and revoke user sessions from multiple devices instantly.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 pt-6 relative z-10 text-[11px] text-stone/50 font-mono">
          StudyMaterial Identity Service v4.2
        </div>
      </div>

      {/* RIGHT COLUMN: SIGNUP CARD */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto max-h-screen">
        <div className="absolute inset-0 grid-background opacity-10 pointer-events-none lg:hidden" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-accent-cyan glow-glow pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-charcoal/30 border border-white/5 rounded-2xl p-8 backdrop-blur-xl shadow-premium relative z-10 space-y-6 my-8"
        >
          {/* Header */}
          <div className="space-y-1.5 text-center lg:text-left">
            <h1 className="text-2xl font-black tracking-tight text-warm-white">Register Creator Account</h1>
            <p className="text-[12.5px] text-stone font-light">Join the Developer OS. Setup credentials to verify.</p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-accent-pink/10 border border-accent-pink/20 text-accent-pink text-[12px] rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-stone uppercase tracking-wider font-bold">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-stone absolute left-3 top-3" />
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Satyajit Mishra"
                  className="w-full bg-charcoal/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-warm-white outline-none focus:border-white/10"
                />
              </div>
              {fieldErrors.fullName && <p className="text-[10px] text-accent-pink font-mono">{fieldErrors.fullName}</p>}
            </div>

            {/* Username Check */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono text-stone uppercase tracking-wider font-bold">Username</label>
                {usernameStatus === 'checking' && <span className="text-[10px] text-stone font-mono">Checking...</span>}
                {usernameStatus === 'available' && <span className="text-[10px] text-accent-emerald font-mono">✓ Available</span>}
                {usernameStatus === 'taken' && <span className="text-[10px] text-accent-pink font-mono">✕ Taken</span>}
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-stone absolute left-3 top-3" />
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_\.]/g, ''))}
                  placeholder="developer_handle"
                  className="w-full bg-charcoal/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-warm-white outline-none focus:border-white/10"
                />
              </div>
              {fieldErrors.username && <p className="text-[10px] text-accent-pink font-mono">{fieldErrors.username}</p>}
              {usernameStatus === 'taken' && usernameSuggestion && (
                <button
                  type="button"
                  onClick={() => setUsername(usernameSuggestion)}
                  className="text-[11px] text-accent-cyan hover:underline text-left block"
                >
                  Try suggestion: <span className="font-bold">{usernameSuggestion}</span>
                </button>
              )}
            </div>

            {/* Email */}
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
              {fieldErrors.email && <p className="text-[10px] text-accent-pink font-mono">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-stone uppercase tracking-wider font-bold">Password</label>
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
              {fieldErrors.password && <p className="text-[10px] text-accent-pink font-mono">{fieldErrors.password}</p>}
            </div>

            {/* Live Password Checklist & Strength Meter */}
            {password.length > 0 && (
              <div className="p-3 bg-charcoal/20 border border-white/5 rounded-xl space-y-3 text-[11px] font-mono">
                {/* Visual Strength Meter */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-stone uppercase font-bold tracking-wider">Password Strength:</span>
                    <span className={`text-[10px] font-bold ${strength.text}`}>{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-charcoal/80 rounded-full overflow-hidden flex gap-0.5">
                    <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${Math.min(100, (strength.score / 6) * 100)}%` }} />
                  </div>
                </div>

                <div className="space-y-1 border-t border-white/5 pt-2">
                  {requirements.map((req, idx) => {
                    const passed = req.test(password);
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        {passed ? (
                          <Check className="w-3.5 h-3.5 text-accent-emerald shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-stone/40 shrink-0" />
                        )}
                        <span className={passed ? 'text-stone' : 'text-stone/60'}>{req.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-stone uppercase tracking-wider font-bold">Confirm Password</label>
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
              {password && confirmPassword && password !== confirmPassword && (
                <span className="text-[10px] text-accent-pink font-mono block">✕ Passwords do not match</span>
              )}
            </div>

            {/* Accept Terms */}
            <div className="flex items-center gap-2 text-[11px] text-stone font-mono select-none py-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  required
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="rounded border-white/5 bg-charcoal/40 text-accent-cyan"
                />
                <span>I accept the Terms and Privacy Agreement</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading || !isFormValid()}
              className="w-full justify-center text-[12.5px] py-2.5 font-bold uppercase tracking-wider"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>

          {/* Social OAuth Buttons */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-stone text-[9.5px] uppercase font-mono font-bold tracking-widest">or register using</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => signIn('google')}
              className="flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl border border-white/5 hover:border-white/10 bg-charcoal/20 text-[12px] text-stone hover:text-warm-white transition-all cursor-pointer font-bold font-mono"
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
              onClick={() => signIn('github')}
              className="flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl border border-white/5 hover:border-white/10 bg-charcoal/20 text-[12px] text-stone hover:text-warm-white transition-all cursor-pointer font-bold font-mono"
            >
              <Github className="w-4 h-4 text-accent-violet" />
              <span>GitHub</span>
            </button>
          </div>

          {/* Link to Log In */}
          <div className="text-center text-[12px] text-stone font-light pt-2">
            Already have an account?{' '}
            <Link href="/login" className="text-accent-cyan hover:underline font-bold">
              Log in
            </Link>
          </div>
        </motion.div>
      </div>

    </div>
  );
}

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Home, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/core';

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reason = searchParams ? (searchParams.get('reason') || searchParams.get('error') || 'unknown') : 'unknown';

  let title = 'Access Denied';
  let desc = 'You do not have permission to view this workspace. Please contact your administrator if you believe this is an error.';
  let showLoginButton = true;
  let showHomeButton = true;

  if (reason === 'admin-only') {
    title = 'Admin Workspace Locked';
    desc = 'This area is restricted to administrators. Sign in with an authorized email to access the Publishing Studio.';
  } else if (reason === 'disabled') {
    title = 'Account Disabled';
    desc = 'Your StudyMaterial profile has been disabled by an administrator. Please contact developer support to restore access.';
    showLoginButton = false;
  } else if (reason === 'expired' || reason === 'SessionRequired') {
    title = 'Session Expired';
    desc = 'Your security session has expired. Log in again to restore access to your master workspace.';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 w-full max-w-md flex flex-col items-center text-center space-y-6 bg-charcoal/25 border border-white/5 p-8 rounded-2xl backdrop-blur-xl shadow-premium"
    >
      {/* Premium Illustration / Icon */}
      <div className="relative w-16 h-16 rounded-full bg-accent-pink/10 border border-accent-pink/20 flex items-center justify-center shadow-lg">
        <ShieldAlert className="w-8 h-8 text-accent-pink" />
        <div className="absolute inset-0 rounded-full bg-accent-pink/5 animate-pulse blur" />
      </div>

      {/* Info */}
      <div className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight text-warm-white">
          {title}
        </h1>
        <p className="text-[12px] text-stone leading-relaxed max-w-xs mx-auto">
          {desc}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-4">
        {showHomeButton && (
          <Button 
            variant="secondary" 
            onClick={() => router.push('/')}
            className="w-full justify-center"
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>Return Home</span>
          </Button>
        )}
        {showLoginButton && (
          <Button 
            variant="primary" 
            onClick={() => router.push('/login')}
            className="w-full justify-center"
          >
            <LogIn className="w-4 h-4 shrink-0" />
            <span>Log In</span>
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 bg-onyx text-warm-white">
      {/* Background patterns */}
      <div className="absolute inset-0 grid-background opacity-20 pointer-events-none" />
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* Decorative ambient spots */}
      <div className="absolute -top-[15%] -left-[10%] w-[45%] h-[45%] rounded-full bg-accent-pink glow-glow" />
      <div className="absolute -bottom-[15%] -right-[10%] w-[45%] h-[45%] rounded-full bg-accent-amber glow-glow" />

      <Suspense fallback={
        <div className="text-stone text-[12px] animate-pulse">
          Loading credentials...
        </div>
      }>
        <UnauthorizedContent />
      </Suspense>
    </div>
  );
}

'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Chrome, Shield } from 'lucide-react';
import { Button } from '@/components/ui/core';

export default function LoginPage() {
  const isSandboxEnabled = 
    process.env.NODE_ENV === 'development' || 
    process.env.NEXT_PUBLIC_ENABLE_SANDBOX === 'true';

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 overflow-hidden bg-onyx text-warm-white">
      {/* Background patterns */}
      <div className="absolute inset-0 grid-background opacity-20 pointer-events-none" />
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* Decorative ambient spots */}
      <div className="absolute -top-[15%] -left-[10%] w-[45%] h-[45%] rounded-full bg-accent-violet glow-glow" />
      <div className="absolute -bottom-[15%] -right-[10%] w-[45%] h-[45%] rounded-full bg-accent-cyan glow-glow" />

      {/* Main Glass Panel Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm flex flex-col items-center text-center space-y-8 bg-charcoal/25 border border-white/5 p-8 rounded-2xl backdrop-blur-xl shadow-premium"
      >
        {/* Logo Icon */}
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-sm select-none">
          <span className="text-2xl">📚</span>
        </div>

        {/* Header Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-warm-white">
            StudyMaterial
          </h1>
          <p className="text-[12px] text-stone max-w-xs leading-relaxed">
            The Future of Learning for Developers. Log in to access your master workspace, projects, and active course paths.
          </p>
        </div>

        {/* Continue with Google button */}
        <div className="w-full">
          <Button
            variant="primary"
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 flex items-center justify-center gap-3 font-semibold tracking-wide cursor-pointer magnetic-item"
          >
            <Chrome className="w-4 h-4 fill-current shrink-0" />
            <span>Continue with Google</span>
          </Button>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-1.5 justify-center text-[10px] text-stone">
          <Shield className="w-3.5 h-3.5" />
          <span>By continuing, you accept the Privacy Notice.</span>
        </div>

        {/* Dev Sandbox Anchor (Only rendered in development mode) */}
        {isSandboxEnabled && (
          <div className="pt-4 border-t border-white/5 w-full">
            <Link 
              href="/login/sandbox" 
              className="text-[10px] text-stone/50 hover:text-accent-cyan hover:underline transition-colors uppercase tracking-widest font-mono"
            >
              Local Sandbox Mode
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}

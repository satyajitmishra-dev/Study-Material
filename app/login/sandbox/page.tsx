'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Terminal, ShieldAlert, Sparkles } from 'lucide-react';
import { Button, Card } from '@/components/ui/core';

export default function DevSandboxPage() {
  const router = useRouter();
  
  const isSandboxEnabled = 
    process.env.NODE_ENV === 'development' || 
    process.env.NEXT_PUBLIC_ENABLE_SANDBOX === 'true';

  if (!isSandboxEnabled) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  const handleSandboxLogin = (email: string) => {
    signIn('sandbox', { email, callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 bg-onyx text-warm-white">
      {/* Background patterns */}
      <div className="absolute inset-0 grid-background opacity-20 pointer-events-none" />
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 w-full max-w-md flex flex-col space-y-6 bg-charcoal/20 border border-white/5 p-8 rounded-2xl backdrop-blur-xl shadow-premium"
      >
        {/* Back navigation */}
        <div className="flex items-center gap-2 text-[11px] text-stone">
          <Button variant="ghost" onClick={() => router.push('/login')} className="h-6 px-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
          </Button>
          <span>Back to Secure Login</span>
        </div>

        {/* Warning Indicator */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-accent-amber/5 border border-accent-amber/15 text-[11px] text-stone leading-relaxed">
          <ShieldAlert className="w-5 h-5 text-accent-amber shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-warm-white">Dev Environment Access Only.</span> This page allows developers to bypass OAuth redirects for sandbox visual checks and middleware role testing.
          </div>
        </div>

        {/* Select Profile */}
        <div className="space-y-4">
          <h2 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-stone" />
            <span>Select Sandbox Profile</span>
          </h2>
          
          <div className="grid grid-cols-1 gap-3">
            {/* Admin Profile */}
            <Card 
              glowColor="cyan"
              onClick={() => handleSandboxLogin('admin@gmail.com')}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-charcoal/40 group"
            >
              <div className="space-y-0.5">
                <h4 className="text-[13px] font-bold text-warm-white group-hover:text-accent-cyan transition-colors">Admin Workspace</h4>
                <p className="text-[11px] text-stone">admin@gmail.com</p>
              </div>
              <Sparkles className="w-4 h-4 text-accent-cyan" />
            </Card>

            {/* Standard User Profile */}
            <Card 
              glowColor="violet"
              onClick={() => handleSandboxLogin('developer@gmail.com')}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-charcoal/40 group"
            >
              <div className="space-y-0.5">
                <h4 className="text-[13px] font-bold text-warm-white group-hover:text-accent-violet transition-colors">Developer Workspace</h4>
                <p className="text-[11px] text-stone">developer@gmail.com</p>
              </div>
              <Terminal className="w-4 h-4 text-stone" />
            </Card>
          </div>
        </div>

      </motion.div>
    </div>
  );
}

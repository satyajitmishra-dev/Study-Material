'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProfileSetupWizard from '@/components/public/ProfileSetupWizard';
import { fetchMyProfileSettingsAction } from '@/lib/actions/profileActions';
import { RefreshCw, LayoutGrid } from 'lucide-react';
import Link from 'next/link';

export default function ProfileSetupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [initialUser, setInitialUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchMyProfileSettingsAction().then(res => {
        if (res.success && res.user) {
          setInitialUser(res.user);
        }
        setLoading(false);
      });
    }
  }, [status, router]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-accent-cyan animate-spin" />
        <span className="text-[12px] font-mono text-stone">Initializing profile context...</span>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Decorative background grids */}
      <div className="absolute inset-0 top-0 left-0 -z-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-charcoal/10 via-onyx to-onyx opacity-90 h-[500px]" />
      
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="flex items-center gap-1.5 text-[11px] font-mono text-stone hover:text-warm-white transition-colors">
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
        <span className="text-stone/40 text-[10px] font-mono">/</span>
        <span className="text-[11px] font-mono text-accent-cyan font-medium">Profile Wizard Setup</span>
      </div>

      <ProfileSetupWizard
        initialUser={initialUser}
        onFinish={() => {
          // Redirect to their dynamic developer page on complete!
          const userSlug = initialUser?.username || 'satyajit';
          router.push(`/u/${userSlug}`);
        }}
      />
    </main>
  );
}

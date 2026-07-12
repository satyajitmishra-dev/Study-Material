'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import FloatingDock from './FloatingDock';
import CommandPalette from './CommandPalette';
import UserDropdown from './UserDropdown';
import CreateMenuDialog from './ui/CreateMenuDialog';
import { Button } from '@/components/ui/core';

interface ClientShellProps {
  children: React.ReactNode;
}

export default function ClientShell({ children }: ClientShellProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const pathname = usePathname();

  const router = useRouter();
  
  const { data: session, status } = useSession();

  // Setup global Ctrl + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isAuthPage = 
    pathname === '/login' || 
    pathname === '/login/sandbox' || 
    pathname?.startsWith('/unauthorized');

  const isAdminPage = pathname?.startsWith('/admin');

  if (isAuthPage) {
    return (
      <div className="relative min-h-screen bg-onyx text-warm-white selection:bg-white/20">
        {children}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-onyx text-warm-white selection:bg-white/20">
      {/* Background patterns */}
      <div className="fixed inset-0 grid-background z-0 pointer-events-none" />
      <div className="fixed inset-0 noise-overlay z-0 pointer-events-none" />

      {/* Decorative ambient spots */}
      <div className="fixed -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-accent-violet glow-glow" />
      <div className="fixed -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-accent-cyan glow-glow" />

      {/* Top Header Bar (Hidden on Admin pages) */}
      {!isAdminPage && (
        <header className="relative z-20 w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between border-b border-white/5">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-[16px] font-bold text-warm-white tracking-tight group-hover:text-accent-cyan transition-colors">
              StudyMaterial
            </span>
            <span className="text-[9px] font-mono border border-white/10 px-1 rounded-sm text-stone uppercase tracking-wider scale-90">
              Beta
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
            ) : session?.user ? (
              <UserDropdown sessionUser={session.user as any} />
            ) : (
              <Button 
                variant="secondary" 
                onClick={() => router.push('/login')} 
                className="py-1 px-3 text-[11px]"
              >
                Sign In
              </Button>
            )}
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={`relative flex-1 z-10 ${isAdminPage ? 'p-4' : 'max-w-6xl w-full mx-auto pb-28'}`}>
        {children}
      </main>

      {/* Spatial Overlay Components (Dock hidden on Admin pages to avoid clutter) */}
      {!isAdminPage && (
        <FloatingDock 
          onSearchClick={() => setIsSearchOpen(true)} 
          onCreateClick={() => setIsCreateOpen(true)} 
        />
      )}
      
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CreateMenuDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}

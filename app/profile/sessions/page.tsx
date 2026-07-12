'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  Monitor, Smartphone, Tablet, Globe, Clock, Shield, 
  Trash2, AlertTriangle, ArrowLeft, CheckCircle, Laptop
} from 'lucide-react';
import { Button, Card } from '@/components/ui/core';
import { getActiveSessionsAction, revokeSessionAction, revokeAllSessionsAction } from '@/lib/actions/authActions';
import Link from 'next/link';

type SessionRecord = {
  id: string;
  sessionToken: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  deviceType?: string | null;
  browser?: string | null;
  os?: string | null;
  location?: string | null;
  lastActiveAt: string | Date;
  createdAt: string | Date;
};

export default function SessionManagerPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile/sessions');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadSessions();
    }
  }, [status]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const result = await getActiveSessionsAction();
      if (result.success && result.sessions) {
        setSessions(result.sessions as SessionRecord[]);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      const result = await revokeSessionAction(sessionId);
      if (result.success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        setSuccessMessage('Session revoked successfully.');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to revoke session:', err);
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAll = async () => {
    setRevokingAll(true);
    try {
      const result = await revokeAllSessionsAction();
      if (result.success) {
        await loadSessions();
        setSuccessMessage('All other sessions have been revoked.');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to revoke all:', err);
    } finally {
      setRevokingAll(false);
    }
  };

  const getDeviceIcon = (deviceType?: string | null) => {
    if (deviceType === 'Mobile') return <Smartphone className="w-5 h-5" />;
    if (deviceType === 'Tablet') return <Tablet className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const currentSessionToken = (session as any)?.sessionToken;

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-onyx text-warm-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
          <span className="text-[12px] font-mono text-stone">Loading session data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-onyx text-warm-white font-sans">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link href="/profile" className="flex items-center gap-1.5 text-[11px] text-stone hover:text-warm-white transition-colors font-mono">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Profile</span>
          </Link>

          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <Shield className="w-6 h-6 text-accent-cyan" />
                Active Sessions
              </h1>
              <p className="text-[12.5px] text-stone font-light">
                Review and manage devices that are currently signed in to your account.
              </p>
            </div>

            {sessions.length > 1 && (
              <Button
                variant="ghost"
                onClick={handleRevokeAll}
                disabled={revokingAll}
                className="text-[11px] text-accent-pink hover:text-accent-pink font-mono shrink-0"
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                {revokingAll ? 'Revoking...' : 'Log Out All Other Devices'}
              </Button>
            )}
          </div>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-[12px] rounded-xl flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </motion.div>
        )}

        {/* Sessions List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-charcoal/20 border border-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16 text-stone text-[13px] font-light">
            <Laptop className="w-10 h-10 mx-auto mb-3 text-stone/30" />
            <p>No active sessions found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => {
              const isCurrent = s.sessionToken === currentSessionToken;
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`
                    p-4 rounded-xl border backdrop-blur-sm transition-colors
                    ${isCurrent 
                      ? 'bg-accent-cyan/5 border-accent-cyan/20' 
                      : 'bg-charcoal/20 border-white/5 hover:border-white/10'
                    }
                  `}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCurrent ? 'bg-accent-cyan/10 text-accent-cyan' : 'bg-white/5 text-stone'}`}>
                        {getDeviceIcon(s.deviceType)}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold text-warm-white">
                            {s.browser || 'Browser'} on {s.os || 'Unknown OS'}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-accent-cyan bg-accent-cyan/10 px-1.5 py-0.5 rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-stone font-mono">
                          {s.ipAddress && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {s.ipAddress}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(s.lastActiveAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isCurrent && (
                      <Button
                        variant="ghost"
                        onClick={() => handleRevoke(s.id)}
                        disabled={revoking === s.id}
                        className="text-[11px] text-accent-pink hover:text-accent-pink font-mono shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        {revoking === s.id ? 'Revoking...' : 'Revoke'}
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Security Notice */}
        <div className="p-4 bg-charcoal/10 border border-white/5 rounded-xl text-[11px] text-stone font-mono space-y-1">
          <p className="font-bold text-warm-white">🔒 Security Notice</p>
          <p>If you see a session you don&apos;t recognize, revoke it immediately and change your password.</p>
        </div>
      </div>
    </div>
  );
}

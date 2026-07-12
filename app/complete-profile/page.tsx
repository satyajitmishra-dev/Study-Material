'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/core';

export default function CompleteProfilePage() {
  const [bio, setBio] = useState('');
  const [github, setGithub] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setCompleted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 bg-onyx text-warm-white font-sans">
      <div className="absolute inset-0 grid-background opacity-20 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-charcoal/30 border border-white/5 p-8 rounded-2xl backdrop-blur-xl shadow-premium space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-warm-white">Complete Profile</h1>
          <p className="text-[12px] text-stone font-light leading-relaxed">
            Setup optional social metadata parameters to complete onboarding.
          </p>
        </div>

        {completed ? (
          <div className="text-center space-y-4 pt-2">
            <CheckCircle className="w-12 h-12 text-accent-emerald mx-auto" />
            <div className="space-y-1">
              <span className="text-[13px] font-bold text-warm-white block">Profile Completed!</span>
              <p className="text-[11.5px] text-stone">Welcome to the StudyMaterial Developer OS ecosystem.</p>
            </div>
            <Link href="/" className="block pt-2">
              <Button variant="primary" className="w-full justify-center text-[12px]">Go to Dashboard</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-stone uppercase tracking-wider font-bold">Developer Bio</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="I build high-fidelity compilers and designs..."
                rows={3}
                className="w-full bg-charcoal/40 border border-white/5 rounded-xl px-3 py-2 text-[13px] text-warm-white outline-none focus:border-white/10"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-stone uppercase tracking-wider font-bold">GitHub Profile Link</label>
              <input 
                type="url" 
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full bg-charcoal/40 border border-white/5 rounded-xl px-3 py-2.5 text-[13px] text-warm-white outline-none focus:border-white/10"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-stone uppercase tracking-wider font-bold">Portfolio Link</label>
              <input 
                type="url" 
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                placeholder="https://domain.com"
                className="w-full bg-charcoal/40 border border-white/5 rounded-xl px-3 py-2.5 text-[13px] text-warm-white outline-none focus:border-white/10"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full justify-center text-[12.5px] py-2.5 font-bold uppercase tracking-wider"
            >
              {loading ? 'Completing...' : 'Finish Setup'}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

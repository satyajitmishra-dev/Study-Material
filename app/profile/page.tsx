'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Clock, 
  CheckCircle, 
  Bookmark, 
  MessageSquare, 
  Highlighter, 
  FileText, 
  TrendingUp, 
  Calendar,
  Share2,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui/core';

export default function ProfileDashboardPage() {
  const [visitorId, setVisitorId] = useState('');
  
  // User Stats
  const [streak, setStreak] = useState(3);
  const [timeSpent, setTimeSpent] = useState(145); // minutes
  const [completedCount, setCompletedCount] = useState(4);
  
  // User Lists
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [userNotes, setUserNotes] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<any[]>([]);

  useEffect(() => {
    let vid = localStorage.getItem('sm_visitor_id');
    if (!vid) {
      vid = `vis_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
      localStorage.setItem('sm_visitor_id', vid);
    }
    setVisitorId(vid);

    // Mock load profile information (in sandbox, retrieve published projects)
    fetch('/api/v1/posts?limit=5')
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setRecentHistory(res.data.slice(0, 3));
          setLikedPosts(res.data.slice(0, 1));
        }
      });
      
    // Seed mock notes
    setUserNotes([
      {
        id: 'note_1',
        postTitle: 'Introducing Partial Prerendering',
        postSlug: 'introducing-partial-prerendering',
        highlightText: 'Partial Prerendering (PPR) is a layout-first prerendering model...',
        noteContent: 'Crucial for dynamic dashboard widgets in Next.js 16. Implement <Suspense> boundaries carefully.',
        updatedAt: new Date()
      }
    ]);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 space-y-10">
      
      {/* Profile Header */}
      <div className="border-b border-white/5 pb-6">
        <span className="text-[11px] font-semibold text-accent-cyan tracking-[0.2em] uppercase font-mono">Personal Dashboard</span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-warm-white mt-1">Reader Profile</h1>
        <p className="text-[13px] text-stone font-light mt-1">
          Monitor your reading goals, streaks, custom highlights, and activity log.
        </p>
      </div>

      {/* Streak & Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card glowColor="violet" className="flex items-center gap-5 p-5 relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-accent-pink/15 border border-accent-pink/20 flex items-center justify-center text-accent-pink shadow-[0_0_15px_rgba(236,72,153,0.2)]">
            <Flame className="w-6 h-6 fill-current animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-stone uppercase tracking-wider font-mono font-bold block">Reading Streak</span>
            <span className="text-2xl font-bold text-warm-white font-mono mt-0.5">{streak} Days Active</span>
          </div>
        </Card>

        <Card className="flex items-center gap-5 p-5">
          <div className="w-12 h-12 rounded-xl bg-accent-cyan/15 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-stone uppercase tracking-wider font-mono font-bold block">Time Spent Reading</span>
            <span className="text-2xl font-bold text-warm-white font-mono mt-0.5">{timeSpent} Minutes</span>
          </div>
        </Card>

        <Card className="flex items-center gap-5 p-5">
          <div className="w-12 h-12 rounded-xl bg-accent-emerald/15 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-stone uppercase tracking-wider font-mono font-bold block">Articles Completed</span>
            <span className="text-2xl font-bold text-warm-white font-mono mt-0.5">{completedCount} Completed</span>
          </div>
        </Card>
      </div>

      {/* History, Notes, Likes sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Kindle Highlights & Notes */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold tracking-tight text-warm-white flex items-center gap-2">
            <Highlighter className="w-5 h-5 text-accent-cyan" />
            <span>Highlights & Private Notes</span>
          </h3>

          <div className="space-y-4">
            {userNotes.map((note) => (
              <div key={note.id} className="p-4 rounded-xl bg-charcoal/10 border border-white/5 space-y-3 relative overflow-hidden">
                <div className="border-l-4 border-yellow-400 pl-3">
                  <p className="text-[11px] italic text-stone/80 line-clamp-2">
                    "{note.highlightText}"
                  </p>
                </div>
                <div className="p-3 bg-charcoal/20 border border-white/5 rounded-lg text-[12px] text-stone leading-relaxed font-light">
                  <span className="font-bold text-warm-white block text-[10px] font-mono uppercase tracking-wider mb-1">Annotation</span>
                  {note.noteContent}
                </div>
                <div className="flex justify-between items-center text-[10px] text-stone font-mono pt-1">
                  <Link href={`/posts/${note.postSlug}`} className="hover:text-warm-white flex items-center gap-0.5">
                    <span>Source: {note.postTitle}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}

            {userNotes.length === 0 && (
              <div className="py-12 border border-dashed border-white/5 rounded-xl text-center text-[11px] text-stone">
                No highlights or annotations saved.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Reading history & Reactions */}
        <div className="space-y-8">
          {/* History */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold tracking-tight text-warm-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-stone" />
              <span>Recently Read</span>
            </h3>

            <div className="space-y-3 bg-charcoal/10 border border-white/5 rounded-2xl p-3">
              {recentHistory.map((post) => (
                <div key={post.id} className="p-2.5 rounded-lg hover:bg-white/5 flex items-center justify-between text-[12px]">
                  <div className="truncate">
                    <span className="text-[9px] font-mono text-accent-cyan uppercase block">{post.categoryRef?.name}</span>
                    <span className="font-bold text-warm-white truncate hover:underline block">
                      <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                    </span>
                  </div>
                  <Link href={`/posts/${post.slug}`} className="text-stone hover:text-warm-white font-mono text-[10px]">
                    Read →
                  </Link>
                </div>
              ))}

              {recentHistory.length === 0 && (
                <div className="text-center py-6 text-[11px] text-stone">
                  Reading stream empty.
                </div>
              )}
            </div>
          </div>

          {/* Reactions */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold tracking-tight text-warm-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent-amber" />
              <span>Reacted Guides</span>
            </h3>

            <div className="space-y-3 bg-charcoal/10 border border-white/5 rounded-2xl p-3">
              {likedPosts.map((post) => (
                <div key={post.id} className="p-2.5 rounded-lg hover:bg-white/5 flex items-center justify-between text-[12px]">
                  <div className="truncate">
                    <span className="font-bold text-warm-white truncate hover:underline block">
                      <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                    </span>
                  </div>
                  <span className="text-[10px] text-accent-amber font-mono font-bold uppercase tracking-wider">
                    👍 reacted
                  </span>
                </div>
              ))}

              {likedPosts.length === 0 && (
                <div className="text-center py-6 text-[11px] text-stone">
                  No liked articles.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

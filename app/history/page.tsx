'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Trash2, ArrowRight, BookOpen, Layers } from 'lucide-react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui/core';

export default function ReadingHistoryPage() {
  const [historyList, setHistoryList] = useState<any[]>([]);

  useEffect(() => {
    // Retrieve sample published posts as reading history
    fetch('/api/v1/posts?limit=5')
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setHistoryList(res.data.map((p: any) => ({
            ...p,
            progress: 85, // Mock scroll progress
            lastViewedAt: new Date(Date.now() - 3600000 * 2)
          })));
        }
      });
  }, []);

  const handleClearHistory = () => {
    setHistoryList([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <span className="text-[11px] font-semibold text-accent-cyan tracking-[0.2em] uppercase font-mono">Reader Stream</span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-warm-white mt-1">Reading History</h1>
          <p className="text-[13px] text-stone font-light mt-1">
            Browse through articles you have read in this browser.
          </p>
        </div>

        {historyList.length > 0 && (
          <Button variant="secondary" onClick={handleClearHistory} className="text-[12px] text-accent-pink hover:bg-accent-pink/5">
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </Button>
        )}
      </div>

      {/* History timeline list */}
      <div className="space-y-6">
        {historyList.map((post) => (
          <Card key={post.id} className="p-5 hover:border-white/10 group flex flex-col md:flex-row gap-6 relative overflow-hidden">
            {post.coverImage && (
              <div className="w-full md:w-36 aspect-[16/10] rounded-xl overflow-hidden border border-white/5 shrink-0">
                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="flex-1 flex flex-col justify-between space-y-3 w-full">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-stone">
                  <span className="text-accent-cyan uppercase font-semibold">{post.categoryRef?.name || 'React'}</span>
                  <span>Viewed {new Date(post.lastViewedAt).toLocaleTimeString()}</span>
                </div>
                <h3 className="text-[15px] font-bold text-warm-white group-hover:text-accent-cyan transition-colors leading-snug">
                  <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                </h3>
                
                {/* Scroll depth progress indicator */}
                <div className="space-y-1 pt-1 max-w-xs">
                  <div className="flex items-center justify-between text-[9px] text-stone font-mono">
                    <span>Progress</span>
                    <span>{post.progress}% read</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-cyan" style={{ width: `${post.progress}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px] text-stone font-mono">
                <span>By @{post.author.name}</span>
                <Link href={`/posts/${post.slug}`} className="text-stone hover:text-warm-white flex items-center gap-0.5">
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </Card>
        ))}

        {historyList.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl">
            <Clock className="w-12 h-12 text-stone/40 animate-pulse" />
            <h4 className="text-[13px] font-bold text-warm-white mt-3">Reading stream empty</h4>
            <p className="text-[11px] text-stone mt-1">Go read articles in the catalog directory.</p>
          </div>
        )}
      </div>
    </div>
  );
}

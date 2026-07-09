'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CornerDownLeft, Sparkles, FolderDot, History, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { publicDb } from '@/lib/database/publicDb';
import { Card } from '@/components/ui/core';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  
  // Keyboard Selection Index
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Search History
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const popularSearches = ['Next.js 16', 'PPR', 'Framer Motion', 'Prisma Schema', 'Tailwind v4'];

  useEffect(() => {
    // Load recent searches
    const history = localStorage.getItem('sm_search_history');
    if (history) {
      setRecentSearches(JSON.parse(history));
    }

    // Load initial published posts list
    publicDb.getPublicPosts({ limit: 100 }).then(res => {
      setAllPosts(res.items);
    });
  }, []);

  // Debouncing query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);
    return () => clearTimeout(handler);
  }, [query]);

  // Execute Search Match
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const q = debouncedQuery.toLowerCase();
    
    // Scan title, description, content
    const matches = allPosts.filter(post => 
      post.title.toLowerCase().includes(q) ||
      post.description?.toLowerCase().includes(q) ||
      post.content.toLowerCase().includes(q)
    );

    setResults(matches);
    setSelectedIndex(-1);
    setLoading(false);
  }, [debouncedQuery, allPosts]);

  // Keyboard navigation listeners
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        e.preventDefault();
        // Save search history
        saveQueryToHistory(query);
        // Navigate
        window.location.href = `/posts/${results[selectedIndex].slug}`;
      }
    }
  };

  const saveQueryToHistory = (term: string) => {
    if (!term.trim()) return;
    const history = [term, ...recentSearches.filter(t => t !== term)].slice(0, 5);
    setRecentSearches(history);
    localStorage.setItem('sm_search_history', JSON.stringify(history));
  };

  const handleSuggestionClick = (term: string) => {
    setQuery(term);
    saveQueryToHistory(term);
  };

  // Helper to highlight matched text query
  const highlightMatch = (text: string, searchWord: string) => {
    if (!searchWord.trim()) return text;
    const regex = new RegExp(`(${searchWord.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === searchWord.toLowerCase() ? (
            <mark key={index} className="bg-accent-cyan/20 text-accent-cyan font-bold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12 space-y-8" onKeyDown={handleKeyDown}>
      {/* Search Header */}
      <div className="border-b border-white/5 pb-6">
        <span className="text-[11px] font-semibold text-accent-cyan tracking-[0.2em] uppercase font-mono">Instant Queries</span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-warm-white mt-1">Search Palette</h1>
        <p className="text-[13px] text-stone font-light mt-1">
          Perform real-time full-text indexing queries. Use arrow keys to navigate and Enter to select.
        </p>
      </div>

      {/* Large Input Box */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone group-focus-within:text-accent-cyan transition-colors" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by titles, slugs, tags, or guide content..." 
          className="w-full bg-charcoal/20 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-[14px] text-warm-white outline-none focus:border-white/10 placeholder:text-stone/40 font-light"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1.5 text-[10px] text-stone font-mono border border-white/5 px-2 py-1 rounded bg-charcoal/30">
          <span>Navigation Active</span>
          <CornerDownLeft className="w-3 h-3" />
        </div>
      </div>

      {/* Quick query presets */}
      {!query && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[11px] font-semibold text-stone uppercase tracking-wider font-mono flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                <span>Recent Searches</span>
              </h4>
              <div className="space-y-1 bg-charcoal/10 border border-white/5 rounded-2xl p-3">
                {recentSearches.map((term, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleSuggestionClick(term)}
                    className="w-full text-left p-2 rounded-lg hover:bg-white/5 text-[12px] text-stone hover:text-warm-white flex items-center justify-between cursor-pointer"
                  >
                    <span>{term}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-stone/40" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular searches */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold text-stone uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Popular Topics</span>
            </h4>
            <div className="space-y-1 bg-charcoal/10 border border-white/5 rounded-2xl p-3">
              {popularSearches.map((term, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleSuggestionClick(term)}
                  className="w-full text-left p-2 rounded-lg hover:bg-white/5 text-[12px] text-stone hover:text-warm-white flex items-center justify-between cursor-pointer"
                >
                  <span>{term}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-stone/40" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {results.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-3"
          >
            <span className="text-[10px] font-mono text-stone uppercase block">{results.length} matched articles</span>
            <div className="bg-charcoal/10 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
              {results.map((post, idx) => {
                const isActive = idx === selectedIndex;
                return (
                  <Link key={post.id} href={`/posts/${post.slug}`} onClick={() => saveQueryToHistory(query)}>
                    <div className={`p-4 transition-all cursor-pointer flex flex-col justify-between gap-1 text-left
                      ${isActive ? 'bg-white/5 border-l-4 border-accent-cyan pl-3' : 'hover:bg-white/[0.01] border-l-4 border-transparent'}
                    `}>
                      <span className="text-[9px] font-mono text-accent-cyan uppercase">{post.categoryRef?.name || 'General'}</span>
                      <h4 className="text-[14px] font-bold text-warm-white">
                        {highlightMatch(post.title, debouncedQuery)}
                      </h4>
                      <p className="text-[12px] text-stone truncate font-light leading-relaxed">
                        {post.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty Search State */}
        {query && results.length === 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl"
          >
            <FolderDot className="w-12 h-12 text-stone/40 animate-pulse" />
            <h4 className="text-[13px] font-bold text-warm-white mt-3">No matching results</h4>
            <p className="text-[11px] text-stone mt-1">Try refining search parameters or using autocomplete keywords.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

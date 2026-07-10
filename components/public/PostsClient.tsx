'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Grid, 
  List, 
  Search, 
  ChevronDown, 
  ChevronRight,
  Calendar, 
  Eye, 
  ThumbsUp, 
  Bookmark, 
  ArrowUpDown, 
  SlidersHorizontal,
  BookmarkCheck,
  FolderOpen
} from 'lucide-react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui/core';

interface PostsClientProps {
  initialPosts: any[];
  categories: any[];
  tags: any[];
}

export default function PostsClient({ 
  initialPosts, 
  categories, 
  tags 
}: PostsClientProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [sortBy, setSortBy] = useState<'publishedAt' | 'views' | 'likes'>('publishedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load more / Pagination
  const [visibleCount, setVisibleCount] = useState(6);

  // Filtered & Sorted items
  const filteredPosts = React.useMemo(() => {
    let result = [...initialPosts];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
      );
    }

    // Category
    if (categoryFilter) {
      result = result.filter(p => p.categoryRef?.slug === categoryFilter);
    }

    // Tag
    if (tagFilter) {
      result = result.filter(p => p.postTags.some((pt: any) => pt.tag.slug === tagFilter));
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'likes') {
        valA = a._count?.reactions || 0;
        valB = b._count?.reactions || 0;
      }

      if (sortBy === 'publishedAt') {
        valA = new Date(a.publishedAt).getTime();
        valB = new Date(b.publishedAt).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [initialPosts, search, categoryFilter, tagFilter, sortBy, sortOrder]);

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 6, filteredPosts.length));
  };

  const hasMore = visibleCount < filteredPosts.length;
  const currentPosts = filteredPosts.slice(0, visibleCount);

  return (
    <div className="w-full space-y-8">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-6">
        <span className="text-[11px] font-semibold text-accent-cyan tracking-[0.2em] uppercase font-mono">Catalog Stream</span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-warm-white mt-1">Articles Hub</h1>
        <p className="text-[13px] text-stone font-light max-w-xl mt-1.5">
          Browse technical guides, architectural posts, and frameworks tutorials. Filter by topic, tags, or popularity.
        </p>
      </div>

      {/* Controls Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-charcoal/20 border border-white/5 rounded-2xl p-4">
        {/* Instant Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles by keywords, content..."
            className="w-full bg-charcoal/30 border border-white/5 rounded-lg pl-9 pr-4 py-2 text-[12px] text-warm-white outline-none focus:border-white/10 placeholder:text-stone/50"
          />
        </div>

        {/* Filters and sorting */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Categories select */}
          <div className="relative">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-charcoal/40 border border-white/5 rounded-lg text-[12px] px-3 py-2 text-stone hover:text-warm-white outline-none cursor-pointer pr-8 appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone pointer-events-none" />
          </div>

          {/* Tag select */}
          <div className="relative">
            <select 
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="bg-charcoal/40 border border-white/5 rounded-lg text-[12px] px-3 py-2 text-stone hover:text-warm-white outline-none cursor-pointer pr-8 appearance-none"
            >
              <option value="">All Tags</option>
              {tags.map(t => <option key={t.id} value={t.slug}>#{t.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone pointer-events-none" />
          </div>

          {/* Sort By select */}
          <div className="relative">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-charcoal/40 border border-white/5 rounded-lg text-[12px] px-3 py-2 text-stone hover:text-warm-white outline-none cursor-pointer pr-8 appearance-none"
            >
              <option value="publishedAt">Publish Date</option>
              <option value="views">Popularity (Views)</option>
              <option value="likes">Reactions</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone pointer-events-none" />
          </div>

          {/* Sort Order button */}
          <Button 
            variant="secondary"
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-2 h-9"
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>

          {/* View Toggle */}
          <div className="flex bg-charcoal/40 border border-white/5 rounded-lg p-0.5 shrink-0">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md cursor-pointer ${viewMode === 'grid' ? 'bg-white/10 text-warm-white' : 'text-stone hover:text-warm-white'}`}
            >
              <Grid className="w-4.5 h-4.5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md cursor-pointer ${viewMode === 'list' ? 'bg-white/10 text-warm-white' : 'text-stone hover:text-warm-white'}`}
            >
              <List className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Articles Grid / List render */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentPosts.map((post) => (
              <Card key={post.id} className="flex flex-col justify-between h-[340px] hover:border-white/12 group relative overflow-hidden">
                <div className="space-y-4">
                  {post.coverImage ? (
                    <div className="h-32 -mx-5 -mt-5 bg-charcoal/20 border-b border-white/5 relative overflow-hidden">
                      <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103" />
                    </div>
                  ) : (
                    <div className="h-32 -mx-5 -mt-5 bg-charcoal/20 border-b border-white/5 flex items-center justify-center text-stone/40 font-mono text-[10px]">
                      Next.js Technical Guide
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono text-accent-cyan uppercase tracking-wider">{post.categoryRef?.name || 'General'}</span>
                    <h3 className="text-[14px] font-bold text-warm-white group-hover:text-accent-cyan transition-colors leading-snug line-clamp-2">
                      <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="text-[11px] text-stone line-clamp-2 leading-relaxed font-light">
                      {post.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-4 text-[10px] text-stone font-mono">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-0.5"><Eye className="w-3.5 h-3.5" /> {post.views}</span>
                    <span className="flex items-center gap-0.5"><ThumbsUp className="w-3.5 h-3.5" /> {post._count?.reactions || 0}</span>
                  </div>
                  <Link href={`/posts/${post.slug}`} className="text-[11px] hover:text-warm-white flex items-center gap-0.5">
                    <span>Read Guide</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {currentPosts.map((post) => (
              <Card key={post.id} className="hover:border-white/10 group p-5 flex flex-col md:flex-row gap-6 items-center">
                {post.coverImage && (
                  <div className="w-full md:w-48 aspect-[16/10] rounded-xl overflow-hidden border border-white/5 shrink-0">
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 flex flex-col justify-between space-y-3 w-full">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone">
                      <span className="text-accent-cyan uppercase font-semibold">{post.categoryRef?.name || 'General'}</span>
                      <span suppressHydrationWarning>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}</span>
                    </div>
                    <h3 className="text-[15px] font-bold text-warm-white group-hover:text-accent-cyan transition-colors leading-snug">
                      <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="text-[12px] text-stone line-clamp-2 leading-relaxed font-light">
                      {post.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] text-stone font-mono">
                    <span>By @{post.author.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-0.5"><Eye className="w-3.5 h-3.5" /> {post.views}</span>
                      <span className="flex items-center gap-0.5"><ThumbsUp className="w-3.5 h-3.5" /> {post._count?.reactions || 0}</span>
                      <span className="flex items-center gap-0.5"><Bookmark className="w-3.5 h-3.5" /> {post._count?.bookmarks || 0}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty States */}
      {currentPosts.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center space-y-4 border border-dashed border-white/5 rounded-2xl">
          <FolderOpen className="w-12 h-12 text-stone/40 animate-pulse" />
          <div className="text-center">
            <h4 className="text-[14px] font-bold text-warm-white">No articles found</h4>
            <p className="text-[11px] text-stone font-light mt-1">Try resetting search keywords or topic filters.</p>
            <Button variant="secondary" onClick={() => { setSearch(''); setCategoryFilter(''); setTagFilter(''); }} className="mt-4 text-[11px] mx-auto">
              Reset Filters
            </Button>
          </div>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <Button variant="secondary" onClick={loadMore} className="text-[12px]">
            <span>Load More Articles</span>
          </Button>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  CornerDownLeft, 
  Sparkles, 
  FolderDot, 
  History, 
  ArrowUpRight, 
  ChevronRight, 
  SlidersHorizontal,
  Bookmark,
  Code2,
  FileText,
  Compass,
  Users,
  Award,
  Calendar,
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui/core';
import { SearchIndex, SearchDocument } from '@/lib/search/SearchIndex';

export default function SearchClient() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Search Filters
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterVerified, setFilterVerified] = useState<string>('');
  const [sortBy, setSortBy] = useState<'relevance' | 'popularity' | 'newest'>('relevance');

  // Search History
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const popularSearches = ['React', 'Next.js', 'Machine Learning', 'Docker', 'System Design'];

  useEffect(() => {
    const history = localStorage.getItem('sm_search_history');
    if (history) {
      setRecentSearches(JSON.parse(history));
    }
  }, []);

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => clearTimeout(handler);
  }, [query]);

  // Execute Search
  const performSearch = (): SearchDocument[] => {
    const filters: any = {};
    if (filterDifficulty) filters.difficulty = filterDifficulty;
    if (filterCategory) filters.category = filterCategory;
    if (filterVerified === 'true') filters.isVerified = true;
    if (filterVerified === 'false') filters.isVerified = false;
    
    if (activeTab !== 'all') {
      // Map tabs to content types
      filters.contentType = activeTab;
    }

    return SearchIndex.search(debouncedQuery, filters, sortBy);
  };

  const results = performSearch();

  const handleSuggestionClick = (term: string) => {
    setQuery(term);
    saveQueryToHistory(term);
  };

  const saveQueryToHistory = (term: string) => {
    if (!term.trim()) return;
    const history = [term, ...recentSearches.filter(t => t !== term)].slice(0, 5);
    setRecentSearches(history);
    localStorage.setItem('sm_search_history', JSON.stringify(history));
  };

  // Grouped results helper (for 'all' tab)
  const groupResultsByType = (docs: SearchDocument[]) => {
    const groups: Record<string, SearchDocument[]> = {};
    docs.forEach(doc => {
      if (!groups[doc.contentType]) {
        groups[doc.contentType] = [];
      }
      groups[doc.contentType].push(doc);
    });
    return groups;
  };

  const groupedResults = groupResultsByType(results);

  // Retrieve available categories in search facets
  const facets = SearchIndex.getFacets();

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

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'project': return Code2;
      case 'note': return FileText;
      case 'roadmap': return Compass;
      case 'discussion': return MessageSquare;
      case 'event': return Calendar;
      default: return Sparkles;
    }
  };

  const formatTypeName = (type: string) => {
    if (type === 'qa') return 'Q&As';
    return type.charAt(0).toUpperCase() + type.slice(1) + 's';
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <span className="text-[10px] font-mono text-accent-cyan font-bold uppercase tracking-wider">Universal Palette</span>
          <h1 className="text-3xl font-black tracking-tight text-warm-white mt-0.5">Search Center</h1>
        </div>

        {/* Filters Toggle & Sorts */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <Button 
            variant="secondary" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 text-[11.5px] py-1.5 px-3"
          >
            <SlidersHorizontal className="w-4 h-4 text-stone" />
            <span>Filters</span>
          </Button>

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-charcoal/30 border border-white/5 rounded-lg px-2 py-1.5 text-[11.5px] text-stone outline-none cursor-pointer"
          >
            <option value="relevance">Relevance</option>
            <option value="popularity">Popularity</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* 2. Filters Grid Container */}
      {showFilters && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-white/5 bg-charcoal/20"
        >
          <div className="space-y-1">
            <span className="text-[9.5px] font-mono text-stone uppercase block font-bold">Category</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-charcoal/40 border border-white/5 rounded px-2 py-1 text-[12px] text-stone outline-none"
            >
              <option value="">All Categories</option>
              {facets.categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[9.5px] font-mono text-stone uppercase block font-bold">Difficulty</span>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full bg-charcoal/40 border border-white/5 rounded px-2 py-1 text-[12px] text-stone outline-none"
            >
              <option value="">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[9.5px] font-mono text-stone uppercase block font-bold">Verification</span>
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value)}
              className="w-full bg-charcoal/40 border border-white/5 rounded px-2 py-1 text-[12px] text-stone outline-none"
            >
              <option value="">All Users</option>
              <option value="true">Verified Only</option>
              <option value="false">Standard Only</option>
            </select>
          </div>
        </motion.div>
      )}

      {/* 3. Input Box */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone group-focus-within:text-accent-cyan transition-colors" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search blogs, roadmaps, codes, notes, certifications..." 
          className="w-full bg-charcoal/20 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-[14px] text-warm-white outline-none focus:border-white/10 placeholder:text-stone/40 font-light"
        />
      </div>

      {/* 4. Tabs Selectors */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-white/5 text-[11px] scrollbar-none">
        {[
          { id: 'all', label: 'All Results' },
          { id: 'blog', label: 'Blogs' },
          { id: 'project', label: 'Projects' },
          { id: 'roadmap', label: 'Roadmaps' },
          { id: 'note', label: 'Notes' },
          { id: 'discussion', label: 'Discussions' },
          { id: 'event', label: 'Events' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-3 py-1.5 rounded-lg shrink-0 cursor-pointer transition-colors ${activeTab === t.id ? 'bg-white/10 text-warm-white font-bold' : 'text-stone hover:text-warm-white'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 5. Suggestions lists */}
      {!query && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          {recentSearches.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-semibold text-stone uppercase tracking-wider font-mono flex items-center gap-1.5">
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

          <div className="space-y-3">
            <h4 className="text-[10px] font-semibold text-stone uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Trending Technologies</span>
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

      {/* 6. Results display */}
      <AnimatePresence mode="wait">
        {query && results.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* If tab is 'All', show segmented results by content types */}
            {activeTab === 'all' ? (
              Object.keys(groupedResults).map((type) => {
                const Icon = getDocIcon(type);
                const items = groupedResults[type];
                return (
                  <div key={type} className="space-y-3">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <h4 className="text-[13px] font-bold text-warm-white uppercase font-mono flex items-center gap-2">
                        <Icon className="w-4 h-4 text-accent-cyan" />
                        <span>{formatTypeName(type)} ({items.length})</span>
                      </h4>
                      <button 
                        onClick={() => setActiveTab(type)}
                        className="text-stone hover:text-accent-cyan text-[10px] font-mono flex items-center gap-0.5"
                      >
                        <span>See All</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.slice(0, 2).map((doc) => (
                        <Card key={doc.id} className="p-4 hover:border-white/10 flex flex-col justify-between h-[130px] group transition-all">
                          <div className="space-y-1">
                            <div className="flex justify-between items-start text-[9.5px] font-mono text-stone">
                              <span className="text-accent-cyan font-bold uppercase">{doc.category}</span>
                              {doc.isVerified && <CheckCircle className="w-3 h-3 text-accent-emerald" />}
                            </div>
                            <h5 className="text-[13.5px] font-bold text-warm-white group-hover:text-accent-cyan transition-colors truncate">
                              {doc.title}
                            </h5>
                            <p className="text-[11.5px] text-stone line-clamp-2 leading-relaxed font-light font-sans">
                              {doc.description}
                            </p>
                          </div>
                          <span className="text-[10px] text-stone mt-2 block hover:underline cursor-pointer">
                            Inspect content →
                          </span>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              // Specific content type tab results list
              <div className="space-y-4">
                <span className="text-[10px] font-mono text-stone uppercase block">{results.length} records matched</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {results.map((doc) => (
                    <Card key={doc.id} className="p-4 hover:border-white/10 flex flex-col justify-between h-[140px] group transition-all">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start text-[9.5px] font-mono text-stone">
                          <span className="text-accent-cyan font-bold uppercase">{doc.category} · {doc.difficulty}</span>
                          {doc.isVerified && <CheckCircle className="w-3 h-3 text-accent-emerald" />}
                        </div>
                        <h5 className="text-[13.5px] font-bold text-warm-white group-hover:text-accent-cyan transition-colors truncate">
                          {doc.title}
                        </h5>
                        <p className="text-[11.5px] text-stone line-clamp-2 leading-relaxed font-light">
                          {doc.description}
                        </p>
                      </div>
                      <span className="text-[10px] text-stone/80 mt-2 block font-mono">
                        Inspect file →
                      </span>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty Search State */}
        {query && results.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 pt-4"
          >
            <div className="py-12 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl text-center">
              <FolderDot className="w-10 h-10 text-stone/30" />
              <h4 className="text-[14px] font-bold text-warm-white mt-3">No results found</h4>
              <p className="text-[11.5px] text-stone mt-1 max-w-xs font-light">We couldn't locate matching records. Try typing different keywords or tags.</p>
            </div>

            {/* Recommendations & Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <span className="text-[9.5px] font-mono text-stone uppercase tracking-wider font-bold block">Popular Technologies</span>
                <div className="flex flex-wrap gap-2">
                  {['React', 'Next.js', 'TypeScript', 'Docker', 'Systems', 'AWS'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleSuggestionClick(tag)}
                      className="px-2.5 py-1 rounded bg-white/5 border border-white/5 text-[11px] font-mono text-stone hover:text-warm-white transition-colors cursor-pointer"
                    >
                      #{tag.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[9.5px] font-mono text-stone uppercase tracking-wider font-bold block">Search Suggestions</span>
                <ul className="space-y-1 text-[11.5px] text-stone font-light">
                  <li>• Verify correct spelling of tags</li>
                  <li>• Filter by specific content types using tabs</li>
                  <li>• Clear active category/difficulty dropdowns</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

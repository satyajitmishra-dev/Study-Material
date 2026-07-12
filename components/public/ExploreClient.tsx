'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ChevronRight, 
  Code2, 
  Compass, 
  FileText, 
  CheckCircle, 
  Flame, 
  SlidersHorizontal,
  FolderDot,
  ArrowUpRight,
  TrendingUp,
  Layers,
  Award,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui/core';
import { SearchIndex, SearchDocument } from '@/lib/search/SearchIndex';

export default function ExploreClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [showOnlyVerified, setShowOnlyVerified] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState(false);

  // Retrieve seeded index records
  const allDocs = SearchIndex.getAll();

  // Helper filters
  const applyFilters = (docs: SearchDocument[]) => {
    return docs.filter(doc => {
      if (selectedCategory && doc.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      if (selectedDifficulty && doc.difficulty !== selectedDifficulty) return false;
      if (showOnlyVerified && !doc.isVerified) return false;
      return true;
    });
  };

  const filteredDocs = applyFilters(allDocs);

  // Lanes
  const trendingDocs = filteredDocs.filter(d => d.popularity > 80);
  const featuredRoadmaps = filteredDocs.filter(d => d.contentType === 'roadmap');
  const popularProjects = filteredDocs.filter(d => d.contentType === 'project');
  const beginnerFriendly = filteredDocs.filter(d => d.difficulty === 'Beginner');
  const verifiedCreators = filteredDocs.filter(d => d.isVerified);
  const editorsPicks = filteredDocs.filter(d => d.contentType === 'note').slice(0, 5);

  const HorizontalLane = ({ title, docs, icon: Icon }: { title: string; docs: SearchDocument[]; icon: React.ComponentType<any> }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    if (docs.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[14px] font-bold text-warm-white font-mono tracking-wide uppercase flex items-center gap-2">
            <Icon className="w-4 h-4 text-accent-cyan" />
            <span>{title}</span>
          </h3>
          <span className="text-stone text-[10px] font-mono">{docs.length} items</span>
        </div>
        
        <div 
          ref={containerRef}
          className="flex gap-6 overflow-x-auto pb-4 pt-1 px-1 scrollbar-thin scrollbar-thumb-white/5 scroll-smooth"
          style={{ scrollbarWidth: 'thin' }}
        >
          {docs.slice(0, 8).map((doc) => {
            const DocIcon = doc.contentType === 'project' ? Code2 : doc.contentType === 'roadmap' ? Compass : FileText;
            return (
              <Card 
                key={doc.id}
                className="min-w-[280px] max-w-[280px] h-[180px] p-5 flex flex-col justify-between hover:border-white/10 transition-all shrink-0 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/[0.01] rounded-bl-full pointer-events-none" />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-mono text-stone">
                    <span className="text-accent-cyan font-bold uppercase">{doc.category}</span>
                    <span className="uppercase">{doc.difficulty}</span>
                  </div>
                  <h4 className="text-[13.5px] font-bold text-warm-white group-hover:text-accent-cyan transition-colors truncate">
                    {doc.title}
                  </h4>
                  <p className="text-[11.5px] text-stone/85 line-clamp-2 leading-relaxed font-light font-sans">
                    {doc.description}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2 mt-auto border-t border-white/5 text-[10px] font-mono text-stone">
                  <span className="flex items-center gap-1">
                    <DocIcon className="w-3.5 h-3.5" />
                    <span className="capitalize">{doc.contentType}</span>
                  </span>
                  <Link href={`/search?tab=${doc.contentType}`} className="text-accent-cyan hover:underline flex items-center gap-0.5">
                    <span>Explore</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const categoriesList = ['TypeScript', 'CSS', 'React', 'Angular', 'General', 'Systems'];

  return (
    <div className="w-full space-y-8 pt-8 pb-16 px-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <span className="text-[10px] font-mono text-accent-cyan font-bold uppercase tracking-wider">Discover Hub</span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-warm-white mt-1">Explore Ecosystem</h1>
          <p className="text-[13px] text-stone font-light mt-1">
            Discover frameworks, timeline roadmaps, notes, and developer assets.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 text-[11.5px] py-1.5 px-3"
          >
            <SlidersHorizontal className="w-4 h-4 text-stone" />
            <span>Refine</span>
          </Button>
        </div>
      </div>

      {/* Filters Drawer */}
      {showFilters && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-white/5 bg-charcoal/20"
        >
          <div className="space-y-1">
            <span className="text-[9.5px] font-mono text-stone uppercase block font-bold">Category</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-charcoal/40 border border-white/5 rounded px-2 py-1 text-[12px] text-stone outline-none"
            >
              <option value="">All Categories</option>
              {categoriesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[9.5px] font-mono text-stone uppercase block font-bold">Difficulty</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-charcoal/40 border border-white/5 rounded px-2 py-1 text-[12px] text-stone outline-none"
            >
              <option value="">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[9.5px] font-mono text-stone uppercase block font-bold">Creators</span>
            <button
              onClick={() => setShowOnlyVerified(!showOnlyVerified)}
              className={`w-full text-left px-3 py-1.5 rounded border text-[12px] transition-colors
                ${showOnlyVerified 
                  ? 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan font-bold' 
                  : 'bg-charcoal/40 border-white/5 text-stone hover:text-warm-white'}`}
            >
              {showOnlyVerified ? '✓ Verified Authors Only' : 'Show All Authors'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Horizontal Netflix lanes */}
      {filteredDocs.length > 0 ? (
        <div className="space-y-12">
          <HorizontalLane title="Trending Today" docs={trendingDocs} icon={Flame} />
          <HorizontalLane title="Featured Roadmaps" docs={featuredRoadmaps} icon={Compass} />
          <HorizontalLane title="Popular Projects" docs={popularProjects} icon={Code2} />
          <HorizontalLane title="Beginner Friendly" docs={beginnerFriendly} icon={BookOpen} />
          <HorizontalLane title="Verified Creator Milestones" docs={verifiedCreators} icon={Award} />
          <HorizontalLane title="Editor's Choice Notes" docs={editorsPicks} icon={FileText} />
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl">
          <FolderDot className="w-12 h-12 text-stone/40 animate-pulse" />
          <h4 className="text-[13px] font-bold text-warm-white mt-3">No content found matching filter criteria</h4>
          <p className="text-[11px] text-stone mt-1">Try resetting selected categories or difficulty sliders.</p>
        </div>
      )}

    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  BookOpen, 
  Code2, 
  Compass, 
  FileText, 
  Users, 
  Calendar, 
  ChevronRight, 
  Award,
  ArrowUpRight,
  TrendingUp,
  SlidersHorizontal,
  CheckCircle2,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui/core';
import { SearchIndex, SearchDocument } from '@/lib/search/SearchIndex';

interface TopicClientProps {
  topicSlug: string;
}

export default function TopicClient({ topicSlug }: TopicClientProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'blogs' | 'projects' | 'notes' | 'qa' | 'creators'>('overview');

  const topicName = topicSlug.toUpperCase();

  // Query search engine to fetch matching items
  const matchedDocs = SearchIndex.search('', {
    category: topicSlug,
  });

  // Fallback query matching tag as well
  const tagMatchedDocs = SearchIndex.search(topicSlug);
  const combinedDocs = Array.from(new Set([...matchedDocs, ...tagMatchedDocs]));

  const blogs = combinedDocs.filter(d => d.contentType === 'blog' || d.contentType === 'note');
  const projects = combinedDocs.filter(d => d.contentType === 'project');
  const notes = combinedDocs.filter(d => d.contentType === 'note');
  const roadmaps = combinedDocs.filter(d => d.contentType === 'roadmap');

  // AI Summary mock data
  const getAiSummary = () => {
    switch (topicSlug.toLowerCase()) {
      case 'react':
        return {
          desc: 'React is a component-based UI library. React 19 introduces automatic memoization via the build-time compiler, Server Actions, and native Document Metadata support.',
          pros: 'Automated cache control, massive ecosystem, state coordination.',
          complexity: 'Intermediate / Advanced'
        };
      case 'css':
        return {
          desc: 'Cascading Style Sheets (CSS) design layouts. Tailwind CSS v4 compiles CSS-first utility classes directly into static assets, enhancing speed.',
          pros: 'No runtime JS, customizable themes, layout control.',
          complexity: 'Beginner / Intermediate'
        };
      default:
        return {
          desc: `${topicName} is a principal technology in developer architectures. Organizes code layers, data endpoints, and layout streaming.`,
          pros: 'Scalability, clear design abstractions, active community support.',
          complexity: 'Intermediate'
        };
    }
  };

  const aiSummary = getAiSummary();

  // Milestones roadmap mock data
  const milestones = [
    { num: '01', title: `${topicName} Environment Setup`, desc: 'Compile local runtime libraries and workspace configurations.' },
    { num: '02', title: 'Data Flow & Variables', desc: 'Manage localized states and reactive changes.' },
    { num: '03', title: 'Performance Optimization', desc: 'Setup edge CDNs, server caching headers, and compilation bounds.' }
  ];

  return (
    <div className="w-full space-y-8 pt-8 pb-16 px-4">
      
      {/* 1. Ecosystem Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-accent-cyan font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Technology Ecosystem Hub</span>
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-warm-white">{topicName} Ecosystem</h1>
          <p className="text-[13px] text-stone font-light leading-relaxed max-w-xl">
            Access automatic learning roadmaps, inspect open-source repos, read deep-dive blogs, and sync notes on {topicName}.
          </p>
        </div>

        {/* Action triggers */}
        <div className="flex gap-3">
          <Link href="/explore">
            <Button variant="secondary" className="text-[12.5px] py-1.5 px-3">
              ← Back to Explore
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. AI Technology Summary Card */}
      <Card className="p-6 border-accent-cyan/15 bg-accent-cyan/[0.01] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/[0.02] rounded-bl-full pointer-events-none" />
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-cyan" />
            <h3 className="text-md font-bold text-warm-white">AI Engine Technology Summary</h3>
          </div>
          <p className="text-[13px] text-stone leading-relaxed font-light font-sans max-w-3xl">
            {aiSummary.desc}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] font-mono text-stone pt-2">
            <span>Pros: <span className="text-warm-white font-sans">{aiSummary.pros}</span></span>
            <span>Recommended Difficulty: <span className="text-accent-cyan font-sans">{aiSummary.complexity}</span></span>
          </div>
        </div>
      </Card>

      {/* 3. Sub-tabs Menu */}
      <div className="flex gap-2 overflow-x-auto border-b border-white/5 pb-2 text-[12px] scrollbar-none">
        {[
          { id: 'overview', label: 'Milestone Roadmap' },
          { id: 'blogs', label: `Blogs & Guides (${blogs.length})` },
          { id: 'projects', label: `Projects (${projects.length})` },
          { id: 'notes', label: `University Notes (${notes.length})` },
          { id: 'qa', label: 'Q&A Discussions' },
          { id: 'creators', label: 'Featured Experts' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveSubTab(t.id as any)}
            className={`px-4 py-1.5 rounded-lg shrink-0 cursor-pointer transition-colors ${activeSubTab === t.id ? 'bg-white/10 text-warm-white font-bold' : 'text-stone hover:text-warm-white'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 4. Tab Contents */}
      <div className="min-h-[250px]">
        <AnimatePresence mode="wait">
          
          {/* TAB: OVERVIEW ROADMAP */}
          {activeSubTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {milestones.map((m, idx) => (
                <Card key={idx} className="p-6 space-y-4 hover:border-white/10 group flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-3xl font-black text-white/5 group-hover:text-accent-cyan/15 transition-colors font-mono block">
                      {m.num}
                    </span>
                    <h4 className="text-[14.5px] font-bold text-warm-white">{m.title}</h4>
                    <p className="text-[12px] text-stone leading-relaxed font-light">{m.desc}</p>
                  </div>
                  <span className="text-[10px] font-mono text-stone group-hover:text-warm-white transition-colors mt-4 block">
                    Learn Step →
                  </span>
                </Card>
              ))}
            </motion.div>
          )}

          {/* TAB: BLOGS & GUIDES */}
          {activeSubTab === 'blogs' && (
            <motion.div
              key="blogs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {blogs.map(blog => (
                <Card key={blog.id} className="p-5 flex flex-col justify-between h-[150px] hover:border-white/10 group transition-all">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-mono text-stone">
                      <span className="text-accent-cyan uppercase font-bold">{blog.category}</span>
                      <span>5 min read</span>
                    </div>
                    <h4 className="text-[14px] font-bold text-warm-white group-hover:text-accent-cyan transition-colors truncate">
                      {blog.title}
                    </h4>
                    <p className="text-[11.5px] text-stone line-clamp-2 leading-relaxed font-light">
                      {blog.description}
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-stone pt-2 border-t border-white/5 mt-auto">
                    <span>By @{blog.author}</span>
                    <Link href="/search?tab=blog" className="text-accent-cyan hover:underline">Read Article</Link>
                  </div>
                </Card>
              ))}

              {blogs.length === 0 && (
                <div className="col-span-2 py-16 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl">
                  <FileText className="w-12 h-12 text-stone/40" />
                  <h4 className="text-[13px] font-bold text-warm-white mt-3">No blogs matching {topicName}</h4>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB: PROJECTS */}
          {activeSubTab === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {projects.map(proj => (
                <Card key={proj.id} className="p-5 flex flex-col justify-between h-[150px] hover:border-white/10 group">
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-accent-violet uppercase font-bold">Open Source</span>
                    <h4 className="text-[14px] font-bold text-warm-white group-hover:text-accent-violet transition-colors truncate">
                      {proj.title}
                    </h4>
                    <p className="text-[11.5px] text-stone line-clamp-2 leading-relaxed font-light">
                      {proj.description}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-2 mt-auto text-[10px] font-mono text-stone">
                    <span>★ {proj.popularity} stars</span>
                    <Link href="/projects" className="text-accent-violet hover:underline">Showcase</Link>
                  </div>
                </Card>
              ))}

              {projects.length === 0 && (
                <div className="col-span-2 py-16 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl">
                  <Code2 className="w-12 h-12 text-stone/40" />
                  <h4 className="text-[13px] font-bold text-warm-white mt-3">No showcases matching {topicName}</h4>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB: NOTES */}
          {activeSubTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {notes.map(note => (
                <Card key={note.id} className="p-5 flex flex-col justify-between h-[140px] hover:border-white/10 group">
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-accent-cyan uppercase font-bold">{note.category}</span>
                    <h4 className="text-[13.5px] font-bold text-warm-white group-hover:text-accent-cyan transition-colors truncate font-sans">
                      {note.title}
                    </h4>
                    <p className="text-[11.5px] text-stone line-clamp-2 leading-relaxed font-light">
                      {note.description}
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-stone pt-2 mt-auto">
                    <span>Topic Guide</span>
                    <span className="hover:text-warm-white cursor-pointer">Download ↓</span>
                  </div>
                </Card>
              ))}

              {notes.length === 0 && (
                <div className="col-span-2 py-16 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl">
                  <FileText className="w-12 h-12 text-stone/40" />
                  <h4 className="text-[13px] font-bold text-warm-white mt-3">No lecture notes for {topicName}</h4>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB: Q&A */}
          {activeSubTab === 'qa' && (
            <motion.div
              key="qa"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <Card className="p-4 flex justify-between items-center border-white/5">
                <div>
                  <h4 className="text-[13.5px] font-bold text-warm-white">How does server-side streaming render boundary nodes in {topicName}?</h4>
                  <p className="text-[11px] text-stone font-mono mt-1">Asked by @SystemsCoder · 3 responses</p>
                </div>
                <Link href="/community">
                  <Button variant="secondary" className="h-7 text-[10px]">Read Thread</Button>
                </Link>
              </Card>
            </motion.div>
          )}

          {/* TAB: CREATORS */}
          {activeSubTab === 'creators' && (
            <motion.div
              key="creators"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
            >
              {[
                { name: 'Satyajit Mishra', role: 'Principal Architect', score: 92 },
                { name: 'SystemsSpecialist', role: `${topicName} Contributor`, score: 85 }
              ].map(creator => (
                <Card key={creator.name} className="p-4 flex justify-between items-center border-white/5">
                  <div>
                    <span className="text-[13.5px] font-bold text-warm-white block">{creator.name}</span>
                    <span className="text-[10px] text-stone font-mono block">{creator.role}</span>
                  </div>
                  <div className="text-[11px] font-mono text-accent-cyan font-bold">
                    Score: {creator.score}
                  </div>
                </Card>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}

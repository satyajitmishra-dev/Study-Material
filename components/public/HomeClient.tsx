'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Bookmark,
  Flame,
  Search,
  ChevronRight,
  TrendingUp,
  Calendar,
  Layers,
  ArrowUpRight,
  ThumbsUp,
  User,
  ExternalLink,
  Code2,
  Compass,
  FileText,
  Users,
  Bot,
  Plus,
  Award,
  BookMarked,
  Trophy,
  History,
  Clock,
  HelpCircle,
  MessageSquare,
  Vote,
  Github,
  Link as LinkIcon,
  BookOpenCheck,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui/core';
import { votePollAction } from '@/lib/actions/pollActions';

interface HomeClientProps {
  initialFeed: any[];
  categories: any[];
  tags: any[];
  layout: string[];
  sessionUser: any;
}

export default function HomeClient({
  initialFeed = [],
  categories = [],
  tags = [],
  layout = [],
  sessionUser
}: HomeClientProps) {
  // Feed tabs state
  const [activeTab, setActiveTab] = useState('trending');
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Filtering states
  const [techFilter, setTechFilter] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyVerified, setOnlyVerified] = useState(false);

  // Feed items state
  const [feedItems, setFeedItems] = useState<any[]>(initialFeed);
  const [offset, setOffset] = useState(initialFeed.length);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Poll voting state
  const [votedPolls, setVotedPolls] = useState<Record<string, string>>({});

  // Sub-communities list
  const communities = [
    { name: 'React', slug: 'react', desc: 'Next.js, Server Components, State' },
    { name: 'Java', slug: 'java', desc: 'Spring Boot, JDK internals' },
    { name: 'Next.js', slug: 'nextjs', desc: 'App Router, PPR rendering' },
    { name: 'DSA', slug: 'dsa', desc: 'LeetCode & algorithms' },
    { name: 'AI', slug: 'ai', desc: 'LLMs, PyTorch, Prompts' },
    { name: 'Open Source', slug: 'open-source', desc: 'PRs, Git, connecting repos' }
  ];

  // Static list for top contributors
  const contributors = [
    { name: 'Satyajit Mishra', username: 'satyajitmishra-dev', rep: 2450, level: 'Verified Creator', xp: 92 },
    { name: 'Emily Chen', username: 'emilychen', rep: 1890, level: 'Trusted Contributor', xp: 85 },
    { name: 'Alex Rivera', username: 'arivera', rep: 1240, level: 'Contributor', xp: 78 },
    { name: 'Sarah Jenkins', username: 'sjenk', rep: 980, level: 'Contributor', xp: 60 }
  ];

  // Static list for upcoming events
  const events = [
    { title: 'Next.js 16 App Router AMA', date: 'July 18, 6:00 PM', type: 'AMA Workshop', organizer: 'Satyajit Mishra' },
    { title: 'AI Hackathon & Build Sprint', date: 'July 22-24', type: 'Hackathon', organizer: 'System Mentor' }
  ];

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Load items from dynamic API
  const loadMoreItems = async (isReset = false) => {
    if (loading) return;
    setLoading(true);
    const currentOffset = isReset ? 0 : offset;
    try {
      const params = new URLSearchParams({
        type: activeTab,
        limit: '12',
        offset: currentOffset.toString(),
      });
      if (techFilter) params.append('technology', techFilter);
      if (difficulty) params.append('difficulty', difficulty);
      if (searchQuery) params.append('technology', searchQuery);

      const res = await fetch(`/api/feed/dynamic?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        let items = data.items;
        if (onlyVerified) {
          items = items.filter((item: any) => item.author?.role === 'admin' || item.isVerifiedCreator);
        }

        if (isReset) {
          setFeedItems(items);
          setOffset(items.length);
        } else {
          setFeedItems(prev => {
            const existingIds = new Set(prev.map(i => i.id));
            const newItems = items.filter((i: any) => !existingIds.has(i.id));
            return [...prev, ...newItems];
          });
          setOffset(prev => prev + items.length);
        }
        setHasMore(items.length >= 10);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error('Error fetching feed:', e);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMoreItems(true);
  }, [activeTab, techFilter, difficulty, onlyVerified]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMoreItems(false);
      }
    }, { threshold: 0.1 });

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [offset, hasMore, loading]);

  const handlePollVote = async (pollId: string, optionId: string) => {
    if (votedPolls[pollId]) return;
    setVotedPolls(prev => ({ ...prev, [pollId]: optionId }));

    try {
      await votePollAction(pollId, optionId);
      setFeedItems(prev => prev.map(item => {
        if (item.feedType === 'poll' && item.id === pollId) {
          const updatedOptions = item.options.map((opt: any) => {
            if (opt.id === optionId) {
              return { ...opt, votes: [...(opt.votes || []), { userId: sessionUser?.id || 'guest' }] };
            }
            return opt;
          });
          return { ...item, options: updatedOptions };
        }
        return item;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const renderFeedCard = (item: any) => {
    switch (item.feedType) {
      case 'blog':
        return (
          <Card key={`${item.feedType}-${item.id}`} className="p-5 border border-white/5 bg-charcoal/20 hover:border-accent-cyan/30 transition-all flex flex-col justify-between h-full group relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan">
                  <FileText className="w-3 h-3" />
                  <span>Article</span>
                </span>
                <span className="text-[11px] text-stone font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {item.readingTime || '6 min'} read
                </span>
              </div>
              <h3 className="text-[15px] font-bold text-warm-white group-hover:text-accent-cyan transition-colors leading-snug">
                <Link href={`/posts/${item.slug}`}>{item.title}</Link>
              </h3>
              <p className="text-[12px] text-stone leading-relaxed line-clamp-3 font-light font-sans">
                {item.description || 'Deep architectural walkthrough of engineering standards.'}
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4 text-[11px] text-stone font-mono">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-white/10 overflow-hidden flex items-center justify-center text-[10px] text-warm-white uppercase">
                  {item.authorImage ? <img src={item.authorImage} alt={item.authorName} className="w-full h-full object-cover" /> : item.authorName?.[0] || 'U'}
                </div>
                <span>@{item.authorName || 'developer'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5 text-stone/70" /> {item.likes || 0}</span>
                <Link href={`/posts/${item.slug}`} className="text-accent-cyan hover:underline flex items-center gap-0.5">
                  Read <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </Card>
        );

      case 'project':
        return (
          <Card key={`${item.feedType}-${item.id}`} className="p-5 border border-white/5 bg-charcoal/20 hover:border-accent-violet/30 transition-all flex flex-col justify-between h-full group relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-accent-violet/10 border border-accent-violet/20 text-accent-violet">
                  <Code2 className="w-3 h-3" />
                  <span>Project</span>
                </span>
                <span className="text-[10px] text-accent-emerald font-mono font-bold tracking-wide">✓ ACTIVE</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-violet to-accent-cyan flex items-center justify-center font-extrabold text-[13px] text-white">
                  {item.title?.[0] || 'P'}
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-warm-white group-hover:text-accent-violet transition-colors leading-snug">
                    <Link href={`/projects/${item.slug}`}>{item.title}</Link>
                  </h3>
                  <span className="text-[10px] text-stone">Updated: {mounted ? new Date(item.createdAt || Date.now()).toLocaleDateString() : ''}</span>
                </div>
              </div>

              <p className="text-[12px] text-stone leading-relaxed line-clamp-3 font-light">
                {item.description || 'Open source developer system designed for visual workflows.'}
              </p>
              
              {item.techStack && item.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.techStack.slice(0, 3).map((stack: string) => (
                    <span key={stack} className="text-[9px] font-mono bg-white/5 border border-white/5 text-stone px-2 py-0.5 rounded">
                      {stack}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-white/5 mt-4">
              <div className="flex justify-between items-center text-[11px] text-stone font-mono">
                <div className="flex items-center gap-3">
                  <span>👀 {item.views || 120} views</span>
                  <span>⭐️ {item.likes || 15} stars</span>
                </div>
                <div className="flex gap-2">
                  {item.githubUrl && (
                    <a href={item.githubUrl} target="_blank" rel="noreferrer" className="p-1 rounded bg-white/5 hover:bg-white/10 text-warm-white">
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {item.demoUrl && (
                    <a href={item.demoUrl} target="_blank" rel="noreferrer" className="p-1 rounded bg-white/5 hover:bg-white/10 text-accent-cyan">
                      <LinkIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );

      case 'roadmap':
        return (
          <Card key={`${item.feedType}-${item.id}`} className="p-5 border border-white/5 bg-charcoal/20 hover:border-accent-orange/30 transition-all flex flex-col justify-between h-full group relative overflow-hidden">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-accent-orange/10 border border-accent-orange/20 text-accent-orange">
                <Compass className="w-3 h-3" />
                <span>Roadmap</span>
              </span>
              <h3 className="text-[15px] font-bold text-warm-white group-hover:text-accent-orange transition-colors leading-snug">
                {item.title}
              </h3>
              <p className="text-[12px] text-stone leading-relaxed line-clamp-3 font-light">
                {item.description || 'Step-by-step masterclass mapping to modern technology frameworks.'}
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4 text-[11px] text-stone font-mono">
              <span>📚 14 Nodes</span>
              <Link href="/learn" className="text-accent-orange hover:underline flex items-center gap-0.5">
                Explore Roadmap <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </Card>
        );

      case 'note':
        return (
          <Card key={`${item.feedType}-${item.id}`} className="p-5 border border-white/5 bg-charcoal/20 hover:border-accent-pink/30 transition-all flex flex-col justify-between h-full group relative overflow-hidden">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-accent-pink/10 border border-accent-pink/20 text-accent-pink">
                <BookMarked className="w-3 h-3" />
                <span>Study Note</span>
              </span>
              <h3 className="text-[15px] font-bold text-warm-white group-hover:text-accent-pink transition-colors leading-snug">
                {item.title}
              </h3>
              <p className="text-[12px] text-stone leading-relaxed line-clamp-2 font-light">
                Shared notes covers core system modules and cheat sheets.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4 text-[11px] text-stone font-mono">
              <span>Category: {item.category || 'General'}</span>
              <Link href={`/notes/${item.slug || item.id}`} className="text-accent-pink hover:underline flex items-center gap-0.5">
                View Notes <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </Card>
        );

      case 'discussion':
      case 'question':
        const isQuestion = item.feedType === 'question';
        return (
          <Card key={`${item.feedType}-${item.id}`} className="p-5 border border-white/5 bg-charcoal/20 hover:border-accent-violet/30 transition-all flex flex-col justify-between h-full group relative overflow-hidden">
            <div className="space-y-3">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                isQuestion 
                  ? 'bg-accent-pink/10 border-accent-pink/20 text-accent-pink' 
                  : 'bg-accent-violet/10 border-accent-violet/20 text-accent-violet'
              }`}>
                {isQuestion ? <HelpCircle className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                <span>{isQuestion ? 'Q&A' : 'Discussion'}</span>
              </span>
              <h3 className="text-[15px] font-bold text-warm-white group-hover:text-accent-violet transition-colors leading-snug">
                <Link href="/community">{item.title}</Link>
              </h3>
              <p className="text-[12px] text-stone leading-relaxed line-clamp-3 font-light">
                {item.content || 'Join the conversation.'}
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4 text-[11px] text-stone font-mono">
              <span>💬 {item.replies || 0} responses</span>
              <span>👍 {item.likes || 0} votes</span>
            </div>
          </Card>
        );

      case 'poll':
        return (
          <Card key={`${item.feedType}-${item.id}`} className="p-5 border border-white/5 bg-charcoal/20 hover:border-accent-orange/30 transition-all flex flex-col justify-between h-full group relative overflow-hidden">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-accent-orange/10 border border-accent-orange/20 text-accent-orange">
                <Vote className="w-3 h-3" />
                <span>Opinion Poll</span>
              </span>
              <h3 className="text-[15px] font-bold text-warm-white leading-snug">
                {item.question || item.title}
              </h3>
              
              <div className="space-y-2 pt-2">
                {item.options?.map((opt: any) => {
                  const totalVotes = item.options.reduce((sum: number, o: any) => sum + (o.votes?.length || 0), 0) || 1;
                  const optVotes = opt.votes?.length || 0;
                  const pct = Math.round((optVotes / totalVotes) * 100);
                  const isVoted = votedPolls[item.id] === opt.id;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handlePollVote(item.id, opt.id)}
                      disabled={!!votedPolls[item.id]}
                      className="w-full text-left p-2.5 rounded-lg bg-onyx/40 border border-white/5 hover:border-white/10 text-[12px] flex items-center justify-between relative overflow-hidden group/opt cursor-pointer transition-all"
                    >
                      <div className="absolute left-0 top-0 bottom-0 bg-accent-orange/10 -z-10 transition-all" style={{ width: `${pct}%` }} />
                      <span className="text-stone group-hover/opt:text-warm-white transition-colors">{opt.text}</span>
                      <span className="text-stone font-mono text-[10px]">{pct}%</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="pt-3 border-t border-white/5 mt-4 text-[10px] text-stone font-mono text-center">
              Click options to cast vote instantly.
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen text-warm-white font-sans max-w-7xl mx-auto pt-6 pb-24 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: NAVIGATION SIDEBAR */}
        <aside className="hidden lg:col-span-3 lg:flex flex-col gap-6 sticky top-6">
          <Card className="p-4 bg-charcoal/20 border-white/5 space-y-6">
            
            {/* Primary Nav Links */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-stone uppercase tracking-wider font-bold block px-2.5 pb-2">Portal Navigation</span>
              {[
                { name: 'Explore Home', tab: 'trending', icon: Flame, color: 'text-accent-orange' },
                { name: 'Roadmaps', tab: 'roadmaps', icon: Compass, color: 'text-accent-cyan' },
                { name: 'Featured Projects', tab: 'projects', icon: Code2, color: 'text-accent-violet' },
                { name: 'Study Notes', tab: 'study_notes', icon: BookMarked, color: 'text-accent-pink' },
                { name: 'Q&As / Forum', tab: 'discussions', icon: MessageSquare, color: 'text-accent-emerald' }
              ].map(item => (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-left cursor-pointer transition-colors ${
                    activeTab === item.tab ? 'bg-white/10 text-warm-white font-bold' : 'text-stone hover:text-warm-white'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>

            {/* Sub-Communities Hub list */}
            <div className="space-y-2 border-t border-white/5 pt-4">
              <span className="text-[10px] font-mono text-stone uppercase tracking-wider font-bold block px-2.5">Sub-Communities</span>
              <div className="grid grid-cols-1 gap-1">
                {communities.map(c => (
                  <Link key={c.slug} href={`/community?slug=${c.slug}`} className="block">
                    <div className="px-3 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 flex items-center justify-between text-left group">
                      <div>
                        <span className="text-[12.5px] text-stone group-hover:text-warm-white font-bold transition-colors">#{c.name}</span>
                        <p className="text-[10.5px] text-stone/40 group-hover:text-stone/60 font-light truncate max-w-[170px] mt-0.5">{c.desc}</p>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-stone/30 group-hover:text-accent-cyan group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* User Profile Summary */}
            {sessionUser ? (
              <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                <Link href="/profile" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-full bg-accent-cyan/10 flex items-center justify-center text-[12px] font-extrabold uppercase text-accent-cyan">
                    {sessionUser.name?.[0] || 'U'}
                  </div>
                  <div>
                    <span className="text-[12.5px] text-stone group-hover:text-warm-white font-bold block leading-none">{sessionUser.name}</span>
                    <span className="text-[10px] text-stone/40 font-mono">@{sessionUser.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'developer'}</span>
                  </div>
                </Link>
                <Link href="/studio">
                  <Button variant="ghost" className="h-7 text-[10px] px-2 bg-white/5">Studio</Button>
                </Link>
              </div>
            ) : (
              <div className="border-t border-white/5 pt-4 text-center">
                <Link href="/login">
                  <Button variant="primary" className="w-full text-[11px] uppercase tracking-wider">Join Platform</Button>
                </Link>
              </div>
            )}
          </Card>
          
          <div className="text-[10.5px] text-stone/30 px-4 font-mono leading-relaxed">
            © 2026 Developer Community Platform. Built for scale.
          </div>
        </aside>

        {/* CENTER COLUMN: WELCOMING HERO & CONTENT FEED */}
        <main className="col-span-1 lg:col-span-6 space-y-6">
          
          {/* Learn -> Build -> Share -> Grow Cinematic Welcome Banner */}
          <div className="relative rounded-2xl border border-white/5 bg-charcoal/10 overflow-hidden p-6 md:p-8 flex flex-col justify-between min-h-[220px] shadow-premium">
            <div className="absolute inset-0 bg-gradient-to-tr from-accent-cyan/5 via-transparent to-accent-violet/5 -z-10" />
            
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-accent-cyan font-extrabold tracking-[0.2em] uppercase">Ecosystem Platform</span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-warm-white">
                Learn <span className="text-stone/40 font-normal">→</span> Build <span className="text-stone/40 font-normal">→</span> Share <span className="text-stone/40 font-normal">→</span> Grow
              </h1>
              <p className="text-[12.5px] text-stone font-light max-w-md leading-relaxed">
                Connect with developer peers. Showcase your project portfolios, publish learning roadmaps, solve technical Q&As, and master modern stacks together.
              </p>
            </div>

            <div className="flex gap-6 mt-6 flex-wrap">
              <div className="flex items-center gap-1.5 text-[12px] text-stone">
                <BookOpenCheck className="w-4 h-4 text-accent-cyan" />
                <span>Interactive Roadmaps</span>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-stone">
                <Code2 className="w-4 h-4 text-accent-violet" />
                <span>Project Portfolios</span>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-stone">
                <Users className="w-4 h-4 text-accent-orange" />
                <span>Developer Forums</span>
              </div>
            </div>
          </div>

          {/* Dynamic Feed tabs & Sort panel */}
          <div className="flex flex-col gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center justify-between">
              {/* Specialized Feeds Slider */}
              <div className="flex overflow-x-auto gap-1.5 p-0.5 bg-charcoal/30 border border-white/5 rounded-xl text-[12px] custom-scrollbar no-scrollbar scroll-smooth">
                {[
                  { id: 'trending', label: '🔥 Trending' },
                  { id: 'latest', label: '📚 Latest' },
                  { id: 'following', label: '👥 Following' },
                  { id: 'projects', label: '🚀 Projects' },
                  { id: 'articles', label: '✍️ Articles' },
                  { id: 'roadmaps', label: '🧠 Roadmaps' },
                  { id: 'study_notes', label: '📖 Notes' },
                  { id: 'discussions', label: '💬 Forums' },
                  { id: 'open_source', label: '🐙 Open Source' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === t.id ? 'bg-white/10 text-warm-white font-bold' : 'text-stone hover:text-warm-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick tag lookup chips */}
            {tags.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[11px] text-stone shrink-0">Tags:</span>
                {tags.slice(0, 8).map((t: any) => (
                  <button
                    key={t.id}
                    onClick={() => setTechFilter(techFilter === t.name ? '' : t.name)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono border transition-all cursor-pointer ${
                      techFilter === t.name 
                        ? 'bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan font-bold' 
                        : 'bg-white/5 border-white/5 text-stone hover:text-warm-white'
                    }`}
                  >
                    #{t.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cards feed grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedItems.length > 0 ? (
              feedItems.map(item => renderFeedCard(item))
            ) : (
              <div className="col-span-2 py-16 text-center text-stone/30 font-light text-[13px] border border-dashed border-white/5 rounded-2xl bg-charcoal/10">
                No active publications found matching this filter tab.
              </div>
            )}
          </div>

          {/* Sentinel for infinite scroll */}
          {hasMore && (
            <div ref={sentinelRef} className="py-6 flex justify-center">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 border-2 border-accent-cyan border-t-transparent rounded-full"
              />
            </div>
          )}
        </main>

        {/* RIGHT COLUMN: LEADERBOARD & ENGAGEMENT */}
        <aside className="hidden lg:col-span-3 lg:flex flex-col gap-6 sticky top-6">
          
          {/* User Streak & Level Progress */}
          {sessionUser && (
            <Card className="p-4 bg-charcoal/20 border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-5 h-5 text-accent-orange animate-pulse" />
                  <span className="text-[13px] font-bold text-warm-white">Streak Master</span>
                </div>
                <span className="text-[11px] text-accent-orange font-bold font-mono">4 Days Daily Goal</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-stone font-mono">
                  <span>Level 4 Ranks</span>
                  <span>1240 / 1500 XP</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-accent-cyan to-accent-violet rounded-full" style={{ width: '82%' }} />
                </div>
              </div>
            </Card>
          )}

          {/* Top Contributors Leaderboard */}
          <Card className="p-4 bg-charcoal/20 border-white/5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-accent-orange" />
                <span className="text-[12px] font-bold uppercase tracking-wider text-warm-white">Top Contributors</span>
              </div>
              <span className="text-[9px] font-mono text-stone">Rep points</span>
            </div>

            <div className="space-y-3">
              {contributors.map((c, idx) => (
                <div key={c.username} className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <span className="w-4 text-[10px] font-mono text-stone font-bold">#{idx + 1}</span>
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-warm-white uppercase">
                      {c.name[0]}
                    </div>
                    <div>
                      <span className="text-stone hover:text-warm-white font-medium block truncate max-w-[110px] leading-tight">
                        {c.name}
                      </span>
                      <span className="text-[9px] text-stone/40 block leading-none">@{c.username}</span>
                    </div>
                  </div>
                  <span className="font-mono text-accent-cyan font-bold">{c.rep}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming Community Events */}
          <Card className="p-4 bg-charcoal/20 border-white/5 space-y-4">
            <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Calendar className="w-4 h-4 text-accent-cyan" />
              <span className="text-[12px] font-bold uppercase tracking-wider text-warm-white">Community Events</span>
            </div>

            <div className="space-y-3.5">
              {events.map(ev => (
                <div key={ev.title} className="space-y-1">
                  <span className="text-[8px] font-bold uppercase tracking-wider bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan px-2 py-0.5 rounded-full inline-block">
                    {ev.type}
                  </span>
                  <h4 className="text-[12.5px] font-bold text-warm-white leading-tight hover:underline cursor-pointer">
                    {ev.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10.5px] text-stone/50 font-mono mt-1">
                    <span>{ev.date}</span>
                    <span>By: {ev.organizer.split(' ')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Technology filter selector */}
          <Card className="p-4 bg-charcoal/20 border-white/5 space-y-3">
            <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Layers className="w-4 h-4 text-accent-violet" />
              <span className="text-[12px] font-bold uppercase tracking-wider text-warm-white">Explore Difficulty</span>
            </div>
            
            <div className="flex flex-col gap-1.5 text-[12.5px]">
              {[
                { id: '', label: 'All Levels' },
                { id: 'Beginner', label: '🟢 Beginner' },
                { id: 'Intermediate', label: '🟡 Intermediate' },
                { id: 'Advanced', label: '🔴 Advanced' }
              ].map(level => (
                <button
                  key={level.id}
                  onClick={() => setDifficulty(level.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    difficulty === level.id ? 'bg-white/10 font-bold text-warm-white' : 'text-stone hover:text-warm-white hover:bg-white/5'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </Card>

        </aside>

      </div>
    </div>
  );
}

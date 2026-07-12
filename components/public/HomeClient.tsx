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
  Mail,
  Check,
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
  Inbox,
  HelpCircle,
  MessageSquare,
  Vote,
  ShieldCheck,
  Download,
  Eye,
  SlidersHorizontal,
  Loader2,
  CheckCircle2
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
  // Feed Filtering & Pagination States
  const [contentType, setContentType] = useState('all');
  const [techFilter, setTechFilter] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'most_viewed' | 'most_saved'>('trending');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [feedItems, setFeedItems] = useState<any[]>(initialFeed);
  const [offset, setOffset] = useState(initialFeed.length);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Poll voting helper state
  const [votedPolls, setVotedPolls] = useState<Record<string, string>>({});

  // Intersection observer ref
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Load items from dynamic API
  const loadMoreItems = async (isReset = false) => {
    if (loading) return;
    setLoading(true);
    const currentOffset = isReset ? 0 : offset;
    try {
      const params = new URLSearchParams({
        type: contentType,
        sortBy,
        limit: '10',
        offset: currentOffset.toString(),
      });
      if (techFilter) params.append('technology', techFilter);
      if (difficulty) params.append('difficulty', difficulty);
      if (searchQuery) params.append('technology', searchQuery); // searches tag or technology matching query

      const res = await fetch(`/api/feed/dynamic?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        let items = data.items;
        if (onlyVerified) {
          items = items.filter((item: any) => item.author?.role === 'admin' || item.organizer?.isVerified || item.isVerifiedCreator);
        }

        if (isReset) {
          setFeedItems(items);
          setOffset(items.length);
        } else {
          setFeedItems(prev => {
            // filter duplicates
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

  // Reset and reload when filters change
  useEffect(() => {
    loadMoreItems(true);
  }, [contentType, techFilter, difficulty, sortBy, onlyVerified]);

  // Observer trigger for infinite scroll
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

  // Formatter helpers
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Poll Vote Handler
  const handlePollVote = async (pollId: string, optionId: string) => {
    if (votedPolls[pollId]) return;
    setVotedPolls(prev => ({ ...prev, pollId: optionId }));

    try {
      await votePollAction(pollId, optionId);
      // Refresh feed item state locally
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

  // RENDER DYNAMIC CARD PER TYPE
  const renderFeedCard = (item: any) => {
    switch (item.feedType) {
      case 'blog':
        return (
          <Card key={item.id} className="p-6 border-white/5 bg-charcoal/20 hover:border-accent-cyan/30 transition-all flex flex-col justify-between h-full group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-cyan/[0.01] rounded-bl-full group-hover:bg-accent-cyan/[0.03] transition-colors" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan">
                  <FileText className="w-3 h-3" />
                  <span>Blog</span>
                </span>
                <span className="text-[11px] text-stone font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {item.readingTime || '5 min'} read
                </span>
              </div>
              <h3 className="text-[16px] font-bold text-warm-white group-hover:text-accent-cyan transition-colors leading-snug">
                <Link href={`/posts/${item.slug}`}>{item.title}</Link>
              </h3>
              <p className="text-[12px] text-stone leading-relaxed line-clamp-3 font-light font-sans">
                {item.description}
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4 text-[11px] text-stone font-mono">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-white/10 overflow-hidden flex items-center justify-center text-[10px]">
                  {item.authorImage ? <img src={item.authorImage} alt={item.authorName} className="w-full h-full object-cover" /> : <User className="w-3 h-3" />}
                </div>
                <span>@{item.authorName || 'system'}</span>
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
          <Card key={item.id} className="p-6 border-white/5 bg-charcoal/20 hover:border-accent-violet/30 transition-all flex flex-col justify-between h-full group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-violet/[0.01] rounded-bl-full group-hover:bg-accent-violet/[0.03] transition-colors" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-accent-violet/10 border border-accent-violet/20 text-accent-violet">
                  <Code2 className="w-3 h-3" />
                  <span>Project</span>
                </span>
                <span className="text-[10px] text-accent-emerald font-mono font-bold tracking-wide">✓ ACTIVE</span>
              </div>
              <h3 className="text-[16px] font-bold text-warm-white group-hover:text-accent-violet transition-colors leading-snug">
                <Link href={`/projects/${item.slug}`}>{item.title}</Link>
              </h3>
              <p className="text-[12px] text-stone leading-relaxed line-clamp-3 font-light">
                {item.description}
              </p>
              {item.techStack && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.techStack.slice(0, 3).map((tech: string, i: number) => (
                    <span key={i} className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded text-stone">
                      {tech}
                    </span>
                  ))}
                  {item.techStack.length > 3 && (
                    <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded text-stone">
                      +{item.techStack.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4 text-[11px] text-stone font-mono">
              <div className="flex items-center gap-3">
                {item.githubUrl && (
                  <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-warm-white flex items-center gap-0.5">
                    GitHub
                  </a>
                )}
                {item.demoUrl && (
                  <a href={item.demoUrl} target="_blank" rel="noopener noreferrer" className="hover:text-warm-white flex items-center gap-0.5 text-accent-cyan">
                    Live Demo <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {item.views || 0}</span>
                <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {item.likes || 0}</span>
              </div>
            </div>
          </Card>
        );

      case 'note':
        return (
          <Card key={item.id} className="p-6 border-white/5 bg-charcoal/20 hover:border-accent-amber/30 transition-all flex flex-col justify-between h-full group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-amber/[0.01] rounded-bl-full group-hover:bg-accent-amber/[0.03] transition-colors" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-accent-amber/10 border border-accent-amber/20 text-accent-amber">
                  <BookMarked className="w-3 h-3" />
                  <span>Notes</span>
                </span>
                <span className="text-[10px] text-stone font-mono bg-white/5 px-2 py-0.5 rounded">
                  {item.fileType || 'PDF'} • {formatBytes(item.fileSize || 0)}
                </span>
              </div>
              <h3 className="text-[16px] font-bold text-warm-white group-hover:text-accent-amber transition-colors leading-snug">
                <Link href={`/notes/${item.slug}`}>{item.title}</Link>
              </h3>
              <p className="text-[12px] text-stone leading-relaxed line-clamp-3 font-light">
                {item.description}
              </p>
              {item.university && (
                <div className="text-[10.5px] text-stone/70 font-sans border-l-2 border-accent-amber/30 pl-2 py-0.5">
                  <span className="font-semibold">{item.university}</span> • Sem {item.semester}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4 text-[11px] text-stone font-mono">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-white/10 overflow-hidden flex items-center justify-center text-[10px]">
                  <User className="w-3 h-3" />
                </div>
                <span>@{item.authorName || 'creator'}</span>
              </div>
              <div className="flex items-center gap-3">
                <a href={item.fileUrl} download className="hover:text-accent-amber flex items-center gap-0.5">
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
                <Link href={`/notes/${item.slug}`} className="text-accent-amber hover:underline">
                  Preview
                </Link>
              </div>
            </div>
          </Card>
        );

      case 'discussion':
      case 'question':
        const isQ = item.feedType === 'question' || item.isQuestion;
        return (
          <Card key={item.id} className="p-6 border-white/5 bg-charcoal/20 hover:border-accent-pink/30 transition-all flex flex-col justify-between h-full group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-pink/[0.01] rounded-bl-full group-hover:bg-accent-pink/[0.03] transition-colors" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider 
                  ${isQ ? 'bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan' : 'bg-accent-pink/10 border-accent-pink/20 text-accent-pink'}`}>
                  {isQ ? <HelpCircle className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                  <span>{isQ ? 'Question' : 'Discussion'}</span>
                </span>
                {item.acceptedAnswerId && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 px-2 py-0.5 rounded font-mono">
                    <CheckCircle2 className="w-3 h-3" /> RESOLVED
                  </span>
                )}
              </div>
              <h3 className="text-[16px] font-bold text-warm-white group-hover:text-accent-pink transition-colors leading-snug">
                <Link href={`/discussions/${item.slug}`}>{item.title}</Link>
              </h3>
              <p className="text-[12px] text-stone leading-relaxed line-clamp-3 font-light">
                {item.content}
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4 text-[11px] text-stone font-mono">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-white/10 overflow-hidden flex items-center justify-center text-[10px]">
                  <User className="w-3 h-3" />
                </div>
                <span>@{item.authorName || 'developer'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {item.likes || 0}</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {item.replies || 0} answers</span>
                <Link href={`/discussions/${item.slug}`} className="text-accent-pink hover:underline">
                  Join →
                </Link>
              </div>
            </div>
          </Card>
        );

      case 'poll':
        const totalPollVotes = item.options?.reduce((sum: number, o: any) => sum + (o.votes?.length || 0), 0) || 0;
        const hasVoted = !!votedPolls[item.id];

        return (
          <Card key={item.id} className="p-6 border-white/5 bg-charcoal/20 hover:border-accent-orange/30 transition-all flex flex-col justify-between h-full group relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-accent-orange/10 border border-accent-orange/20 text-accent-orange">
                  <Vote className="w-3 h-3" />
                  <span>Opinion Poll</span>
                </span>
                <span className="text-[10px] text-stone font-mono">
                  {totalPollVotes} votes
                </span>
              </div>
              <h3 className="text-[15px] font-bold text-warm-white leading-snug">
                {item.title}
              </h3>

              <div className="space-y-2.5 pt-1">
                {item.options?.map((opt: any) => {
                  const optVotes = opt.votes?.length || 0;
                  const pct = totalPollVotes > 0 ? Math.round((optVotes / totalPollVotes) * 100) : 0;
                  return (
                    <button
                      key={opt.id}
                      disabled={hasVoted}
                      onClick={() => handlePollVote(item.id, opt.id)}
                      className={`w-full relative p-3 rounded-lg border text-left text-[12px] overflow-hidden transition-all flex justify-between items-center
                        ${hasVoted
                          ? 'bg-charcoal/20 border-white/5 text-stone cursor-default'
                          : 'bg-charcoal/30 border-white/5 text-warm-white hover:border-white/10 hover:bg-charcoal/50 cursor-pointer'}`}
                    >
                      {hasVoted && (
                        <div
                          style={{ width: `${pct}%` }}
                          className="absolute left-0 top-0 bottom-0 bg-accent-orange/10 pointer-events-none transition-all duration-500"
                        />
                      )}
                      <span className="relative z-10 font-medium">{opt.text}</span>
                      <span className="relative z-10 font-mono text-[11px] font-bold">
                        {hasVoted ? `${pct}%` : 'Vote'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4 text-[10.5px] text-stone font-mono">
              <span>Category: {item.category}</span>
              <span>Expires {new Date(item.expiresAt).toLocaleDateString()}</span>
            </div>
          </Card>
        );

      case 'event':
        const daysLeft = Math.max(0, Math.ceil((new Date(item.deadlineAt).getTime() - Date.now()) / (1000 * 3600 * 24)));
        return (
          <Card key={item.id} className="p-0 border-white/5 bg-charcoal/20 hover:border-accent-pink/30 transition-all flex flex-col justify-between h-full group relative overflow-hidden">
            {item.banner && (
              <div className="w-full h-32 overflow-hidden relative">
                <img src={item.banner} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-accent-pink border border-accent-pink/20 text-white shadow-lg">
                  <Calendar className="w-3 h-3" />
                  <span>Event</span>
                </div>
              </div>
            )}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] text-stone font-mono">
                  <span className="uppercase text-accent-pink font-bold">{item.eventType || 'Hackathon'}</span>
                  <span>{daysLeft} days to register</span>
                </div>
                <h3 className="text-[15px] font-bold text-warm-white group-hover:text-accent-pink transition-colors leading-snug">
                  <Link href={`/events/${item.slug}`}>{item.title}</Link>
                </h3>
                <p className="text-[12px] text-stone leading-relaxed line-clamp-2 font-light">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between text-[11px] text-stone font-mono">
                <span>Team: {item.minTeamSize}-{item.maxTeamSize} members</span>
                <Link href={`/events/${item.slug}`} className="inline-flex items-center gap-1 text-accent-pink hover:underline">
                  Register <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </Card>
        );

      case 'resource':
        return (
          <Card key={item.id} className="p-6 border-white/5 bg-charcoal/20 hover:border-accent-cyan/30 transition-all flex flex-col justify-between h-full group relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-accent-cyan/15 border border-accent-cyan/20 text-accent-cyan">
                  <Compass className="w-3 h-3" />
                  <span>Resource</span>
                </span>
                {item.difficulty && (
                  <span className="text-[9.5px] font-mono border border-white/10 px-1.5 py-0.25 rounded text-stone">
                    {item.difficulty}
                  </span>
                )}
              </div>
              <h3 className="text-[15px] font-bold text-warm-white leading-snug hover:underline">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                  {item.title} <ExternalLink className="w-3.5 h-3.5 text-stone" />
                </a>
              </h3>
              <p className="text-[12px] text-stone leading-relaxed line-clamp-3 font-light">
                {item.description}
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4 text-[11px] text-stone font-mono">
              <span>Tech: {item.technology || 'General'}</span>
              <button className="flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/5 px-2.5 py-1 rounded text-stone hover:text-warm-white transition-colors">
                <ThumbsUp className="w-3 h-3" /> Upvote ({item.upvotes || 0})
              </button>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-10 pb-16 font-sans">

      {/* 1. Welcoming Hero Banner / Dynamic Dashboard */}
      {sessionUser ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-6 rounded-2xl bg-charcoal/20 border border-white/5 relative overflow-hidden"
        >
          <div className="absolute inset-0 grid-background opacity-20 pointer-events-none" />
          <div className="flex gap-4 items-center relative z-10">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0">
              <img src={sessionUser.image || sessionUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} alt={sessionUser.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-warm-white">Welcome back, {sessionUser.name}!</h2>
              <span className="text-[11px] text-stone block font-mono">Developer OS Dashboard • active session</span>
            </div>
          </div>

          <div className="flex items-center gap-6 relative z-10 text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-accent-pink animate-pulse" />
              <div>
                <span className="text-warm-white block font-bold">5 Days</span>
                <span className="text-[9px] text-stone uppercase font-bold tracking-wider">Streak</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent-amber" />
              <div>
                <span className="text-warm-white block font-bold">Top 5%</span>
                <span className="text-[9px] text-stone uppercase font-bold tracking-wider">Leaderboard</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-accent-cyan" />
              <div>
                <span className="text-warm-white block font-bold">92/100</span>
                <span className="text-[9px] text-stone uppercase font-bold tracking-wider">Contribution</span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="text-center space-y-4 pt-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan">
            <Sparkles className="w-3.5 h-3.5" />
            <span>StudyMaterial v4</span>
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-warm-white leading-tight">
            Discovery Feed
          </h1>
          <p className="text-[13.5px] text-stone leading-relaxed max-w-xl mx-auto font-light">
            An intelligent mixed feed for modern engineers. Discover blogs, repositories, study notes, event updates, and cast votes.
          </p>
        </div>
      )}

      {/* 2. Unified Content Filters & Action Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Filter Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-5 border-white/5 bg-charcoal/20 space-y-6">

            {/* Feed Section Tabs */}
            <div className="space-y-2">
              <span className="text-[9.5px] font-mono text-stone uppercase font-bold tracking-wider block">Content Channels</span>
              <div className="flex flex-col gap-1 text-[12px]">
                {[
                  { id: 'all', label: 'All Content', icon: Layers },
                  { id: 'blog', label: 'Technical Blogs', icon: FileText },
                  { id: 'project', label: 'Code Projects', icon: Code2 },
                  { id: 'note', label: 'Study Notes', icon: BookMarked },
                  { id: 'discussion', label: 'Forums & Discussions', icon: Users },
                  { id: 'question', label: 'Resolved Q&As', icon: HelpCircle },
                  { id: 'poll', label: 'Opinion Polls', icon: Vote },
                  { id: 'event', label: 'Developer Events', icon: Calendar },
                  { id: 'resource', label: 'Shared Resources', icon: Compass }
                ].map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setContentType(t.id)}
                      className={`w-full px-3 py-2 rounded-lg flex items-center justify-between transition-colors text-left cursor-pointer
                        ${contentType === t.id ? 'bg-white/10 text-warm-white font-bold' : 'text-stone hover:text-warm-white hover:bg-white/[0.02]'}`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{t.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sorting */}
            <div className="space-y-2 pt-4 border-t border-white/5">
              <span className="text-[9.5px] font-mono text-stone uppercase font-bold tracking-wider block">Sort By</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full bg-charcoal/30 border border-white/5 rounded-lg p-2 text-[12px] text-stone outline-none cursor-pointer focus:border-white/10"
              >
                <option value="trending">Trending Index</option>
                <option value="latest">Latest Releases</option>
                <option value="most_viewed">Total Views</option>
                <option value="most_saved">Saved / Bookmarked</option>
              </select>
            </div>

            {/* Advanced Metadata Filters */}
            <div className="space-y-3 pt-4 border-t border-white/5 text-[12px]">
              <span className="text-[9.5px] font-mono text-stone uppercase font-bold tracking-wider block">Refine Feed</span>

              {/* Tech Select */}
              <div className="space-y-1">
                <label className="text-[10px] text-stone/70 font-mono">Technology</label>
                <select
                  value={techFilter}
                  onChange={(e) => setTechFilter(e.target.value)}
                  className="w-full bg-charcoal/30 border border-white/5 rounded-lg p-2 text-stone outline-none cursor-pointer"
                >
                  <option value="">All Tech Stacks</option>
                  <option value="React">React / Next.js</option>
                  <option value="TypeScript">TypeScript</option>
                  <option value="CSS">CSS / Tailwind</option>
                  <option value="Backend">Node.js / APIs</option>
                  <option value="Systems">Operating Systems</option>
                  <option value="Database">Prisma / SQL</option>
                </select>
              </div>

              {/* Difficulty */}
              <div className="space-y-1">
                <label className="text-[10px] text-stone/70 font-mono">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-charcoal/30 border border-white/5 rounded-lg p-2 text-stone outline-none cursor-pointer"
                >
                  <option value="">Any Level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Verified Toggle */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-stone font-mono flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-accent-cyan" /> Verified Creator
                </span>
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="w-4 h-4 accent-accent-cyan cursor-pointer"
                />
              </div>
            </div>

          </Card>

          {/* Quick Shortcuts / Action list */}
          <div className="hidden lg:block space-y-4">
            <span className="text-[10px] font-mono text-stone uppercase font-bold tracking-widest pl-2">Platform Actions</span>
            <div className="grid grid-cols-1 gap-2.5">
              <Link href="/notes/upload" className="w-full text-left">
                <Button variant="secondary" className="w-full justify-start text-[11px] py-2 px-3 border-white/5 bg-charcoal/20">
                  <Plus className="w-4 h-4 text-accent-cyan" />
                  <span>Upload Note Documents</span>
                </Button>
              </Link>
              <Link href="/discussions/create" className="w-full text-left">
                <Button variant="secondary" className="w-full justify-start text-[11px] py-2 px-3 border-white/5 bg-charcoal/20">
                  <Plus className="w-4 h-4 text-accent-pink" />
                  <span>Ask a Question</span>
                </Button>
              </Link>
              <Link href="/community" className="w-full text-left">
                <Button variant="secondary" className="w-full justify-start text-[11px] py-2 px-3 border-white/5 bg-charcoal/20">
                  <Compass className="w-4 h-4 text-accent-amber" />
                  <span>Create Poll or Event</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Main Feed List */}
        <div className="lg:col-span-9 space-y-6">

          {/* Feed Header info & search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="text-[12px] font-mono text-stone pl-1">
              Showing <span className="text-warm-white font-bold">{feedItems.length}</span> discovery nodes
            </div>

            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone" />
              <input
                type="text"
                placeholder="Search technologies, tags, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-charcoal/20 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-[12px] text-warm-white outline-none focus:border-white/10 placeholder:text-stone/40"
              />
            </div>
          </div>

          {/* Feed Items Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {feedItems.map(item => (
                <motion.div
                  key={item.id}
                  layoutId={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderFeedCard(item)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Skeletons while loading */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="h-[200px] border border-white/5 bg-white/[0.01] rounded-2xl animate-pulse p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="w-16 h-4 bg-white/5 rounded" />
                    <div className="w-20 h-4 bg-white/5 rounded" />
                  </div>
                  <div className="w-3/4 h-6 bg-white/5 rounded" />
                  <div className="space-y-2">
                    <div className="w-full h-4 bg-white/5 rounded" />
                    <div className="w-5/6 h-4 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && feedItems.length === 0 && (
            <Card className="w-full py-20 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-white/5 bg-charcoal/10">
              <Inbox className="w-12 h-12 text-stone/30" />
              <div className="space-y-1">
                <h4 className="text-[15px] font-bold text-warm-white">No content discovered</h4>
                <p className="text-[12px] text-stone max-w-sm font-light">Try adjusting your filters or search keywords to discover platform elements.</p>
              </div>
              <Button variant="primary" onClick={() => { setContentType('all'); setTechFilter(''); setDifficulty(''); setSearchQuery(''); }} className="text-[11px] py-1.5 px-4 font-bold">
                Reset All Filters
              </Button>
            </Card>
          )}

          {/* Intersection Observer Sentinel */}
          {hasMore && (
            <div ref={sentinelRef} className="h-10 flex items-center justify-center">
              {loading && <Loader2 className="w-6 h-6 animate-spin text-accent-cyan" />}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

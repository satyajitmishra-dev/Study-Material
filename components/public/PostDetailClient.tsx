'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  BookOpen, 
  ThumbsUp, 
  Bookmark, 
  Share2, 
  Copy, 
  Flag, 
  MessageSquare,
  AlertTriangle,
  FolderPlus,
  Highlighter,
  MessageCircle,
  CornerDownRight,
  Trash2,
  Edit2,
  Check,
  Play,
  ChevronDown,
  Settings,
  Maximize2,
  Minimize2,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components/ui/core';
import TipTapRenderer from '@/components/ui/TipTapRenderer';
import { 
  reactToPostAction, 
  bookmarkPostAction, 
  submitCommentAction, 
  saveHighlightAction, 
  saveNoteAction,
  submitSpamReportAction,
  logShareEventAction
} from '@/lib/actions/public';

interface PostDetailClientProps {
  post: any;
  comments: any[];
  sessionUser: any;
  series: any;
  relatedPosts: any[];
}

export default function PostDetailClient({ 
  post, 
  comments: initialComments, 
  sessionUser, 
  series,
  relatedPosts 
}: PostDetailClientProps) {
  const router = useRouter();
  const [visitorId, setVisitorId] = useState('');
  
  // Engagement status states
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [reactionType, setReactionType] = useState<string | null>(null);
  const [likesCount, setLikesCount] = useState(post.views / 10);
  const [bookmarksCount, setBookmarksCount] = useState(12);

  // Comments state
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<any[]>(initialComments);
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Scroll Progress & Heading Observer
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeHeadingId, setActiveHeadingId] = useState('');
  const [readingTimeRemaining, setReadingTimeRemaining] = useState(5);

  // Reader Settings States
  const [showSettings, setShowSettings] = useState(false);
  const [readerTheme, setReaderTheme] = useState<'dark' | 'light' | 'sepia' | 'contrast'>('dark');
  const [readerFont, setReaderFont] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [readerFontSize, setReaderFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [readerLineHeight, setReaderLineHeight] = useState<'tight' | 'normal' | 'loose'>('normal');
  const [readerColumnWidth, setReaderColumnWidth] = useState<'narrow' | 'medium' | 'wide' | 'full'>('medium');
  const [focusMode, setFocusMode] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [copyProtectionActive, setCopyProtectionActive] = useState(false);

  // Kindle Highlights Tooltip
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [highlightColor, setHighlightColor] = useState('yellow');
  const [noteContent, setNoteContent] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  
  // General UI Feedback
  const [copiedLink, setCopiedLink] = useState(false);
  const [reported, setReported] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Parse TipTap JSON schema to extract Table of Contents headings (H2, H3, H4)
  const extractedToc = useMemo(() => {
    if (!post.content) return [];
    try {
      const parsed = JSON.parse(post.content);
      const headings: { id: string; text: string; level: number }[] = [];
      
      const findHeadings = (node: any) => {
        if (node.type === 'heading' && node.content) {
          const text = node.content.map((c: any) => c.text || '').join('');
          const level = node.attrs?.level || 1;
          // Only index H2, H3, and H4 headings in the TOC tree
          if (level >= 2 && level <= 4) {
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            headings.push({ id, text, level });
          }
        }
        if (node.content && Array.isArray(node.content)) {
          node.content.forEach(findHeadings);
        }
      };

      findHeadings(parsed);
      return headings;
    } catch {
      // Fallback
      return [];
    }
  }, [post.content]);

  // Set visitor ID and scroll observer
  useEffect(() => {
    let vid = localStorage.getItem('sm_visitor_id');
    if (!vid) {
      vid = `vis_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
      localStorage.setItem('sm_visitor_id', vid);
    }
    setVisitorId(vid);

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(progress, 100));

        // Dynamically compute remaining reading time
        const totalReadingTime = Math.max(1, Math.ceil((post.content?.length || 1000) / 1500));
        const remaining = Math.max(0, Math.ceil(totalReadingTime * (1 - progress / 100)));
        setReadingTimeRemaining(remaining);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post.content]);

  // Intersect observe headings to highlight active TOC sidebar link
  useEffect(() => {
    const headings = document.querySelectorAll('.tiptap-renderer h2, .tiptap-renderer h3, .tiptap-renderer h4');
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) {
          setActiveHeadingId(visible.target.id);
        }
      },
      { rootMargin: '0px 0px -60% 0px', threshold: 0.1 }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [htmlContentLoadedTrigger()]);

  // Trick to reload intersection observer once html generated in TipTapRenderer has mounted
  function htmlContentLoadedTrigger() {
    return post.content;
  }

  // Text selection listener for Kindle Highlights
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setTooltip(null);
      setShowNoteForm(false);
      return;
    }
    const text = selection.toString().trim();
    if (text.length > 4) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setTooltip({
        text,
        x: rect.left + window.scrollX + rect.width / 2,
        y: rect.top + window.scrollY - 50
      });
    }
  };

  // Trigger Toast Notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Reactions
  const handleReaction = async (type: string) => {
    const res = await reactToPostAction(post.id, type, visitorId);
    if (res.success) {
      if (res.reacted) {
        setReactionType(type);
        setLikesCount(prev => prev + 1);
        triggerToast(`You reacted with ${type}!`);
      } else {
        setReactionType(null);
        setLikesCount(prev => Math.max(0, prev - 1));
        triggerToast(`Removed reaction`);
      }
    }
  };

  // Bookmark
  const handleBookmark = async () => {
    const res = await bookmarkPostAction(post.id, undefined, visitorId);
    if (res.success) {
      setIsBookmarked(!!res.bookmarked);
      setBookmarksCount(prev => res.bookmarked ? prev + 1 : Math.max(0, prev - 1));
      triggerToast(res.bookmarked ? 'Article bookmarked!' : 'Removed from bookmarks');
    }
  };

  // Highlight selection
  const handleHighlightCreate = async (color: string) => {
    if (!tooltip) return;
    const res = await saveHighlightAction(post.id, tooltip.text, color, visitorId);
    if (res.success && res.highlight) {
      if (noteContent.trim()) {
        await saveNoteAction(post.id, res.highlight.id, noteContent, true, visitorId);
      }
      triggerToast(`Highlight saved successfully!`);
      setTooltip(null);
      setNoteContent('');
      setShowNoteForm(false);
    }
  };

  // Copy Link
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    triggerToast('Share link copied to clipboard!');
    logShareEventAction(post.id, 'copy_link', visitorId);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Comments submit
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionUser) {
      router.push('/login');
      return;
    }
    if (!commentText.trim()) return;

    const res = await submitCommentAction(post.id, commentText, undefined, visitorId);
    if (res.success && res.comment) {
      setCommentsList(prev => [
        {
          id: res.comment!.id,
          content: commentText,
          createdAt: new Date(),
          likesCount: 0,
          user: {
            name: sessionUser.name,
            avatar: sessionUser.avatar || null
          },
          replies: []
        },
        ...prev
      ]);
      setCommentText('');
      triggerToast('Comment published!');
    } else {
      triggerToast(res.error || 'Failed to submit comment');
    }
  };

  // Reply submit
  const handleAddReply = async (commentId: string) => {
    if (!sessionUser) {
      router.push('/login');
      return;
    }
    if (!replyText.trim()) return;

    const res = await submitCommentAction(post.id, replyText, commentId, visitorId);
    if (res.success && res.reply) {
      setCommentsList(prev => prev.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: [
              ...c.replies,
              {
                id: res.reply!.id,
                content: replyText,
                createdAt: new Date(),
                user: {
                  name: sessionUser.name,
                  avatar: sessionUser.avatar || null
                }
              }
            ]
          };
        }
        return c;
      }));
      setReplyText('');
      setReplyTarget(null);
      triggerToast('Reply published!');
    }
  };

  // Computed totals
  const wordCount = post.content ? post.content.split(/\s+/).filter(Boolean).length : 500;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className={`w-full space-y-12 relative select-text`} onMouseUp={handleTextSelection}>
      
      {/* Toast Notification Popups */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-55 bg-charcoal/90 border border-white/10 px-4 py-3 rounded-xl shadow-premium backdrop-blur-md text-[12px] font-bold text-accent-cyan flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-accent-cyan animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reading Progress Bar */}
      {!zenMode && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-50">
          <div 
            className="h-full bg-accent-cyan shadow-[0_0_10px_rgba(6,182,212,0.6)]" 
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      )}

      {/* Floating Kindle-style Highlighter Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
            className="absolute -translate-x-1/2 z-40 bg-onyx border border-white/10 p-2.5 rounded-xl shadow-premium backdrop-blur-md flex flex-col gap-2.5 w-64 pointer-events-auto"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] font-semibold text-stone uppercase tracking-wider flex items-center gap-1">
                <Highlighter className="w-3.5 h-3.5 text-accent-cyan" />
                Highlight Selector
              </span>
            </div>
            
            <div className="flex gap-2 justify-around">
              {['yellow', 'green', 'blue', 'pink'].map(color => {
                const colorHex = {
                  yellow: 'bg-yellow-400/80 border-yellow-500',
                  green: 'bg-emerald-400/80 border-emerald-500',
                  blue: 'bg-cyan-400/80 border-cyan-500',
                  pink: 'bg-pink-400/80 border-pink-500'
                };
                return (
                  <button 
                    key={color} 
                    onClick={() => handleHighlightCreate(color)}
                    className={`w-6 h-6 rounded-full border cursor-pointer ${colorHex[color as keyof typeof colorHex]}`} 
                  />
                );
              })}
            </div>

            {showNoteForm ? (
              <div className="space-y-2">
                <textarea 
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write a private Kindle note..."
                  className="w-full bg-charcoal/30 border border-white/5 rounded-lg p-2 text-[10px] text-warm-white outline-none focus:border-white/10 h-16"
                />
                <Button variant="primary" onClick={() => handleHighlightCreate(highlightColor)} className="w-full text-[10px] py-1">
                  Save Note
                </Button>
              </div>
            ) : (
              <button 
                onClick={() => setShowNoteForm(true)} 
                className="text-[10px] text-stone hover:text-warm-white text-center py-1 border border-dashed border-white/5 rounded-lg cursor-pointer"
              >
                + Add Private Annotation
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header breadcrumbs & Zen exit */}
      {!zenMode ? (
        <div className="flex items-center justify-between border-b border-white/5 pb-4 select-none">
          <Link href="/posts">
            <Button variant="ghost" className="h-8 px-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Catalog</span>
            </Button>
          </Link>

          {/* Controls toolbar */}
          <div className="flex items-center gap-2">
            
            {/* Reading Mode configs */}
            <Button 
              variant="secondary" 
              onClick={() => setShowSettings(!showSettings)} 
              className="h-8 text-[11px] px-2.5 flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Preferences</span>
            </Button>

            <Button 
              variant="secondary" 
              onClick={() => setZenMode(true)} 
              className="h-8 text-[11px] px-2.5 flex items-center gap-1.5"
              title="Zen distraction free editing"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Zen Mode</span>
            </Button>

            {/* Reaction Bar */}
            <div className="flex items-center gap-1.5 bg-charcoal/30 border border-white/5 rounded-full p-1 font-mono text-[11px] text-stone">
              <button 
                onClick={() => handleReaction('LIKE')}
                className={`p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer ${reactionType === 'LIKE' ? 'text-accent-cyan' : ''}`}
                title="Like claps"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <span className="px-1 text-[10px] pr-2">{likesCount} claps</span>
              <div className="w-[1px] h-4 bg-white/10" />
              <button 
                onClick={handleBookmark}
                className={`p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer ${isBookmarked ? 'text-accent-cyan' : ''}`}
                title="Bookmark"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      ) : (
        <div className="fixed top-4 left-4 z-50 select-none">
          <Button 
            variant="secondary" 
            onClick={() => setZenMode(false)} 
            className="h-8 text-[10px] bg-charcoal/80 border border-white/10 text-stone hover:text-warm-white flex items-center gap-1"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Zen Mode</span>
          </Button>
        </div>
      )}

      {/* Floating preferences config settings modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-16 right-4 z-50 bg-onyx border border-white/10 p-5 rounded-2xl shadow-premium backdrop-blur-md w-72 space-y-4 text-left select-none"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-xs font-bold text-warm-white flex items-center gap-1">
                <Settings className="w-4 h-4 text-accent-cyan" />
                Reader Layout Preferences
              </span>
              <button onClick={() => setShowSettings(false)} className="text-stone hover:text-warm-white text-xs">Close</button>
            </div>

            {/* Colors Themes */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-stone">Color Theme</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'dark', label: 'Dark Charcoal' },
                  { value: 'light', label: 'Paper White' },
                  { value: 'sepia', label: 'Warm Sepia' },
                  { value: 'contrast', label: 'High Contrast' }
                ].map(th => (
                  <button
                    key={th.value}
                    onClick={() => setReaderTheme(th.value as any)}
                    className={`px-2 py-1 text-[10px] font-semibold border rounded-lg transition-all
                      ${readerTheme === th.value 
                        ? 'border-accent-cyan text-accent-cyan bg-accent-cyan/5 font-bold' 
                        : 'border-white/5 text-stone hover:border-white/10 hover:text-warm-white'}
                    `}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fonts */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-stone">Font Family</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { value: 'sans', label: 'Sans UI' },
                  { value: 'serif', label: 'Editorial' },
                  { value: 'mono', label: 'Technical' }
                ].map(ft => (
                  <button
                    key={ft.value}
                    onClick={() => setReaderFont(ft.value as any)}
                    className={`px-1.5 py-1 text-[10px] border rounded-lg transition-all
                      ${readerFont === ft.value 
                        ? 'border-accent-cyan text-accent-cyan font-bold bg-accent-cyan/5' 
                        : 'border-white/5 text-stone hover:border-white/10'}
                    `}
                  >
                    {ft.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size & Line Height */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone">Size</span>
                <select 
                  value={readerFontSize} 
                  onChange={(e) => setReaderFontSize(e.target.value as any)}
                  className="w-full bg-charcoal/20 border border-white/5 rounded-lg px-2 py-1 text-[11px] text-warm-white outline-none"
                >
                  <option value="sm">Small</option>
                  <option value="md">Normal</option>
                  <option value="lg">Large</option>
                  <option value="xl">Extra Large</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone">Line Height</span>
                <select 
                  value={readerLineHeight} 
                  onChange={(e) => setReaderLineHeight(e.target.value as any)}
                  className="w-full bg-charcoal/20 border border-white/5 rounded-lg px-2 py-1 text-[11px] text-warm-white outline-none"
                >
                  <option value="tight">Tight</option>
                  <option value="normal">Normal</option>
                  <option value="loose">Loose</option>
                </select>
              </div>
            </div>

            {/* Column Width */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone">Reading Width</span>
              <select 
                value={readerColumnWidth} 
                onChange={(e) => setReaderColumnWidth(e.target.value as any)}
                className="w-full bg-charcoal/20 border border-white/5 rounded-lg px-2 py-1.5 text-[11px] text-warm-white outline-none"
              >
                <option value="narrow">Narrow (600px)</option>
                <option value="medium">Medium (720px - Recommended)</option>
                <option value="wide">Wide (960px)</option>
                <option value="full">Full Width</option>
              </select>
            </div>

            {/* Focus Mode & Copy Protection */}
            <div className="pt-2.5 border-t border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone">Dim Unfocused Blocks</span>
                <input 
                  type="checkbox" 
                  checked={focusMode} 
                  onChange={(e) => setFocusMode(e.target.checked)} 
                  className="w-4 h-4 accent-accent-cyan cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-accent-pink" />
                  Disable Selection / Drag
                </span>
                <input 
                  type="checkbox" 
                  checked={copyProtectionActive} 
                  onChange={(e) => setCopyProtectionActive(e.target.checked)} 
                  className="w-4 h-4 accent-accent-cyan cursor-pointer"
                />
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Post Cover & Title Area */}
      {!zenMode && (
        <div className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="space-y-3">
            <span className="text-[11px] font-mono tracking-widest text-accent-cyan uppercase bg-accent-cyan/10 border border-accent-cyan/20 px-3 py-1 rounded-full">
              {post.categoryRef?.name || 'General'}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-warm-white">
              {post.title}
            </h1>
            <p className="text-[15px] text-stone leading-relaxed font-light">
              {post.description}
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 text-[12px] text-stone font-mono select-none">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>@{post.author.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span suppressHydrationWarning>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-accent-cyan" />
              <span>{readingTime} min read {scrollProgress > 0 ? `(${Math.round(scrollProgress)}% read)` : ''}</span>
            </div>
          </div>

          {post.coverImage && (
            <div className="w-full aspect-[2/1] rounded-2xl overflow-hidden border border-white/5 shadow-premium">
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      )}

      {/* Main post grid (TOC sidebar + Body) */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto transition-all ${focusMode || zenMode ? 'lg:grid-cols-1' : ''}`}>
        
        {/* Left: Scroll-linked Table of Contents */}
        {!focusMode && !zenMode && (
          <div className="lg:col-span-3 lg:sticky lg:top-16 space-y-5 select-none text-left">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h4 className="text-[11px] font-semibold text-stone uppercase tracking-wider font-mono">Table of Contents</h4>
              <button
                onClick={() => setFocusMode(true)}
                className="text-[10px] text-accent-cyan hover:underline font-mono"
              >
                Focus Mode
              </button>
            </div>
            <ul className="space-y-3 text-[12px] text-stone">
              {extractedToc.length > 0 ? (
                extractedToc.map((item, idx) => (
                  <li 
                    key={idx} 
                    className={`hover:text-accent-cyan transition-colors cursor-pointer border-l-2 pl-3 truncate
                      ${item.level === 3 ? 'ml-3 border-transparent' : 'border-accent-cyan/40'}
                      ${activeHeadingId === item.id ? 'border-accent-cyan text-accent-cyan font-bold' : 'border-transparent'}
                    `}
                  >
                    <a href={`#${item.id}`}>{item.text}</a>
                  </li>
                ))
              ) : (
                <div className="text-[11px] font-light text-stone/50 italic">No headings indexed.</div>
              )}
            </ul>

            {/* Post Series link if any */}
            {series && (
              <div className="pt-6 border-t border-white/5 space-y-3">
                <span className="text-[10px] font-mono text-accent-violet uppercase font-semibold">Post Series</span>
                <Card className="p-3 bg-charcoal/10 border-white/5">
                  <span className="text-[11px] font-bold text-warm-white block truncate">{series.title}</span>
                  <span className="text-[10px] text-stone mt-1 block leading-relaxed font-light">Part 1 of 3</span>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Right: Unified rendering content column */}
        <div className={`space-y-12 ${focusMode || zenMode ? 'lg:col-span-12 max-w-2xl mx-auto' : 'lg:col-span-9'}`}>
          {focusMode && !zenMode && (
            <button
              onClick={() => setFocusMode(false)}
              className="px-3 py-1.5 rounded-lg text-[10.5px] font-bold bg-white/5 border border-white/5 hover:bg-white/10 text-accent-cyan cursor-pointer transition-colors block mb-4 select-none"
            >
              ← Exit Focus Mode
            </button>
          )}

          {/* Unified TipTapRenderer output */}
          <TipTapRenderer 
            content={post.content} 
            theme={readerTheme}
            fontFamily={readerFont}
            fontSize={readerFontSize}
            lineHeight={readerLineHeight}
            readingWidth={readerColumnWidth}
            focusMode={focusMode}
            copyProtection={copyProtectionActive}
          />

          {/* Bottom metadata details */}
          {!zenMode && (
            <>
              {/* Next / Prev Article Navigation */}
              {(post.prevProject || post.nextProject) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5 select-none">
                  {post.prevProject ? (
                    <Link href={`/posts/${post.prevProject.slug}`}>
                      <Card className="p-4 hover:border-white/10 group cursor-pointer flex flex-col justify-between h-20 text-left">
                        <span className="text-[9px] font-mono text-stone uppercase">← Previous Article</span>
                        <span className="text-[12px] font-bold text-warm-white group-hover:text-accent-cyan transition-colors truncate">{post.prevProject.title}</span>
                      </Card>
                    </Link>
                  ) : (
                    <div />
                  )}
                  {post.nextProject ? (
                    <Link href={`/posts/${post.nextProject.slug}`}>
                      <Card className="p-4 hover:border-white/10 group cursor-pointer flex flex-col justify-between h-20 text-right">
                        <span className="text-[9px] font-mono text-stone uppercase">Next Article →</span>
                        <span className="text-[12px] font-bold text-warm-white group-hover:text-accent-cyan transition-colors truncate">{post.nextProject.title}</span>
                      </Card>
                    </Link>
                  ) : (
                    <div />
                  )}
                </div>
              )}

              {/* Share triggers */}
              <div className="flex items-center gap-3 border-t border-b border-white/5 py-4 select-none">
                <span className="text-[12px] text-stone font-mono uppercase">Share Article:</span>
                <Button variant="secondary" onClick={copyLinkToClipboard} className="h-8 px-2.5">
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </Button>
                <a href="https://twitter.com" target="_blank" rel="noreferrer">
                  <Button variant="secondary" className="h-8 px-2.5">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>X / Twitter</span>
                  </Button>
                </a>
              </div>

              {/* Comments section */}
              <div className="space-y-6 select-text text-left">
                <h3 className="text-lg font-bold tracking-tight text-warm-white flex items-center gap-2 select-none">
                  <MessageSquare className="w-5 h-5 text-stone" />
                  <span>Comments ({commentsList.length})</span>
                </h3>

                {sessionUser ? (
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input 
                      type="text" 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your technical feedback..."
                      className="flex-1 bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-[12px] text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/30 transition-all"
                    />
                    <Button type="submit" variant="primary">Send</Button>
                  </form>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-[12px] text-stone select-none">
                    You must <Link href="/login" className="text-accent-cyan underline">Sign In</Link> to participate in technical discussions.
                  </div>
                )}

                <div className="space-y-4">
                  {commentsList.map(comment => (
                    <div key={comment.id} className="p-4 rounded-xl bg-charcoal/10 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-stone font-mono select-none">
                        <span className="font-semibold text-warm-white">@{comment.user.name}</span>
                        <span suppressHydrationWarning>{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                      <p className="text-[13px] text-stone/90 leading-relaxed font-light">{comment.content}</p>

                      <div className="flex items-center gap-3 pt-2 text-[10px] text-stone font-mono select-none">
                        <button 
                          onClick={() => setReplyTarget(replyTarget === comment.id ? null : comment.id)}
                          className="hover:text-warm-white flex items-center gap-1 cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Reply
                        </button>
                        <button 
                          onClick={() => {
                            submitSpamReportAction(comment.id, null, 'Comment Flagged', visitorId);
                            triggerToast('Comment reported for moderation');
                          }}
                          className="hover:text-accent-pink flex items-center gap-1 cursor-pointer"
                        >
                          <Flag className="w-3.5 h-3.5" />
                          Report
                        </button>
                      </div>

                      {replyTarget === comment.id && (
                        <div className="flex gap-2 pt-3 pl-4 border-l border-white/5">
                          <CornerDownRight className="w-4 h-4 text-stone shrink-0 mt-2" />
                          <input 
                            type="text" 
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 bg-charcoal/30 border border-white/5 rounded-lg px-3 py-1.5 text-[11px] text-warm-white outline-none focus:border-white/10"
                          />
                          <Button variant="primary" onClick={() => handleAddReply(comment.id)} className="py-1 text-[11px]">Send</Button>
                        </div>
                      )}

                      {comment.replies && comment.replies.length > 0 && (
                        <div className="pl-6 border-l border-white/5 space-y-3 pt-3">
                          {comment.replies.map((reply: any) => (
                            <div key={reply.id} className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-stone font-mono select-none">
                                <span className="font-semibold text-warm-white">@{reply.user.name}</span>
                                <span suppressHydrationWarning>{reply.createdAt ? new Date(reply.createdAt).toLocaleDateString() : ''}</span>
                              </div>
                              <p className="text-[12px] text-stone font-light leading-relaxed">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ Accordions Section */}
              {post.faq && Array.isArray(post.faq) && post.faq.length > 0 && (
                <div className="pt-8 border-t border-white/5 space-y-4 text-left select-text">
                  <h4 className="text-[12px] font-semibold text-stone uppercase tracking-wider font-mono select-none">Frequently Asked Questions</h4>
                  <div className="space-y-3">
                    {post.faq.map((item: any, idx: number) => (
                      <details key={idx} className="group bg-charcoal/10 border border-white/5 rounded-xl p-4 cursor-pointer [&_summary::-webkit-details-marker]:hidden">
                        <summary className="flex items-center justify-between text-[13px] font-bold text-warm-white list-none select-none">
                          <span>{item.question}</span>
                          <span className="text-stone transition group-open:rotate-180">
                            <ChevronDown className="w-4 h-4" />
                          </span>
                        </summary>
                        <p className="text-[12px] text-stone mt-3 leading-relaxed font-light">
                          {item.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Articles Suggestion Carousel */}
              {relatedPosts && relatedPosts.length > 0 && (
                <div className="pt-8 border-t border-white/5 space-y-4 select-none">
                  <h4 className="text-[12px] font-semibold text-stone uppercase tracking-wider font-mono">Related Content AI Suggestions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relatedPosts.map(p => (
                      <Link key={p.id} href={`/posts/${p.slug}`}>
                        <Card className="p-4 hover:border-white/10 group cursor-pointer h-24 flex flex-col justify-between">
                          <span className="text-[9px] font-mono text-accent-cyan uppercase">{p.category}</span>
                          <h5 className="text-[13px] font-bold text-warm-white group-hover:text-accent-cyan transition-colors truncate">{p.title}</h5>
                          <span className="text-[10px] text-stone">Read article →</span>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

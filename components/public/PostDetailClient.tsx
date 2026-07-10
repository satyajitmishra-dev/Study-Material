'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components/ui/core';
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
  const [likesCount, setLikesCount] = useState(post.views / 10); // Mock starting count
  const [bookmarksCount, setBookmarksCount] = useState(12);

  // Comments state
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<any[]>(initialComments);
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Scroll Progress
  const [scrollProgress, setScrollProgress] = useState(0);

  // Kindle Highlights Tooltip
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [highlightColor, setHighlightColor] = useState('yellow');
  const [noteContent, setNoteContent] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  
  // General UI Feedback
  const [copiedLink, setCopiedLink] = useState(false);
  const [reported, setReported] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let vid = localStorage.getItem('sm_visitor_id');
    if (!vid) {
      vid = `vis_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
      localStorage.setItem('sm_visitor_id', vid);
    }
    setVisitorId(vid);

    // Track scroll depth
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(progress, 100));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Toggle Claps/Reactions
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

  // Toggle Bookmark
  const handleBookmark = async () => {
    const res = await bookmarkPostAction(post.id, undefined, visitorId);
    if (res.success) {
      setIsBookmarked(!!res.bookmarked);
      setBookmarksCount(prev => res.bookmarked ? prev + 1 : Math.max(0, prev - 1));
      triggerToast(res.bookmarked ? 'Article bookmarked!' : 'Removed from bookmarks');
    }
  };

  // Highlight selection handler
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

  // Comments submit handler
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

  // Reply submit handler
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

  return (
    <div className="w-full space-y-12 relative" onMouseUp={handleTextSelection}>
      
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

      {/* Est. Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-50">
        <div 
          className="h-full bg-accent-cyan shadow-[0_0_10px_rgba(6,182,212,0.6)]" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

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
            
            {/* Color pills */}
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

            {/* Note form */}
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

      {/* Header breadcrumbs & actions */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <Link href="/posts">
          <Button variant="ghost" className="h-8 px-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Catalog</span>
          </Button>
        </Link>

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

      {/* Post Cover & Title Area */}
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

        <div className="flex items-center justify-center gap-6 text-[12px] text-stone font-mono">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            <span>@{post.author.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span suppressHydrationWarning>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>5 min read</span>
          </div>
        </div>

        {post.coverImage && (
          <div className="w-full aspect-[2/1] rounded-2xl overflow-hidden border border-white/5 shadow-premium">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Main post grid (TOC sidebar + Body) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
        
        {/* Left: Table of Contents */}
        <div className="lg:col-span-3 lg:sticky lg:top-16 space-y-4">
          <h4 className="text-[11px] font-semibold text-stone uppercase tracking-wider font-mono">Table of Contents</h4>
          <ul className="space-y-3 text-[12px] text-stone">
            {post.toc && post.toc.length > 0 ? (
              post.toc.map((item: any, idx: number) => (
                <li 
                  key={idx} 
                  className={`hover:text-accent-cyan transition-colors cursor-pointer border-l-2 pl-3 truncate
                    ${item.level === 3 ? 'ml-3 border-transparent' : 'border-accent-cyan/40'}
                  `}
                >
                  <a href={`#${item.id}`}>{idx + 1}. {item.text}</a>
                </li>
              ))
            ) : (
              <>
                <li className="hover:text-accent-cyan transition-colors cursor-pointer border-l-2 border-accent-cyan/40 pl-3">
                  1. Overview
                </li>
                <li className="hover:text-accent-cyan transition-colors cursor-pointer border-l-2 border-transparent pl-3">
                  2. Design Guidelines
                </li>
                <li className="hover:text-accent-cyan transition-colors cursor-pointer border-l-2 border-transparent pl-3">
                  3. Setup Configurations
                </li>
                <li className="hover:text-accent-cyan transition-colors cursor-pointer border-l-2 border-transparent pl-3">
                  4. Verification Mechanics
                </li>
              </>
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

        {/* Right: Body Content */}
        <div className="lg:col-span-9 space-y-12">
          {/* Post Rich Content */}
          <article className="prose prose-invert max-w-none text-[15px] text-fog/90 leading-relaxed font-light space-y-6 select-text">
            {post.content ? (
              <div 
                className="space-y-6"
                dangerouslySetInnerHTML={{ __html: post.content }} 
              />
            ) : (
              <>
                <p>
                  Partial Prerendering (PPR) is a layout-first prerendering model that allows streaming dynamic content holes inside static route shells. 
                  Wrap dynamic components in React 19's <code>&lt;Suspense&gt;</code> and Next.js does the rest under the hood! 
                  By splitting the page compilation during build time, we avoid database hits for static headers, menus, or sidebars while enabling streaming layouts.
                </p>

                <div className="p-4 bg-charcoal/20 border-l-4 border-accent-cyan rounded-r-xl text-[13px] text-stone leading-relaxed font-mono">
                  💡 **Callout Overview**: Using PPR eliminates the classic TTFB latency trade-off between static generation and server-side queries.
                </div>

                <h3 className="text-xl font-bold text-warm-white font-mono mt-8">Dynamic Streaming Code Setup</h3>
                
                {/* Syntax highlight code block */}
                <Card className="bg-charcoal/30 border-white/5 p-4 font-mono text-[12px] space-y-1 overflow-x-auto relative group">
                  <button 
                    onClick={copyLinkToClipboard}
                    className="absolute top-3 right-3 text-stone hover:text-warm-white bg-white/5 border border-white/5 px-2 py-0.5 rounded text-[10px] cursor-pointer"
                  >
                    Copy
                  </button>
                  <div className="text-accent-cyan">import &#123; Suspense &#125; from 'react';</div>
                  <div className="text-accent-cyan">import &#123; DynamicComponent &#125; from './widgets';</div>
                  <br />
                  <div>export default function ShellPage() &#123;</div>
                  <div className="pl-4">return (</div>
                  <div className="pl-8 text-graphite">&lt;div className="layout-shell"&gt;</div>
                  <div className="pl-12 text-accent-amber">&lt;Suspense fallback=&#123;&lt;ShellSkeleton /&gt;&#125;&gt;</div>
                  <div className="pl-16 text-warm-white">&lt;DynamicComponent /&gt;</div>
                  <div className="pl-12 text-accent-amber">&lt;/Suspense&gt;</div>
                  <div className="pl-8 text-graphite">&lt;/div&gt;</div>
                  <div className="pl-4">);</div>
                  <div>&#125;</div>
                </Card>

                <p>
                  When a user loads this route, the static shell is returned immediately. Once the dynamic data queries in the backend database complete, 
                  the suspense holes are streamed and hydrated in the client browser transparently.
                </p>
              </>
            )}
          </article>

          {/* Next / Prev Article Navigation */}
          {(post.prevProject || post.nextProject) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
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

          {/* Share triggers and Copy Link */}
          <div className="flex items-center gap-3 border-t border-b border-white/5 py-4">
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
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-warm-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-stone" />
              <span>Comments ({commentsList.length})</span>
            </h3>

            {/* Comment Form */}
            {sessionUser ? (
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input 
                  type="text" 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your technical feedback..."
                  className="flex-1 bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-[12px] text-warm-white outline-none focus:border-white/10"
                />
                <Button type="submit" variant="primary">Send</Button>
              </form>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-[12px] text-stone">
                You must <Link href="/login" className="text-accent-cyan underline">Sign In</Link> to participate in technical discussions.
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {commentsList.map(comment => (
                <div key={comment.id} className="p-4 rounded-xl bg-charcoal/10 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-stone font-mono">
                    <span className="font-semibold text-warm-white">@{comment.user.name}</span>
                    <span suppressHydrationWarning>{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}</span>
                  </div>
                  <p className="text-[13px] text-stone/90 leading-relaxed font-light">{comment.content}</p>

                  <div className="flex items-center gap-3 pt-2 text-[10px] text-stone font-mono">
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

                  {/* Inline reply form */}
                  {replyTarget === comment.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2 pt-3 pl-4 border-l border-white/5"
                    >
                      <CornerDownRight className="w-4 h-4 text-stone shrink-0 mt-2" />
                      <input 
                        type="text" 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 bg-charcoal/30 border border-white/5 rounded-lg px-3 py-1.5 text-[11px] text-warm-white outline-none focus:border-white/10"
                      />
                      <Button variant="primary" onClick={() => handleAddReply(comment.id)} className="py-1 text-[11px]">Send</Button>
                    </motion.div>
                  )}

                  {/* Replies List */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="pl-6 border-l border-white/5 space-y-3 pt-3">
                      {comment.replies.map((reply: any) => (
                        <div key={reply.id} className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-stone font-mono">
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
            <div className="pt-8 border-t border-white/5 space-y-4 text-left">
              <h4 className="text-[12px] font-semibold text-stone uppercase tracking-wider font-mono">Frequently Asked Questions</h4>
              <div className="space-y-3">
                {post.faq.map((item: any, idx: number) => (
                  <details key={idx} className="group bg-charcoal/10 border border-white/5 rounded-xl p-4 cursor-pointer [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex items-center justify-between text-[13px] font-bold text-warm-white list-none">
                      <span>{item.question}</span>
                      <span className="text-stone transition group-open:rotate-180">
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    </summary>
                    <p className="text-[12px] text-stone mt-3 leading-relaxed font-light select-text">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Related Articles Carousel */}
          {relatedPosts && relatedPosts.length > 0 && (
            <div className="pt-8 border-t border-white/5 space-y-4">
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

        </div>
      </div>
    </div>
  );
}

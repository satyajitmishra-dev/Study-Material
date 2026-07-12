'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui/core';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { 
  ArrowLeft, 
  ThumbsUp, 
  CheckCircle2, 
  User, 
  ShieldCheck, 
  MessageSquare,
  ArrowUp,
  ArrowDown,
  Check,
  AlertCircle
} from 'lucide-react';
import { 
  addDiscussionAnswerAction, 
  addDiscussionReplyAction, 
  voteDiscussionAction, 
  acceptAnswerAction 
} from '@/lib/actions/discussionActions';

interface DiscussionClientProps {
  discussion: any;
  userId: string | null;
}

export default function DiscussionClient({ discussion, userId }: DiscussionClientProps) {
  const [currentDiscussion, setCurrentDiscussion] = useState(discussion);
  const [answerContent, setAnswerContent] = useState('');
  const [replyContents, setReplyContents] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Checks
  const isAuthor = userId === currentDiscussion.authorId;

  // Handle vote discussion thread
  const handleVoteDiscussion = async (voteType: 'UPVOTE' | 'DOWNVOTE') => {
    if (!userId) {
      setError('You must be logged in to vote.');
      return;
    }
    try {
      const res = await voteDiscussionAction(voteType, { discussionId: currentDiscussion.id }, currentDiscussion.slug);
      if (res.success) {
        // Refresh local discussion state upvote counts
        setCurrentDiscussion((prev: any) => ({
          ...prev,
          upvotes: voteType === 'UPVOTE' ? prev.upvotes + 1 : prev.upvotes,
          downvotes: voteType === 'DOWNVOTE' ? prev.downvotes + 1 : prev.downvotes
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle vote answer
  const handleVoteAnswer = async (answerId: string, voteType: 'UPVOTE' | 'DOWNVOTE') => {
    if (!userId) {
      setError('You must be logged in to vote.');
      return;
    }
    try {
      const res = await voteDiscussionAction(voteType, { answerId }, currentDiscussion.slug);
      if (res.success) {
        setCurrentDiscussion((prev: any) => {
          const updatedAnswers = prev.answers.map((a: any) => {
            if (a.id === answerId) {
              return {
                ...a,
                upvotes: voteType === 'UPVOTE' ? a.upvotes + 1 : a.upvotes,
                downvotes: voteType === 'DOWNVOTE' ? a.downvotes + 1 : a.downvotes
              };
            }
            return a;
          });
          return { ...prev, answers: updatedAnswers };
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError('You must be logged in to submit an answer.');
      return;
    }
    if (!answerContent.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await addDiscussionAnswerAction(currentDiscussion.id, answerContent, currentDiscussion.slug);
      if (res.success) {
        setAnswerContent('');
        setCurrentDiscussion((prev: any) => ({
          ...prev,
          answers: [...prev.answers, {
            ...res.answer,
            author: { name: 'You', image: null },
            replies: []
          }]
        }));
      } else {
        setError(res.error || 'Failed to submit answer.');
      }
    } catch (err: any) {
      setError(err.message || 'Server error.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Reply
  const handleSubmitReply = async (answerId: string) => {
    if (!userId) {
      setError('You must be logged in to reply.');
      return;
    }
    const content = replyContents[answerId];
    if (!content || !content.trim()) return;

    try {
      const res = await addDiscussionReplyAction(answerId, content, currentDiscussion.slug);
      if (res.success) {
        setReplyContents(prev => ({ ...prev, [answerId]: '' }));
        setActiveReplyId(null);
        setCurrentDiscussion((prev: any) => {
          const updatedAnswers = prev.answers.map((a: any) => {
            if (a.id === answerId) {
              return {
                ...a,
                replies: [...(a.replies || []), {
                  ...res.reply,
                  author: { name: 'You', image: null }
                }]
              };
            }
            return a;
          });
          return { ...prev, answers: updatedAnswers };
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Accept Answer
  const handleAcceptAnswer = async (answerId: string) => {
    if (!userId || !isAuthor) return;

    try {
      const res = await acceptAnswerAction(currentDiscussion.id, answerId, currentDiscussion.slug);
      if (res.success) {
        setCurrentDiscussion((prev: any) => {
          const updatedAnswers = prev.answers.map((a: any) => ({
            ...a,
            isAccepted: a.id === answerId
          }));
          return {
            ...prev,
            acceptedAnswerId: answerId,
            answers: updatedAnswers
          };
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Sort answers: accepted first, then upvotes, then latest
  const sortedAnswers = [...(currentDiscussion.answers || [])].sort((a, b) => {
    if (a.isAccepted) return -1;
    if (b.isAccepted) return 1;
    return b.upvotes - a.upvotes;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-12 pb-16 font-sans">
      
      {/* Back button */}
      <div className="mb-6">
        <Link href="/community" className="inline-flex items-center gap-1.5 text-[12px] text-stone hover:text-warm-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Community Board
        </Link>
      </div>

      <div className="space-y-6">
        
        {/* Error Notification */}
        {error && (
          <Card className="p-3.5 bg-accent-pink/10 border border-accent-pink/20 text-accent-pink text-[12px] rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </Card>
        )}

        {/* 1. Main Thread Post */}
        <Card className="p-6 border-white/5 bg-charcoal/20 space-y-6">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-mono font-bold border px-2 py-0.5 rounded uppercase
                  ${currentDiscussion.isQuestion ? 'border-accent-cyan/20 bg-accent-cyan/5 text-accent-cyan' : 'border-accent-pink/20 bg-accent-pink/5 text-accent-pink'}`}>
                  {currentDiscussion.isQuestion ? 'Question' : 'Discussion'}
                </span>
                <span className="text-[10.5px] text-stone font-mono">
                  #{currentDiscussion.category} • Posted on {new Date(currentDiscussion.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-warm-white leading-tight">
                {currentDiscussion.title}
              </h1>
            </div>

            {/* Voting widget */}
            <div className="flex flex-col items-center gap-1.5 bg-charcoal/30 border border-white/5 p-2 rounded-xl text-stone shrink-0">
              <button 
                onClick={() => handleVoteDiscussion('UPVOTE')}
                className="hover:text-accent-cyan p-1 cursor-pointer transition-colors"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <span className="text-[12px] font-bold font-mono text-warm-white">
                {currentDiscussion.upvotes - currentDiscussion.downvotes}
              </span>
              <button 
                onClick={() => handleVoteDiscussion('DOWNVOTE')}
                className="hover:text-accent-pink p-1 cursor-pointer transition-colors"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-[13.5px] text-stone/90 leading-relaxed font-sans border-t border-white/5 pt-4">
            <MarkdownRenderer content={currentDiscussion.content} />
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-white/5 text-[11px] text-stone font-mono">
            <div className="w-6 h-6 rounded-full bg-white/5 overflow-hidden flex items-center justify-center">
              {currentDiscussion.author?.image ? <img src={currentDiscussion.author.image} alt={currentDiscussion.author.name} className="w-full h-full object-cover" /> : <User className="w-3.5 h-3.5" />}
            </div>
            <span>Asked by @{currentDiscussion.author?.name || 'developer'}</span>
          </div>
        </Card>

        {/* 2. Answers Stream */}
        <div className="space-y-4">
          <h3 className="text-[13px] font-bold text-stone font-mono uppercase tracking-wider pl-1">
            Answers ({sortedAnswers.length})
          </h3>

          <div className="space-y-4">
            {sortedAnswers.map((ans) => (
              <Card 
                key={ans.id} 
                className={`p-6 border bg-charcoal/20 space-y-4 relative overflow-hidden
                  ${ans.isAccepted ? 'border-accent-emerald/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'border-white/5'}`}
              >
                {ans.isAccepted && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 text-accent-emerald text-[10px] font-mono font-bold tracking-wider bg-accent-emerald/10 border border-accent-emerald/20 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ACCEPTED ANSWER
                  </div>
                )}

                <div className="flex justify-between items-start gap-4">
                  <div className="prose prose-invert max-w-none text-[13px] text-stone/90 leading-relaxed font-sans flex-1">
                    <MarkdownRenderer content={ans.content} />
                  </div>

                  {/* Answer Vote box */}
                  <div className="flex flex-col items-center gap-1.5 bg-charcoal/30 border border-white/5 p-2 rounded-lg text-stone shrink-0">
                    <button 
                      onClick={() => handleVoteAnswer(ans.id, 'UPVOTE')}
                      className="hover:text-accent-cyan p-0.5 cursor-pointer transition-colors"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-bold font-mono text-warm-white">
                      {ans.upvotes - ans.downvotes}
                    </span>
                    <button 
                      onClick={() => handleVoteAnswer(ans.id, 'DOWNVOTE')}
                      className="hover:text-accent-pink p-0.5 cursor-pointer transition-colors"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Accept option for author */}
                {isAuthor && !ans.isAccepted && (
                  <Button 
                    variant="secondary"
                    onClick={() => handleAcceptAnswer(ans.id)}
                    className="text-[10px] py-1 px-2.5 border-accent-emerald/20 text-accent-emerald bg-accent-emerald/5 hover:bg-accent-emerald/10 uppercase font-mono tracking-wider flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Accept Answer</span>
                  </Button>
                )}

                {/* Footer contributor details */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px] text-stone font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/5 overflow-hidden flex items-center justify-center">
                      {ans.author?.image ? <img src={ans.author.image} alt={ans.author.name} className="w-full h-full object-cover" /> : <User className="w-3 h-3" />}
                    </div>
                    <span>Answered by @{ans.author?.name || 'contributor'}</span>
                  </div>

                  <button 
                    onClick={() => setActiveReplyId(activeReplyId === ans.id ? null : ans.id)}
                    className="text-stone hover:text-warm-white transition-colors"
                  >
                    Reply
                  </button>
                </div>

                {/* Nested Replies */}
                {ans.replies && ans.replies.length > 0 && (
                  <div className="pl-6 border-l-2 border-white/5 space-y-2.5 mt-3 pt-2">
                    {ans.replies.map((rep: any) => (
                      <div key={rep.id} className="text-[12px] bg-white/[0.01] p-3 rounded-lg border border-white/5 space-y-1">
                        <div className="text-stone font-sans">{rep.content}</div>
                        <div className="text-[10px] text-stone/50 font-mono flex items-center gap-1 pt-1">
                          <User className="w-3 h-3" />
                          <span>@{rep.author?.name || 'replier'} • {new Date(rep.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {activeReplyId === ans.id && (
                  <div className="pl-6 pt-3 space-y-2">
                    <input 
                      type="text"
                      placeholder="Write a nested reply..."
                      value={replyContents[ans.id] || ''}
                      onChange={(e) => setReplyContents(prev => ({ ...prev, [ans.id]: e.target.value }))}
                      className="w-full bg-charcoal/20 border border-white/5 rounded-lg px-3 py-1.5 text-[12px] text-warm-white outline-none focus:border-white/10"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="secondary" className="text-[10px] py-1 px-2.5" onClick={() => setActiveReplyId(null)}>Cancel</Button>
                      <Button variant="primary" className="text-[10px] py-1 px-3" onClick={() => handleSubmitReply(ans.id)}>Submit Reply</Button>
                    </div>
                  </div>
                )}

              </Card>
            ))}
          </div>
        </div>

        {/* 3. Post Answer Form */}
        {userId ? (
          <Card className="p-6 border-white/5 bg-charcoal/20 space-y-4">
            <h3 className="text-[13.5px] font-bold text-warm-white font-mono uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4.5 h-4.5 text-accent-cyan" /> Submit Your Answer
            </h3>
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <textarea
                required
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="Type your markdown answer, code blocks, or explanations..."
                rows={5}
                className="w-full bg-charcoal/30 border border-white/5 rounded-lg p-3 text-[12.5px] text-warm-white outline-none focus:border-white/10 font-mono resize-none"
              />
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-stone font-mono">Supports markdown formats</span>
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={loading}
                  className="text-[12px] uppercase font-bold py-2 px-5"
                >
                  {loading ? 'Submitting...' : 'Post Answer'}
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Card className="p-6 border-dashed border-white/5 bg-charcoal/10 text-center">
            <p className="text-[12.5px] text-stone font-light">
              You must be logged in to answer this thread. <Link href="/login" className="text-accent-cyan hover:underline">Log in here</Link>
            </p>
          </Card>
        )}

      </div>
    </div>
  );
}

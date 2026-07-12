'use client';

import React, { useState } from 'react';
import { Card, Button } from '@/components/ui/core';
import { 
  Vote, 
  User, 
  Calendar, 
  Clock, 
  ThumbsUp, 
  MessageSquare,
  Globe,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { votePollAction } from '@/lib/actions/pollActions';

interface PollDetailClientProps {
  poll: any;
  userId: string | null;
}

export default function PollDetailClient({ poll, userId }: PollDetailClientProps) {
  const [currentPoll, setCurrentPoll] = useState(poll);
  const [userChoice, setUserChoice] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Check if poll is expired
  const isExpired = new Date(currentPoll.expiresAt).getTime() < Date.now();
  const totalVotes = currentPoll.options?.reduce((sum: number, o: any) => sum + (o.votes?.length || 0), 0) || 0;

  // Cast vote
  const handleVote = async (optionId: string) => {
    if (userChoice || isExpired) return;
    setError('');

    try {
      const res = await votePollAction(currentPoll.id, optionId);
      if (res.success) {
        setUserChoice(optionId);
        setSuccess(true);
        // Optimistically update local options list
        setCurrentPoll((prev: any) => {
          const updatedOptions = prev.options.map((opt: any) => {
            if (opt.id === optionId) {
              return {
                ...opt,
                votes: [...(opt.votes || []), { userId: userId || 'guest' }]
              };
            }
            return opt;
          });
          return { ...prev, options: updatedOptions };
        });
      } else {
        if (res.error === 'ALREADY_VOTED') {
          setError('You have already voted in this poll.');
        } else {
          setError(res.error || 'Failed to submit vote.');
        }
      }
    } catch (e: any) {
      setError(e.message || 'Server error.');
    }
  };

  return (
    <Card className="p-6 border-white/5 bg-charcoal/20 space-y-6 relative overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-20 pointer-events-none" />
      
      {error && (
        <div className="p-3.5 bg-accent-pink/10 border border-accent-pink/20 text-accent-pink text-[12px] rounded-lg flex items-center gap-2 relative z-10">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-accent-orange/10 border border-accent-orange/20 text-accent-orange">
            <Vote className="w-3.5 h-3.5" />
            <span>Developer Opinion Poll</span>
          </span>
          <span className="text-[11px] text-stone font-mono flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" />
            {currentPoll.visibility}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl font-black text-warm-white leading-tight">
            {currentPoll.title}
          </h1>
          {currentPoll.description && (
            <p className="text-[12.5px] text-stone/90 leading-relaxed font-light font-sans">
              {currentPoll.description}
            </p>
          )}
        </div>

        <div className="space-y-3 pt-2">
          {currentPoll.options?.map((opt: any) => {
            const optVotes = opt.votes?.length || 0;
            const pct = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
            const isVotedChoice = userChoice === opt.id;

            return (
              <button
                key={opt.id}
                disabled={!!userChoice || isExpired}
                onClick={() => handleVote(opt.id)}
                className={`w-full relative p-4 rounded-xl border text-left text-[12.5px] overflow-hidden transition-all flex justify-between items-center
                  ${userChoice || isExpired
                    ? 'bg-charcoal/20 border-white/5 text-stone cursor-default' 
                    : 'bg-charcoal/30 border-white/5 text-warm-white hover:border-white/10 hover:bg-charcoal/50 cursor-pointer'}`}
              >
                {(userChoice || isExpired) && (
                  <div 
                    style={{ width: `${pct}%` }} 
                    className="absolute left-0 top-0 bottom-0 bg-accent-orange/10 pointer-events-none transition-all duration-500" 
                  />
                )}
                <span className={`relative z-10 font-semibold ${isVotedChoice ? 'text-accent-orange' : ''}`}>
                  {opt.text}
                </span>
                <span className="relative z-10 font-mono text-[12px] font-bold">
                  {userChoice || isExpired ? `${pct}% (${optVotes} votes)` : 'Vote'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-white/5 text-[11px] text-stone font-mono">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-white/5 overflow-hidden flex items-center justify-center">
              <User className="w-3 h-3 text-stone" />
            </div>
            <span>Posted by @{currentPoll.author?.name || 'admin'}</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Total Votes: {totalVotes}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {isExpired ? 'CLOSED' : `Expires ${new Date(currentPoll.expiresAt).toLocaleDateString()}`}
            </span>
          </div>
        </div>

      </div>
    </Card>
  );
}

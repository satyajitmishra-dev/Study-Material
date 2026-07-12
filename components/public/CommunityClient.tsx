'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  HelpCircle, 
  Plus, 
  ThumbsUp, 
  Users, 
  Calendar, 
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  User,
  Vote,
  Hash,
  Inbox,
  Clock,
  Eye,
  AlertCircle
} from 'lucide-react';
import { Card, Button } from '@/components/ui/core';
import Link from 'next/link';
import { createDiscussionAction } from '@/lib/actions/discussionActions';
import { votePollAction } from '@/lib/actions/pollActions';

interface CommunityClientProps {
  initialDiscussions: any[];
  initialPolls: any[];
  initialEvents: any[];
}

export default function CommunityClient({ 
  initialDiscussions = [], 
  initialPolls = [], 
  initialEvents = [] 
}: CommunityClientProps) {
  const [activeTab, setActiveTab] = useState<'discussions' | 'qa' | 'polls' | 'events'>('discussions');

  // Discussions & Q&As State
  const [discussions, setDiscussions] = useState<any[]>(initialDiscussions);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [isQuestion, setIsQuestion] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Polls State
  const [polls, setPolls] = useState<any[]>(initialPolls);
  const [votedPolls, setVotedPolls] = useState<Record<string, string>>({});

  // Category list
  const categories = [
    'General', 'Frontend', 'Backend', 'Java', 'Python', 'React', 
    'Next.js', 'AI', 'Machine Learning', 'Cloud', 'Cyber Security', 
    'Career', 'Interview', 'College', 'Assignments', 'Open Source', 'Others'
  ];

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setError('Title and Content are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await createDiscussionAction({
        title: newTitle,
        content: newContent,
        category: newCategory,
        isQuestion,
        visibility: 'public',
        tags: [newCategory.toLowerCase()]
      });

      if (res.success) {
        setDiscussions([res.discussion, ...discussions]);
        setNewTitle('');
        setNewContent('');
        setShowForm(false);
      } else {
        setError(res.error || 'Failed to create post.');
      }
    } catch (err: any) {
      setError(err.message || 'Server error.');
    } finally {
      setLoading(false);
    }
  };

  const handlePollVote = async (pollId: string, optionId: string) => {
    if (votedPolls[pollId]) return;
    setVotedPolls(prev => ({ ...prev, [pollId]: optionId }));

    try {
      await votePollAction(pollId, optionId);
      // Update local state
      setPolls(prev => prev.map(p => {
        if (p.id === pollId) {
          const updatedOptions = p.options.map((opt: any) => {
            if (opt.id === optionId) {
              return { ...opt, votes: [...(opt.votes || []), { userId: 'guest' }] };
            }
            return opt;
          });
          return { ...p, options: updatedOptions };
        }
        return p;
      }));
    } catch (err: any) {
      console.error(err);
    }
  };

  const filteredDiscussions = discussions.filter(d => !d.isQuestion);
  const filteredQuestions = discussions.filter(d => d.isQuestion);

  return (
    <div className="w-full space-y-8 pt-8 pb-16 px-4 font-sans max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <span className="text-[10px] font-mono text-accent-cyan font-bold uppercase tracking-wider">Community HUB</span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-warm-white mt-1">Community Space</h1>
          <p className="text-[13px] text-stone font-light mt-1">
            Participate in Q&As, vote in interactive polls, collaborate in developer forums, and explore upcoming events.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-0.5 bg-charcoal/50 border border-white/5 rounded-lg text-[12px] self-start md:self-center">
          {[
            { id: 'discussions', label: 'Forums' },
            { id: 'qa', label: 'Q&As' },
            { id: 'polls', label: 'Opinion Polls' },
            { id: 'events', label: 'Events' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id as any);
                setShowForm(false);
                setError('');
              }}
              className={`px-4 py-1.5 rounded transition-colors cursor-pointer ${activeTab === t.id ? 'bg-white/10 text-warm-white font-bold' : 'text-stone hover:text-warm-white'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Dynamic Forms & Feeds */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Create Button area */}
          {(activeTab === 'discussions' || activeTab === 'qa') && !showForm && (
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-md font-bold text-warm-white flex items-center gap-2">
                {activeTab === 'discussions' ? (
                  <>
                    <MessageSquare className="w-5 h-5 text-accent-pink" />
                    <span>General Forums & Discussions</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-5 h-5 text-accent-cyan" />
                    <span>Technical Q&As & Bug Solving</span>
                  </>
                )}
              </h3>
              <Button 
                variant="primary" 
                onClick={() => {
                  setIsQuestion(activeTab === 'qa');
                  setShowForm(true);
                }} 
                className="text-[12px] py-1.5 px-3 uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                <span>{activeTab === 'discussions' ? 'New Thread' : 'Ask Question'}</span>
              </Button>
            </div>
          )}

          {/* Discussion / Q&A Form */}
          {showForm && (
            <Card className="p-5 border border-white/10 bg-charcoal/30 space-y-4">
              <h3 className="text-[14px] font-bold text-warm-white font-mono uppercase">
                {isQuestion ? 'Ask a New Question' : 'Start a New Discussion Thread'}
              </h3>
              {error && (
                <div className="p-3.5 bg-accent-pink/10 border border-accent-pink/20 text-accent-pink text-[12px] rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleCreateDiscussion} className="space-y-4">
                <div className="space-y-1.5 text-[12px]">
                  <label className="text-[10px] font-mono text-stone uppercase font-bold">Title *</label>
                  <input 
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={isQuestion ? 'E.g., Why does react compiler skip automatic memoization for functions?' : 'E.g., CSS Container queries vs Grid layouts debate'}
                    className="w-full bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-warm-white outline-none focus:border-white/10"
                  />
                </div>

                <div className="space-y-1.5 text-[12px]">
                  <label className="text-[10px] font-mono text-stone uppercase font-bold">Content (Markdown supported) *</label>
                  <textarea 
                    required
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Describe your question or topic details..."
                    rows={6}
                    className="w-full bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-warm-white outline-none focus:border-white/10 font-mono text-[11.5px] resize-none"
                  />
                </div>

                <div className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2 text-[12px]">
                    <span className="text-stone font-mono">Category:</span>
                    <select 
                      value={newCategory} 
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="bg-charcoal/40 border border-white/5 rounded px-2.5 py-1 text-stone outline-none cursor-pointer"
                    >
                      {categories.map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex gap-2 text-[11px]">
                    <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                      {loading ? 'Publishing...' : 'Publish'}
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          )}

          {/* DISCUSSIONS LIST */}
          {activeTab === 'discussions' && (
            <div className="space-y-4">
              {filteredDiscussions.length > 0 ? (
                filteredDiscussions.map((d) => (
                  <Card key={d.id} className="p-5 hover:border-white/10 transition-colors flex justify-between gap-6 group">
                    <div className="space-y-2 truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono border border-accent-pink/20 bg-accent-pink/5 text-accent-pink px-2 py-0.5 rounded uppercase font-semibold">
                          #{d.category}
                        </span>
                        <span className="text-[10.5px] text-stone font-mono">@{d.author?.name || 'developer'} • {new Date(d.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-[14.5px] font-bold text-warm-white group-hover:text-accent-pink transition-colors truncate">
                        <Link href={`/discussions/${d.slug}`}>{d.title}</Link>
                      </h4>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 font-mono text-[11.5px] text-stone">
                      <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {d.upvotes}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {d.answers?.length || 0}</span>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl text-center space-y-4">
                  <Inbox className="w-12 h-12 text-stone/30" />
                  <h4 className="text-[14px] font-bold text-warm-white">No discussions yet</h4>
                  <Button variant="primary" onClick={() => { setIsQuestion(false); setShowForm(true); }}>
                    Start the First Discussion
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* QUESTIONS LIST */}
          {activeTab === 'qa' && (
            <div className="space-y-4">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((q) => (
                  <Card key={q.id} className="p-5 hover:border-white/10 transition-colors flex gap-6 group justify-between">
                    <div className="flex gap-4 items-start truncate">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-charcoal/30 border border-white/5 text-[11px] font-mono text-stone shrink-0">
                        <span className="font-bold text-warm-white">{q.upvotes}</span>
                        <span className="text-[8px] uppercase tracking-wider">votes</span>
                      </div>

                      <div className="space-y-1.5 truncate">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9.5px] font-mono text-accent-cyan uppercase font-bold">#{q.category}</span>
                          {q.acceptedAnswerId && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 px-1.5 py-0.25 rounded font-mono">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                            </span>
                          )}
                          <span className="text-[10px] text-stone/50 font-mono">{new Date(q.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-[14.5px] font-bold text-warm-white group-hover:text-accent-cyan transition-colors truncate">
                          <Link href={`/discussions/${q.slug}`}>{q.title}</Link>
                        </h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[11.5px] text-stone shrink-0">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{q.answers?.length || 0} answers</span>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl text-center space-y-4">
                  <Inbox className="w-12 h-12 text-stone/30" />
                  <h4 className="text-[14px] font-bold text-warm-white">No questions asked yet</h4>
                  <Button variant="primary" onClick={() => { setIsQuestion(true); setShowForm(true); }}>
                    Ask a Question
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* POLLS LIST */}
          {activeTab === 'polls' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {polls.length > 0 ? (
                polls.map((p) => {
                  const totalVotes = p.options?.reduce((sum: number, o: any) => sum + (o.votes?.length || 0), 0) || 0;
                  const userChoice = votedPolls[p.id];
                  return (
                    <Card key={p.id} className="p-5 border-white/5 bg-charcoal/10 flex flex-col justify-between h-full relative overflow-hidden">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] text-stone font-mono">
                          <span className="uppercase text-accent-orange font-bold">#{p.category}</span>
                          <span>{totalVotes} votes cast</span>
                        </div>
                        <h4 className="text-[14.5px] font-bold text-warm-white">{p.title}</h4>
                        {p.description && <p className="text-[11.5px] text-stone/80 font-light leading-snug">{p.description}</p>}
                        
                        <div className="space-y-2.5">
                          {p.options?.map((opt: any) => {
                            const optVotes = opt.votes?.length || 0;
                            const pct = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
                            const choiceSelected = userChoice === opt.id;
                            
                            return (
                              <button
                                key={opt.id}
                                disabled={!!userChoice}
                                onClick={() => handlePollVote(p.id, opt.id)}
                                className={`w-full relative p-3 rounded-lg border text-left text-[11.5px] overflow-hidden flex justify-between items-center transition-all
                                  ${userChoice 
                                    ? 'bg-charcoal/20 border-white/5 text-stone cursor-default' 
                                    : 'bg-charcoal/30 border-white/5 text-warm-white hover:border-white/10 hover:bg-charcoal/50 cursor-pointer'}`}
                              >
                                {userChoice && (
                                  <div 
                                    style={{ width: `${pct}%` }} 
                                    className="absolute left-0 top-0 bottom-0 bg-accent-orange/10 pointer-events-none transition-all duration-500" 
                                  />
                                )}
                                <span className={`relative z-10 font-medium ${choiceSelected ? 'text-accent-orange' : ''}`}>{opt.text}</span>
                                <span className="relative z-10 font-mono text-[11px] font-bold">
                                  {userChoice ? `${pct}%` : 'Vote'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="md:col-span-2 py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl text-center">
                  <Inbox className="w-12 h-12 text-stone/30" />
                  <h4 className="text-[14px] font-bold text-warm-white mt-4">No polls registered</h4>
                </div>
              )}
            </div>
          )}

          {/* EVENTS LIST */}
          {activeTab === 'events' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {initialEvents.length > 0 ? (
                initialEvents.map((evt) => {
                  const active = new Date(evt.deadlineAt).getTime() > Date.now();
                  return (
                    <Card key={evt.id} className="p-0 border-white/5 bg-charcoal/20 hover:border-white/10 transition-colors flex flex-col justify-between h-full relative overflow-hidden group">
                      {evt.banner && (
                        <div className="w-full h-32 overflow-hidden relative">
                          <img src={evt.banner} alt={evt.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                          <div className={`absolute top-2 left-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-white shadow-lg ${active ? 'bg-accent-pink' : 'bg-stone'}`}>
                            <span>{evt.eventType}</span>
                          </div>
                        </div>
                      )}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-[15px] font-bold text-warm-white group-hover:text-accent-pink transition-colors leading-snug">
                            <Link href={`/events/${evt.slug}`}>{evt.title}</Link>
                          </h4>
                          <p className="text-[12px] text-stone leading-relaxed line-clamp-2 font-light">
                            {evt.description}
                          </p>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-white/5 text-[10.5px] text-stone font-mono">
                          <span>Team: {evt.minTeamSize}-{evt.maxTeamSize} devs</span>
                          <Link href={`/events/${evt.slug}`} className="text-accent-pink hover:underline flex items-center gap-0.5">
                            Details <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="md:col-span-2 py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl text-center">
                  <Inbox className="w-12 h-12 text-stone/30" />
                  <h4 className="text-[14px] font-bold text-warm-white mt-4">No events scheduled</h4>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Side: Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Ecosystem Rules widget */}
          <Card className="p-5 border-white/5 bg-charcoal/20 space-y-4 text-[12.5px]">
            <h3 className="text-[11.5px] font-bold text-stone font-mono uppercase tracking-wider">
              Space Rules
            </h3>
            <ul className="space-y-2.5 list-disc pl-4 font-light text-stone/85 leading-relaxed">
              <li>Keep all conversations and questions constructive.</li>
              <li>Provide code snippets in markdown code blocks.</li>
              <li>Cast opinion poll votes objectively.</li>
              <li>Organizers must follow up on event registrations promptly.</li>
            </ul>
          </Card>

        </div>

      </div>

    </div>
  );
}

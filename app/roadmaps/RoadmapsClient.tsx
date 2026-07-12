'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui/core';
import { 
  Compass, 
  Plus, 
  Map, 
  Calendar, 
  Award, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Inbox,
  AlertCircle
} from 'lucide-react';
import { submitRoadmapSuggestionAction } from '@/lib/actions/roadmapActions';

interface RoadmapsClientProps {
  roadmaps: any[];
  userId: string | null;
}

export default function RoadmapsClient({ roadmaps, userId }: RoadmapsClientProps) {
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [sugTitle, setSugTitle] = useState('');
  const [sugDesc, setSugDesc] = useState('');
  const [sugType, setSugType] = useState<'new_roadmap' | 'edit_step' | 'outdated_step'>('new_roadmap');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError('You must be logged in to suggest roadmaps.');
      return;
    }
    if (!sugTitle.trim() || !sugDesc.trim()) {
      setError('Title and Description are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await submitRoadmapSuggestionAction({
        title: sugTitle,
        description: sugDesc,
        type: sugType
      });

      if (res.success) {
        setSuccess(true);
        setSugTitle('');
        setSugDesc('');
        setTimeout(() => {
          setSuccess(false);
          setShowSuggestForm(false);
        }, 3000);
      } else {
        setError(res.error || 'Failed to submit suggestion.');
      }
    } catch (err: any) {
      setError(err.message || 'Server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-12 pb-16 font-sans space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Library</span>
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-warm-white">Learning Roadmaps</h1>
          <p className="text-[13px] text-stone font-light mt-1">
            Curated and verified path guides built by experts. Choose a track, track your progress node by node, and complete credentials.
          </p>
        </div>

        <Button 
          variant="primary" 
          onClick={() => {
            setShowSuggestForm(!showSuggestForm);
            setError('');
          }}
          className="text-[11.5px] uppercase font-bold tracking-wider py-2 px-4 shrink-0 self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Suggest Roadmap</span>
        </Button>
      </div>

      {/* Suggestion Form */}
      {showSuggestForm && (
        <Card className="p-5 border border-white/10 bg-charcoal/30 space-y-4 max-w-2xl">
          <h3 className="text-[13.5px] font-bold text-warm-white font-mono uppercase tracking-wider">
            Roadmap / Step Suggestion Form
          </h3>

          {error && (
            <div className="p-3 bg-accent-pink/10 border border-accent-pink/20 text-accent-pink text-[12px] rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-[12.5px] rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Suggestion submitted to moderation queue!</span>
            </div>
          )}

          <form onSubmit={handleSuggestionSubmit} className="space-y-4 text-[12px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-stone uppercase font-bold">Suggestion Type</label>
                <select
                  value={sugType}
                  onChange={(e: any) => setSugType(e.target.value)}
                  className="w-full bg-charcoal/20 border border-white/5 rounded px-2.5 py-1.5 text-stone outline-none cursor-pointer"
                >
                  <option value="new_roadmap">Suggest a New Roadmap</option>
                  <option value="edit_step">Suggest Edits to Existing Roadmap</option>
                  <option value="outdated_step">Report Outdated Resources/Steps</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-stone uppercase font-bold">Title / Step Name *</label>
                <input 
                  type="text"
                  required
                  value={sugTitle}
                  onChange={(e) => setSugTitle(e.target.value)}
                  placeholder="E.g. System Design Track, Outdated React Router link"
                  className="w-full bg-charcoal/20 border border-white/5 rounded px-2.5 py-1.5 text-warm-white outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-stone uppercase font-bold">Details & Resources *</label>
              <textarea 
                required
                value={sugDesc}
                onChange={(e) => setSugDesc(e.target.value)}
                placeholder="List recommended topics, links to blogs/notes, or description updates..."
                rows={4}
                className="w-full bg-charcoal/20 border border-white/5 rounded px-2.5 py-1.5 text-warm-white outline-none resize-none font-sans"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" type="button" onClick={() => setShowSuggestForm(false)}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Suggestion'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Library Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roadmaps.length > 0 ? (
          roadmaps.map((rm) => (
            <Card key={rm.id} className="p-6 border-white/5 bg-charcoal/20 hover:border-accent-cyan/30 transition-all flex flex-col justify-between h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent-cyan/[0.01] rounded-bl-full group-hover:bg-accent-cyan/[0.03] transition-colors" />
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] text-stone font-mono">
                  <span className="uppercase text-accent-cyan font-bold tracking-wider">{rm.difficulty} Level</span>
                  <span>Duration: {rm.duration}</span>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-warm-white group-hover:text-accent-cyan transition-colors">
                    {rm.title}
                  </h3>
                  <p className="text-[12.5px] text-stone leading-relaxed font-light">
                    {rm.description}
                  </p>
                </div>

                {rm.prerequisites && rm.prerequisites.length > 0 && (
                  <div className="text-[11px] text-stone/85 font-mono pt-1">
                    Prereqs: {rm.prerequisites.join(', ')}
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="pt-6 border-t border-white/5 mt-6 space-y-2">
                <div className="flex justify-between items-center text-[11px] font-mono text-stone">
                  <span>Track progress</span>
                  <span className="text-warm-white font-bold">{rm.percent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div 
                    style={{ width: `${rm.percent}%` }}
                    className="h-full bg-accent-cyan shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Link href={`/roadmaps/${rm.slug}`}>
                    <Button variant="primary" className="text-[11px] py-1.5 px-3 flex items-center gap-1 uppercase tracking-wider font-bold">
                      <span>Enter Roadmap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="md:col-span-2 py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl text-center space-y-4">
            <Inbox className="w-12 h-12 text-stone/30" />
            <h4 className="text-[14px] font-bold text-warm-white">No roadmaps published</h4>
          </div>
        )}
      </div>

    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Card, Button } from '@/components/ui/core';
import { 
  CheckCircle2, 
  Circle, 
  Map, 
  Lock, 
  Compass, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Award
} from 'lucide-react';
import { updateRoadmapProgressAction } from '@/lib/actions/roadmapActions';
import Link from 'next/link';

interface RoadmapDetailClientProps {
  roadmap: any;
  initialCompleted: string[];
  userId: string | null;
}

export default function RoadmapDetailClient({ roadmap, initialCompleted, userId }: RoadmapDetailClientProps) {
  const [completed, setCompleted] = useState<string[]>(initialCompleted);
  const [loading, setLoading] = useState(false);

  const steps = roadmap.steps || [];
  const percent = steps.length > 0 ? Math.round((completed.length / steps.length) * 100) : 0;

  // Toggle step completeness
  const handleToggleStep = async (stepId: string) => {
    if (!userId) return;

    let newCompleted = [...completed];
    if (newCompleted.includes(stepId)) {
      newCompleted = newCompleted.filter(id => id !== stepId);
    } else {
      newCompleted.push(stepId);
    }

    setCompleted(newCompleted);

    try {
      await updateRoadmapProgressAction(roadmap.id, newCompleted);
    } catch (e) {
      console.error('Error updating roadmap progress:', e);
    }
  };

  // Mock related content details to populate the step nodes dynamically
  const getMockRelatedContent = (stepTitle: string) => {
    const titleLower = stepTitle.toLowerCase();
    if (titleLower.includes('html') || titleLower.includes('css')) {
      return [
        { type: 'blog', label: 'Flexbox vs Grid layouts guide', href: '/posts/introducing-partial-prerendering' },
        { type: 'note', label: 'Stanford Web Design Sem-2 notes', href: '/notes/operating-system-notes' }
      ];
    }
    if (titleLower.includes('javascript') || titleLower.includes('ts')) {
      return [
        { type: 'discussion', label: 'Best TypeScript configs?', href: '/discussions/best-authentication-strategy-for-nextjs-16' }
      ];
    }
    if (titleLower.includes('react') || titleLower.includes('next')) {
      return [
        { type: 'project', label: 'StudyMaterial Core Repository', href: '/projects/study-materials' },
        { type: 'discussion', label: 'Authentication Strategies for Next.js 16', href: '/discussions/best-authentication-strategy-for-nextjs-16' },
        { type: 'question', label: 'JWT verifications inside Middleware', href: '/discussions/how-does-jwt-work-under-the-hood-in-nextjs-middleware' }
      ];
    }
    return [];
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Roadmap Title Card */}
      <Card className="p-6 border-white/5 bg-charcoal/20 relative overflow-hidden">
        <div className="absolute inset-0 grid-background opacity-20 pointer-events-none" />
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan">
              <Map className="w-3.5 h-3.5" />
              <span>{roadmap.difficulty} path</span>
            </span>
            <span className="text-[11px] text-stone font-mono">
              Estimated: {roadmap.duration}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-warm-white">
            {roadmap.title}
          </h1>
          <p className="text-[13px] text-stone/90 leading-relaxed font-light">
            {roadmap.description}
          </p>

          {/* Progress Bar */}
          <div className="pt-4 border-t border-white/5 space-y-2.5">
            <div className="flex justify-between items-center text-[11px] font-mono text-stone">
              <span>My Progress</span>
              <span className="text-warm-white font-bold">{percent}% Completed</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <div 
                style={{ width: `${percent}%` }}
                className="h-full bg-accent-cyan shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all duration-300"
              />
            </div>
            {!userId && (
              <span className="text-[10px] text-stone block font-mono pl-1">
                * Log in to track progress and save completed steps.
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Steps List */}
      <div className="space-y-6">
        <h3 className="text-[13px] font-bold text-stone font-mono uppercase tracking-wider pl-1">
          Path Steps Sequence
        </h3>

        <div className="space-y-6 pl-2">
          {steps.map((step: any, index: number) => {
            const isDone = completed.includes(step.id);
            const related = getMockRelatedContent(step.title);

            return (
              <div key={step.id} className="relative flex gap-6 group pl-6">
                
                {/* Node Line connecting dots */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[30px] top-6 bottom-[-32px] w-[1.5px] bg-white/5 group-hover:bg-white/10 transition-colors" />
                )}

                {/* Left Dot checkbox */}
                <div className="z-10 shrink-0 mt-1">
                  <button 
                    disabled={!userId}
                    onClick={() => handleToggleStep(step.id)}
                    className="focus:outline-none transition-transform active:scale-95 cursor-pointer"
                  >
                    {isDone ? (
                      <div className="w-6 h-6 rounded-full bg-accent-cyan/15 border border-accent-cyan flex items-center justify-center text-accent-cyan shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-charcoal border border-white/20 flex items-center justify-center text-stone hover:border-warm-white transition-colors">
                        <Circle className="w-3.5 h-3.5 text-stone/50 hover:text-stone/75" />
                      </div>
                    )}
                  </button>
                </div>

                {/* Step Node Card */}
                <Card className={`p-5 flex-1 border transition-all relative overflow-hidden
                  ${isDone ? 'border-accent-cyan/20 bg-accent-cyan/[0.01]' : 'border-white/5'}`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-3">
                      <h4 className="text-[15px] font-bold text-warm-white flex items-center gap-2">
                        {step.title}
                      </h4>
                      <span className="text-[11px] text-stone/60 font-mono">0{index + 1}</span>
                    </div>
                    {step.description && (
                      <p className="text-[12.5px] text-stone leading-relaxed font-light font-sans">
                        {step.description}
                      </p>
                    )}

                    {/* Related platform nodes */}
                    {related.length > 0 && (
                      <div className="pt-3 border-t border-white/5 space-y-2 mt-3 text-[11px] font-sans">
                        <span className="text-[9.5px] font-mono text-stone uppercase block font-bold">Related Platform Content</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {related.map((link: any, lIdx: number) => (
                            <Link key={lIdx} href={link.href}>
                              <div className="p-2 rounded-lg bg-charcoal/30 border border-white/5 hover:border-white/10 transition-colors flex items-center justify-between group/link">
                                <div className="space-y-0.5 truncate pr-2">
                                  <span className={`text-[8.5px] font-mono uppercase px-1 rounded-sm block w-fit
                                    ${link.type === 'blog' ? 'bg-accent-cyan/10 text-accent-cyan' : 
                                      link.type === 'note' ? 'bg-accent-amber/10 text-accent-amber' : 
                                      link.type === 'project' ? 'bg-accent-violet/10 text-accent-violet' : 
                                      'bg-accent-pink/10 text-accent-pink'}`}>
                                    {link.type}
                                  </span>
                                  <span className="text-stone hover:text-warm-white truncate block">
                                    {link.label}
                                  </span>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-stone/50 group-hover/link:text-warm-white transition-colors shrink-0" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

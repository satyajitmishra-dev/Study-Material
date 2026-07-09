'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  BookOpen, 
  Code2, 
  Compass, 
  Map, 
  Search,
  Sparkles,
  Play,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Button, Card, Tabs } from '@/components/ui/core';
import { Storage, LearningProgress } from '@/lib/storage';
import { MOCK_COURSES, MOCK_PROJECTS, MOCK_ROADMAP } from '@/lib/mockData';

export default function HomeDashboard() {
  const [progress, setProgress] = useState<Record<string, LearningProgress>>({});
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    Storage.getProgress().then(setProgress);
  }, []);

  // Compute stats
  const activeCourse = MOCK_COURSES[0]; // Next.js 16
  const activeCourseProgress = progress[activeCourse.id];
  const completedCount = activeCourseProgress?.completedSteps.length || 0;
  const totalCount = activeCourse.chapters.reduce((sum, ch) => sum + ch.steps.length, 0);
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-6 pt-16 pb-12">
      {/* Cinematic Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-white/5 mb-16"
      >
        <div className="space-y-3">
          <span className="text-[11px] font-semibold text-accent-cyan tracking-[0.2em] uppercase">
            Platform Workspace
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-warm-white">
            StudyMaterial
          </h1>
          <p className="text-[14px] text-stone font-light max-w-md leading-relaxed">
            The Future of Learning for Developers. A premium workspace designed for speed, precision, and architectural mastery.
          </p>
        </div>

        {/* Raycast Search Callout */}
        <div className="w-full md:w-auto">
          <div 
            onClick={() => {
              const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'k' });
              window.dispatchEvent(event);
            }}
            className="flex items-center gap-6 px-4 py-3 bg-charcoal/20 border border-white/5 rounded-xl text-[12px] text-stone hover:text-warm-white hover:border-white/10 transition-all duration-200 cursor-pointer shadow-premium"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-stone" />
              <span>Search workspaces, actions, docs...</span>
            </div>
            <kbd className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[10px]">Ctrl + K</kbd>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Learning Stream & Catalog */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Active Course Progress Card */}
          {percentComplete > 0 ? (
            <Card glowColor="cyan" className="relative overflow-hidden group">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] bg-accent-cyan/10 border border-accent-cyan/20 px-2 py-0.5 rounded-full text-accent-cyan font-medium uppercase tracking-wider">
                    In Progress
                  </span>
                  <h2 className="text-xl font-bold text-warm-white">{activeCourse.title}</h2>
                  <p className="text-[12px] text-stone">{activeCourse.tagline}</p>
                </div>
                <div className="shrink-0 flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-[20px] font-mono font-bold text-warm-white">{percentComplete}%</span>
                    <span className="text-[10px] text-stone uppercase tracking-wider">Completed</span>
                  </div>
                  <Link href={`/learn/${activeCourse.id}`}>
                    <Button variant="primary" className="magnetic-item">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Resume</span>
                    </Button>
                  </Link>
                </div>
              </div>
              {/* Progress Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentComplete}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full bg-accent-cyan shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                />
              </div>
            </Card>
          ) : (
            <Card className="flex flex-col md:flex-row items-center justify-between gap-6 border-dashed border-white/10 bg-transparent">
              <div className="space-y-1 text-center md:text-left">
                <h3 className="text-[14px] font-semibold text-warm-white">No active course progress</h3>
                <p className="text-[12px] text-stone">Launch any course step to track progress and unlock certificates.</p>
              </div>
              <Link href={`/learn/${activeCourse.id}`}>
                <Button variant="primary">Explore Course</Button>
              </Link>
            </Card>
          )}

          {/* Catalog / Workspaces */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-lg font-bold tracking-tight text-warm-white">Explore Workspaces</h2>
              <Tabs 
                options={[
                  { id: 'courses', label: 'Courses', icon: BookOpen },
                  { id: 'projects', label: 'Projects', icon: Code2 }
                ]}
                activeId={activeTab}
                onChange={setActiveTab}
              />
            </div>

            {activeTab === 'courses' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_COURSES.map((course) => (
                  <Card key={course.id} className="flex flex-col justify-between h-[180px] hover:border-white/10 group">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-accent-cyan uppercase tracking-widest">{course.category}</span>
                        <span className="text-[11px] text-stone">{course.duration}</span>
                      </div>
                      <h3 className="text-[15px] font-bold text-warm-white group-hover:text-accent-cyan transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-[12px] text-stone/80 line-clamp-2 leading-relaxed">
                        {course.tagline}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                      <span className="text-[11px] text-stone">{course.difficulty}</span>
                      <Link href={`/learn/${course.id}`} className="text-[11px] text-stone hover:text-warm-white flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Enter Workspace</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_PROJECTS.map((project) => (
                  <Card key={project.id} className="flex flex-col justify-between h-[180px] group">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-accent-violet uppercase tracking-widest">{project.category}</span>
                        <span className="text-[11px] text-stone">★ {project.stars}</span>
                      </div>
                      <h3 className="text-[15px] font-bold text-warm-white group-hover:text-accent-violet transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-[12px] text-stone/80 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                      <span className="text-[11px] text-stone">Ready for Import</span>
                      <Link href={`/projects/${project.id}`} className="text-[11px] text-stone hover:text-warm-white flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Launch Project</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Roadmap Tree & Tools */}
        <div className="lg:col-span-4 space-y-12">
          
          {/* Interactive Roadmap Nodes */}
          <div className="space-y-6">
            <div className="border-b border-white/5 pb-3">
              <h2 className="text-lg font-bold tracking-tight text-warm-white flex items-center gap-2">
                <Map className="w-4 h-4 text-stone" />
                <span>Learning Pathway</span>
              </h2>
            </div>

            <Card className="relative overflow-hidden bg-charcoal/20 border-white/5 p-6">
              <div className="absolute inset-0 grid-background opacity-20 pointer-events-none" />
              
              <div className="relative flex flex-col gap-6">
                {MOCK_ROADMAP.map((node, index) => {
                  const isCompleted = node.status === 'completed';
                  const isAvailable = node.status === 'available';
                  const isLocked = node.status === 'locked';

                  return (
                    <div key={node.id} className="relative flex gap-4 group">
                      {/* Connection Line */}
                      {index < MOCK_ROADMAP.length - 1 && (
                        <div className="absolute left-[9px] top-5 bottom-[-24px] w-[1.5px] bg-white/5 group-hover:bg-white/10 transition-colors" />
                      )}

                      {/* Status Icon */}
                      <div className="z-10 shrink-0 mt-1">
                        {isCompleted && (
                          <div className="w-5 h-5 rounded-full bg-accent-cyan/15 border border-accent-cyan flex items-center justify-center text-accent-cyan shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                        )}
                        {isAvailable && (
                          <div className="w-5 h-5 rounded-full bg-onyx border border-white/30 flex items-center justify-center text-warm-white hover:border-warm-white transition-colors">
                            <div className="w-1.5 h-1.5 rounded-full bg-warm-white" />
                          </div>
                        )}
                        {isLocked && (
                          <div className="w-5 h-5 rounded-full bg-charcoal border border-white/5 flex items-center justify-center text-stone">
                            <Lock className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[12px] font-bold ${isLocked ? 'text-stone/60' : 'text-warm-white'}`}>
                            {node.title}
                          </span>
                          <span className={`text-[9px] font-mono border px-1 rounded-sm uppercase tracking-wider
                            ${node.category === 'React' 
                              ? 'bg-accent-cyan/5 border-accent-cyan/20 text-accent-cyan' 
                              : node.category === 'CSS' 
                              ? 'bg-accent-pink/5 border-accent-pink/20 text-accent-pink'
                              : 'bg-accent-violet/5 border-accent-violet/20 text-accent-violet'
                            }
                          `}>
                            {node.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone/80 leading-relaxed">
                          {node.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Quick Tools list */}
          <div className="space-y-6">
            <div className="border-b border-white/5 pb-3">
              <h2 className="text-lg font-bold tracking-tight text-warm-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-stone" />
                <span>Developer Tools</span>
              </h2>
            </div>
            
            <div className="space-y-2">
              <Link href="/admin/import" className="block group">
                <div className="flex items-center justify-between p-3.5 rounded-lg bg-charcoal/20 border border-white/5 hover:bg-charcoal/40 hover:border-white/10 transition-all duration-150">
                  <div className="space-y-0.5">
                    <h4 className="text-[12px] font-semibold text-warm-white group-hover:text-accent-cyan transition-colors">GitHub Importer</h4>
                    <p className="text-[10px] text-stone">Import repositories with dynamic metadata scraping</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-stone group-hover:text-warm-white transition-colors" />
                </div>
              </Link>

              <Link href="/admin/seo" className="block group">
                <div className="flex items-center justify-between p-3.5 rounded-lg bg-charcoal/20 border border-white/5 hover:bg-charcoal/40 hover:border-white/10 transition-all duration-150">
                  <div className="space-y-0.5">
                    <h4 className="text-[12px] font-semibold text-warm-white group-hover:text-accent-cyan transition-colors">SEO Studio</h4>
                    <p className="text-[10px] text-stone">Real-time meta validation and search engine previews</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-stone group-hover:text-warm-white transition-colors" />
                </div>
              </Link>

              <Link href="/admin/analytics" className="block group">
                <div className="flex items-center justify-between p-3.5 rounded-lg bg-charcoal/20 border border-white/5 hover:bg-charcoal/40 hover:border-white/10 transition-all duration-150">
                  <div className="space-y-0.5">
                    <h4 className="text-[12px] font-semibold text-warm-white group-hover:text-accent-cyan transition-colors">Analytics Center</h4>
                    <p className="text-[10px] text-stone">Deep visual insights and course completion graphs</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-stone group-hover:text-warm-white transition-colors" />
                </div>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

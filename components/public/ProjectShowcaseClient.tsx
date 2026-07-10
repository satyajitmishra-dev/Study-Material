'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, 
  Globe, 
  BookOpen, 
  Star, 
  Eye, 
  GitFork, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  GitCommit, 
  GitPullRequest, 
  Heart, 
  Bookmark, 
  Calendar,
  AlertCircle,
  Award,
  BookMarked,
  Code2,
  ChevronRight,
  Terminal,
  ExternalLink,
  ThumbsUp
} from 'lucide-react';
import Link from 'next/link';
import { Card, Button, Tabs } from '@/components/ui/core';
import { toggleFollowDeveloperOrProjectAction } from '@/lib/actions/profileActions';
import { reactToPostAction, bookmarkPostAction, submitCommentAction } from '@/lib/actions/public';

interface ClientProps {
  project: any;
  slug: string;
}

export default function ProjectShowcaseClient({ project, slug }: ClientProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Follow project state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(12); // Simulated base count
  
  // Interactive social actions
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(pViews(project.id) % 35);
  
  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [replyInput, setReplyInput] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  // GitHub Meta
  const githubMeta = project.integrations?.find((i: any) => i.provider === 'github' && i.isActive)?.metadata 
    ? JSON.parse(project.integrations.find((i: any) => i.provider === 'github' && i.isActive).metadata)
    : project.githubMetadata ? JSON.parse(project.githubMetadata) : null;

  function pViews(id: string) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  }

  // Load comments
  useEffect(() => {
    // Simulated discussions fetch or publicDb comments fetch
    setComments([
      {
        id: 'comm_1',
        user: { name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80' },
        content: 'This database adapter implementation is extremely modular. Excellent schema layout!',
        createdAt: new Date(Date.now() - 3600000 * 24),
        replies: [
          {
            id: 'rep_1',
            user: { name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80' },
            content: 'Agreed, the transaction handling fallback for sandbox queries works like a charm.',
            createdAt: new Date(Date.now() - 3600000 * 12)
          }
        ]
      }
    ]);
  }, [project.id]);

  const handleFollowProject = async () => {
    const prev = isFollowing;
    setIsFollowing(!prev);
    setFollowersCount(prev ? followersCount - 1 : followersCount + 1);
    await toggleFollowDeveloperOrProjectAction('PROJECT', project.id);
  };

  const handleLike = async () => {
    const prev = isLiked;
    setIsLiked(!prev);
    setLikesCount(prev ? likesCount - 1 : likesCount + 1);
    // Project acts as CmsProject or post in comments / reactions context
    await reactToPostAction(project.id, 'LIKE');
  };

  const handleBookmark = async () => {
    setIsBookmarked(!isBookmarked);
    await bookmarkPostAction(project.id);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment = {
      id: `c_${Date.now()}`,
      user: { name: 'Sandbox Administrator', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80' },
      content: commentInput,
      createdAt: new Date(),
      replies: []
    };

    setComments([newComment, ...comments]);
    setCommentInput('');
    await submitCommentAction(project.id, commentInput);
  };

  const handleAddReply = async (commentId: string) => {
    if (!replyInput.trim()) return;

    setComments(comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [
            ...c.replies,
            {
              id: `r_${Date.now()}`,
              user: { name: 'Sandbox Administrator', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80' },
              content: replyInput,
              createdAt: new Date()
            }
          ]
        };
      }
      return c;
    }));

    setReplyInput('');
    setActiveReplyId(null);
    await submitCommentAction(project.id, replyInput, commentId);
  };

  // Tech stack colors mapping
  const getTechColor = (tech: string) => {
    const t = tech.toLowerCase();
    if (t.includes('react') || t.includes('next')) return 'bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan';
    if (t.includes('tailwind') || t.includes('css')) return 'bg-accent-pink/10 border-accent-pink/20 text-accent-pink';
    if (t.includes('postgres') || t.includes('prisma')) return 'bg-accent-teal/10 border-accent-teal/20 text-accent-teal';
    return 'bg-accent-violet/10 border-accent-violet/20 text-accent-violet';
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Project Banner cover */}
      <div className="relative w-full h-[240px] rounded-2xl overflow-hidden border border-white/5 shadow-premium">
        {project.banner ? (
          <img src={project.banner} alt={project.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-charcoal/20 via-onyx to-accent-violet/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/30 to-transparent" />
        <div className="absolute inset-0 grid-background opacity-10" />
      </div>

      {/* Project Header Hero Card */}
      <div className="relative -mt-24 px-6 flex flex-col md:flex-row items-end gap-6 border-b border-white/5 pb-8">
        <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 bg-charcoal shadow-premium shrink-0 flex items-center justify-center">
          {project.logo ? (
            <img src={project.logo} alt={project.name} className="w-full h-full object-cover" />
          ) : (
            <Code2 className="w-12 h-12 text-stone" />
          )}
        </div>

        <div className="flex-1 space-y-3 mt-4 md:mt-0 text-center md:text-left">
          <div>
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
              <h1 className="text-3xl font-extrabold text-warm-white tracking-tight">{project.name}</h1>
              <span className="w-fit self-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent-violet/15 border border-accent-violet/20 text-accent-violet uppercase tracking-wider">
                {project.status || 'Active'}
              </span>
            </div>
            <p className="text-[13px] text-stone mt-1 max-w-xl font-light">
              {project.description || 'Showcase and software repository analytics.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1">
            {project.liveDemo && (
              <a href={project.liveDemo} target="_blank" rel="noreferrer" className="text-[12px] text-accent-cyan hover:underline flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                <span>Live Demo</span>
              </a>
            )}
            {project.documentationUrl && (
              <a href={project.documentationUrl} target="_blank" rel="noreferrer" className="text-[12px] text-accent-violet hover:underline flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Documentation</span>
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-[12px] text-stone hover:text-warm-white hover:underline flex items-center gap-1">
                <Github className="w-3.5 h-3.5" />
                <span>Source Repository</span>
              </a>
            )}
          </div>
        </div>

        {/* Showcase actions */}
        <div className="shrink-0 flex items-center gap-3 w-full md:w-auto justify-center">
          <Button 
            variant={isFollowing ? 'secondary' : 'accent'} 
            onClick={handleFollowProject}
            className="px-4 py-2"
          >
            {isFollowing ? 'Following Project' : 'Follow Project'}
            <span className="text-[10px] font-mono border border-white/10 px-1 rounded-sm bg-white/5 ml-1">{followersCount}</span>
          </Button>

          <button onClick={handleLike} className={`p-2 rounded-lg border transition-all ${isLiked ? 'bg-accent-pink/10 border-accent-pink/20 text-accent-pink' : 'border-white/5 text-stone hover:text-accent-pink'}`}>
            <Heart className="w-4 h-4 fill-current" />
          </button>
          <button onClick={handleBookmark} className={`p-2 rounded-lg border transition-all ${isBookmarked ? 'bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan' : 'border-white/5 text-stone hover:text-accent-cyan'}`}>
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>

      {/* GitHub Repository Cached stats cards */}
      {githubMeta && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="p-3 text-center">
            <span className="text-[9px] font-mono text-stone uppercase block">Stars</span>
            <span className="text-lg font-bold text-warm-white font-mono mt-1 flex items-center justify-center gap-1"><Star className="w-3.5 h-3.5 text-accent-amber fill-accent-amber" /> {githubMeta.stars || 0}</span>
          </Card>
          <Card className="p-3 text-center">
            <span className="text-[9px] font-mono text-stone uppercase block">Watchers</span>
            <span className="text-lg font-bold text-warm-white font-mono mt-1 flex items-center justify-center gap-1"><Eye className="w-3.5 h-3.5 text-accent-cyan" /> {githubMeta.watchers || 0}</span>
          </Card>
          <Card className="p-3 text-center">
            <span className="text-[9px] font-mono text-stone uppercase block">Forks</span>
            <span className="text-lg font-bold text-warm-white font-mono mt-1 flex items-center justify-center gap-1"><GitFork className="w-3.5 h-3.5 text-accent-pink" /> {githubMeta.forks || 0}</span>
          </Card>
          <Card className="p-3 text-center">
            <span className="text-[9px] font-mono text-stone uppercase block">Open Issues</span>
            <span className="text-lg font-bold text-warm-white font-mono mt-1 flex items-center justify-center gap-1"><AlertCircle className="w-3.5 h-3.5 text-accent-pink" /> {githubMeta.openIssues || 0}</span>
          </Card>
          <Card className="p-3 text-center">
            <span className="text-[9px] font-mono text-stone uppercase block">Pulls</span>
            <span className="text-lg font-bold text-warm-white font-mono mt-1 flex items-center justify-center gap-1"><GitPullRequest className="w-3.5 h-3.5 text-accent-emerald" /> {githubMeta.openPulls || 0}</span>
          </Card>
          <Card className="p-3 text-center">
            <span className="text-[9px] font-mono text-stone uppercase block">License</span>
            <span className="text-[12px] font-bold text-warm-white font-mono mt-2 block truncate">{githubMeta.license || 'MIT'}</span>
          </Card>
        </div>
      )}

      {/* Tabs list */}
      <Tabs 
        options={[
          { id: 'overview', label: 'Readme & Repo', icon: Github },
          { id: 'roadmap', label: 'Milestones Roadmap', icon: CheckCircle2 },
          { id: 'timeline', label: 'Timeline Feed', icon: Clock },
          { id: 'articles', label: 'Articles & Updates', icon: BookOpen },
          { id: 'community', label: 'Discussions', icon: MessageSquare }
        ]} 
        activeId={activeTab} 
        onChange={setActiveTab}
        className="w-full md:w-fit"
      />

      {/* Tab Panels */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {/* README Render */}
              <div className="md:col-span-2 space-y-6">
                <Card className="p-6 space-y-4">
                  <h3 className="text-md font-bold text-warm-white border-b border-white/5 pb-2">Repository README</h3>
                  <div className="prose prose-invert max-w-none text-[13.5px] leading-relaxed text-stone/90 font-light select-text">
                    {githubMeta?.readme ? (
                      <pre className="whitespace-pre-wrap font-sans text-stone/95 leading-relaxed">
                        {githubMeta.readme}
                      </pre>
                    ) : (
                      <p className="italic text-stone/50 text-[12px]">No cached README found.</p>
                    )}
                  </div>
                </Card>
              </div>

              {/* Sidebar stats & languages */}
              <div className="space-y-6">
                {/* Languages */}
                {githubMeta?.languages && (
                  <Card className="p-5 space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-stone">Languages</h3>
                    <div className="space-y-3">
                      {githubMeta.languages.map((l: string, idx: number) => (
                        <div key={l} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-warm-white font-bold">{l}</span>
                            <span className="text-stone">{idx === 0 ? 'Primary' : 'Sub'}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <div className={`h-full ${idx === 0 ? 'bg-accent-cyan' : idx === 1 ? 'bg-accent-violet' : 'bg-accent-pink'}`} style={{ width: idx === 0 ? '70%' : idx === 1 ? '20%' : '10%' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Recent Commits */}
                {githubMeta?.commits && (
                  <Card className="p-5 space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-stone">Latest Commits</h3>
                    <div className="space-y-3">
                      {githubMeta.commits.slice(0, 5).map((commit: any) => (
                        <div key={commit.sha} className="p-2.5 rounded bg-charcoal/20 border border-white/5 space-y-1 text-[11.5px] leading-snug">
                          <div className="flex items-center justify-between text-[9px] font-mono text-stone">
                            <span className="text-accent-cyan font-bold">{commit.sha}</span>
                            <span>{new Date(commit.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-warm-white font-medium line-clamp-1">{commit.message}</p>
                          <span className="text-[9.5px] text-stone/50 block font-mono">by {commit.author}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Contributors */}
                {githubMeta?.contributors && (
                  <Card className="p-5 space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-stone">Contributors</h3>
                    <div className="flex flex-wrap gap-2.5">
                      {githubMeta.contributors.map((c: any) => (
                        <div key={c.login} className="flex items-center gap-2 bg-white/5 border border-white/5 pl-1.5 pr-2.5 py-1 rounded-full text-[11px] font-mono font-medium hover:bg-white/10 transition-colors">
                          <div className="w-5 h-5 rounded-full overflow-hidden border border-white/10 shrink-0">
                            <img src={c.avatar_url} alt={c.login} className="w-full h-full object-cover" />
                          </div>
                          <span>@{c.login}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'roadmap' && (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-3xl"
            >
              <h3 className="text-md font-bold text-warm-white border-b border-white/5 pb-2">Milestones Roadmap</h3>

              <div className="space-y-6 pt-2">
                {project.roadmaps && project.roadmaps.map((milestone: any) => {
                  const tasks = milestone.tasks || [];
                  const done = tasks.filter((t: any) => t.status === 'done').length;
                  const total = tasks.length;
                  const calcProgress = total > 0 ? Math.round((done / total) * 100) : milestone.progress || 0;

                  // Render progress bar blocks
                  const filledBlocks = Math.round(calcProgress / 10);
                  const emptyBlocks = 10 - filledBlocks;
                  const blockBar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

                  return (
                    <Card key={milestone.id} className="p-6 space-y-4 hover:border-white/10 transition-colors">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h4 className="text-[14.5px] font-bold text-warm-white flex items-center gap-2">
                            <span>{milestone.title}</span>
                          </h4>
                          <p className="text-[12px] text-stone leading-relaxed font-light mt-1">
                            {milestone.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold font-mono uppercase tracking-wider ${milestone.status === 'completed' ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20' : milestone.status === 'in_progress' ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20' : 'bg-white/5 text-stone border border-white/5'}`}>
                            {milestone.status.replace('_', ' ')}
                          </span>
                          {milestone.estimatedCompletion && (
                            <span className="text-[9.5px] text-stone/50 font-mono block mt-1.5">Est. {new Date(milestone.estimatedCompletion).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar Widget */}
                      <div className="space-y-1.5 p-3 rounded-lg bg-onyx/40 border border-white/5 font-mono text-[11px]">
                        <div className="flex items-center justify-between text-stone">
                          <span>Milestone Checklist Progress: {calcProgress}%</span>
                          <span>{done}/{total} Tasks Completed</span>
                        </div>
                        <div className="text-[13px] text-accent-cyan font-bold tracking-tight select-none block mt-1">
                          {blockBar}
                        </div>
                      </div>

                      {/* Checklist items */}
                      {tasks.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-white/5">
                          <span className="text-[10px] font-mono text-stone uppercase tracking-wider block">Tasks Checklist</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                            {tasks.map((task: any) => (
                              <div key={task.id} className="flex items-center gap-2 text-[12px] text-stone">
                                <CheckCircle2 className={`w-4 h-4 shrink-0 ${task.status === 'done' ? 'text-accent-emerald' : 'text-stone/30'}`} />
                                <span className={task.status === 'done' ? 'line-through text-stone/50' : 'text-fog'}>{task.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}

                {(!project.roadmaps || project.roadmaps.length === 0) && (
                  <div className="py-12 border border-dashed border-white/5 rounded-xl text-center text-[12px] text-stone">
                    No roadmap milestones configured.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-2xl"
            >
              <h3 className="text-md font-bold text-warm-white border-b border-white/5 pb-2">Timeline Feed (Learn in Public)</h3>

              <div className="space-y-6 pl-4 relative border-l border-white/5 ml-2 pt-2">
                {project.timelines && project.timelines.map((event: any) => {
                  const colorMap = {
                    repo_sync: 'bg-accent-cyan',
                    roadmap_complete: 'bg-accent-emerald',
                    article_publish: 'bg-accent-violet',
                    version_release: 'bg-accent-pink',
                    manual: 'bg-stone'
                  };
                  const colorClass = (colorMap as any)[event.type] || 'bg-stone';

                  return (
                    <div key={event.id} className="relative space-y-1.5">
                      <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full ${colorClass} border border-charcoal`} />
                      <div>
                        <span className="text-[10px] text-stone font-mono block uppercase">{new Date(event.date).toLocaleDateString()} · {event.type}</span>
                        <h4 className="text-[13.5px] font-bold text-warm-white mt-1">{event.title}</h4>
                        {event.description && (
                          <p className="text-[12px] text-stone leading-relaxed font-light mt-0.5">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {(!project.timelines || project.timelines.length === 0) && (
                  <div className="py-12 text-center text-[12px] text-stone">
                    Timeline stream is currently empty.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'articles' && (
            <motion.div
              key="articles"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {project.cmsProjects && project.cmsProjects.map((post: any) => (
                <Card key={post.id} className="p-5 hover:border-white/10 group flex flex-col md:flex-row gap-6">
                  {post.coverImage && (
                    <div className="w-full md:w-44 aspect-[16/10] rounded-xl overflow-hidden border border-white/5 shrink-0">
                      <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-stone">
                        <span className="text-accent-cyan uppercase font-semibold">{post.type === 'release_notes' ? 'Release Notes' : 'Tutorial'}</span>
                        <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-[15px] font-bold text-warm-white group-hover:text-accent-cyan transition-colors leading-snug">
                        <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p className="text-[12px] text-stone leading-relaxed font-light line-clamp-2">
                        {post.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] text-stone font-mono">
                      <span>By @{project.organization?.owner?.username || 'satyajit'}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-0.5"><Eye className="w-3.5 h-3.5" /> {post.views}</span>
                        <span className="flex items-center gap-0.5"><ThumbsUp className="w-3.5 h-3.5" /> {post._count?.reactions || 0}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {(!project.cmsProjects || project.cmsProjects.length === 0) && (
                <div className="py-12 border border-dashed border-white/5 rounded-xl text-center text-[12px] text-stone font-light">
                  No articles or release notes published for this project.
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'community' && (
            <motion.div
              key="community"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 max-w-2xl"
            >
              <h3 className="text-md font-bold text-warm-white border-b border-white/5 pb-2">Developer Discussions</h3>

              <Card className="p-4 space-y-4 bg-charcoal/20 border-white/5">
                {/* Comment Submission Form */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Ask a question or share architectural feedback..."
                    className="flex-1 bg-charcoal/30 border border-white/5 rounded-lg px-3 py-2 text-[12.5px] text-warm-white outline-none focus:border-white/20"
                  />
                  <Button type="submit" variant="primary" className="px-3 text-[11px]">
                    Comment
                  </Button>
                </form>

                {/* Comments List */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-4 rounded-xl bg-onyx/40 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-stone">
                        <span className="font-semibold text-warm-white">@{comment.user.name.replace(' ', '_').toLowerCase()}</span>
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[13px] text-stone leading-relaxed">
                        {comment.content}
                      </p>

                      {/* Nested Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="space-y-2.5 pl-4 border-l border-white/5 ml-1 pt-1.5">
                          {comment.replies.map((reply: any) => (
                            <div key={reply.id} className="p-2.5 rounded bg-white/[0.01] border border-white/5 text-[12px] space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-stone">
                                <span className="font-semibold text-warm-white">@{reply.user.name.replace(' ', '_').toLowerCase()}</span>
                                <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-stone/90 leading-relaxed">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply form link toggle */}
                      <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-stone">
                        <button onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)} className="hover:text-warm-white cursor-pointer">
                          Reply
                        </button>
                      </div>

                      {activeReplyId === comment.id && (
                        <div className="flex gap-2 pt-2 border-t border-white/5">
                          <input
                            type="text"
                            value={replyInput}
                            onChange={(e) => setReplyInput(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 bg-charcoal/30 border border-white/5 rounded-lg px-2.5 py-1 text-[11.5px] text-warm-white outline-none focus:border-white/20"
                          />
                          <button onClick={() => handleAddReply(comment.id)} className="px-2.5 py-1 text-[11px] font-semibold text-onyx bg-warm-white rounded hover:bg-mist cursor-pointer">
                            Reply
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <div className="text-center py-6 text-[12px] text-stone font-light">
                      No discussions started yet. Be the first to ask!
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

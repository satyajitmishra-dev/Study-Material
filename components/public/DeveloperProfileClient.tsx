'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Globe, 
  Github, 
  Linkedin, 
  Twitter, 
  Award, 
  Sparkles, 
  FolderGit2, 
  BookText, 
  Activity as ActivityIcon, 
  UserPlus, 
  UserCheck, 
  Calendar, 
  Terminal,
  ThumbsUp,
  Eye,
  Clock,
  ExternalLink,
  MessageSquare,
  Bookmark,
  Languages,
  Compass,
  Briefcase,
  GraduationCap,
  Youtube,
  Hash
} from 'lucide-react';
import Link from 'next/link';
import { Card, Button, Tabs } from '@/components/ui/core';
import { toggleFollowDeveloperOrProjectAction } from '@/lib/actions/profileActions';

interface ClientProps {
  username: string;
  initialUser: any;
  initialProjects: any[];
  initialPosts: any[];
  initialFollowers: any[];
  initialFollowing: any[];
  initialBookmarks: any[];
}

export default function DeveloperProfileClient({
  username,
  initialUser,
  initialProjects,
  initialPosts,
  initialFollowers,
  initialFollowing,
  initialBookmarks
}: ClientProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [followers, setFollowers] = useState(initialFollowers);
  const [isFollowing, setIsFollowing] = useState(
    initialFollowers.some(f => f.userId === 'sandbox-user-id') // Mocked for sandbox, update for real session user
  );
  const [followLoading, setFollowLoading] = useState(false);

  const profile = initialUser.authorProfile || {};
  const name = initialUser.name || username;
  const headline = profile.headline || 'Software Engineer';
  const bio = profile.bio || 'Exploring compiler optimizations, React frameworks, and server architectures.';
  const coverImage = profile.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=400';
  const avatar = initialUser.avatar || initialUser.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
  const location = profile.location || 'Remote';
  const experienceLevel = profile.experienceLevel || 'Senior Engineer';
  const website = profile.website || '';
  const portfolio = profile.portfolio || '';
  const availability = profile.availability || 'available';

  // Parse structured data lists
  const skills = profile.skills ? JSON.parse(profile.skills) : [];
  const experience = profile.experience ? JSON.parse(profile.experience) : [];
  const education = profile.education ? JSON.parse(profile.education) : [];
  const achievements = profile.achievementsJson ? JSON.parse(profile.achievementsJson) : [];
  const languages = profile.languages || ['English'];
  const interests = profile.interests || ['Web Performance', 'AI Agents'];

  // Aggregate stats
  const totalViews = initialPosts.reduce((sum, p) => sum + (p.views || 0), 0) + (initialProjects.length * 342);
  const totalLikes = initialPosts.reduce((sum, p) => sum + (p._count?.reactions || 0), 0) + (initialProjects.length * 15);

  const handleFollow = async () => {
    setFollowLoading(true);
    const prevFollowed = isFollowing;
    setIsFollowing(!prevFollowed);
    if (!prevFollowed) {
      setFollowers([...followers, { userId: 'sandbox-user-id', user: { name: 'Sandbox User' } }]);
    } else {
      setFollowers(followers.filter(f => f.userId !== 'sandbox-user-id'));
    }

    try {
      const res = await toggleFollowDeveloperOrProjectAction('DEVELOPER', initialUser.id);
      if (res.success) {
        setIsFollowing(res.followed ?? false);
      } else {
        setIsFollowing(prevFollowed);
        setFollowers(initialFollowers);
        if (res.error === 'CANNOT_FOLLOW_SELF') {
          alert('You cannot follow yourself.');
        }
      }
    } catch (err) {
      setIsFollowing(prevFollowed);
      setFollowers(initialFollowers);
    } finally {
      setFollowLoading(false);
    }
  };

  const getBadgeIcon = (achievement: string) => {
    switch (achievement) {
      case 'open_source_contributor':
        return <Github className="w-3.5 h-3.5 text-accent-cyan" />;
      case 'ai_wizard':
        return <Sparkles className="w-3.5 h-3.5 text-accent-violet" />;
      default:
        return <Award className="w-3.5 h-3.5 text-accent-amber" />;
    }
  };

  const formatBadgeName = (achievement: string) => {
    return achievement
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Cover Image Block */}
      <div className="relative w-full h-[220px] rounded-2xl overflow-hidden border border-white/5 shadow-premium">
        <img src={coverImage} alt="profile cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/40 to-transparent" />
        <div className="absolute inset-0 grid-background opacity-10" />
      </div>

      {/* Hero card & core metadata */}
      <div className="relative -mt-24 px-6 flex flex-col md:flex-row items-end gap-6 border-b border-white/5 pb-8">
        <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-charcoal bg-charcoal shadow-premium shrink-0 relative group">
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="text-[10px] font-mono Sarabun uppercase tracking-wider text-warm-white">Online</span>
          </div>
        </div>

        <div className="flex-1 space-y-3 text-center md:text-left mt-4 md:mt-0">
          <div>
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
              <h1 className="text-3xl font-extrabold text-warm-white tracking-tight">{name}</h1>
              <span className="w-fit self-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent-cyan/15 border border-accent-cyan/20 text-accent-cyan uppercase tracking-wider">
                {experienceLevel}
              </span>
            </div>
            <p className="text-[13px] text-stone font-mono mt-0.5">@{username}</p>
          </div>

          <p className="text-[14px] text-stone leading-relaxed font-light max-w-2xl">{headline}</p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[12px] text-stone">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-accent-pink" /> {location}</span>
            {website && (
              <a href={website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-warm-white transition-colors">
                <Globe className="w-3.5 h-3.5 text-accent-emerald" /> {website.replace('https://', '')}
              </a>
            )}
            {portfolio && (
              <a href={portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-warm-white transition-colors">
                <Globe className="w-3.5 h-3.5 text-accent-violet" /> Portfolio
              </a>
            )}
          </div>

          {/* Social Icons row */}
          <div className="flex items-center justify-center md:justify-start gap-4 pt-1 text-stone">
            {profile.github && (
              <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-warm-white transition-colors">
                <Github className="w-4 h-4" />
              </a>
            )}
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-warm-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {profile.twitter && (
              <a href={profile.twitter} target="_blank" rel="noreferrer" className="hover:text-warm-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {profile.youtube && (
              <a href={profile.youtube} target="_blank" rel="noreferrer" className="hover:text-warm-white transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Follow Button */}
        <div className="shrink-0 flex gap-3 w-full md:w-auto justify-center">
          <Button 
            variant={isFollowing ? 'secondary' : 'primary'} 
            onClick={handleFollow}
            disabled={followLoading}
            className="w-[120px]"
          >
            {isFollowing ? (
              <>
                <UserCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5 shrink-0" />
                <span>Follow</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Aggregate Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-stone uppercase tracking-wider block">Showcase Projects</span>
          <span className="text-2xl font-bold text-warm-white font-mono mt-1">{initialProjects.length}</span>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-stone uppercase tracking-wider block">Profile Followers</span>
          <span className="text-2xl font-bold text-warm-white font-mono mt-1">{followers.length}</span>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-stone uppercase tracking-wider block">Content Views</span>
          <span className="text-2xl font-bold text-warm-white font-mono mt-1">{totalViews}</span>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-stone uppercase tracking-wider block">Total Likes</span>
          <span className="text-2xl font-bold text-warm-white font-mono mt-1">{totalLikes}</span>
        </Card>
      </div>

      {/* 10 Tabs Menu */}
      <Tabs 
        options={[
          { id: 'overview', label: 'Overview', icon: Globe },
          { id: 'projects', label: 'Projects', icon: FolderGit2 },
          { id: 'articles', label: 'Articles', icon: BookText },
          { id: 'roadmaps', label: 'Roadmaps', icon: Compass },
          { id: 'activity', label: 'Activity', icon: ActivityIcon },
          { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
          { id: 'followers', label: 'Followers', icon: UserCheck },
          { id: 'following', label: 'Following', icon: UserPlus },
          { id: 'achievements', label: 'Achievements', icon: Award },
          { id: 'about', label: 'About', icon: Terminal }
        ]} 
        activeId={activeTab} 
        onChange={setActiveTab} 
        className="w-full"
      />

      {/* Tabs Content */}
      <div className="min-h-[400px] relative z-10">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-8 animate-fadeIn"
            >
              {/* Bio & Availability */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 md:col-span-2 space-y-3 relative overflow-hidden bg-gradient-to-r from-charcoal/20 to-onyx">
                  <div className="absolute inset-0 grid-background opacity-[0.03] pointer-events-none" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-stone">Developer Bio</h3>
                  <p className="text-[13px] text-stone leading-relaxed font-light whitespace-pre-wrap">{bio}</p>
                </Card>

                <Card className="p-6 flex flex-col justify-center items-center text-center space-y-2 border-white/5">
                  <span className="text-[9px] font-mono text-stone uppercase tracking-wider font-bold">Status Availability</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full animate-ping ${availability === 'available' ? 'bg-accent-emerald' : availability === 'busy' ? 'bg-accent-amber' : 'bg-stone/50'}`} />
                    <span className="text-[14px] font-bold text-warm-white capitalize">{availability.replace('_', ' ')}</span>
                  </div>
                  <p className="text-[11px] text-stone font-light mt-1">
                    {availability === 'available' ? 'Open for contract opportunities & team hires.' : 'Currently focused on ongoing builds.'}
                  </p>
                </Card>
              </div>

              {/* Featured Projects Grid */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-bold text-warm-white">Featured Projects</h3>
                  <button onClick={() => setActiveTab('projects')} className="text-accent-cyan text-[11px] font-mono hover:underline">View All →</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {initialProjects.slice(0, 2).map((p) => (
                    <Card key={p.id} className="p-5 hover:border-white/10 group flex gap-4 transition-all">
                      <div className="w-12 h-12 rounded-xl bg-charcoal/50 border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                        {p.logo ? (
                          <img src={p.logo} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <FolderGit2 className="w-6 h-6 text-stone" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2 truncate">
                        <h4 className="text-[14px] font-bold text-warm-white hover:text-accent-cyan transition-colors">
                          <Link href={`/projects/${p.slug}`}>{p.name}</Link>
                        </h4>
                        <p className="text-[11px] text-stone leading-relaxed line-clamp-2 font-light">
                          {p.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {p.techStack.slice(0, 3).map((tech: string) => (
                            <span key={tech} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/5 border border-white/5 text-stone/80">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                  {initialProjects.length === 0 && (
                    <div className="col-span-2 text-center py-10 border border-dashed border-white/5 rounded-xl text-[12px] text-stone font-light">
                      No showcase projects yet.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: PROJECTS */}
          {activeTab === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 gap-6 animate-fadeIn"
            >
              {initialProjects.map((p) => {
                const stats = p.githubMetadata ? JSON.parse(p.githubMetadata) : {};
                return (
                  <Card key={p.id} className="p-6 hover:border-white/10 flex flex-col md:flex-row gap-6 relative overflow-hidden group">
                    <div className="w-16 h-16 rounded-2xl bg-charcoal/50 border border-white/5 flex items-center justify-center shrink-0 overflow-hidden shadow-premium">
                      {p.logo ? (
                        <img src={p.logo} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <FolderGit2 className="w-8 h-8 text-stone" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-[16px] font-bold text-warm-white hover:text-accent-cyan transition-colors">
                            <Link href={`/projects/${p.slug}`}>{p.name}</Link>
                          </h3>
                          {p.githubUrl && (
                            <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-stone hover:text-warm-white text-[11px] font-mono flex items-center gap-1 border border-white/5 px-2 py-0.5 rounded bg-white/5">
                              <Github className="w-3.5 h-3.5" />
                              <span>GitHub</span>
                            </a>
                          )}
                        </div>
                        <p className="text-[12.5px] text-stone leading-relaxed font-light mt-1.5">
                          {p.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {p.techStack.map((tech: string) => (
                          <span key={tech} className="px-2 py-0.5 rounded text-[10px] font-mono bg-accent-cyan/5 border border-accent-cyan/15 text-accent-cyan">
                            {tech}
                          </span>
                        ))}
                      </div>

                      {p.githubMetadata && (
                        <div className="flex items-center gap-6 pt-3 border-t border-white/5 text-[11px] text-stone font-mono">
                          <span>★ {stats.stars || 0} stars</span>
                          <span>⑂ {stats.forks || 0} forks</span>
                          <span className="ml-auto text-[10px] text-stone/40">Synced: {new Date(p.githubLastSyncedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
              {initialProjects.length === 0 && (
                <div className="text-center py-12 border border-dashed border-white/5 rounded-xl text-[12px] text-stone font-light">
                  No projects configured.
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: ARTICLES */}
          {activeTab === 'articles' && (
            <motion.div
              key="articles"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4 animate-fadeIn"
            >
              {initialPosts.map((post) => (
                <Card key={post.id} className="p-5 hover:border-white/10 group flex flex-col md:flex-row gap-6">
                  {post.coverImage && (
                    <div className="w-full md:w-44 aspect-[16/10] rounded-xl overflow-hidden border border-white/5 shrink-0">
                      <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-stone">
                        <span className="text-accent-cyan uppercase font-semibold">{post.categoryRef?.name || post.category || 'React'}</span>
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
                      <span>By @{username}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-0.5"><Eye className="w-3.5 h-3.5" /> {post.views}</span>
                        <span className="flex items-center gap-0.5"><ThumbsUp className="w-3.5 h-3.5" /> {post._count?.reactions || 0}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {initialPosts.length === 0 && (
                <div className="py-12 border border-dashed border-white/5 rounded-xl text-center text-[12px] text-stone font-light">
                  No published articles found.
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: ROADMAPS */}
          {activeTab === 'roadmaps' && (
            <motion.div
              key="roadmaps"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6 animate-fadeIn"
            >
              {initialProjects.flatMap(p => p.roadmaps || []).map((roadmap: any) => {
                const totalTasks = roadmap.tasks?.length || 0;
                const completedTasks = roadmap.tasks?.filter((t: any) => t.isCompleted || t.status === 'completed').length || 0;
                const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                
                return (
                  <Card key={roadmap.id} className="p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-2">
                      <div>
                        <span className="text-[10px] font-mono text-accent-cyan uppercase tracking-wider block">PROJECT ROADMAP</span>
                        <h4 className="text-[15px] font-bold text-warm-white mt-0.5">{roadmap.title}</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono text-stone">{completedTasks}/{totalTasks} tasks ({progressPct}%)</span>
                        <div className="w-20 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-accent-cyan" style={{ width: `${progressPct}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {roadmap.tasks?.map((task: any) => (
                        <div key={task.id} className="flex items-start gap-2.5 p-2 rounded bg-charcoal/10 border border-white/[0.02]">
                          <input 
                            type="checkbox"
                            checked={task.isCompleted || task.status === 'completed'}
                            readOnly
                            className="mt-0.5 rounded border-white/5 bg-charcoal/50 text-accent-cyan"
                          />
                          <div>
                            <span className={`text-[12.5px] font-semibold block ${task.isCompleted || task.status === 'completed' ? 'line-through text-stone/50' : 'text-warm-white'}`}>{task.title}</span>
                            <span className="text-[10.5px] text-stone font-light block mt-0.5">{task.description || 'No description provided.'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
              {initialProjects.flatMap(p => p.roadmaps || []).length === 0 && (
                <div className="py-12 border border-dashed border-white/5 rounded-xl text-center text-[12px] text-stone font-light">
                  No active project roadmaps found.
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 5: ACTIVITY TIMELINE */}
          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6 animate-fadeIn"
            >
              <h3 className="text-md font-bold text-warm-white border-b border-white/5 pb-2">Developer Timeline Feed</h3>
              
              <div className="space-y-6 pl-4 relative border-l border-white/5 ml-2 pt-2">
                <div className="relative space-y-6">
                  <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-accent-emerald border border-charcoal" />
                  <div>
                    <span className="text-[10px] text-stone font-mono block">RECENT</span>
                    <h4 className="text-[13.5px] font-bold text-warm-white mt-1">Profile Workspace Synced</h4>
                    <p className="text-[12px] text-stone leading-relaxed font-light mt-0.5">
                      Completed custom setup of technical experiences, skills, and developer credentials.
                    </p>
                  </div>
                </div>
                
                {initialPosts.slice(0, 2).map((post) => (
                  <div key={post.id} className="relative space-y-6">
                    <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-accent-cyan border border-charcoal" />
                    <div>
                      <span className="text-[10px] text-stone font-mono block">{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                      <h4 className="text-[13.5px] font-bold text-warm-white mt-1">Published Article: {post.title}</h4>
                      <p className="text-[12px] text-stone leading-relaxed font-light mt-0.5">
                        {post.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 6: BOOKMARKS */}
          {activeTab === 'bookmarks' && (
            <motion.div
              key="bookmarks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 gap-4 animate-fadeIn"
            >
              {initialBookmarks.map((b: any) => (
                <Card key={b.id} className="p-4 border-white/5 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono text-accent-cyan uppercase block">BOOKMARKED CONTENT</span>
                    <span className="text-[14.5px] font-bold text-warm-white mt-1 block">{b.project?.name || 'Showcase Project'}</span>
                  </div>
                  {b.project?.slug && (
                    <Link href={`/projects/${b.project.slug}`}>
                      <Button variant="secondary" className="h-7 text-[10px]">View Page</Button>
                    </Link>
                  )}
                </Card>
              ))}
              {initialBookmarks.length === 0 && (
                <div className="py-12 border border-dashed border-white/5 rounded-xl text-center text-[12px] text-stone font-light">
                  No bookmarks saved yet.
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 7: FOLLOWERS */}
          {activeTab === 'followers' && (
            <motion.div
              key="followers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-fadeIn"
            >
              {followers.map((f, i) => (
                <Card key={i} className="p-4 flex items-center gap-3 border-white/5">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center font-bold text-sm shrink-0">👤</div>
                  <div>
                    <span className="text-[13px] font-bold text-warm-white block">{f.user?.name || 'Anonymous User'}</span>
                    <span className="text-[10px] text-stone font-mono block">@{f.user?.username || 'user'}</span>
                  </div>
                </Card>
              ))}
              {followers.length === 0 && (
                <div className="col-span-3 py-12 border border-dashed border-white/5 rounded-xl text-center text-[12px] text-stone font-light">
                  No followers yet.
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 8: FOLLOWING */}
          {activeTab === 'following' && (
            <motion.div
              key="following"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-fadeIn"
            >
              {initialFollowing.map((f, i) => (
                <Card key={i} className="p-4 flex items-center gap-3 border-white/5">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center font-bold text-sm shrink-0">👥</div>
                  <div>
                    <span className="text-[13px] font-bold text-warm-white block">Following Account</span>
                    <span className="text-[10px] text-stone font-mono block">Target: {f.targetType} ({f.targetId})</span>
                  </div>
                </Card>
              ))}
              {initialFollowing.length === 0 && (
                <div className="col-span-3 py-12 border border-dashed border-white/5 rounded-xl text-center text-[12px] text-stone font-light">
                  Not following anyone yet.
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 9: ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn"
            >
              {/* Fallback to profile array achievements */}
              {profile.achievements && profile.achievements.map((ach: string) => (
                <Card key={ach} className="p-4 flex items-center gap-3.5 border-white/5 bg-charcoal/10">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    {getBadgeIcon(ach)}
                  </div>
                  <div>
                    <span className="text-[13.5px] font-bold text-warm-white block">{formatBadgeName(ach)}</span>
                    <span className="text-[10.5px] text-stone font-light block mt-0.5">Verified Platform Milestone</span>
                  </div>
                </Card>
              ))}

              {/* Custom detailed achievementsJson */}
              {achievements.map((ach: any, idx: number) => (
                <Card key={idx} className="p-4 flex items-start gap-3.5 border-white/5 bg-gradient-to-r from-charcoal/20 to-onyx">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-accent-cyan">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[13.5px] font-bold text-warm-white block">{ach.title}</span>
                    <span className="text-[10px] text-stone font-mono block">Issuer: {ach.issuer} · {ach.date}</span>
                    <p className="text-[11.5px] text-stone leading-relaxed font-light">{ach.description}</p>
                    {ach.verificationUrl && (
                      <a href={ach.verificationUrl} target="_blank" rel="noreferrer" className="text-[10px] text-accent-cyan font-mono hover:underline flex items-center gap-0.5 mt-1.5">
                        <span>Verify link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </Card>
              ))}

              {(!profile.achievements || profile.achievements.length === 0) && achievements.length === 0 && (
                <div className="col-span-2 py-12 border border-dashed border-white/5 rounded-xl text-center text-[12px] text-stone font-light">
                  No showcased achievements yet.
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 10: ABOUT (Professional Dossier) */}
          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fadeIn"
            >
              {/* Full Bio, Timeline & Educations */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Experiences Timeline */}
                {experience.length > 0 && (
                  <Card className="p-6 space-y-4">
                    <h3 className="text-md font-bold text-warm-white border-b border-white/5 pb-2 flex items-center gap-1.5">
                      <Briefcase className="w-4.5 h-4.5 text-accent-cyan" />
                      <span>Experiences Timeline</span>
                    </h3>
                    <div className="space-y-6 pl-4 relative border-l border-white/5 ml-2 pt-2">
                      {experience.map((exp: any, idx: number) => (
                        <div key={idx} className="relative space-y-1">
                          <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-accent-cyan border border-charcoal" />
                          <span className="text-[10px] text-stone font-mono block">{exp.duration}</span>
                          <h4 className="text-[14px] font-bold text-warm-white">{exp.role} @ {exp.company}</h4>
                          <p className="text-[12px] text-stone leading-relaxed font-light mt-0.5">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Educations credentials */}
                {education.length > 0 && (
                  <Card className="p-6 space-y-4">
                    <h3 className="text-md font-bold text-warm-white border-b border-white/5 pb-2 flex items-center gap-1.5">
                      <GraduationCap className="w-4.5 h-4.5 text-accent-cyan" />
                      <span>Education Credentials</span>
                    </h3>
                    <div className="space-y-4">
                      {education.map((edu: any, idx: number) => (
                        <div key={idx} className="flex gap-4 items-start p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">🎓</div>
                          <div>
                            <h4 className="text-[13.5px] font-bold text-warm-white">{edu.degree} — {edu.college}</h4>
                            <span className="text-[10px] font-mono text-stone block mt-0.5">{edu.duration}</span>
                            <p className="text-[12px] text-stone/80 mt-1">{edu.achievements}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {/* Sidebar: Skills chips, Availability, Languages */}
              <div className="space-y-6">
                
                {/* Skills chips */}
                {skills.length > 0 && (
                  <Card className="p-5 space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-stone">Technical Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s: any) => (
                        <div key={s.name} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[11px] font-mono text-stone">
                          <span>{s.name}</span>
                          <span className="text-[9.5px] text-stone/40 ml-1">({s.years}y)</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Spoken Languages */}
                <Card className="p-5 space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-stone flex items-center gap-1">
                    <Languages className="w-4 h-4" />
                    <span>Languages</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {languages.map((l: string) => (
                      <span key={l} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[11.5px] font-medium text-stone">{l}</span>
                    ))}
                  </div>
                </Card>

                {/* Professional Interests */}
                <Card className="p-5 space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-stone flex items-center gap-1">
                    <Compass className="w-4 h-4" />
                    <span>Interests</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {interests.map((int: string) => (
                      <span key={int} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[11.5px] font-medium text-stone">{int}</span>
                    ))}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

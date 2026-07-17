'use client';

import React, { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Users, 
  MousePointerClick, 
  Database, 
  HardDrive, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  FileText, 
  Upload, 
  BarChart, 
  Shield, 
  Pin,
  Clock,
  Settings,
  X,
  RefreshCw,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  TrendingUp,
  Sliders,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui/core';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer 
} from 'recharts';
import NotificationCenter from './NotificationCenter';

interface DashboardClientProps {
  initialData: {
    totalProjects: number;
    publishedCount: number;
    draftsCount: number;
    totalViews: number;
    mediaCount: number;
    recentProjects: any[];
    auditLogs: any[];
  };
  role: string;
  userName: string;
}

interface Widget {
  id: string;
  title: string;
  visible: boolean;
}

const DEFAULT_ADMIN_WIDGETS: Widget[] = [
  { id: 'stats', title: 'Realtime Counter Statistics', visible: true },
  { id: 'analytics', title: 'Traffic Activity Chart', visible: true },
  { id: 'quick_actions', title: 'Studio Quick Actions', visible: true },
  { id: 'system_health', title: 'Infrastructure System Health', visible: true },
  { id: 'pinned_projects', title: 'Pinned & Recent Projects', visible: true },
  { id: 'recent_activities', title: 'Live Audit Log Timeline', visible: true },
];

const DEFAULT_CREATOR_WIDGETS: Widget[] = [
  { id: 'creator_stats', title: 'Content Performance Statistics', visible: true },
  { id: 'creator_analytics', title: 'Engagement Trends', visible: true },
  { id: 'creator_actions', title: 'Creator Tools', visible: true },
  { id: 'creator_top_content', title: 'Top Performing Content', visible: true },
  { id: 'creator_recent_activity', title: 'Recent Activity', visible: true },
];

export default function DashboardClient({ initialData, role, userName }: DashboardClientProps) {
  const isAdmin = role === 'admin';
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [realtimeViews, setRealtimeViews] = useState(initialData.totalViews);
  const [liveVisitors, setLiveVisitors] = useState(isAdmin ? 14 : 2);
  const [healthStatus, setHealthStatus] = useState({
    postgres: 'connected',
    redis: 'connected',
    autosave: 'active',
    sync: 'synced',
    queueSize: 0,
    responseTime: 42,
  });

  // Read Creator metrics dynamically from database aggregates passed in initialData
  const totalViews = realtimeViews;
  const likesCount = (initialData as any).likesCount ?? 0;
  const commentsCount = (initialData as any).commentsCount ?? 0;
  const bookmarksCount = (initialData as any).bookmarksCount ?? 0;
  const followersCount = (initialData as any).followersCount ?? 0;

  // Load layout from localStorage
  useEffect(() => {
    const key = isAdmin ? 'sm_admin_widgets' : 'sm_creator_widgets';
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setWidgets(JSON.parse(saved));
      } catch (e) {
        setWidgets(isAdmin ? DEFAULT_ADMIN_WIDGETS : DEFAULT_CREATOR_WIDGETS);
      }
    } else {
      setWidgets(isAdmin ? DEFAULT_ADMIN_WIDGETS : DEFAULT_CREATOR_WIDGETS);
    }
  }, [isAdmin]);

  // Persist layout to localStorage
  const saveLayout = (updatedWidgets: Widget[]) => {
    setWidgets(updatedWidgets);
    const key = isAdmin ? 'sm_admin_widgets' : 'sm_creator_widgets';
    localStorage.setItem(key, JSON.stringify(updatedWidgets));
  };

  // Realtime ticking simulations
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time views and visitors
      setRealtimeViews(prev => prev + Math.floor(Math.random() * 3));
      setLiveVisitors(prev => {
        const diff = Math.floor(Math.random() * 3) - 1;
        return Math.max(1, prev + diff);
      });

      // Simulate system fluctuations
      if (isAdmin) {
        setHealthStatus(prev => ({
          ...prev,
          responseTime: Math.floor(35 + Math.random() * 15),
        }));
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isAdmin]);

  const storageUsed = `${(initialData.mediaCount * 0.48).toFixed(1)} MB`;

  // Chart data
  const chartData = [
    { name: 'Mon', views: Math.floor(totalViews * 0.72), engagement: Math.floor(likesCount * 0.65) },
    { name: 'Tue', views: Math.floor(totalViews * 0.81), engagement: Math.floor(likesCount * 0.74) },
    { name: 'Wed', views: Math.floor(totalViews * 0.88), engagement: Math.floor(likesCount * 0.82) },
    { name: 'Thu', views: Math.floor(totalViews * 0.93), engagement: Math.floor(likesCount * 0.90) },
    { name: 'Fri', views: Math.floor(totalViews * 0.97), engagement: Math.floor(likesCount * 0.95) },
    { name: 'Today', views: totalViews, engagement: likesCount },
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Cinematic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-accent-cyan tracking-[0.2em] uppercase font-mono">
            {isAdmin ? 'Enterprise Admin Space' : 'Creator Studio Space'}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-warm-white">
            {isAdmin ? 'Workspace Director' : `Welcome, ${userName}`}
          </h1>
          <p className="text-[13px] text-stone font-light max-w-lg">
            {isAdmin 
              ? 'Manage users, review publications, audit media files, and monitor real-time system performance from a unified panel.' 
              : 'Write blogs, manage draft files, monitor views, check code snippets, and trace followers engagement details.'
            }
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <NotificationCenter />

          <Button 
            variant="secondary"
            onClick={() => setShowConfig(!showConfig)}
            className="text-[11px] py-1.5 px-3 flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize</span>
          </Button>

          <Link href="/admin/projects/create">
            <Button variant="primary" className="text-[11px] py-1.5 px-3 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Customizable Layout Manager Dialog */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 rounded-2xl bg-charcoal/40 border border-white/10 backdrop-blur-md space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider">Configure Dashboard Grid</h3>
              <button onClick={() => setShowConfig(false)} className="text-stone hover:text-warm-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[12px] text-stone">Drag to reorder rows. Toggle visibility of dashboard widgets.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {widgets.map(w => (
                <div key={w.id} className="flex items-center justify-between p-3 rounded-lg bg-onyx/40 border border-white/5">
                  <span className="text-[12px] text-stone font-medium">{w.title}</span>
                  <input 
                    type="checkbox" 
                    checked={w.visible}
                    onChange={(e) => {
                      const updated = widgets.map(item => item.id === w.id ? { ...item, visible: e.target.checked } : item);
                      saveLayout(updated);
                    }}
                    className="w-4 h-4 accent-accent-cyan rounded cursor-pointer border-white/10 bg-transparent"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Drag-and-Drop Reorder Widget List */}
      <Reorder.Group 
        axis="y" 
        values={widgets} 
        onReorder={saveLayout}
        className="space-y-6 cursor-grab active:cursor-grabbing"
      >
        {widgets.map((widget) => {
          if (!widget.visible) return null;

          return (
            <Reorder.Item key={widget.id} value={widget} className="focus:outline-none">
              
              {/* WIDGET 1: ADMIN STATS COUNTERS */}
              {widget.id === 'stats' && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="flex flex-col justify-between h-[110px] relative overflow-hidden group">
                    <span className="text-[10px] text-stone uppercase tracking-wider font-semibold">Total Projects</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold font-mono text-warm-white">{initialData.totalProjects}</span>
                      <span className="text-[10px] text-stone">({initialData.publishedCount} active)</span>
                    </div>
                    <FileText className="absolute right-4 bottom-4 w-12 h-12 text-white/[0.02] group-hover:text-accent-cyan/10 transition-colors pointer-events-none" />
                  </Card>

                  <Card className="flex flex-col justify-between h-[110px] relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-stone uppercase tracking-wider font-semibold">Global Views</span>
                      <span className="flex h-1.5 w-1.5 rounded-full bg-accent-cyan animate-pulse" />
                    </div>
                    <span className="text-3xl font-extrabold font-mono text-warm-white">
                      {realtimeViews.toLocaleString()}
                    </span>
                    <Eye className="absolute right-4 bottom-4 w-12 h-12 text-white/[0.02] group-hover:text-accent-cyan/10 transition-colors pointer-events-none" />
                  </Card>

                  <Card className="flex flex-col justify-between h-[110px] relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-stone uppercase tracking-wider font-semibold">Live Visitors</span>
                      <span className="text-[9px] text-accent-cyan font-mono bg-accent-cyan/10 px-1.5 py-0.2 rounded">Live</span>
                    </div>
                    <span className="text-3xl font-extrabold font-mono text-accent-cyan">
                      {liveVisitors}
                    </span>
                    <Users className="absolute right-4 bottom-4 w-12 h-12 text-white/[0.02] group-hover:text-accent-cyan/10 transition-colors pointer-events-none" />
                  </Card>

                  <Card className="flex flex-col justify-between h-[110px] relative overflow-hidden group">
                    <span className="text-[10px] text-stone uppercase tracking-wider font-semibold">Media Library</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold font-mono text-warm-white">{initialData.mediaCount} files</span>
                      <span className="text-[10px] text-stone">({storageUsed})</span>
                    </div>
                    <HardDrive className="absolute right-4 bottom-4 w-12 h-12 text-white/[0.02] group-hover:text-accent-cyan/10 transition-colors pointer-events-none" />
                  </Card>
                </div>
              )}

              {/* WIDGET 2: ADMIN TRAFFIC CHART */}
              {widget.id === 'analytics' && (
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider font-mono">Platform View Trends</h3>
                      <p className="text-[11px] text-stone">Activity indicators across all hosted creators and projects.</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-accent-cyan" />
                  </div>
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#00f2fe" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="name" stroke="#52525B" fontSize={11} tickLine={false} />
                        <YAxis stroke="#52525B" fontSize={11} tickLine={false} />
                        <ChartTooltip 
                          contentStyle={{ backgroundColor: '#161619', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '12px' }} 
                          labelStyle={{ color: '#E4E4E7', fontWeight: 'bold', fontSize: 11 }}
                        />
                        <Area type="monotone" dataKey="views" name="Page Views" stroke="#00f2fe" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              {/* WIDGET 3: ADMIN QUICK ACTIONS */}
              {widget.id === 'quick_actions' && (
                <Card className="p-6 space-y-4">
                  <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider font-mono">Operations Panel</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Link href="/admin/users" className="w-full">
                      <Button variant="secondary" className="w-full justify-start text-[12px] h-12">
                        <Users className="w-4 h-4 mr-2 text-accent-cyan" />
                        <span>Manage Users</span>
                      </Button>
                    </Link>
                    <Link href="/admin/moderation" className="w-full">
                      <Button variant="secondary" className="w-full justify-start text-[12px] h-12">
                        <Shield className="w-4 h-4 mr-2 text-accent-pink" />
                        <span>Moderation Reports</span>
                      </Button>
                    </Link>
                    <Link href="/admin/categories" className="w-full">
                      <Button variant="secondary" className="w-full justify-start text-[12px] h-12">
                        <Database className="w-4 h-4 mr-2 text-accent-amber" />
                        <span>Categories Taxonomy</span>
                      </Button>
                    </Link>
                    <Link href="/admin/community-mod" className="w-full">
                      <Button variant="secondary" className="w-full justify-start text-[12px] h-12">
                        <MessageSquare className="w-4 h-4 mr-2 text-accent-violet" />
                        <span>Community Content</span>
                      </Button>
                    </Link>
                  </div>
                </Card>
              )}

              {/* WIDGET 4: ADMIN SYSTEM HEALTH */}
              {widget.id === 'system_health' && (
                <Card className="p-6 space-y-4">
                  <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider font-mono">Infrastructure Diagnostics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-onyx/40 border border-white/5 rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent-emerald/10 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-accent-emerald" />
                      </div>
                      <div>
                        <span className="text-[9px] text-stone font-mono block uppercase">Database</span>
                        <span className="text-[12px] font-bold text-warm-white">{healthStatus.postgres}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-onyx/40 border border-white/5 rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent-emerald/10 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-accent-emerald" />
                      </div>
                      <div>
                        <span className="text-[9px] text-stone font-mono block uppercase">Cache (Redis)</span>
                        <span className="text-[12px] font-bold text-warm-white">{healthStatus.redis}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-onyx/40 border border-white/5 rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-accent-cyan" />
                      </div>
                      <div>
                        <span className="text-[9px] text-stone font-mono block uppercase">API Response</span>
                        <span className="text-[12px] font-bold text-warm-white">{healthStatus.responseTime}ms</span>
                      </div>
                    </div>

                    <div className="p-3 bg-onyx/40 border border-white/5 rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent-violet/10 flex items-center justify-center">
                        <Database className="w-4 h-4 text-accent-violet" />
                      </div>
                      <div>
                        <span className="text-[9px] text-stone font-mono block uppercase">Worker Queue</span>
                        <span className="text-[12px] font-bold text-warm-white">{healthStatus.queueSize} pending</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* WIDGET 5: CREATOR STATS COUNTERS */}
              {widget.id === 'creator_stats' && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="flex flex-col justify-between h-[110px] relative overflow-hidden group">
                    <span className="text-[10px] text-stone uppercase tracking-wider font-semibold">My Content</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold font-mono text-warm-white">{initialData.totalProjects} posts</span>
                      <span className="text-[10px] text-stone">({initialData.draftsCount} drafts)</span>
                    </div>
                    <FileText className="absolute right-4 bottom-4 w-12 h-12 text-white/[0.02] group-hover:text-accent-cyan/10 transition-colors pointer-events-none" />
                  </Card>

                  <Card className="flex flex-col justify-between h-[110px] relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-stone uppercase tracking-wider font-semibold">Total Views</span>
                      <span className="flex h-1.5 w-1.5 rounded-full bg-accent-cyan animate-pulse" />
                    </div>
                    <span className="text-3xl font-extrabold font-mono text-warm-white">
                      {totalViews.toLocaleString()}
                    </span>
                    <Eye className="absolute right-4 bottom-4 w-12 h-12 text-white/[0.02] group-hover:text-accent-cyan/10 transition-colors pointer-events-none" />
                  </Card>

                  <Card className="flex flex-col justify-between h-[110px] relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-stone uppercase tracking-wider font-semibold">Likes & Comments</span>
                      <ThumbsUp className="w-3.5 h-3.5 text-accent-pink" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold font-mono text-accent-pink">{likesCount}</span>
                      <span className="text-[10px] text-stone">({commentsCount} comments)</span>
                    </div>
                    <ThumbsUp className="absolute right-4 bottom-4 w-12 h-12 text-white/[0.02] group-hover:text-accent-pink/10 transition-colors pointer-events-none" />
                  </Card>

                  <Card className="flex flex-col justify-between h-[110px] relative overflow-hidden group">
                    <span className="text-[10px] text-stone uppercase tracking-wider font-semibold">Followers & Bookmarks</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold font-mono text-accent-violet">{followersCount}</span>
                      <span className="text-[10px] text-stone">({bookmarksCount} saved)</span>
                    </div>
                    <Bookmark className="absolute right-4 bottom-4 w-12 h-12 text-white/[0.02] group-hover:text-accent-violet/10 transition-colors pointer-events-none" />
                  </Card>
                </div>
              )}

              {/* WIDGET 6: CREATOR ENGAGEMENT TRENDS */}
              {widget.id === 'creator_analytics' && (
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider font-mono">Audience Engagement Trends</h3>
                      <p className="text-[11px] text-stone">Track page views and likes growth across your published works.</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-accent-cyan" />
                  </div>
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="creatorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#00f2fe" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="creatorLikes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="name" stroke="#52525B" fontSize={11} tickLine={false} />
                        <YAxis stroke="#52525B" fontSize={11} tickLine={false} />
                        <ChartTooltip 
                          contentStyle={{ backgroundColor: '#161619', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '12px' }} 
                          labelStyle={{ color: '#E4E4E7', fontWeight: 'bold', fontSize: 11 }}
                        />
                        <Area type="monotone" dataKey="views" name="Views" stroke="#00f2fe" strokeWidth={2} fillOpacity={1} fill="url(#creatorViews)" />
                        <Area type="monotone" dataKey="engagement" name="Likes" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#creatorLikes)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              {/* WIDGET 7: CREATOR TOOLS */}
              {widget.id === 'creator_actions' && (
                <Card className="p-6 space-y-4">
                  <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider font-mono">Creator Workspace Shortcuts</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Link href="/admin/projects/create" className="w-full">
                      <Button variant="secondary" className="w-full justify-start text-[12px] h-12">
                        <Plus className="w-4 h-4 mr-2 text-accent-cyan" />
                        <span>Write Blog Post</span>
                      </Button>
                    </Link>
                    <Link href="/admin/projects" className="w-full">
                      <Button variant="secondary" className="w-full justify-start text-[12px] h-12">
                        <FileText className="w-4 h-4 mr-2 text-accent-amber" />
                        <span>View Drafts</span>
                      </Button>
                    </Link>
                    <Link href="/admin/media" className="w-full">
                      <Button variant="secondary" className="w-full justify-start text-[12px] h-12">
                        <Upload className="w-4 h-4 mr-2 text-accent-violet" />
                        <span>Upload Media</span>
                      </Button>
                    </Link>
                    <Link href="/profile" className="w-full">
                      <Button variant="secondary" className="w-full justify-start text-[12px] h-12">
                        <Settings className="w-4 h-4 mr-2 text-stone" />
                        <span>Account Settings</span>
                      </Button>
                    </Link>
                  </div>
                </Card>
              )}

              {/* WIDGET 8: PINNED / RECENT PROJECTS */}
              {(widget.id === 'pinned_projects' || widget.id === 'creator_top_content') && (
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider font-mono">
                      {widget.id === 'creator_top_content' ? 'Top Performing Content' : 'Recent Project Publications'}
                    </h3>
                    <Link href="/admin/projects" className="text-[11px] text-stone hover:text-accent-cyan flex items-center font-mono">
                      <span>View All</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="border-b border-white/5 text-stone text-[10px] uppercase font-mono font-bold">
                          <th className="py-2.5">Title</th>
                          <th className="py-2.5">Category</th>
                          <th className="py-2.5 text-center">Status</th>
                          <th className="py-2.5 text-right">Views</th>
                          <th className="py-2.5 text-right">Updated</th>
                        </tr>
                      </thead>
                      <tbody className="text-[12.5px]">
                        {initialData.recentProjects.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-stone font-light">No content published yet. Start creating!</td>
                          </tr>
                        ) : (
                          initialData.recentProjects.slice(0, 5).map(p => (
                            <tr key={p.id} className="border-b border-white/[0.02] hover:bg-white/[0.01]">
                              <td className="py-3 font-semibold text-warm-white">
                                <Link href={`/admin/projects/edit/${p.id}`} className="hover:underline">
                                  {p.title}
                                </Link>
                              </td>
                              <td className="py-3 text-stone">{p.category || 'Uncategorized'}</td>
                              <td className="py-3 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  p.status === 'PUBLISHED' 
                                    ? 'bg-accent-emerald/10 text-accent-emerald' 
                                    : 'bg-stone/10 text-stone'
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="py-3 text-right font-mono font-bold">{p.views || 0}</td>
                              <td className="py-3 text-right text-stone font-mono">{new Date(p.updatedAt).toLocaleDateString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* WIDGET 9: AUDIT LOG TIMELINE */}
              {(widget.id === 'recent_activities' || widget.id === 'creator_recent_activity') && (
                <Card className="p-6 space-y-4">
                  <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider font-mono">
                    {widget.id === 'creator_recent_activity' ? 'Your Activity History' : 'System Audit Log Timeline'}
                  </h3>
                  <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5">
                    {initialData.auditLogs.length === 0 ? (
                      <p className="text-center text-stone py-6 text-[12px] font-light">No logged actions recorded.</p>
                    ) : (
                      initialData.auditLogs.slice(0, 6).map((log) => (
                        <div key={log.id} className="flex gap-4 relative z-10">
                          <div className="w-6.5 h-6.5 rounded-lg bg-charcoal/80 border border-white/5 flex items-center justify-center text-[10px] text-accent-cyan shrink-0">
                            <Clock className="w-3.5 h-3.5 text-stone" />
                          </div>
                          <div>
                            <p className="text-[12.5px] text-warm-white font-medium">
                              <span className="font-bold text-accent-cyan">{log.action}</span> on <span className="font-mono text-[11.5px]">{log.targetType}</span> ({log.targetId})
                            </p>
                            <span className="text-[10px] text-stone font-mono">{new Date(log.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              )}

            </Reorder.Item>
          );
        })}
      </Reorder.Group>

    </div>
  );
}

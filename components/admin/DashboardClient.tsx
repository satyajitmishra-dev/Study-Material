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
  RefreshCw
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
}

interface Widget {
  id: string;
  title: string;
  visible: boolean;
}

const DEFAULT_WIDGETS: Widget[] = [
  { id: 'stats', title: 'Realtime Counter Statistics', visible: true },
  { id: 'analytics', title: 'Traffic Activity Chart', visible: true },
  { id: 'quick_actions', title: 'Studio Quick Actions', visible: true },
  { id: 'system_health', title: 'Infrastructure System Health', visible: true },
  { id: 'pinned_projects', title: 'Pinned & Recent Projects', visible: true },
  { id: 'recent_activities', title: 'Live Audit Log Timeline', visible: true },
];

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [realtimeViews, setRealtimeViews] = useState(initialData.totalViews);
  const [liveVisitors, setLiveVisitors] = useState(14);
  const [healthStatus, setHealthStatus] = useState({
    postgres: 'connected',
    redis: 'connected',
    autosave: 'active',
    sync: 'synced',
    queueSize: 0,
    responseTime: 42,
  });

  // Load layout from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sm_cms_widgets');
    if (saved) {
      try {
        setWidgets(JSON.parse(saved));
      } catch (e) {
        setWidgets(DEFAULT_WIDGETS);
      }
    } else {
      setWidgets(DEFAULT_WIDGETS);
    }
  }, []);

  // Persist layout to localStorage
  const saveLayout = (updatedWidgets: Widget[]) => {
    setWidgets(updatedWidgets);
    localStorage.setItem('sm_cms_widgets', JSON.stringify(updatedWidgets));
  };

  // Realtime ticking simulations
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time views and visitors
      setRealtimeViews(prev => prev + Math.floor(Math.random() * 3));
      setLiveVisitors(prev => {
        const diff = Math.floor(Math.random() * 5) - 2;
        return Math.max(8, prev + diff);
      });

      // Simulate system fluctuations
      setHealthStatus(prev => ({
        ...prev,
        responseTime: Math.floor(35 + Math.random() * 15),
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Compute stats
  const ctr = '4.8%';
  const storageUsed = `${(initialData.mediaCount * 0.48).toFixed(1)} MB`;

  // Mock chart data matching simulated views
  const chartData = [
    { name: '08:00', views: realtimeViews - 120, visitors: liveVisitors + 2 },
    { name: '10:00', views: realtimeViews - 90, visitors: liveVisitors + 5 },
    { name: '12:00', views: realtimeViews - 60, visitors: liveVisitors - 1 },
    { name: '14:00', views: realtimeViews - 30, visitors: liveVisitors + 1 },
    { name: '16:00', views: realtimeViews - 10, visitors: liveVisitors + 4 },
    { name: '18:00', views: realtimeViews, visitors: liveVisitors },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Cinematic Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-accent-violet tracking-[0.2em] uppercase">
            Enterprise CMS Space
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-warm-white">
            Workspace Studio
          </h1>
          <p className="text-[13px] text-stone font-light max-w-md">
            Manage projects, review publications, audit media files, and monitor real-time system performance from a unified panel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NotificationCenter />

          <Button 
            variant="secondary"
            onClick={() => setShowConfig(!showConfig)}
            className="text-[11px] py-1.5 px-3"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Customize View</span>
          </Button>

          <Link href="/admin/projects/create">
            <Button variant="primary" className="text-[11px] py-1.5 px-3">
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
            <p className="text-[12px] text-stone">Drag to reorder columns. Toggle visibility of dashboard widgets.</p>
            
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
                    className="w-4 h-4 accent-accent-violet rounded cursor-pointer border-white/10 bg-transparent"
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
                      <span className="text-[10px] text-stone uppercase tracking-wider font-semibold">Realtime Views</span>
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
                    <span className="text-[10px] text-stone uppercase tracking-wider font-semibold">Media Storage</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold font-mono text-warm-white">{storageUsed}</span>
                      <span className="text-[10px] text-stone">/ 1 GB limit</span>
                    </div>
                    <HardDrive className="absolute right-4 bottom-4 w-12 h-12 text-white/[0.02] group-hover:text-accent-cyan/10 transition-colors pointer-events-none" />
                  </Card>
                </div>
              )}

              {widget.id === 'analytics' && (
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider">Impressions Stream</h3>
                      <p className="text-[11px] text-stone">Visualizing traffic view hits and active user sessions.</p>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-stone font-mono">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-accent-violet" />
                        Views: {realtimeViews}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                        Live visitors: {liveVisitors}
                      </span>
                    </div>
                  </div>

                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="widgetColorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} axisLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} axisLine={false} />
                        <ChartTooltip 
                          contentStyle={{ 
                            background: '#121214', 
                            borderColor: 'rgba(255,255,255,0.08)', 
                            borderRadius: '12px',
                            fontSize: '11px',
                            color: '#fafaf9'
                          }} 
                        />
                        <Area type="monotone" dataKey="views" name="Page Hits" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#widgetColorViews)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              {widget.id === 'quick_actions' && (
                <Card className="p-5 space-y-4">
                  <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider">Quick Actions</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Link href="/admin/projects/create" className="block">
                      <Button variant="secondary" className="w-full text-[12px] py-2.5 hover:border-accent-cyan/20">
                        <Plus className="w-4 h-4 text-accent-cyan" />
                        <span>Create Content</span>
                      </Button>
                    </Link>
                    <Link href="/admin/media" className="block">
                      <Button variant="secondary" className="w-full text-[12px] py-2.5 hover:border-accent-pink/20">
                        <Upload className="w-4 h-4 text-accent-pink" />
                        <span>Upload Asset</span>
                      </Button>
                    </Link>
                    <Link href="/admin/seo" className="block">
                      <Button variant="secondary" className="w-full text-[12px] py-2.5 hover:border-accent-emerald/20">
                        <BarChart className="w-4 h-4 text-accent-emerald" />
                        <span>SEO Studio</span>
                      </Button>
                    </Link>
                    <Link href="/admin/system" className="block">
                      <Button variant="secondary" className="w-full text-[12px] py-2.5 hover:border-accent-violet/20">
                        <Shield className="w-4 h-4 text-accent-violet" />
                        <span>System Health</span>
                      </Button>
                    </Link>
                  </div>
                </Card>
              )}

              {widget.id === 'system_health' && (
                <Card className="p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider">System Health & Nodes</h3>
                    <span className="text-[10px] font-mono text-stone">Response Time: {healthStatus.responseTime}ms</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                      <Database className="w-4 h-4 text-accent-emerald shrink-0" />
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-stone uppercase tracking-wider font-semibold">PostgreSQL</p>
                        <span className="text-[12px] text-warm-white font-medium flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-accent-emerald" />
                          Online
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <HardDrive className="w-4 h-4 text-accent-emerald shrink-0" />
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-stone uppercase tracking-wider font-semibold">Redis Cache</p>
                        <span className="text-[12px] text-warm-white font-medium flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-accent-emerald" />
                          Online
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-accent-emerald shrink-0" />
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-stone uppercase tracking-wider font-semibold">Autosave Agent</p>
                        <span className="text-[12px] text-warm-white font-medium flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-accent-emerald" />
                          Active
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-4 h-4 text-accent-emerald shrink-0" />
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-stone uppercase tracking-wider font-semibold">Publishing Queue</p>
                        <span className="text-[12px] text-warm-white font-medium">
                          {healthStatus.queueSize} pending
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {widget.id === 'pinned_projects' && (
                <Card className="p-5 space-y-4">
                  <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                    <Pin className="w-4 h-4 text-accent-pink" />
                    <span>Recent Project Workspace Drafts</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {initialData.recentProjects.slice(0, 4).map(proj => (
                      <Link key={proj.id} href={`/admin/projects/edit/${proj.id}`} className="block group">
                        <div className="p-3 bg-onyx/40 border border-white/5 hover:border-white/12 rounded-xl flex items-center justify-between transition-colors">
                          <div className="space-y-0.5">
                            <span className="text-[12px] font-bold text-warm-white group-hover:text-accent-violet transition-colors">
                              {proj.title}
                            </span>
                            <p className="text-[10px] text-stone uppercase tracking-wider">
                              Category: {proj.category || 'general'}
                            </p>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 border rounded-full font-medium uppercase
                            ${proj.status === 'published' 
                              ? 'bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald'
                              : 'bg-stone/10 border-white/5 text-stone'
                            }
                          `}>
                            {proj.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}

              {widget.id === 'recent_activities' && (
                <Card className="p-5 space-y-4">
                  <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent-cyan" />
                    <span>Live Audit Activity Logs</span>
                  </h3>
                  <div className="border border-white/5 rounded-xl divide-y divide-white/5 max-h-[220px] overflow-y-auto custom-scrollbar">
                    {initialData.auditLogs.map((log) => (
                      <div key={log.id} className="p-3 text-[11px] flex items-center justify-between hover:bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                          <span className="text-accent-cyan font-mono">{log.action}</span>
                          <span className="text-stone">on {log.targetType} ({log.targetId})</span>
                        </div>
                        <span className="text-stone/60 font-mono">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
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

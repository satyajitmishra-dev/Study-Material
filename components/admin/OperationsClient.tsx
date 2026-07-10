'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Activity, 
  Cpu, 
  HardDrive, 
  CheckCircle, 
  AlertTriangle, 
  Database,
  History,
  Clock,
  TrendingUp,
  RefreshCw,
  Server,
  Key,
  Shield,
  FileCode
} from 'lucide-react';
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

interface OperationsClientProps {
  initialData: {
    projectId: string;
    projectName: string;
    organizationName: string;
    totalProjects: number;
    mediaCount: number;
    auditLogs: any[];
  };
}

export default function OperationsClient({ initialData }: OperationsClientProps) {
  const [logs, setLogs] = useState<{ id: string; time: string; type: 'info' | 'warn' | 'error'; message: string; source: string }[]>([]);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'usage' | 'audit'>('diagnostics');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Seed mock diagnostics logs
  useEffect(() => {
    setLogs([
      { id: 'l1', time: new Date(Date.now() - 50000).toISOString().slice(11, 19), type: 'info', message: 'Prisma Client loaded successfully, connection established.', source: 'Prisma' },
      { id: 'l2', time: new Date(Date.now() - 42000).toISOString().slice(11, 19), type: 'info', message: 'Next.js 16 compiler target resolved for dynamic edge routing.', source: 'Next.js' },
      { id: 'l3', time: new Date(Date.now() - 30000).toISOString().slice(11, 19), type: 'warn', message: 'Cloudinary webhook delay detected: retrying signature verification.', source: 'Webhooks' },
      { id: 'l4', time: new Date(Date.now() - 15000).toISOString().slice(11, 19), type: 'info', message: 'OpenAI API request completed. Prompt tokens: 1420, cost: $0.0028.', source: 'AI Engine' },
      { id: 'l5', time: new Date(Date.now() - 2000).toISOString().slice(11, 19), type: 'error', message: 'Failed to retrieve SEO keywords meta tag: request timed out on external parser.', source: 'SEO Analyzer' }
    ]);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const newLog = {
        id: `l_${Date.now()}`,
        time: new Date().toISOString().slice(11, 19),
        type: Math.random() > 0.7 ? 'warn' : 'info' as any,
        message: `Diagnostics trace executed. Health check passes for Project context: ${initialData.projectName}`,
        source: 'SysCheck'
      };
      setLogs(prev => [newLog, ...prev]);
    }, 800);
  };

  // Mock charts usage data
  const usageData = [
    { name: 'Mon', api: 1240, ai: 420, cost: 0.8 },
    { name: 'Tue', api: 1450, ai: 510, cost: 1.1 },
    { name: 'Wed', api: 1100, ai: 380, cost: 0.75 },
    { name: 'Thu', api: 1890, ai: 730, cost: 1.45 },
    { name: 'Fri', api: 2300, ai: 920, cost: 1.9 },
    { name: 'Sat', api: 950, ai: 240, cost: 0.5 },
    { name: 'Sun', api: 1120, ai: 310, cost: 0.65 }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-accent-cyan tracking-[0.2em] uppercase font-mono">
            {initialData.organizationName} / {initialData.projectName}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-warm-white">
            Operations Control Panel
          </h1>
          <p className="text-[13px] text-stone font-light">
            Monitor API usage, AI compilation costs, active simulated server errors, and Project-scoped audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="secondary"
            onClick={handleRefresh}
            className="py-2 px-4 text-[12px] flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Diagnostics</span>
          </Button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-white/5 pb-0.5 gap-6">
        {[
          { id: 'diagnostics', label: 'System Diagnostics', icon: Cpu },
          { id: 'usage', label: 'API & AI Usage Analytics', icon: TrendingUp },
          { id: 'audit', label: 'Project Audit Trail', icon: History }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-[13px] font-medium tracking-wide flex items-center gap-2 cursor-pointer border-b-2 transition-all select-none
                ${isActive ? 'border-accent-cyan text-warm-white font-bold' : 'border-transparent text-stone hover:text-warm-white'}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[400px]">
        {activeTab === 'diagnostics' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Grid of Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Nodes status */}
              <Card className="p-5 space-y-4 col-span-1">
                <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                  <Server className="w-4 h-4 text-accent-cyan" />
                  <span>Infrastructure Status</span>
                </h3>
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-stone" />
                      <span className="text-[12.5px] text-stone">Supabase Postgres</span>
                    </div>
                    <span className="text-[11px] text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-stone" />
                      <span className="text-[12.5px] text-stone">Redis Cache Cluster</span>
                    </div>
                    <span className="text-[11px] text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-stone" />
                      <span className="text-[12.5px] text-stone">Node.js Runtime</span>
                    </div>
                    <span className="text-[11px] text-warm-white font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                      v20.11.0
                    </span>
                  </div>
                </div>
              </Card>

              {/* Performance Node */}
              <Card className="p-5 space-y-4 col-span-1">
                <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                  <Activity className="w-4 h-4 text-accent-violet" />
                  <span>Performance Profiles</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="text-stone">API Latency (p99)</span>
                    <span className="font-mono text-warm-white">38ms</span>
                  </div>
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="text-stone">Server CPU Load</span>
                    <span className="font-mono text-accent-cyan">14.2%</span>
                  </div>
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="text-stone">Redis Cache Hit Rate</span>
                    <span className="font-mono text-accent-emerald">96.8%</span>
                  </div>
                </div>
              </Card>

              {/* Quotas & Storage */}
              <Card className="p-5 space-y-4 col-span-1">
                <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                  <HardDrive className="w-4 h-4 text-accent-pink" />
                  <span>Media Quota Scoping</span>
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] text-stone">
                    <span>Project Cloud Storage</span>
                    <span>{(initialData.mediaCount * 0.48).toFixed(2)} MB / 100.00 MB</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-accent-pink h-full transition-all duration-300" 
                      style={{ width: `${Math.min(100, (initialData.mediaCount * 0.48 / 100) * 100)}%` }} 
                    />
                  </div>
                  <span className="text-[9.5px] text-stone/50 block italic pt-1">Storage scopes files under active projectId partition only.</span>
                </div>
              </Card>
            </div>

            {/* Build Information & Env settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Build Info */}
              <Card className="p-5 space-y-3">
                <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                  <FileCode className="w-4 h-4 text-accent-violet" />
                  <span>Build Information</span>
                </h3>
                <div className="space-y-2.5 text-[12.5px]">
                  <div className="flex justify-between"><span className="text-stone">Next.js Target</span><span className="font-mono text-warm-white">v16.0.0</span></div>
                  <div className="flex justify-between"><span className="text-stone">Tailwind PostCSS Compiler</span><span className="font-mono text-warm-white">v4.0.0</span></div>
                  <div className="flex justify-between"><span className="text-stone">Active Build Shell</span><span className="font-mono text-accent-cyan">Static/Edge Shell Hybrid</span></div>
                  <div className="flex justify-between"><span className="text-stone">Environment Context</span><span className="font-mono text-accent-violet uppercase">Production Sandbox</span></div>
                </div>
              </Card>

              {/* Secrets and Keys Verification */}
              <Card className="p-5 space-y-3">
                <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                  <Key className="w-4 h-4 text-accent-cyan" />
                  <span>Secrets Verification Check</span>
                </h3>
                <div className="space-y-2.5 text-[12.5px]">
                  <div className="flex justify-between"><span className="text-stone">AUTH_SECRET key</span><span className="text-accent-emerald flex items-center gap-1 font-bold"><CheckCircle className="w-3.5 h-3.5" /> Valid</span></div>
                  <div className="flex justify-between"><span className="text-stone">OPENAI_API_KEY tokens</span><span className="text-accent-emerald flex items-center gap-1 font-bold"><CheckCircle className="w-3.5 h-3.5" /> Configured</span></div>
                  <div className="flex justify-between"><span className="text-stone">GITHUB_TOKEN permissions</span><span className="text-accent-emerald flex items-center gap-1 font-bold"><CheckCircle className="w-3.5 h-3.5" /> Active</span></div>
                  <div className="flex justify-between"><span className="text-stone">CLOUDINARY_URL webhook</span><span className="text-accent-emerald flex items-center gap-1 font-bold"><CheckCircle className="w-3.5 h-3.5" /> Verified</span></div>
                </div>
              </Card>
            </div>

            {/* Simulated Live Console */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-accent-cyan" />
                  <span>Interactive Diagnostics Console Logs</span>
                </h3>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-accent-emerald animate-ping" />
                  <button 
                    onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
                    className="text-[11px] text-stone hover:text-warm-white cursor-pointer transition-colors"
                  >
                    {isConsoleExpanded ? 'Collapse' : 'Expand'}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {isConsoleExpanded && (
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="w-full bg-onyx-dark/80 border border-white/5 rounded-lg p-4 font-mono text-[11.5px] leading-relaxed max-h-[250px] overflow-y-auto custom-scrollbar space-y-1.5">
                      {logs.map(log => (
                        <div key={log.id} className="flex items-start gap-2">
                          <span className="text-stone/40 shrink-0 select-none">[{log.time}]</span>
                          <span className={`px-1 rounded text-[9px] font-bold uppercase shrink-0 leading-tight py-0.5
                            ${log.type === 'error' ? 'bg-accent-pink/15 text-accent-pink border border-accent-pink/20' : 
                              log.type === 'warn' ? 'bg-accent-amber/15 text-accent-amber border border-accent-amber/20' : 
                              'bg-white/5 text-stone/80 border border-white/5'}`}
                          >
                            {log.type}
                          </span>
                          <span className="text-stone/50 font-bold shrink-0 font-sans">{log.source}:</span>
                          <span className={`${log.type === 'error' ? 'text-accent-pink' : log.type === 'warn' ? 'text-accent-amber' : 'text-stone/80'}`}>
                            {log.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>
        )}

        {activeTab === 'usage' && (
          <Card className="p-6 space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 gap-4">
              <div>
                <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent-cyan" />
                  <span>API Request Rates & AI Tokens Costs</span>
                </h3>
                <p className="text-[11.5px] text-stone font-light leading-normal mt-0.5">
                  Aggregate billing metrics for API queries and OpenAI prompt generation across this project.
                </p>
              </div>
              
              <div className="flex gap-4">
                <div className="p-2.5 rounded-lg bg-white/[0.01] border border-white/5 flex flex-col items-center">
                  <span className="text-[10px] text-stone uppercase tracking-wider font-mono">Weekly cost</span>
                  <span className="text-[14px] font-bold text-accent-cyan font-mono mt-0.5">$7.65</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.01] border border-white/5 flex flex-col items-center">
                  <span className="text-[10px] text-stone uppercase tracking-wider font-mono">Total API Requests</span>
                  <span className="text-[14px] font-bold text-accent-violet font-mono mt-0.5">9,130</span>
                </div>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#00f2fe" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} className="font-mono" />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} className="font-mono" />
                  <ChartTooltip 
                    contentStyle={{ backgroundColor: '#161618', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="api" stroke="#8884d8" fillOpacity={1} fill="url(#colorApi)" strokeWidth={2} name="API Requests" />
                  <Area type="monotone" dataKey="ai" stroke="#00f2fe" fillOpacity={1} fill="url(#colorAi)" strokeWidth={2} name="AI Tokens (x10)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {activeTab === 'audit' && (
          <Card className="p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-accent-cyan" />
                <span>Project Scope Audit Trail Log</span>
              </h3>
              <span className="text-[10px] text-stone font-mono uppercase tracking-wider">Scoped by projectId</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[12px] text-stone">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] text-stone uppercase tracking-wider">
                    <th className="py-2.5 font-semibold">User</th>
                    <th className="py-2.5 font-semibold">Action</th>
                    <th className="py-2.5 font-semibold">Resource</th>
                    <th className="py-2.5 font-semibold">Details</th>
                    <th className="py-2.5 font-semibold text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {initialData.auditLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3 text-warm-white font-sans font-medium">
                        {log.userId === 'sandbox-admin-id' ? 'Sandbox Admin' : log.userId.substring(0, 10)}
                      </td>
                      <td className="py-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/5 text-accent-cyan">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 text-warm-white">{log.targetType}</td>
                      <td className="py-3 text-stone/80 truncate max-w-xs">{log.details || '-'}</td>
                      <td className="py-3 text-right text-stone/60">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {initialData.auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-stone">
                        No audit events recorded for this Project.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  MessageSquare, 
  Settings, 
  ShieldAlert, 
  ThumbsUp, 
  Eye, 
  Bookmark, 
  ArrowUp, 
  ArrowDown, 
  UserX, 
  Check, 
  Trash2, 
  AlertTriangle,
  Layout,
  Plus
} from 'lucide-react';
import { Card, Button, Input } from '@/components/ui/core';

interface EngagementClientProps {
  initialLayout: string[];
  onSaveLayout: (layout: string[]) => Promise<any>;
}

export default function EngagementClient({ 
  initialLayout, 
  onSaveLayout 
}: EngagementClientProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'moderation' | 'layout' | 'blocked'>('analytics');

  // Business Analytics KPIs
  const kpis = [
    { title: 'Average Read Completion', value: '74.2%', change: '+3.5%', desc: 'Avg scroll progress per post view' },
    { title: 'Returning Readers', value: '48.9%', change: '+12.4%', desc: 'Readers with >1 visits' },
    { title: 'Newsletter Conversion Rate', value: '4.8%', change: '+0.9%', desc: 'Digests subscribers CTR' },
    { title: 'Avg Time Spent on Page', value: '4m 12s', change: '+22s', desc: 'Sliding window reading session avg' }
  ];

  // Mock reported comments moderation queue
  const [spamQueue, setSpamQueue] = useState<any[]>([
    { id: 'spam_1', commentId: 'comm_sandbox_1', author: 'anonymous_bot', reason: 'Self-promotion links and spam words.', content: 'Earn $5000 a day reading nextjs articles! Visit my spam link.', createdAt: new Date() },
    { id: 'spam_2', commentId: 'comm_sandbox_2', author: 'angry_dev', reason: 'Offensive language.', content: 'This library is completely useless, you are a terrible coder.', createdAt: new Date() }
  ]);

  // Dynamic Layout Builder State
  const [layoutOrder, setLayoutOrder] = useState<string[]>(initialLayout);
  
  // Blocked users/IPs lists
  const [blockedIps, setBlockedIps] = useState<string[]>(['192.168.1.102', '10.0.0.45']);
  const [ipInput, setIpInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Reorder Layout sections
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...layoutOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    // Swap
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    
    setLayoutOrder(newOrder);
  };

  const handleSaveLayout = async () => {
    const res = await onSaveLayout(layoutOrder);
    if (res.success) {
      triggerToast('Homepage layout order saved successfully!');
    } else {
      triggerToast('Failed to save layout order');
    }
  };

  // Moderation Actions
  const handleApproveComment = (id: string) => {
    setSpamQueue(prev => prev.filter(c => c.id !== id));
    triggerToast('Comment approved and cleared from queue.');
  };

  const handleDeleteComment = (id: string) => {
    setSpamQueue(prev => prev.filter(c => c.id !== id));
    triggerToast('Comment deleted successfully.');
  };

  const handleBlockIp = () => {
    if (!ipInput.trim()) return;
    setBlockedIps(prev => [...prev, ipInput]);
    setIpInput('');
    triggerToast('IP address added to blocked list.');
  };

  const handleUnblockIp = (ip: string) => {
    setBlockedIps(prev => prev.filter(item => item !== ip));
    triggerToast('IP address unblocked.');
  };

  return (
    <div className="space-y-6">
      {/* Toast popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-55 bg-accent-cyan/10 border border-accent-cyan/20 px-4 py-3 rounded-xl shadow-premium backdrop-blur-md text-[12px] font-bold text-accent-cyan flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <span className="text-[11px] font-semibold text-accent-cyan tracking-[0.2em] uppercase font-mono">CMS Hub</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-warm-white mt-1">Engagement Studio</h1>
        <p className="text-[13px] text-stone font-light mt-1">
          Review business performance KPIs, moderate reported comment spam, and configure your public homepage layout.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/5 pb-0.5 gap-6 text-[13px] text-stone font-medium">
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 relative cursor-pointer ${activeTab === 'analytics' ? 'text-warm-white font-bold' : 'hover:text-warm-white'}`}
        >
          {activeTab === 'analytics' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-cyan" />}
          <span className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Performance KPIs</span>
        </button>
        <button 
          onClick={() => setActiveTab('moderation')}
          className={`pb-3 relative cursor-pointer ${activeTab === 'moderation' ? 'text-warm-white font-bold' : 'hover:text-warm-white'}`}
        >
          {activeTab === 'moderation' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-cyan" />}
          <span className="flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Spam Queue ({spamQueue.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('layout')}
          className={`pb-3 relative cursor-pointer ${activeTab === 'layout' ? 'text-warm-white font-bold' : 'hover:text-warm-white'}`}
        >
          {activeTab === 'layout' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-cyan" />}
          <span className="flex items-center gap-2"><Layout className="w-4 h-4" /> Homepage Builder</span>
        </button>
        <button 
          onClick={() => setActiveTab('blocked')}
          className={`pb-3 relative cursor-pointer ${activeTab === 'blocked' ? 'text-warm-white font-bold' : 'hover:text-warm-white'}`}
        >
          {activeTab === 'blocked' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-cyan" />}
          <span className="flex items-center gap-2"><UserX className="w-4 h-4" /> Blocked Desk</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-4">
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {kpis.map((kpi, idx) => (
                <Card key={idx} className="p-5 flex flex-col justify-between h-[130px]">
                  <div>
                    <span className="text-[10px] text-stone uppercase tracking-wider font-mono font-bold block">{kpi.title}</span>
                    <span className="text-2xl font-bold text-warm-white font-mono block mt-1.5">{kpi.value}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-stone mt-4 border-t border-white/5 pt-2">
                    <span className="text-accent-emerald font-bold">{kpi.change}</span>
                    <span className="truncate max-w-[120px]">{kpi.desc}</span>
                  </div>
                </Card>
              ))}
            </div>

            {/* Structured charts / list reports */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-5 space-y-4">
                <h4 className="text-[13px] font-bold text-warm-white font-mono uppercase tracking-wider">Top Referrers</h4>
                <div className="space-y-3 font-mono text-[12px] text-stone">
                  <div className="flex items-center justify-between"><span>1. google.com</span><span className="text-warm-white">65% CTR</span></div>
                  <div className="flex items-center justify-between"><span>2. news.ycombinator.com</span><span className="text-warm-white">20% CTR</span></div>
                  <div className="flex items-center justify-between"><span>3. twitter.com</span><span className="text-warm-white">10% CTR</span></div>
                </div>
              </Card>
              <Card className="p-5 space-y-4">
                <h4 className="text-[13px] font-bold text-warm-white font-mono uppercase tracking-wider">Device Profiles</h4>
                <div className="space-y-3 font-mono text-[12px] text-stone">
                  <div className="flex items-center justify-between"><span>Desktop</span><span className="text-warm-white">70%</span></div>
                  <div className="flex items-center justify-between"><span>Mobile Browser</span><span className="text-warm-white">25%</span></div>
                  <div className="flex items-center justify-between"><span>Tablet / iPad</span><span className="text-warm-white">5%</span></div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-warm-white font-mono uppercase tracking-wider text-[12px]">flagged comments queue</h3>
            <div className="space-y-4">
              {spamQueue.map(c => (
                <Card key={c.id} className="p-5 border-white/5 hover:border-white/10 flex flex-col md:flex-row gap-6 justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 text-[11px] text-stone font-mono">
                      <span className="text-accent-pink font-semibold uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Reported: {c.reason}
                      </span>
                      <span>By @{c.author}</span>
                    </div>
                    <p className="text-[13px] text-stone font-light leading-relaxed">
                      "{c.content}"
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0 self-center">
                    <Button variant="ghost" onClick={() => handleApproveComment(c.id)} className="h-8 px-2.5 text-accent-emerald hover:bg-accent-emerald/5">
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </Button>
                    <Button variant="ghost" onClick={() => handleDeleteComment(c.id)} className="h-8 px-2.5 text-accent-pink hover:bg-accent-pink/5">
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </Card>
              ))}

              {spamQueue.length === 0 && (
                <div className="py-20 border border-dashed border-white/5 rounded-2xl text-center text-stone text-[12px]">
                  All comment flags cleared. Moderation queue empty!
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <Card className="p-6 max-w-xl mx-auto space-y-6">
            <div>
              <h3 className="text-base font-bold text-warm-white flex items-center gap-2">
                <Layout className="w-5 h-5 text-accent-cyan" />
                <span>Homepage Layout Builder</span>
              </h3>
              <p className="text-[11px] text-stone mt-1 leading-relaxed">
                Drag-order the public homepage modules below. Save changes to push layout order updates instantly.
              </p>
            </div>

            <div className="space-y-2 bg-charcoal/20 border border-white/5 rounded-2xl p-4">
              {layoutOrder.map((section, idx) => (
                <div key={section} className="flex items-center justify-between p-3.5 bg-charcoal/40 border border-white/5 rounded-xl text-[12px] font-mono text-warm-white">
                  <span className="uppercase tracking-wider font-bold">{section} Section</span>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => moveSection(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => moveSection(idx, 'down')}
                      disabled={idx === layoutOrder.length - 1}
                      className="p-1 rounded hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="primary" onClick={handleSaveLayout} className="w-full justify-center text-[12px] py-2">
              <span>Save Homepage Layout</span>
            </Button>
          </Card>
        )}

        {activeTab === 'blocked' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* IP Block widget */}
            <Card className="p-5 space-y-5">
              <div>
                <h4 className="text-[13px] font-bold text-warm-white font-mono uppercase tracking-wider">Blocked IP Addresses</h4>
                <p className="text-[11px] text-stone mt-0.5">Blocked IPs are denied public route access and form submission rights.</p>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  placeholder="e.g. 192.168.1.105..."
                  className="flex-1 bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-[12px] text-warm-white outline-none focus:border-white/10 font-mono"
                />
                <Button variant="primary" onClick={handleBlockIp} className="px-3"><Plus className="w-4 h-4" /></Button>
              </div>

              <div className="space-y-2 bg-charcoal/20 border border-white/5 rounded-xl p-3 max-h-[160px] overflow-y-auto font-mono text-[12px] text-stone">
                {blockedIps.map(ip => (
                  <div key={ip} className="flex items-center justify-between py-1.5">
                    <span>{ip}</span>
                    <button onClick={() => handleUnblockIp(ip)} className="text-accent-pink hover:text-warm-white cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                {blockedIps.length === 0 && <div className="text-center py-4 text-[11px]">No blocked IPs</div>}
              </div>
            </Card>

            {/* Feature flag list */}
            <Card className="p-5 space-y-4">
              <div>
                <h4 className="text-[13px] font-bold text-warm-white font-mono uppercase tracking-wider">Feature Flags</h4>
                <p className="text-[11px] text-stone mt-0.5">Toggle active modules across the publishing platform.</p>
              </div>

              <div className="space-y-3 text-[12px] text-stone">
                <div className="flex items-center justify-between p-3 bg-charcoal/20 border border-white/5 rounded-lg">
                  <div className="space-y-0.5">
                    <span className="font-bold text-warm-white block">Email Newsletter Digests</span>
                    <span className="text-[10px] block font-light">Toggle automated weekly sendouts</span>
                  </div>
                  <span className="text-[9px] bg-accent-emerald/10 border border-accent-emerald/20 px-2 py-0.5 rounded text-accent-emerald uppercase font-bold">Enabled</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-charcoal/20 border border-white/5 rounded-lg">
                  <div className="space-y-0.5">
                    <span className="font-bold text-warm-white block">Speakable RSS Feed</span>
                    <span className="text-[10px] block font-light">Enables speech readers metadata sitemaps</span>
                  </div>
                  <span className="text-[9px] bg-accent-emerald/10 border border-accent-emerald/20 px-2 py-0.5 rounded text-accent-emerald uppercase font-bold">Enabled</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

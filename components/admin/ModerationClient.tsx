'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Trash2, 
  EyeOff, 
  CheckCircle, 
  FolderPlus, 
  Flame, 
  Lock, 
  Clock, 
  Users, 
  BookOpen, 
  Code2, 
  FileText, 
  MessageSquare,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  Send,
  Plus
} from 'lucide-react';
import { Card, Button } from '@/components/ui/core';
import { reportsStore as initialReports, ContentReport, moderateContentAction } from '@/lib/actions/moderation';

interface CategoryNode {
  name: string;
  sub: string[];
}

export default function ModerationClient() {
  const [reports, setReports] = useState<ContentReport[]>(initialReports);
  const [auditLogs, setAuditLogs] = useState<string[]>([
    'Moderator Satyajit Mishra approved developer portfolio badge validation for usr_12',
    'Post titled "stale-while-revalidate caches" marked as featured on Explore page',
    'Lock comments executed on forum discussion "salary guidelines 2026"'
  ]);

  // Categories Tree state
  const [categories, setCategories] = useState<CategoryNode[]>([
    { name: 'Programming', sub: ['Web Development', 'Mobile Development', 'Backend Architectures', 'Frontend Engineering', 'AI & Data Science'] },
    { name: 'College Notes', sub: ['Semester 1 Notes', 'Semester 2 Notes', 'Pre-placement Papers'] },
    { name: 'Career & Interview', sub: ['System Design prep', 'DSA Cheat Sheets', 'HR negotiation guidelines'] }
  ]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatParent, setNewCatParent] = useState('Programming');

  // Trigger moderator actions
  const handleApplyAction = async (reportId: string, contentId: string, type: string, action: 'hide' | 'lock_comments' | 'feature' | 'verify') => {
    const res = await moderateContentAction(contentId, type, action, `Applied via Moderation Hub on Report: ${reportId}`);
    if (res.success) {
      setReports(reports.filter(r => r.id !== reportId));
      
      const newLog = `Moderator action [${action.toUpperCase()}] applied to ${type} (ID: ${contentId}) by ${res.moderatorName}`;
      setAuditLogs([newLog, ...auditLogs]);
      alert(`Action successfully applied! Event emitted: content:${action}`);
    } else {
      alert(`Failed to apply action: ${res.error}`);
    }
  };

  const handleDismissReport = (reportId: string) => {
    setReports(reports.filter(r => r.id !== reportId));
    setAuditLogs([`Report ${reportId} was dismissed by moderator.`, ...auditLogs]);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCategories(categories.map(c => c.name === newCatParent ? {
      ...c,
      sub: [...c.sub, newCatName]
    } : c));
    setNewCatName('');
    setAuditLogs([`New hierarchical category "${newCatName}" appended under ${newCatParent}`, ...auditLogs]);
  };

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'project': return Code2;
      case 'note': return FileText;
      case 'discussion': return MessageSquare;
      default: return Sparkles;
    }
  };

  return (
    <div className="w-full space-y-8 pt-8 pb-16 px-4">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-6">
        <span className="text-[10px] font-mono text-accent-cyan font-bold uppercase tracking-wider flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Admin Operations</span>
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-warm-white mt-1">Moderation Hub</h1>
        <p className="text-[13px] text-stone font-light mt-1">
          Review spam reports, approve badges, moderate tag taxonomies, and manage category node hierarchies.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Reports', value: reports.length, color: 'text-accent-pink bg-accent-pink/5 border-accent-pink/15' },
          { label: 'Audit Events Logged', value: auditLogs.length, color: 'text-accent-violet bg-accent-violet/5 border-accent-violet/15' },
          { label: 'Verified Creators', value: 4, color: 'text-accent-cyan bg-accent-cyan/5 border-accent-cyan/15' },
          { label: 'Category Folders', value: 11, color: 'text-accent-amber bg-accent-amber/5 border-accent-amber/15' }
        ].map((s, i) => (
          <Card key={i} className={`p-4 flex flex-col justify-between h-[100px] border ${s.color}`}>
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone">{s.label}</span>
            <span className="text-2xl font-black text-warm-white">{s.value}</span>
          </Card>
        ))}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Reports Inbox */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="text-md font-bold text-warm-white flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-accent-pink" />
              <span>Pending Moderation Reports ({reports.length})</span>
            </h3>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {reports.map((rep) => {
                const Icon = getDocIcon(rep.contentType);
                return (
                  <motion.div
                    key={rep.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="p-5 border-accent-pink/10 bg-accent-pink/[0.01] space-y-4 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-accent-pink/[0.01] rounded-bl-full pointer-events-none" />
                      
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono bg-accent-pink/10 border border-accent-pink/20 px-2 py-0.5 rounded text-accent-pink font-bold uppercase tracking-wider">
                              Report: {rep.reason.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-stone font-mono">ID: {rep.id} · 2 hrs ago</span>
                          </div>
                          <h4 className="text-[14px] font-bold text-warm-white flex items-center gap-2 mt-1.5">
                            <Icon className="w-4 h-4 text-stone" />
                            <span>Target: {rep.contentType} (ID: {rep.contentId})</span>
                          </h4>
                          <p className="text-[12px] text-stone leading-relaxed font-light mt-1">
                            Flagged Reason: <span className="text-warm-white font-sans font-normal">"{rep.details}"</span>
                          </p>
                        </div>
                        <span className="text-[10px] text-stone/40 font-mono">Reporter: {rep.reporterId}</span>
                      </div>

                      {/* Moderator action controls */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5 text-[11px]">
                        <Button 
                          variant="secondary" 
                          onClick={() => handleApplyAction(rep.id, rep.contentId, rep.contentType, 'hide')}
                          className="py-1 px-2.5 flex items-center gap-1 hover:border-accent-pink/30 hover:text-accent-pink"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide Content</span>
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={() => handleApplyAction(rep.id, rep.contentId, rep.contentType, 'lock_comments')}
                          className="py-1 px-2.5 flex items-center gap-1 hover:border-accent-violet/30 hover:text-accent-violet"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Lock Comments</span>
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={() => handleApplyAction(rep.id, rep.contentId, rep.contentType, 'feature')}
                          className="py-1 px-2.5 flex items-center gap-1 hover:border-accent-cyan/30 hover:text-accent-cyan"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>Feature Item</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => handleDismissReport(rep.id)}
                          className="py-1 px-2.5 ml-auto text-stone hover:text-warm-white"
                        >
                          Dismiss Flag
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {reports.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl">
                <CheckCircle className="w-12 h-12 text-accent-emerald/45 animate-bounce" />
                <h4 className="text-[13px] font-bold text-warm-white mt-3">Clean inbox</h4>
                <p className="text-[11px] text-stone mt-1">No pending content reports are awaiting moderator review.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Categories Node Manager & Audit Logs */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Category Tree Manager */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold text-stone uppercase tracking-wider font-mono">Category Hierarchy Tree</h4>
            <div className="bg-charcoal/20 border border-white/5 rounded-2xl p-4 space-y-4 font-sans text-[12px]">
              
              {/* Category Node List */}
              <div className="space-y-3">
                {categories.map((c) => (
                  <div key={c.name} className="space-y-1">
                    <span className="font-bold text-warm-white block">{c.name}</span>
                    <ul className="pl-3 border-l border-white/5 space-y-1 text-stone text-[11px] font-mono">
                      {c.sub.map(s => (
                        <li key={s}>├─ {s}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Add category node form */}
              <form onSubmit={handleCreateCategory} className="space-y-2 border-t border-white/5 pt-3">
                <span className="text-[9.5px] font-mono text-stone uppercase font-bold block">Append Subcategory</span>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="New node name..."
                    className="flex-1 bg-charcoal/30 border border-white/5 rounded px-2 py-1 text-[11px] text-warm-white outline-none"
                  />
                  <select
                    value={newCatParent}
                    onChange={(e) => setNewCatParent(e.target.value)}
                    className="bg-charcoal/40 border border-white/5 rounded px-1.5 py-1 text-[11px] text-stone"
                  >
                    {categories.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <Button type="submit" variant="primary" className="w-full text-[10.5px] py-1.5 justify-center">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Append Node</span>
                </Button>
              </form>

            </div>
          </div>

          {/* Audit Logs */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold text-stone uppercase tracking-wider font-mono">Audit Operations Log</h4>
            <div className="bg-charcoal/20 border border-white/5 rounded-2xl p-4 space-y-3 font-mono text-[10px] text-stone leading-relaxed max-h-[220px] overflow-y-auto">
              {auditLogs.map((log, idx) => (
                <div key={idx} className="border-b border-white/5 pb-2 last:border-b-0 last:pb-0">
                  <span className="text-stone/40 block">v4.0 Audit Event Logged</span>
                  <p className="mt-0.5 text-stone/85">{log}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

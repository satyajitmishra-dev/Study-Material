'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Trash2, 
  EyeOff, 
  CheckCircle, 
  Lock, 
  Clock, 
  Users, 
  Code2, 
  FileText, 
  MessageSquare,
  Sparkles,
  AlertTriangle,
  Plus,
  Ban,
  UserX,
  UserCheck,
  Flag,
  FileCheck
} from 'lucide-react';
import { Card, Button } from '@/components/ui/core';
import { reportsStore as initialReports, ContentReport, moderateContentAction, moderateUserAction } from '@/lib/actions/moderation';

interface CategoryNode {
  name: string;
  sub: string[];
}

export default function ModerationClient() {
  const [activeSubTab, setActiveSubTab] = useState<'reports' | 'users' | 'categories' | 'logs'>('reports');
  const [reports, setReports] = useState<ContentReport[]>(initialReports);
  
  // Selected reports for bulk operations
  const [selectedReportIds, setSelectedReportIds] = useState<Set<string>>(new Set());

  const [auditLogs, setAuditLogs] = useState<string[]>([
    'Moderator Satyajit Mishra approved developer portfolio badge validation for usr_12',
    'Post titled "stale-while-revalidate caches" marked as featured on Explore page',
    'Lock comments executed on forum discussion "salary guidelines 2026"'
  ]);

  // Ban management states
  const [targetUserId, setTargetUserId] = useState('usr_dev_3');
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('7');

  const [usersList, setUsersList] = useState([
    { id: 'usr_dev_1', name: 'Emily Chen', username: 'emilychen', role: 'user', status: 'active', strikes: 0, shadowBanned: false },
    { id: 'usr_dev_2', name: 'Alex Rivera', username: 'arivera', role: 'user', status: 'active', strikes: 2, shadowBanned: false },
    { id: 'usr_dev_3', name: 'Spammy Dev', username: 'spammydev', role: 'user', status: 'active', strikes: 1, shadowBanned: false },
    { id: 'usr_dev_4', name: 'Banned Poster', username: 'bannedposter', role: 'user', status: 'disabled', strikes: 3, shadowBanned: false }
  ]);

  const [categories, setCategories] = useState<CategoryNode[]>([
    { name: 'Programming', sub: ['Web Development', 'Mobile Development', 'Backend Architectures', 'Frontend Engineering', 'AI & Data Science'] },
    { name: 'College Notes', sub: ['Semester 1 Notes', 'Semester 2 Notes', 'Pre-placement Papers'] },
    { name: 'Career & Interview', sub: ['System Design prep', 'DSA Cheat Sheets', 'HR negotiation guidelines'] }
  ]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatParent, setNewCatParent] = useState('Programming');

  // Appeals mock list
  const [appeals, setAppeals] = useState([
    { id: 'app_1', userId: 'usr_dev_4', username: 'bannedposter', reason: 'Self-correction: cleared duplicate links from drafts.', status: 'pending' }
  ]);

  // Content Actions
  const handleApplyAction = async (reportId: string, contentId: string, type: string, action: 'hide' | 'lock_comments' | 'feature' | 'verify') => {
    const res = await moderateContentAction(contentId, type, action, `Applied via Moderation Hub on Report: ${reportId}`);
    if (res.success) {
      setReports(reports.filter(r => r.id !== reportId));
      const newLog = `Moderator action [${action.toUpperCase()}] applied to ${type} (ID: ${contentId}) by ${res.moderatorName}`;
      setAuditLogs([newLog, ...auditLogs]);
    } else {
      alert(`Failed to apply action: ${res.error}`);
    }
  };

  const handleDismissReport = (reportId: string) => {
    setReports(reports.filter(r => r.id !== reportId));
    setAuditLogs([`Report ${reportId} was dismissed by moderator.`, ...auditLogs]);
  };

  // Bulk Operations
  const toggleSelectReport = (id: string) => {
    const next = new Set(selectedReportIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedReportIds(next);
  };

  const handleBulkAction = async (action: 'hide' | 'dismiss') => {
    if (selectedReportIds.size === 0) return;
    
    let count = 0;
    const idsToProcess = Array.from(selectedReportIds);
    
    for (const rId of idsToProcess) {
      const rep = reports.find(r => r.id === rId);
      if (rep) {
        if (action === 'hide') {
          await moderateContentAction(rep.contentId, rep.contentType, 'hide', `Bulk Hide Action`);
        }
        count++;
      }
    }

    setReports(reports.filter(r => !selectedReportIds.has(r.id)));
    setAuditLogs([`Bulk [${action.toUpperCase()}] applied to ${count} content reports.`, ...auditLogs]);
    setSelectedReportIds(new Set());
    alert(`Bulk action successfully executed on ${count} reports.`);
  };

  // User Moderation Actions
  const handleUserMod = async (action: 'shadowban' | 'tempban' | 'permban' | 'unban' | 'add_strike') => {
    if (!banReason.trim()) {
      alert('Please state a reason for user moderation action.');
      return;
    }

    const res = await moderateUserAction(targetUserId, action, banReason, parseInt(banDuration));
    if (res.success) {
      setUsersList(usersList.map(u => {
        if (u.id === targetUserId) {
          return {
            ...u,
            status: action === 'unban' ? 'active' : (action === 'tempban' || action === 'permban') ? 'disabled' : u.status,
            shadowBanned: action === 'shadowban' ? true : u.shadowBanned,
            strikes: action === 'add_strike' ? u.strikes + 1 : u.strikes
          };
        }
        return u;
      }));

      setAuditLogs([res.log || `Executed user mod: ${action}`, ...auditLogs]);
      setBanReason('');
      alert('User restriction configured and logged.');
    } else {
      alert(`Action failed: ${res.error}`);
    }
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

  return (
    <div className="w-full space-y-8 pt-8 pb-16 px-4 font-sans text-warm-white">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-6">
        <span className="text-[10px] font-mono text-accent-cyan font-bold uppercase tracking-wider flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Console Moderation Panel</span>
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-warm-white mt-1">Console Operations Hub</h1>
        <p className="text-[13px] text-stone font-light mt-1">
          Review spam queues, restrict shadow-banned creators, resolve appeal briefs, and configure category nodes.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-white/5 pb-1 gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'reports', label: `Pending Reports (${reports.length})` },
          { id: 'users', label: 'Bans & Strikes Manager' },
          { id: 'categories', label: 'Category Node Taxonomy' },
          { id: 'logs', label: 'Operations Audit Log' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveSubTab(t.id as any)}
            className={`px-4 py-2 border-b-2 text-[12.5px] font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === t.id ? 'border-accent-cyan text-accent-cyan' : 'border-transparent text-stone hover:text-warm-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Reports Inbox */}
        {activeSubTab === 'reports' && (
          <div className="lg:col-span-12 space-y-6">
            
            {/* Bulk actions header bar */}
            {reports.length > 0 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-charcoal/20 border border-white/5 text-[12px] text-stone">
                <div className="flex items-center gap-2">
                  <span>Selected: {selectedReportIds.size}</span>
                  <button 
                    onClick={() => {
                      if (selectedReportIds.size === reports.length) {
                        setSelectedReportIds(new Set());
                      } else {
                        setSelectedReportIds(new Set(reports.map(r => r.id)));
                      }
                    }} 
                    className="text-accent-cyan hover:underline font-bold"
                  >
                    Toggle All
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleBulkAction('hide')}
                    disabled={selectedReportIds.size === 0}
                    className="py-1 px-3 text-[11px] bg-accent-pink/15 text-accent-pink hover:bg-accent-pink/25 border-accent-pink/20"
                  >
                    Bulk Hide Content
                  </Button>
                  <Button 
                    onClick={() => handleBulkAction('dismiss')}
                    disabled={selectedReportIds.size === 0}
                    className="py-1 px-3 text-[11px] bg-white/5 text-stone hover:text-warm-white border-white/5"
                  >
                    Bulk Dismiss Flags
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {reports.map((rep) => {
                  const isSelected = selectedReportIds.has(rep.id);
                  return (
                    <motion.div
                      key={rep.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-start gap-3 w-full"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectReport(rep.id)}
                        className="mt-5 w-4 h-4 rounded accent-accent-cyan cursor-pointer"
                      />
                      <Card className="flex-1 p-5 border-accent-pink/10 bg-accent-pink/[0.01] space-y-4 relative overflow-hidden group">
                        <div className="flex justify-between items-start gap-4 flex-wrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono bg-accent-pink/10 border border-accent-pink/20 px-2 py-0.5 rounded text-accent-pink font-bold uppercase tracking-wider">
                                Report: {rep.reason.replace('_', ' ')}
                              </span>
                              <span className="text-[10px] text-stone font-mono">ID: {rep.id}</span>
                            </div>
                            <h4 className="text-[14px] font-bold text-warm-white flex items-center gap-2 mt-1.5">
                              <span>Target Content ID: {rep.contentId} ({rep.contentType})</span>
                            </h4>
                            <p className="text-[12px] text-stone leading-relaxed font-light mt-1">
                              Details: <span className="text-warm-white font-sans font-normal">"{rep.details}"</span>
                            </p>
                          </div>
                          <span className="text-[10px] text-stone/40 font-mono">Reporter: {rep.reporterId}</span>
                        </div>

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
        )}

        {/* Bans & Strikes Manager */}
        {activeSubTab === 'users' && (
          <div className="lg:col-span-12 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Form panel */}
              <div className="md:col-span-5 space-y-4">
                <Card className="p-5 space-y-4">
                  <h3 className="text-md font-bold text-warm-white flex items-center gap-2">
                    <Ban className="w-4.5 h-4.5 text-accent-pink" />
                    <span>Issue Restrictions</span>
                  </h3>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Select User</label>
                    <select 
                      value={targetUserId} 
                      onChange={e => setTargetUserId(e.target.value)} 
                      className="bg-charcoal/20 border border-white/5 rounded-lg text-[13px] px-3 py-2 text-warm-white outline-none"
                    >
                      {usersList.map(u => (
                        <option key={u.id} value={u.id} className="bg-[#1c1c1e] text-warm-white">
                          {u.name} (@{u.username}) {u.status === 'disabled' ? '[Banned]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Ban Duration (For Temporary Ban)</label>
                    <select 
                      value={banDuration} 
                      onChange={e => setBanDuration(e.target.value)} 
                      className="bg-charcoal/20 border border-white/5 rounded-lg text-[13px] px-3 py-2 text-warm-white outline-none"
                    >
                      <option value="1">1 Day Suspension</option>
                      <option value="7">7 Days Suspension</option>
                      <option value="30">30 Days Suspension</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Audit / Ban Reason</label>
                    <textarea 
                      value={banReason}
                      onChange={e => setBanReason(e.target.value)}
                      placeholder="Plagiarism detection, spam distribution, code injection..."
                      className="w-full h-24 bg-charcoal/20 border border-white/5 rounded-lg text-[13px] px-3 py-2 text-warm-white outline-none focus:border-white/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button onClick={() => handleUserMod('add_strike')} variant="secondary" className="py-2 text-[11px] justify-center">
                      + Add Strike
                    </Button>
                    <Button onClick={() => handleUserMod('shadowban')} variant="secondary" className="py-2 text-[11px] justify-center">
                      Shadow Ban
                    </Button>
                    <Button onClick={() => handleUserMod('tempban')} className="py-2 text-[11px] justify-center bg-accent-pink/10 hover:bg-accent-pink/20 text-accent-pink">
                      Suspend User
                    </Button>
                    <Button onClick={() => handleUserMod('permban')} className="py-2 text-[11px] justify-center bg-accent-red/25 hover:bg-accent-red/35 text-white">
                      Perm Ban
                    </Button>
                  </div>
                  
                  <Button onClick={() => handleUserMod('unban')} variant="ghost" className="w-full text-stone hover:text-warm-white text-[11px] justify-center">
                    <UserCheck className="w-4 h-4 mr-1.5 text-accent-emerald" />
                    Restore Account / Lift Bans
                  </Button>
                </Card>
              </div>

              {/* Status & Appeals list */}
              <div className="md:col-span-7 space-y-6">
                <Card className="p-5 space-y-4">
                  <h3 className="text-md font-bold text-warm-white">Developer Strike Roster</h3>
                  
                  <div className="space-y-3">
                    {usersList.map(u => (
                      <div key={u.id} className="flex items-center justify-between border-b border-white/5 pb-2 text-[12.5px] last:border-b-0">
                        <div>
                          <span className="font-bold text-warm-white block">{u.name}</span>
                          <span className="text-[10px] text-stone">@{u.username} · {u.id}</span>
                        </div>
                        
                        <div className="flex gap-2 text-[10px] font-mono">
                          {u.shadowBanned && <span className="bg-accent-violet/10 border border-accent-violet/20 text-accent-violet px-2 py-0.5 rounded">SHADOW BANNED</span>}
                          {u.status === 'disabled' && <span className="bg-accent-red/10 border border-accent-red/20 text-accent-red px-2 py-0.5 rounded">SUSPENDED</span>}
                          <span className={`px-2 py-0.5 rounded ${u.strikes >= 2 ? 'bg-accent-pink/10 text-accent-pink' : 'bg-white/5 text-stone'}`}>
                            {u.strikes} Strikes
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Appeal list card */}
                <Card className="p-5 space-y-4">
                  <h3 className="text-md font-bold text-warm-white">Bans Appeals Inbox ({appeals.length})</h3>
                  
                  <div className="space-y-3">
                    {appeals.map(ap => (
                      <div key={ap.id} className="p-4 rounded-xl bg-onyx/40 border border-white/5 space-y-3 text-[12.5px]">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-warm-white">Appeal by @{ap.username}</span>
                          <span className="text-[10.5px] text-stone font-mono bg-accent-orange/10 px-1.5 py-0.25 rounded text-accent-orange">PENDING</span>
                        </div>
                        <p className="text-stone font-light leading-relaxed">"{ap.reason}"</p>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => {
                              setAppeals([]);
                              setAuditLogs([`Appeal ${ap.id} approved. Lifted ban for @${ap.username}`, ...auditLogs]);
                              alert('Ban lifted successfully.');
                            }}
                            className="py-1 px-3 text-[10.5px] bg-accent-emerald/10 border border-accent-emerald/20 hover:bg-accent-emerald/20 text-accent-emerald font-bold"
                          >
                            Approve Appeal
                          </Button>
                          <Button 
                            onClick={() => {
                              setAppeals([]);
                              setAuditLogs([`Appeal ${ap.id} rejected. Ban maintained for @${ap.username}`, ...auditLogs]);
                              alert('Appeal rejected.');
                            }}
                            variant="ghost" 
                            className="py-1 px-3 text-[10.5px] text-stone hover:text-warm-white"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

            </div>
          </div>
        )}

        {/* Category Node taxonomy tab */}
        {activeSubTab === 'categories' && (
          <div className="lg:col-span-12 space-y-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-md font-bold text-warm-white">Hierarchical Category Trees</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((c) => (
                  <div key={c.name} className="p-4 rounded-xl bg-onyx/40 border border-white/5 space-y-2">
                    <span className="font-bold text-warm-white block">{c.name}</span>
                    <ul className="pl-3 border-l border-white/5 space-y-1 text-stone text-[11px] font-mono">
                      {c.sub.map(s => (
                        <li key={s}>├─ {s}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-4 border-t border-white/5 pt-4 max-w-xl">
                <span className="text-[11px] font-mono text-stone uppercase font-bold block">Append Subcategory Node</span>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Enter node title (e.g. Next.js 16)"
                    className="flex-1 bg-charcoal/30 border border-white/5 rounded px-3 py-2 text-[12px] text-warm-white outline-none"
                  />
                  <select
                    value={newCatParent}
                    onChange={(e) => setNewCatParent(e.target.value)}
                    className="bg-charcoal/40 border border-white/5 rounded px-2 py-2 text-[12px] text-stone"
                  >
                    {categories.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <Button type="submit" variant="primary" className="w-full text-[11px] py-2 justify-center uppercase tracking-wider font-bold">
                  <Plus className="w-4 h-4 mr-1" />
                  Append Category Node
                </Button>
              </form>
            </Card>
          </div>
        )}

        {/* Operations Audit Log tab */}
        {activeSubTab === 'logs' && (
          <div className="lg:col-span-12 space-y-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-md font-bold text-warm-white">Realtime Operations Audit Trail</h3>
              
              <div className="space-y-3 font-mono text-[11px]">
                {auditLogs.map((log, idx) => (
                  <div key={idx} className="p-3 border border-white/5 rounded-xl bg-onyx/40 space-y-1">
                    <span className="text-stone/40 block">Timestamp: {new Date().toLocaleTimeString()} · Level: INFO</span>
                    <p className="text-stone/85 leading-relaxed">{log}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}

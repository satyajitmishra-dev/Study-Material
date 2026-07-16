'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  ArrowLeft, 
  RefreshCw, 
  MessageSquare, 
  FileText, 
  FolderGit, 
  Eye, 
  User, 
  EyeOff, 
  CheckCircle, 
  Star, 
  Lock, 
  AlertCircle 
} from 'lucide-react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui/core';
import { getAllContentAction, moderateContentAction } from '@/lib/actions/moderation';

type ContentType = 'project' | 'note' | 'discussion';

export default function CommunityModPage() {
  const [activeTab, setActiveTab] = useState<ContentType>('project');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modifyingId, setModifyingId] = useState<string | null>(null);

  const fetchContent = async (type: ContentType) => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllContentAction(type);
      if (res.success) {
        setItems(res.items || []);
      } else {
        setError(res.error || 'Failed to fetch platform content.');
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent(activeTab);
  }, [activeTab]);

  const handleModerate = async (contentId: string, actionType: 'hide' | 'restore' | 'verify' | 'feature' | 'lock_comments' | 'suspend_author') => {
    setModifyingId(contentId);
    try {
      const res = await moderateContentAction(contentId, activeTab, actionType, 'Moderator action applied.');
      if (res.success) {
        // Refetch to update UI state
        await fetchContent(activeTab);
      } else {
        alert(res.error || 'Failed to moderate content.');
      }
    } catch (err) {
      alert('A network error occurred.');
    } finally {
      setModifyingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-warm-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div className="space-y-1.5">
          <Link href="/admin" className="flex items-center gap-1 text-[11px] text-stone hover:text-warm-white font-mono uppercase tracking-wider">
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-warm-white flex items-center gap-2.5">
            <Shield className="w-8 h-8 text-accent-cyan" />
            <span>Community Content Hub</span>
          </h1>
          <p className="text-[13px] text-stone font-light">
            View, audit, and moderate all creator publications, notes, and discussions across the platform.
          </p>
        </div>

        <Button 
          variant="secondary" 
          onClick={() => fetchContent(activeTab)} 
          disabled={loading}
          className="text-[11px] py-1.5 px-3 flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-white/5 p-1 bg-charcoal/20 rounded-xl max-w-md">
        {(['project', 'note', 'discussion'] as ContentType[]).map((tab) => {
          const isActive = activeTab === tab;
          const Icon = tab === 'project' ? FolderGit : tab === 'note' ? FileText : MessageSquare;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-[12px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer
                ${isActive ? 'bg-charcoal/80 text-warm-white shadow-premium' : 'text-stone hover:text-warm-white'}
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab}s</span>
            </button>
          );
        })}
      </div>

      {/* Content Table Card */}
      <Card className="p-6 space-y-4">
        {error && (
          <div className="p-3 bg-accent-pink/10 border border-accent-pink/20 text-accent-pink text-[12px] rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-white/5 text-stone text-[10px] uppercase font-mono font-bold">
                <th className="py-2.5">Title / Content</th>
                <th className="py-2.5">Creator</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5 text-right">Views</th>
                <th className="py-2.5 text-right">Created</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[12.5px] font-light">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-accent-cyan" />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-stone font-light">No items found for this category.</td>
                </tr>
              ) : (
                items.map((item) => {
                  const isHidden = activeTab === 'project' 
                    ? item.status === 'archived' 
                    : item.visibility === 'private';
                  
                  return (
                    <tr key={item.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors">
                      <td className="py-3">
                        <div>
                          <div className="font-bold text-warm-white">{item.title || 'Untitled'}</div>
                          <div className="text-[10px] text-stone font-mono">{item.id}</div>
                        </div>
                      </td>
                      <td className="py-3">
                        {item.author ? (
                          <div>
                            <div className="font-medium text-warm-white flex items-center gap-1">
                              <User className="w-3 h-3 text-stone" />
                              <span>{item.author.name}</span>
                            </div>
                            <div className="text-[10px] text-stone font-mono">{item.author.email}</div>
                          </div>
                        ) : (
                          <span className="text-stone italic">Unknown</span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isHidden 
                            ? 'bg-accent-pink/10 text-accent-pink' 
                            : 'bg-accent-emerald/10 text-accent-emerald'
                        }`}>
                          {isHidden ? 'Hidden' : 'Visible'}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-bold">{item.views || 0}</td>
                      <td className="py-3 text-right text-stone font-mono">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          {/* Hide / Restore button */}
                          {isHidden ? (
                            <Button
                              variant="secondary"
                              disabled={modifyingId !== null}
                              onClick={() => handleModerate(item.id, 'restore')}
                              className="text-[10px] py-1 px-2.5 flex items-center gap-1 hover:bg-accent-emerald/10 hover:text-accent-emerald"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Restore</span>
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              disabled={modifyingId !== null}
                              onClick={() => handleModerate(item.id, 'hide')}
                              className="text-[10px] py-1 px-2.5 flex items-center gap-1 hover:bg-accent-pink/10 hover:text-accent-pink"
                            >
                              <EyeOff className="w-3 h-3" />
                              <span>Hide Content</span>
                            </Button>
                          )}

                          {/* Extra Moderate Actions */}
                          <Button
                            variant="secondary"
                            disabled={modifyingId !== null}
                            onClick={() => handleModerate(item.id, 'verify')}
                            className="text-[10px] py-1 px-2 flex items-center justify-center hover:bg-accent-cyan/10"
                            title="Verify Content Quality"
                          >
                            <CheckCircle className="w-3 h-3 text-accent-cyan" />
                          </Button>

                          <Button
                            variant="secondary"
                            disabled={modifyingId !== null}
                            onClick={() => handleModerate(item.id, 'feature')}
                            className="text-[10px] py-1 px-2 flex items-center justify-center hover:bg-accent-amber/10"
                            title="Feature Content"
                          >
                            <Star className="w-3 h-3 text-accent-amber" />
                          </Button>

                          <Button
                            variant="secondary"
                            disabled={modifyingId !== null}
                            onClick={() => handleModerate(item.id, 'lock_comments')}
                            className="text-[10px] py-1 px-2 flex items-center justify-center hover:bg-accent-violet/10"
                            title="Lock Comment Threads"
                          >
                            <Lock className="w-3 h-3 text-accent-violet" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

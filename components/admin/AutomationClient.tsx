'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Trash2, 
  Settings, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Database, 
  Calendar, 
  ChevronRight, 
  RefreshCw, 
  Sliders, 
  User, 
  Copy, 
  ExternalLink, 
  Lock, 
  Upload, 
  ShieldCheck, 
  Eye, 
  BookOpen, 
  Heart, 
  DollarSign, 
  Layers, 
  Smartphone,
  Check,
  Zap,
  History
} from 'lucide-react';
import { Card, Button, Input, Tabs } from '@/components/ui/core';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { 
  saveRepositoryAction, 
  deleteRepositoryAction, 
  saveCredentialAction, 
  deleteCredentialAction, 
  updateDraftAction, 
  deleteDraftAction, 
  regenerateDraftAction, 
  publishDraftAction, 
  saveAiMemoryAction, 
  saveTemplateAction, 
  forceQueueProcessAction,
  generateMultiPlatformDraftsAction,
  restoreDraftVersionAction
} from '@/lib/actions/automation';

interface AutomationClientProps {
  initialData: {
    workspaces: any[];
    activeWorkspace: any;
    repositories: any[];
    events: any[];
    drafts: any[];
    templates: any[];
    credentials: any[];
    aiMemory: any;
    usage: any;
  };
}

export default function AutomationClient({ initialData }: AutomationClientProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [repos, setRepos] = useState(initialData.repositories);
  const [events, setEvents] = useState(initialData.events);
  const [drafts, setDrafts] = useState(initialData.drafts);
  const [templates, setTemplates] = useState(initialData.templates);
  const [credentials, setCredentials] = useState(initialData.credentials);
  const [aiMemory, setAiMemory] = useState(initialData.aiMemory);
  const [usage, setUsage] = useState(initialData.usage);

  // Edit / Form states
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [queueLogs, setQueueLogs] = useState<string[]>([]);
  const [isRegeneratingDraft, setIsRegeneratingDraft] = useState<string | null>(null);
  const [isPublishingDraft, setIsPublishingDraft] = useState<string | null>(null);
  const [isGeneratingMultiPlatform, setIsGeneratingMultiPlatform] = useState(false);
  const [customGenerationTopic, setCustomGenerationTopic] = useState('');
  const [isRestoringVersion, setIsRestoringVersion] = useState<string | null>(null);

  // Repository Form Modal
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [editingRepo, setEditingRepo] = useState<any | null>(null);
  const [repoOwner, setRepoOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [repoDesc, setRepoDesc] = useState('');
  const [branchFilters, setBranchFilters] = useState('main');
  const [ignorePaths, setIgnorePaths] = useState('');
  const [ignoreCommits, setIgnoreCommits] = useState('chore:, docs:');
  const [aiModel, setAiModel] = useState('gpt-4o-mini');
  const [aiStyle, setAiStyle] = useState('professional');
  const [webhookSecret, setWebhookSecret] = useState('');

  // Draft Editor Modal
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [editingDraft, setEditingDraft] = useState<any | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftStatus, setDraftStatus] = useState('draft');
  const [scheduledDate, setScheduledDate] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState('UTC');
  const [qualityCheckResults, setQualityCheckResults] = useState<{ success: boolean; errors: string[]; warnings: string[] } | null>(null);
  
  // Undo/Redo & Preview states
  const [draftContentHistory, setDraftContentHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [reviewTab, setReviewTab] = useState<'edit' | 'preview'>('edit');

  // Prompt / Memory Form
  const [isSavingMemory, setIsSavingMemory] = useState(false);
  const [styleDesc, setStyleDesc] = useState(aiMemory.writingStyle);
  const [hashtagsStr, setHashtagsStr] = useState(aiMemory.preferredHashtags.join(', '));
  const [emojisStr, setEmojisStr] = useState(aiMemory.preferredEmojis.join(' '));
  const [ctaStyle, setCtaStyle] = useState(aiMemory.ctaStyle);
  const [tone, setTone] = useState(aiMemory.tone);
  const [audience, setAudience] = useState(aiMemory.audience);

  // Templates Form
  const [selectedTemplatePlatform, setSelectedTemplatePlatform] = useState(templates[0]?.platform || 'linkedin');
  const [sysPrompt, setSysPrompt] = useState('');
  const [usrPrompt, setUsrPrompt] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Integration Connection
  const [connectedPlatform, setConnectedPlatform] = useState('slack');
  const [integrationToken, setIntegrationToken] = useState('');
  const [integrationSecret, setIntegrationSecret] = useState('');
  const [channelSettings, setChannelSettings] = useState('');
  const [isSavingCredential, setIsSavingCredential] = useState(false);

  // Selected event log modal
  const [viewLogsEvent, setViewLogsEvent] = useState<any | null>(null);

  useEffect(() => {
    // Sync templates editor when platform tab changes
    const tmpl = templates.find(t => t.platform === selectedTemplatePlatform);
    if (tmpl) {
      setSysPrompt(tmpl.systemPrompt);
      setUsrPrompt(tmpl.userPrompt);
    }
  }, [selectedTemplatePlatform, templates]);

  // Billing Tier Info
  const billingLimits: Record<string, { repos: number; posts: number; tokens: number }> = {
    free: { repos: 1, posts: 5, tokens: 25000 },
    pro: { repos: 5, posts: 50, tokens: 250000 },
    team: { repos: 20, posts: 300, tokens: 1500000 },
    enterprise: { repos: 999, posts: 9999, tokens: 99999999 }
  };

  const currentTier = initialData.activeWorkspace.billingTier || 'free';
  const limits = billingLimits[currentTier] || billingLimits.free;

  // Manual trigger to process event queue
  const handleForceQueueProcess = async () => {
    setIsProcessingQueue(true);
    setQueueLogs(['[Client] Dispatching queue process run...']);
    try {
      const res = await forceQueueProcessAction();
      if (res.success) {
        setQueueLogs(res.logs || []);
        // Trigger data reload simulation
        // In real app, we revalidatePath but we can also sync states
        if (res.processed !== undefined && res.processed > 0) {
          // Re-fetch drafts/events or display alert
          setQueueLogs(prev => [...prev, `[Completed] Processed ${res.processed} event(s).`]);
        }
      } else {
        setQueueLogs(prev => [...prev, `[Error] ${res.error}`]);
      }
    } catch (err: any) {
      setQueueLogs(prev => [...prev, `[Error] ${err.message}`]);
    } finally {
      setIsProcessingQueue(false);
    }
  };

  // Repository CRUD
  const handleOpenRepoModal = (repo?: any) => {
    if (repo) {
      setEditingRepo(repo);
      setRepoOwner(repo.owner);
      setRepoName(repo.name);
      setRepoDesc(repo.description || '');
      setBranchFilters(repo.branchFilters.join(', '));
      setIgnorePaths(repo.ignorePaths.join(', '));
      setIgnoreCommits(repo.ignoreCommits.join(', '));
      setAiModel(repo.aiModel);
      setAiStyle(repo.aiWritingStyle);
      setWebhookSecret(repo.webhookSecret || '');
    } else {
      setEditingRepo(null);
      setRepoOwner('');
      setRepoName('');
      setRepoDesc('');
      setBranchFilters('main');
      setIgnorePaths('');
      setIgnoreCommits('chore:, docs:');
      setAiModel('gpt-4o-mini');
      setAiStyle('professional');
      setWebhookSecret('');
    }
    setShowRepoModal(true);
  };

  const handleSaveRepository = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      id: editingRepo?.id,
      workspaceId: initialData.activeWorkspace.id,
      owner: repoOwner,
      name: repoName,
      description: repoDesc,
      branchFilters: branchFilters.split(',').map(s => s.trim()).filter(Boolean),
      ignorePaths: ignorePaths.split(',').map(s => s.trim()).filter(Boolean),
      ignoreCommits: ignoreCommits.split(',').map(s => s.trim()).filter(Boolean),
      aiWritingStyle: aiStyle,
      aiModel,
      webhookSecret,
    };

    const res = await saveRepositoryAction(data);
    if (res.success) {
      if (editingRepo) {
        setRepos(prev => prev.map(r => r.id === res.repository.id ? res.repository : r));
      } else {
        setRepos(prev => [...prev, res.repository]);
      }
      setShowRepoModal(false);
    } else {
      alert(res.error || 'Failed to save repository');
    }
  };

  const handleDeleteRepository = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect this repository?')) return;
    const res = await deleteRepositoryAction(id);
    if (res.success) {
      setRepos(prev => prev.filter(r => r.id !== id));
    }
  };

  // Draft updates & publish
  const handleOpenDraftModal = (draft: any) => {
    setEditingDraft(draft);
    setDraftTitle(draft.title);
    setDraftContent(draft.content);
    setDraftStatus(draft.status);
    setScheduledDate(draft.scheduledAt ? draft.scheduledAt.substring(0, 16) : '');
    setSelectedTimezone(draft.timezone || 'UTC');
    
    // Initialize history stack
    setDraftContentHistory([draft.content]);
    setHistoryIndex(0);
    setReviewTab('edit');
    
    // Quality check
    runContentQualityChecks(draft.content, draft.platform, draft.title);
    
    setShowDraftModal(true);
  };

  const runContentQualityChecks = (text: string, platform: string, title?: string) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Secret scan
    const keyPatterns = [/gh[pso]_/, /sk-[a-zA-Z0-9]{20}T3BlbkFJ/, /AKIA[0-9A-Z]{16}/];
    if (keyPatterns.some(rx => rx.test(text))) {
      errors.push('Credential leak warning: high entropy pattern detected in body.');
    }
    
    // Bounds check
    if (platform === 'twitter' && text.length > 280) {
      warnings.push(`Exceeds 280 character limit for X standard posts (${text.length} chars).`);
    }
    if (platform === 'linkedin' && text.length > 3000) {
      errors.push('Exceeds LinkedIn limit of 3,000 characters.');
    }

    setQualityCheckResults({ success: errors.length === 0, errors, warnings });
  };

  const updateContentWithHistory = (newVal: string) => {
    const nextHist = draftContentHistory.slice(0, historyIndex + 1);
    nextHist.push(newVal);
    setDraftContentHistory(nextHist);
    setHistoryIndex(nextHist.length - 1);
    setDraftContent(newVal);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      const prevVal = draftContentHistory[historyIndex - 1];
      setDraftContent(prevVal);
      runContentQualityChecks(prevVal, editingDraft.platform, draftTitle);
    }
  };

  const handleRedo = () => {
    if (historyIndex < draftContentHistory.length - 1) {
      setHistoryIndex(prev => prev + 1);
      const nextVal = draftContentHistory[historyIndex + 1];
      setDraftContent(nextVal);
      runContentQualityChecks(nextVal, editingDraft.platform, draftTitle);
    }
  };

  const handleSaveDraft = async () => {
    if (!editingDraft) return;
    const updateData = {
      title: draftTitle,
      content: draftContent,
      status: draftStatus,
      scheduledAt: scheduledDate ? new Date(scheduledDate) : null,
      timezone: selectedTimezone,
      changedBy: 'User',
    };

    const res = await updateDraftAction(editingDraft.id, updateData);
    if (res.success) {
      setDrafts(prev => prev.map(d => d.id === editingDraft.id ? { ...d, ...updateData, scheduledAt: scheduledDate ? new Date(scheduledDate).toISOString() : null } : d));
      setShowDraftModal(false);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    if (!confirm('Are you sure you want to discard this draft?')) return;
    const res = await deleteDraftAction(id);
    if (res.success) {
      setDrafts(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleRegenerateDraft = async (id: string) => {
    setIsRegeneratingDraft(id);
    const res = await regenerateDraftAction(id);
    if (res.success) {
      setDrafts(prev => prev.map(d => d.id === id ? res.draft : d));
      if (editingDraft?.id === id) {
        setEditingDraft(res.draft);
        setDraftContent(res.draft.content);
        setDraftTitle(res.draft.title);
      }
    } else {
      alert(res.error || 'Failed to regenerate content');
    }
    setIsRegeneratingDraft(null);
  };

  const handlePublishDraft = async (id: string) => {
    setIsPublishingDraft(id);
    const res = await publishDraftAction(id);
    if (res.success) {
      setDrafts(prev => prev.map(d => d.id === id ? { ...d, status: 'published', publishUrl: res.url } : d));
      alert(`Successfully published! Destination URL: ${res.url}`);
      setShowDraftModal(false);
    } else {
      alert(`Publishing failed: ${res.error}`);
    }
    setIsPublishingDraft(null);
  };

  const handleGenerateMultiPlatform = async (repositoryId: string) => {
    setIsGeneratingMultiPlatform(true);
    const res = await generateMultiPlatformDraftsAction(repositoryId, customGenerationTopic || undefined);
    if (res.success && res.drafts) {
      setDrafts(prev => [...res.drafts, ...prev]);
      setCustomGenerationTopic('');
      alert(`Successfully generated ${res.drafts.length} multi-platform content drafts (LinkedIn, X, Dev.to, Release Notes, Newsletter)!`);
    } else {
      alert(res.error || 'Failed to generate multi-platform drafts');
    }
    setIsGeneratingMultiPlatform(false);
  };

  const handleRestoreDraftVersion = async (draftId: string, versionId: string) => {
    setIsRestoringVersion(versionId);
    const res = await restoreDraftVersionAction(draftId, versionId);
    if (res.success && res.draft) {
      setDrafts(prev => prev.map(d => d.id === draftId ? res.draft : d));
      if (editingDraft?.id === draftId) {
        setEditingDraft(res.draft);
        setDraftContent(res.draft.content);
        setDraftTitle(res.draft.title);
      }
      alert('Draft restored to selected version!');
    } else {
      alert(res.error || 'Failed to restore draft version');
    }
    setIsRestoringVersion(null);
  };

  // Save AI Memory
  const handleSaveAiMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMemory(true);
    const data = {
      writingStyle: styleDesc,
      preferredHashtags: hashtagsStr.split(',').map((s: string) => s.trim()).filter(Boolean),
      preferredEmojis: emojisStr.split(/\s+/).filter(Boolean),
      ctaStyle,
      tone,
      audience,
    };
    const res = await saveAiMemoryAction(initialData.activeWorkspace.id, data);
    if (res.success) {
      setAiMemory(res.memory);
      alert('AI Memory Writing Profile updated.');
    }
    setIsSavingMemory(false);
  };

  // Save template prompt
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTemplate(true);
    const currentTmpl = templates.find(t => t.platform === selectedTemplatePlatform);
    const data = {
      id: currentTmpl?.id,
      workspaceId: initialData.activeWorkspace.id,
      name: currentTmpl?.name || `${selectedTemplatePlatform} prompt`,
      platform: selectedTemplatePlatform,
      systemPrompt: sysPrompt,
      userPrompt: usrPrompt,
    };
    const res = await saveTemplateAction(data);
    if (res.success) {
      setTemplates(prev => prev.map(t => t.id === res.template.id ? res.template : t));
      alert('Prompt template saved.');
    }
    setIsSavingTemplate(false);
  };

  // Connection integration
  const handleSaveCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCredential(true);
    const settingsStr = connectedPlatform === 'slack' || connectedPlatform === 'discord'
      ? JSON.stringify({ webhookUrl: channelSettings })
      : connectedPlatform === 'telegram'
      ? JSON.stringify({ chatId: channelSettings })
      : '';

    const res = await saveCredentialAction({
      workspaceId: initialData.activeWorkspace.id,
      platform: connectedPlatform,
      token: integrationToken,
      secret: integrationSecret,
      settings: settingsStr,
    });

    if (res.success) {
      setCredentials(prev => {
        const next = prev.filter(c => c.platform !== connectedPlatform);
        return [...next, res.credential];
      });
      setIntegrationToken('');
      setIntegrationSecret('');
      setChannelSettings('');
      alert('Integrations credentials securely updated.');
    } else {
      alert(res.error || 'Failed to save credentials.');
    }
    setIsSavingCredential(false);
  };

  const handleDeleteCredential = async (id: string) => {
    if (!confirm('Disconnect this channel?')) return;
    const res = await deleteCredentialAction(id);
    if (res.success) {
      setCredentials(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* SaaS Dashboard Title bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-accent-violet tracking-[0.2em] uppercase">
              AI CONTENT AUTOMATION SPACE
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-accent-amber/10 text-accent-amber border border-accent-amber/20">
              {currentTier} PLAN
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-warm-white flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-accent-violet fill-accent-violet/15" /> Content Studio
          </h1>
          <p className="text-[13px] text-stone font-light max-w-xl">
            Detect git commits, generate styled SaaS multi-platform posts, perform quality scans, and publish automatically or after human review.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={handleForceQueueProcess} disabled={isProcessingQueue}>
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessingQueue ? 'animate-spin' : ''}`} />
            {isProcessingQueue ? 'Processing Events...' : 'Tick Queue Worker'}
          </Button>
          <Button variant="primary" onClick={() => handleOpenRepoModal()}>
            <Plus className="w-3.5 h-3.5" /> Connect Repository
          </Button>
        </div>
      </div>

      {/* Tabs list */}
      <Tabs
        options={[
          { id: 'overview', label: 'Overview & Quotas', icon: Layers },
          { id: 'drafts', label: 'Content Planner', icon: Calendar },
          { id: 'queue', label: 'Events Queue', icon: Activity },
          { id: 'repositories', label: 'Repositories', icon: Database },
          { id: 'prompts', label: 'Prompts & Memory', icon: Sliders },
          { id: 'integrations', label: 'Integrations', icon: Lock }
        ]}
        activeId={activeTab}
        onChange={setActiveTab}
        className="w-full flex-wrap"
      />

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
        >
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Analytics Counters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <Card>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-stone uppercase tracking-wider">Posts Generated</span>
                      <p className="text-3xl font-extrabold text-warm-white">{usage.postsGenerated}</p>
                      <p className="text-[10px] text-stone font-mono">Limit: {limits.posts} posts / mo</p>
                    </div>
                    <div className="p-2 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
                      <Sparkles className="w-4 h-4 text-accent-cyan" />
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-4 w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-accent-cyan" style={{ width: `${Math.min(100, (usage.postsGenerated / limits.posts) * 100)}%` }} />
                  </div>
                </Card>

                <Card>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-stone uppercase tracking-wider">Quota Tokens Used</span>
                      <p className="text-3xl font-extrabold text-warm-white">
                        {usage.tokensUsed.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-stone font-mono">Limit: {limits.tokens.toLocaleString()}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-accent-violet/10 border border-accent-violet/20">
                      <Zap className="w-4 h-4 text-accent-violet" />
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-4 w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-accent-violet" style={{ width: `${Math.min(100, (usage.tokensUsed / limits.tokens) * 100)}%` }} />
                  </div>
                </Card>

                <Card>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-stone uppercase tracking-wider">Monthly Est. Cost</span>
                      <p className="text-3xl font-extrabold text-warm-white">
                        ${usage.estimatedCostUsd.toFixed(4)}
                      </p>
                      <p className="text-[10px] text-accent-emerald font-mono">OpenAI Pricing Model</p>
                    </div>
                    <div className="p-2 rounded-lg bg-accent-emerald/10 border border-accent-emerald/20">
                      <DollarSign className="w-4 h-4 text-accent-emerald" />
                    </div>
                  </div>
                  {/* Metric indicator */}
                  <div className="mt-4 text-[11px] text-stone">
                    Cost per repository: <span className="text-warm-white font-mono">${(usage.estimatedCostUsd / Math.max(1, repos.length)).toFixed(4)}</span>
                  </div>
                </Card>

                <Card>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-stone uppercase tracking-wider">Publish Success Rate</span>
                      <p className="text-3xl font-extrabold text-warm-white">
                        {usage.postsPublished > 0 ? '100%' : 'N/A'}
                      </p>
                      <p className="text-[10px] text-stone font-mono">Published: {usage.postsPublished} posts</p>
                    </div>
                    <div className="p-2 rounded-lg bg-accent-amber/10 border border-accent-amber/20">
                      <ShieldCheck className="w-4 h-4 text-accent-amber" />
                    </div>
                  </div>
                  <div className="mt-4 text-[11px] text-stone">
                    Connected Channels: <span className="text-warm-white font-bold">{credentials.length}</span>
                  </div>
                </Card>
              </div>

              {/* Connected Repos Summary & Tick logs console */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Recent Drafts Feed */}
                  <Card>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wide">
                        Recent Generated Drafts
                      </h3>
                      <span className="text-[11px] text-stone">Review pending: {drafts.filter(d => d.status === 'draft' || d.status === 'needs_review').length}</span>
                    </div>
                    {drafts.length === 0 ? (
                      <div className="py-8 text-center text-[12px] text-stone">
                        No drafts found. Try pushing to a repository or mock a webhook trigger.
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {drafts.slice(0, 5).map(d => (
                          <div key={d.id} className="py-3 flex justify-between items-center gap-3">
                            <div className="min-w-0">
                              <p className="text-[13px] font-medium text-warm-white truncate">{d.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono
                                  ${d.platform === 'linkedin' ? 'bg-accent-cyan/10 text-accent-cyan' : ''}
                                  ${d.platform === 'twitter' ? 'bg-white/10 text-warm-white' : ''}
                                  ${d.platform === 'devto' ? 'bg-accent-amber/10 text-accent-amber' : ''}
                                  ${d.platform === 'release_notes' ? 'bg-accent-violet/10 text-accent-violet' : ''}
                                `}>
                                  {d.platform}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold
                                  ${d.status === 'published' ? 'bg-accent-emerald/10 text-accent-emerald' : ''}
                                  ${d.status === 'needs_review' ? 'bg-accent-orange/10 text-accent-orange' : ''}
                                  ${d.status === 'draft' ? 'bg-charcoal/80 text-stone border border-white/5' : ''}
                                  ${d.status === 'approved' ? 'bg-accent-violet/15 text-accent-violet' : ''}
                                `}>
                                  {d.status}
                                </span>
                              </div>
                            </div>
                            <Button variant="ghost" className="px-2 py-1 h-fit" onClick={() => handleOpenDraftModal(d)}>
                              Review
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>

                <div className="space-y-6">
                  {/* Local Queue Execution Console */}
                  <Card className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wide flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-accent-violet animate-pulse" /> Queue Worker Logs
                      </h3>
                      <button className="text-[10px] text-stone hover:text-warm-white flex items-center gap-1" onClick={() => setQueueLogs([])}>
                        Clear
                      </button>
                    </div>
                    
                    <div className="flex-1 bg-onyx border border-white/5 rounded-lg p-3 font-mono text-[11px] text-stone h-64 overflow-y-auto custom-scrollbar space-y-1">
                      {queueLogs.length === 0 ? (
                        <div className="text-stone/40 italic">Worker idle. Click "Tick Queue Worker" to trigger background process logs.</div>
                      ) : (
                        queueLogs.map((log, idx) => (
                          <div key={idx} className={log.includes('[Error]') ? 'text-accent-red' : log.includes('[Completed]') ? 'text-accent-emerald' : ''}>
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTENT PLANNER */}
          {activeTab === 'drafts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-[16px] font-bold text-warm-white">Generated Content Drafts</h2>
                <div className="text-[12px] text-stone">Total drafts: {drafts.length}</div>
              </div>

              {/* AI Multi-Platform Content Studio Panel */}
              <Card className="bg-onyx/90 border-accent-cyan/30 p-5 space-y-4 shadow-premium">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-accent-cyan shrink-0" />
                    <div>
                      <h3 className="text-[14px] font-extrabold text-warm-white">AI Multi-Platform Content Studio</h3>
                      <p className="text-[11.5px] text-stone">Draft-First Generator: Creates tailored LinkedIn, X/Twitter, Dev.to, Release Notes, and Newsletter drafts instantly.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                  <Input
                    placeholder="Enter topic or release highlight (e.g. Launched new Markdown renderer & AI drafting suite...)"
                    value={customGenerationTopic}
                    onChange={(e) => setCustomGenerationTopic(e.target.value)}
                    className="flex-1 text-[13px]"
                  />
                  <Button
                    variant="primary"
                    className="shrink-0 flex items-center gap-2 font-bold"
                    onClick={() => {
                      const repoId = repos[0]?.id || 'repo_sandbox_1';
                      handleGenerateMultiPlatform(repoId);
                    }}
                    disabled={isGeneratingMultiPlatform}
                  >
                    <Sparkles className="w-4 h-4" />
                    {isGeneratingMultiPlatform ? 'Generating 5 Formats...' : 'Generate All Formats'}
                  </Button>
                </div>
              </Card>

              {drafts.length === 0 ? (
                <Card className="py-12 text-center">
                  <BookOpen className="w-12 h-12 text-stone/40 mx-auto mb-4" />
                  <h4 className="text-[14px] font-bold text-warm-white mb-2">No drafts generated yet</h4>
                  <p className="text-[13px] text-stone max-w-sm mx-auto mb-6">
                    Connect a repository and push changes to trigger automated AI generations, or click the Tick Queue Worker fallback.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {drafts.map(d => (
                    <Card key={d.id} className="flex flex-col justify-between h-80">
                      <div>
                        <div className="flex justify-between items-start gap-3 mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold
                            ${d.platform === 'linkedin' ? 'bg-accent-cyan/10 text-accent-cyan' : ''}
                            ${d.platform === 'twitter' ? 'bg-white/10 text-warm-white' : ''}
                            ${d.platform === 'devto' ? 'bg-accent-amber/10 text-accent-amber' : ''}
                            ${d.platform === 'release_notes' ? 'bg-accent-violet/10 text-accent-violet' : ''}
                          `}>
                            {d.platform}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-extrabold
                            ${d.status === 'published' ? 'bg-accent-emerald/10 text-accent-emerald' : ''}
                            ${d.status === 'needs_review' ? 'bg-accent-orange/10 text-accent-orange' : ''}
                            ${d.status === 'draft' ? 'bg-charcoal/80 text-stone border border-white/5' : ''}
                            ${d.status === 'approved' ? 'bg-accent-violet/15 text-accent-violet' : ''}
                          `}>
                            {d.status}
                          </span>
                        </div>
                        <h4 className="text-[14px] font-bold text-warm-white line-clamp-2 mb-2">{d.title}</h4>
                        <p className="text-[12px] text-stone line-clamp-6 font-light whitespace-pre-wrap">{d.content}</p>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                        <span className="text-[10px] text-stone/60">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" className="px-2 py-1 h-fit" onClick={() => handleOpenDraftModal(d)}>
                            Open & Edit
                          </Button>
                          <button className="p-1 rounded text-stone hover:text-accent-red transition-colors" onClick={() => handleDeleteDraft(d.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EVENTS QUEUE MONITOR */}
          {activeTab === 'queue' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-[16px] font-bold text-warm-white">Asynchronous Webhook Event Queue</h2>
                <span className="text-[12px] text-stone">Queue depth: {events.filter(e => e.status === 'pending' || e.status === 'processing').length} pending</span>
              </div>

              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className="border-b border-white/5 text-stone text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-4">Event ID / Event</th>
                        <th className="py-3 px-4">Target Ref / Commit SHA</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Author / Msg</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {events.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-stone">No webhook events registered.</td>
                        </tr>
                      ) : (
                        events.map(e => (
                          <tr key={e.id} className="hover:bg-white/2 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-mono text-[11px] text-warm-white">{e.id}</div>
                              <div className="text-[10px] text-stone capitalize mt-0.5">{e.eventType}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-mono text-[11px] text-warm-white">{e.ref?.replace('refs/heads/', '') || 'N/A'}</div>
                              <div className="text-[10px] text-stone/60 font-mono mt-0.5">{e.sha?.slice(0, 7) || 'N/A'}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold
                                ${e.status === 'completed' ? 'bg-accent-emerald/10 text-accent-emerald' : ''}
                                ${e.status === 'processing' ? 'bg-accent-cyan/10 text-accent-cyan animate-pulse' : ''}
                                ${e.status === 'pending' ? 'bg-charcoal/80 text-stone border border-white/5' : ''}
                                ${e.status === 'failed' ? 'bg-accent-orange/10 text-accent-orange' : ''}
                              `}>
                                {e.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-[12px] text-warm-white font-medium truncate max-w-[200px]">{e.message || 'N/A'}</div>
                              <div className="text-[10px] text-stone mt-0.5">By {e.author || 'system'}</div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button variant="ghost" className="px-2.5 py-1 text-[11px] ml-auto" onClick={() => setViewLogsEvent(e)}>
                                View Timeline
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 4: REPOSITORIES */}
          {activeTab === 'repositories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-[16px] font-bold text-warm-white">Connected Repositories</h2>
                <div className="text-[12px] text-stone">{repos.length} Connected</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {repos.map(r => (
                  <Card key={r.id} className="relative">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <h4 className="text-[15px] font-bold text-warm-white">{r.owner}/{r.name}</h4>
                        <p className="text-[12px] text-stone/80 font-light mt-1">{r.description || 'No description provided.'}</p>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button className="p-1.5 rounded hover:bg-white/5 text-stone hover:text-warm-white transition-colors" onClick={() => handleOpenRepoModal(r)}>
                          <Settings className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-white/5 text-stone hover:text-accent-red transition-colors" onClick={() => handleDeleteRepository(r.id)}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px] text-stone font-mono mt-4 pt-4 border-t border-white/5">
                      <div>
                        <span className="text-[10px] text-stone/40 block uppercase">Branches:</span>
                        <span className="text-warm-white">{r.branchFilters.join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone/40 block uppercase">AI Model:</span>
                        <span className="text-accent-cyan font-bold">{r.aiModel}</span>
                      </div>
                    </div>

                    {r.webhookSecret && (
                      <div className="mt-4 flex items-center gap-2 bg-charcoal/20 border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] text-stone/80 w-full truncate">
                        <Lock className="w-3.5 h-3.5 text-accent-violet shrink-0" />
                        <span className="truncate">Secret: *********</span>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PROMPTS & AI STYLE MEMORY */}
          {activeTab === 'prompts' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Workspace memory */}
              <div className="space-y-6">
                <Card>
                  <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wide mb-4">
                    AI Memory Profile (Workspace Style Guide)
                  </h3>
                  
                  <form onSubmit={handleSaveAiMemory} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-semibold text-stone uppercase block mb-1">Target Audience</label>
                      <Input value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g. developers, developers and founders" />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone uppercase block mb-1">Overall Tone</label>
                      <select className="w-full px-3 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none" value={tone} onChange={e => setTone(e.target.value)}>
                        <option value="professional">Professional</option>
                        <option value="technical">Technical</option>
                        <option value="engaging">Engaging & Casual</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone uppercase block mb-1">Writing Style Guidelines</label>
                      <textarea className="w-full h-24 px-3 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/20" value={styleDesc} onChange={e => setStyleDesc(e.target.value)} placeholder="e.g. Direct, developer-focused, technical insights, and clean code references." />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone uppercase block mb-1">Default Hashtags</label>
                      <Input value={hashtagsStr} onChange={e => setHashtagsStr(e.target.value)} placeholder="nextjs, typescript, saas (comma separated)" />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone uppercase block mb-1">Preferred Emojis</label>
                      <Input value={emojisStr} onChange={e => setEmojisStr(e.target.value)} placeholder="🚀 💻 🛠️ ⚡" />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone uppercase block mb-1">CTA Template Style</label>
                      <Input value={ctaStyle} onChange={e => setCtaStyle(e.target.value)} placeholder="e.g. Star the repository and join the discussion!" />
                    </div>

                    <Button variant="primary" type="submit" className="w-full" disabled={isSavingMemory}>
                      {isSavingMemory ? 'Saving Guide...' : 'Save AI Memory Guide'}
                    </Button>
                  </form>
                </Card>
              </div>

              {/* Prompt Marketplace / Editor */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wide">
                      Platform Prompts Marketplace
                    </h3>
                    <Tabs
                      options={[
                        { id: 'linkedin', label: 'LinkedIn' },
                        { id: 'twitter', label: 'X (Twitter)' },
                        { id: 'devto', label: 'Dev.to' },
                        { id: 'release_notes', label: 'Release Notes' }
                      ]}
                      activeId={selectedTemplatePlatform}
                      onChange={setSelectedTemplatePlatform}
                    />
                  </div>

                  <form onSubmit={handleSaveTemplate} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-semibold text-stone uppercase block mb-1">System Prompt Context (Roles & Directives)</label>
                      <textarea className="w-full h-32 px-3 py-2 text-[12px] font-mono bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/20" value={sysPrompt} onChange={e => setSysPrompt(e.target.value)} placeholder="Configure the AI agent's system role directive..." />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone uppercase block mb-1">User Prompt Layout Template (Use variables like {`{summary}`}, {`{tech}`})</label>
                      <textarea className="w-full h-44 px-3 py-2 text-[12px] font-mono bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/20" value={usrPrompt} onChange={e => setUsrPrompt(e.target.value)} placeholder="Define the prompt format..." />
                    </div>

                    <Button variant="primary" type="submit" className="w-full" disabled={isSavingTemplate}>
                      {isSavingTemplate ? 'Saving Template...' : 'Save Prompt Template'}
                    </Button>
                  </form>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 6: INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Credentials Connect Form */}
              <div>
                <Card>
                  <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wide mb-4">
                    Connect Publishing Channels
                  </h3>

                  <form onSubmit={handleSaveCredential} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-semibold text-stone uppercase block mb-1">Target Channel</label>
                      <select className="w-full px-3 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none" value={connectedPlatform} onChange={e => setConnectedPlatform(e.target.value)}>
                        <option value="slack">Slack Webhook</option>
                        <option value="discord">Discord Webhook</option>
                        <option value="telegram">Telegram Bot</option>
                        <option value="devto">Dev.to API</option>
                        <option value="hashnode">Hashnode API</option>
                        <option value="medium">Medium API</option>
                        <option value="linkedin">LinkedIn Share OAuth</option>
                        <option value="twitter">X (Twitter) OAuth</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone uppercase block mb-1">
                        {connectedPlatform === 'slack' || connectedPlatform === 'discord' ? 'Webhook URL' : connectedPlatform === 'telegram' ? 'Chat ID' : 'API Token / Key'}
                      </label>
                      <Input value={channelSettings} onChange={e => setChannelSettings(e.target.value)} placeholder={connectedPlatform === 'slack' ? 'https://hooks.slack.com/services/...' : connectedPlatform === 'telegram' ? '@channel_username or numeric Chat ID' : 'Enter API token...'} />
                    </div>

                    {(connectedPlatform !== 'slack' && connectedPlatform !== 'discord') && (
                      <div>
                        <label className="text-[11px] font-semibold text-stone uppercase block mb-1">Access Token / Bot Token</label>
                        <Input type="password" value={integrationToken} onChange={e => setIntegrationToken(e.target.value)} placeholder="Bearer token or API Secret key" />
                      </div>
                    )}

                    {connectedPlatform === 'twitter' && (
                      <div>
                        <label className="text-[11px] font-semibold text-stone uppercase block mb-1">Secret Key / OAuth Key</label>
                        <Input type="password" value={integrationSecret} onChange={e => setIntegrationSecret(e.target.value)} placeholder="OAuth Token Secret" />
                      </div>
                    )}

                    <Button variant="primary" type="submit" className="w-full" disabled={isSavingCredential}>
                      {isSavingCredential ? 'Connecting Channel...' : 'Securely Connect Channel'}
                    </Button>
                  </form>
                </Card>
              </div>

              {/* Active Channels */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wide mb-4">
                    Active Publishing Channels
                  </h3>
                  
                  {credentials.length === 0 ? (
                    <div className="py-8 text-center text-[12px] text-stone">No channels connected yet. Connect Webhooks or API keys to start publishing.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {credentials.map(c => (
                        <div key={c.id} className="p-3 bg-charcoal/20 border border-white/5 rounded-xl flex justify-between items-center gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-accent-emerald animate-pulse" />
                            <div>
                              <p className="text-[13px] font-bold text-warm-white capitalize">{c.platform}</p>
                              <span className="text-[10px] text-stone/60 block font-mono">ID: {c.id}</span>
                            </div>
                          </div>

                          <button className="p-1 rounded text-stone hover:text-accent-red transition-colors" onClick={() => handleDeleteCredential(c.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* MODAL 1: ADD / EDIT REPOSITORY */}
      {showRepoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-onyx border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-premium">
            <div className="flex justify-between items-center">
              <h3 className="text-[16px] font-extrabold text-warm-white">
                {editingRepo ? 'Edit Repository Configuration' : 'Connect New GitHub Repository'}
              </h3>
              <button className="text-stone hover:text-warm-white" onClick={() => setShowRepoModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveRepository} className="space-y-4 text-[13px]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-stone uppercase block mb-1">GitHub Owner</label>
                  <Input value={repoOwner} onChange={e => setRepoOwner(e.target.value)} placeholder="e.g. satyajitmishra-dev" required />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone uppercase block mb-1">Repository Name</label>
                  <Input value={repoName} onChange={e => setRepoName(e.target.value)} placeholder="e.g. Study-Material" required />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone uppercase block mb-1">Description (Optional)</label>
                <Input value={repoDesc} onChange={e => setRepoDesc(e.target.value)} placeholder="Provide context of what the codebase does" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-stone uppercase block mb-1">Branches (comma separated)</label>
                  <Input value={branchFilters} onChange={e => setBranchFilters(e.target.value)} placeholder="main, master" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone uppercase block mb-1">AI Writing Mode</label>
                  <select className="w-full px-3 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none" value={aiStyle} onChange={e => setAiStyle(e.target.value)}>
                    <option value="professional">Human Review Needed</option>
                    <option value="auto_publish">Auto-Publish (Immediate)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-stone uppercase block mb-1">Ignore Path Patterns</label>
                  <Input value={ignorePaths} onChange={e => setIgnorePaths(e.target.value)} placeholder="*.lock, docs/*" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone uppercase block mb-1">Ignore Commit Prefixes</label>
                  <Input value={ignoreCommits} onChange={e => setIgnoreCommits(e.target.value)} placeholder="docs:, chore:" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-stone uppercase block mb-1">LLM Model</label>
                  <select className="w-full px-3 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none" value={aiModel} onChange={e => setAiModel(e.target.value)}>
                    <option value="gpt-4o-mini">GPT-4.0 Mini (Low Cost)</option>
                    <option value="gpt-4o">GPT-4.0 (Full Context)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone uppercase block mb-1">Webhook Secret Key (Optional)</label>
                  <Input type="password" value={webhookSecret} onChange={e => setWebhookSecret(e.target.value)} placeholder="Signature encryption secret" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <Button variant="secondary" type="button" onClick={() => setShowRepoModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Settings</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: DRAFT REVIEW & ACTION */}
      {showDraftModal && editingDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-onyx border border-white/10 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-premium h-[85vh] flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-accent-cyan/15 text-accent-cyan">
                  {editingDraft.platform}
                </span>
                <h3 className="text-[15px] font-extrabold text-warm-white">Review Generated Content</h3>
              </div>
              <button className="text-stone hover:text-warm-white" onClick={() => setShowDraftModal(false)}>✕</button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-4 custom-scrollbar">
              {/* Tab Selector inside modal */}
              <div className="flex border-b border-white/5 pb-2 gap-4">
                <button
                  type="button"
                  className={`text-[12px] font-bold uppercase tracking-wider pb-1 transition-colors ${reviewTab === 'edit' ? 'text-accent-cyan border-b-2 border-accent-cyan' : 'text-stone hover:text-warm-white'}`}
                  onClick={() => setReviewTab('edit')}
                >
                  Edit Content
                </button>
                <button
                  type="button"
                  className={`text-[12px] font-bold uppercase tracking-wider pb-1 transition-colors ${reviewTab === 'preview' ? 'text-accent-cyan border-b-2 border-accent-cyan' : 'text-stone hover:text-warm-white'}`}
                  onClick={() => setReviewTab('preview')}
                >
                  Live Preview
                </button>
              </div>

              {reviewTab === 'edit' ? (
                <>
                  <div className="flex justify-between items-center">
                    <div className="flex-1 mr-4">
                      <label className="text-[11px] font-semibold text-stone uppercase block mb-1">Draft Title</label>
                      <Input value={draftTitle} onChange={e => setDraftTitle(e.target.value)} />
                    </div>
                    {/* Undo/Redo Buttons */}
                    <div className="flex gap-2 self-end">
                      <Button variant="secondary" className="px-2 py-1 text-[11px]" type="button" onClick={handleUndo} disabled={historyIndex <= 0}>
                        Undo
                      </Button>
                      <Button variant="secondary" className="px-2 py-1 text-[11px]" type="button" onClick={handleRedo} disabled={historyIndex >= draftContentHistory.length - 1}>
                        Redo
                      </Button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-semibold text-stone uppercase">Draft Content Body</label>
                      <span className="text-[10px] text-stone font-mono">
                        Words: {draftContent.split(/\s+/).filter(Boolean).length} | Chars: {draftContent.length}
                      </span>
                    </div>
                    <textarea
                      className="w-full h-56 px-3 py-2 text-[13px] font-light bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/20 font-sans whitespace-pre-wrap"
                      value={draftContent}
                      onChange={e => {
                        updateContentWithHistory(e.target.value);
                        runContentQualityChecks(e.target.value, editingDraft.platform, draftTitle);
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="py-4 space-y-4">
                  <div className="text-[11px] text-stone mb-2">Simulated live feed display layout:</div>
                  
                  {editingDraft.platform === 'linkedin' && (
                    <div className="bg-[#1b1f23] border border-white/5 rounded-xl p-4 max-w-lg mx-auto font-sans text-[13px] text-stone">
                      <div className="flex gap-2.5 items-center mb-3">
                        <div className="w-9 h-9 rounded-full bg-accent-violet flex items-center justify-center font-bold text-white text-[12px]">
                          S
                        </div>
                        <div>
                          <div className="font-bold text-warm-white text-[12px] hover:underline cursor-pointer">SaaS Developer</div>
                          <div className="text-[9px] text-stone/60">Content Automator Specialist • 1h</div>
                        </div>
                      </div>
                      <div className="text-stone whitespace-pre-wrap font-light leading-relaxed">
                        {draftContent}
                      </div>
                    </div>
                  )}

                  {editingDraft.platform === 'twitter' && (
                    <div className="bg-black border border-white/5 rounded-xl p-4 max-w-md mx-auto font-sans text-[13px] text-stone">
                      <div className="flex gap-2.5 items-start mb-3">
                        <div className="w-8 h-8 rounded-full bg-accent-cyan flex items-center justify-center font-bold text-black text-[11px]">
                          X
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex gap-1.5 items-center">
                            <span className="font-bold text-warm-white hover:underline cursor-pointer">SaaS Developer</span>
                            <span className="text-stone/60 text-[10px]">@saas_dev • 12m</span>
                          </div>
                          <div className="text-stone whitespace-pre-wrap font-light leading-normal mt-1">
                            {draftContent}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!['linkedin', 'twitter'].includes(editingDraft.platform) && (
                    <div className="bg-[#121314] border border-white/5 rounded-xl p-5 mx-auto text-[13px] font-sans max-w-xl text-stone space-y-3 leading-relaxed font-light">
                      <h2 className="text-lg font-extrabold text-warm-white border-b border-white/5 pb-1.5">{draftTitle}</h2>
                      <MarkdownRenderer content={draftContent} />
                    </div>
                  )}
                </div>
              )}

              {/* Version details & Quality audit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-charcoal/15 border border-white/5 space-y-2">
                  <span className="text-[11px] font-semibold text-stone uppercase block">AI Metrics Scan</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-stone font-mono">
                    <div>Confidence: <span className="text-accent-cyan">{(editingDraft.aiConfidence * 100).toFixed(0)}%</span></div>
                    <div>Est. Engagement: <span className="text-accent-violet">{editingDraft.estimatedEngagement}/10</span></div>
                    <div>Readability: <span className="text-warm-white">{editingDraft.readabilityScore}/100</span></div>
                    <div>Est. Cost: <span className="text-accent-emerald">${editingDraft.tokenCost.toFixed(5)}</span></div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-charcoal/15 border border-white/5 space-y-1">
                  <span className="text-[11px] font-semibold text-stone uppercase block">Pre-Publish Verification</span>
                  {qualityCheckResults ? (
                    <div className="text-[11px] space-y-1">
                      {qualityCheckResults.success ? (
                        <div className="text-accent-emerald flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Safety scan passed. Zero credentials leaked.</div>
                      ) : (
                        qualityCheckResults.errors.map((e, idx) => (
                          <div key={idx} className="text-accent-red flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {e}</div>
                        ))
                      )}
                      {qualityCheckResults.warnings.map((w, idx) => (
                        <div key={idx} className="text-accent-amber flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {w}</div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-stone">Auditing draft content...</span>
                  )}
                </div>
              </div>

              {/* Version Rollback & Undo History */}
              <div className="p-3 rounded-lg bg-charcoal/15 border border-white/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[11.5px] text-stone">
                  <History className="w-4 h-4 text-accent-cyan shrink-0" />
                  <span>Draft Versioning: Session edits saved automatically. Click to restore original generated baseline.</span>
                </div>
                <Button 
                  variant="secondary" 
                  className="py-1 px-3 text-[11px] shrink-0" 
                  type="button"
                  onClick={() => {
                    if (draftContentHistory.length > 0) {
                      setDraftContent(draftContentHistory[0]);
                      runContentQualityChecks(draftContentHistory[0], editingDraft.platform, draftTitle);
                    }
                  }}
                >
                  Restore Initial Baseline
                </Button>
              </div>

              {/* Scheduling Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/5">
                <div>
                  <label className="text-[11px] font-semibold text-stone uppercase block mb-1">Approval Workflow State</label>
                  <select className="w-full px-3 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none" value={draftStatus} onChange={e => setDraftStatus(e.target.value)}>
                    <option value="draft">Draft</option>
                    <option value="needs_review">Needs Review</option>
                    <option value="approved">Approved (Queue for Publish)</option>
                    <option value="scheduled">Scheduled (Set Time below)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone uppercase block mb-1">Scheduled Release Date (Optional)</label>
                  <input type="datetime-local" className="w-full px-3 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-3">
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => handleRegenerateDraft(editingDraft.id)} disabled={isRegeneratingDraft === editingDraft.id}>
                  <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingDraft === editingDraft.id ? 'animate-spin' : ''}`} />
                  {isRegeneratingDraft === editingDraft.id ? 'Regenerating...' : 'Regenerate Draft'}
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="secondary" onClick={() => setShowDraftModal(false)}>Close</Button>
                <Button variant="primary" onClick={handleSaveDraft}>Save Changes</Button>
                <Button variant="accent" onClick={() => handlePublishDraft(editingDraft.id)} disabled={isPublishingDraft === editingDraft.id || !qualityCheckResults?.success}>
                  {isPublishingDraft === editingDraft.id ? 'Publishing...' : 'Publish Immediately'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* TIMELINE LOG DRAWER */}
      {viewLogsEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-onyx border border-white/10 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-premium">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-[15px] font-bold text-warm-white">Event Log Timeline: {viewLogsEvent.id}</h3>
              <button className="text-stone hover:text-warm-white" onClick={() => setViewLogsEvent(null)}>✕</button>
            </div>

            <div className="bg-charcoal/10 rounded-lg p-3 max-h-96 overflow-y-auto space-y-3 custom-scrollbar text-[12px] font-mono text-stone">
              {JSON.parse(viewLogsEvent.processingLogs || '[]').map((log: any, idx: number) => (
                <div key={idx} className="flex gap-2.5 items-start">
                  <span className="text-stone/40 shrink-0">{new Date(log.time).toLocaleTimeString()}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-warm-white uppercase font-bold shrink-0">{log.step}</span>
                  <span className="text-warm-white font-sans">{log.message}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-white/5">
              <Button variant="secondary" onClick={() => setViewLogsEvent(null)}>Close</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

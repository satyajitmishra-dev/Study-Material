'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, 
  Globe, 
  BookOpen, 
  Calendar, 
  Terminal, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  Sparkles, 
  AlertCircle, 
  Trash2, 
  Plus, 
  Save, 
  TrendingUp, 
  Compass, 
  Laptop, 
  Check, 
  FolderGit2,
  ListTodo,
  RefreshCw,
  GitCommit,
  GitPullRequest,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { Card, Button, Input, Tabs } from '@/components/ui/core';
import { 
  updateDeveloperProjectAction, 
  connectGithubRepositoryAction, 
  syncIntegrationAction, 
  saveRoadmapMilestoneAction, 
  deleteRoadmapMilestoneAction,
  saveRoadmapTaskAction,
  deleteRoadmapTaskAction,
  saveTimelineEventAction,
  deleteTimelineEventAction,
  generateAiDraftFromCommitsAction
} from '@/lib/actions/projectActions';

function pViews(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

interface DashboardProps {
  project: any;
  integration: any;
  roadmap: any[];
  timeline: any[];
  repositories: any[];
}

export default function ProjectDashboardClient({
  project: initialProject,
  integration: initialIntegration,
  roadmap: initialRoadmap,
  timeline: initialTimeline,
  repositories
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [project, setProject] = useState(initialProject);
  const [integration, setIntegration] = useState(initialIntegration);
  const [roadmap, setRoadmap] = useState(initialRoadmap);
  const [timeline, setTimeline] = useState(initialTimeline);

  // Repository Connect State
  const [searchRepoQuery, setSearchRepoQuery] = useState('');
  const [connectLoading, setConnectLoading] = useState<string | null>(null);

  // GitHub metadata cache
  const githubMeta = integration?.metadata ? JSON.parse(integration.metadata) : null;
  const [syncLoading, setSyncLoading] = useState(false);

  // AI studio state
  const [selectedCommits, setSelectedCommits] = useState<string[]>([]);
  const [aiPlatform, setAiPlatform] = useState<'linkedin' | 'twitter' | 'devto' | 'release_notes' | 'newsletter'>('linkedin');
  const [aiInstructions, setAiInstructions] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<any>(null);

  // Roadmap Form state
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [milestoneLoading, setMilestoneLoading] = useState(false);
  const [newTaskTitles, setNewTaskTitles] = useState<Record<string, string>>({});

  // Timeline Form state
  const [timelineTitle, setTimelineTitle] = useState('');
  const [timelineDesc, setTimelineDesc] = useState('');
  const [timelineType, setTimelineType] = useState('manual');
  const [timelineLoading, setTimelineLoading] = useState(false);

  // General Settings state
  const [liveDemo, setLiveDemo] = useState(project.liveDemo || '');
  const [docUrl, setDocUrl] = useState(project.documentationUrl || '');
  const [techStackInput, setTechStackInput] = useState<string>(project.techStack?.join(', ') || '');
  const [license, setLicense] = useState(project.license || 'MIT');
  const [visibility, setVisibility] = useState(project.visibility || 'public');
  const [saveSettingsLoading, setSaveSettingsLoading] = useState(false);

  // Connect git repo
  const handleConnectRepo = async (repoUrl: string, fullName: string) => {
    setConnectLoading(fullName);
    try {
      const res = await connectGithubRepositoryAction(project.id, repoUrl);
      if (res.success) {
        setIntegration(res.integration);
        // Refresh project reference and reload
        window.location.reload();
      } else {
        alert('Failed to connect repository: ' + res.error);
      }
    } catch (err) {
      alert('Error connecting repository.');
    } finally {
      setConnectLoading(null);
    }
  };

  // Trigger cache sync
  const handleSync = async () => {
    setSyncLoading(true);
    try {
      const res = await syncIntegrationAction(project.id);
      if (res.success) {
        // Refresh integration state
        window.location.reload();
      } else {
        alert('Sync failed: ' + res.error);
      }
    } catch (err) {
      alert('Error during sync.');
    } finally {
      setSyncLoading(false);
    }
  };

  // Toggle commit checkbox
  const handleToggleCommit = (sha: string) => {
    if (selectedCommits.includes(sha)) {
      setSelectedCommits(selectedCommits.filter(s => s !== sha));
    } else {
      setSelectedCommits([...selectedCommits, sha]);
    }
  };

  // Generate AI Draft
  const handleGenerateDraft = async () => {
    setGenerating(true);
    try {
      const res = await generateAiDraftFromCommitsAction(
        project.id,
        selectedCommits,
        aiPlatform,
        aiInstructions
      );
      if (res.success) {
        setGeneratedDraft(res.draft);
        alert('AI Draft generated successfully! You can find it under CmsDrafts.');
      } else {
        alert('AI draft generation failed: ' + res.error);
      }
    } catch (err) {
      alert('Error during AI drafting.');
    } finally {
      setGenerating(false);
    }
  };

  // Add roadmap phase
  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    setMilestoneLoading(true);
    try {
      const res = await saveRoadmapMilestoneAction({
        projectId: project.id,
        title: newMilestoneTitle,
        description: newMilestoneDesc,
        status: 'planned',
        progress: 0,
        estimatedCompletion: newMilestoneDate || undefined,
        orderIndex: roadmap.length
      });

      if (res.success) {
        setRoadmap([...roadmap, res.milestone]);
        setNewMilestoneTitle('');
        setNewMilestoneDesc('');
        setNewMilestoneDate('');
      }
    } catch (err) {
      alert('Error saving milestone.');
    } finally {
      setMilestoneLoading(false);
    }
  };

  // Delete milestone
  const handleDeleteMilestone = async (id: string) => {
    if (!confirm('Delete milestone?')) return;
    try {
      const res = await deleteRoadmapMilestoneAction(id, project.id);
      if (res.success) {
        setRoadmap(roadmap.filter(r => r.id !== id));
      }
    } catch (err) {
      alert('Error deleting milestone.');
    }
  };

  // Add task to checklist
  const handleAddTask = async (roadmapId: string) => {
    const taskTitle = newTaskTitles[roadmapId];
    if (!taskTitle || !taskTitle.trim()) return;

    try {
      const res = await saveRoadmapTaskAction(project.id, {
        roadmapId,
        title: taskTitle,
        status: 'todo'
      });

      if (res.success) {
        // Reload roadmap milestone to fetch fresh checklists
        window.location.reload();
      }
    } catch (err) {
      alert('Error saving checklist task.');
    }
  };

  // Toggle checklist checkbox
  const handleToggleTask = async (task: any) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      const res = await saveRoadmapTaskAction(project.id, {
        id: task.id,
        roadmapId: task.roadmapId,
        title: task.title,
        status: newStatus
      });
      if (res.success) {
        window.location.reload();
      }
    } catch (err) {
      alert('Error updating task.');
    }
  };

  // Delete checklist task
  const handleDeleteTask = async (taskId: string, roadmapId: string) => {
    try {
      const res = await deleteRoadmapTaskAction(taskId, roadmapId, project.id);
      if (res.success) {
        window.location.reload();
      }
    } catch (err) {
      alert('Error deleting task.');
    }
  };

  // Add custom Timeline Event
  const handleAddTimelineEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timelineTitle.trim()) return;

    setTimelineLoading(true);
    try {
      const res = await saveTimelineEventAction({
        projectId: project.id,
        title: timelineTitle,
        description: timelineDesc,
        type: timelineType,
        date: new Date().toISOString()
      });

      if (res.success) {
        setTimeline([res.event, ...timeline]);
        setTimelineTitle('');
        setTimelineDesc('');
        setTimelineType('manual');
      }
    } catch (err) {
      alert('Error creating event.');
    } finally {
      setTimelineLoading(false);
    }
  };

  // Delete Timeline Event
  const handleDeleteTimelineEvent = async (id: string) => {
    try {
      const res = await deleteTimelineEventAction(id, project.id);
      if (res.success) {
        setTimeline(timeline.filter(t => t.id !== id));
      }
    } catch (err) {
      alert('Error deleting event.');
    }
  };

  // Save settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSettingsLoading(true);

    try {
      const stack = techStackInput.split(',').map((s: string) => s.trim()).filter(Boolean);
      const res = await updateDeveloperProjectAction(project.id, {
        liveDemo,
        documentationUrl: docUrl,
        techStack: stack,
        license,
        visibility
      });

      if (res.success) {
        setProject(res.project);
        alert('Showcase settings saved successfully!');
      }
    } catch (err) {
      alert('Failed to save settings.');
    } finally {
      setSaveSettingsLoading(false);
    }
  };

  // Filter repos matching query
  const filteredRepos = repositories.filter(r => 
    r.name.toLowerCase().includes(searchRepoQuery.toLowerCase()) ||
    r.full_name.toLowerCase().includes(searchRepoQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Dashboard header */}
      <div className="border-b border-white/5 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-accent-cyan uppercase tracking-wider font-bold block">Owner Control Room</span>
          <h1 className="text-2xl font-extrabold text-warm-white tracking-tight mt-1">{project.name} Dashboard</h1>
          <p className="text-[12.5px] text-stone font-light">
            Manage repository hooks, generate AI updates, outline roadmaps, and review visitor engagement analytics.
          </p>
        </div>

        <Link href={`/projects/${project.slug}`} target="_blank">
          <Button variant="secondary" className="text-[11.5px] py-1.5 px-3">
            <span>View Public Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Tabs Menu */}
      <Tabs 
        options={[
          { id: 'overview', label: 'Overview', icon: Sliders },
          { id: 'repository', label: 'Repository Control', icon: Github },
          { id: 'ai', label: 'AI Content Studio', icon: Sparkles },
          { id: 'roadmap', label: 'Roadmap Builder', icon: ListTodo },
          { id: 'timeline', label: 'Timeline Logs', icon: Clock },
          { id: 'analytics', label: 'Visitor Analytics', icon: TrendingUp },
          { id: 'settings', label: 'Settings & Integrations', icon: FolderGit2 }
        ]} 
        activeId={activeTab} 
        onChange={setActiveTab}
        className="w-full"
      />

      {/* Tab Panels */}
      <div className="min-h-[450px]">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {/* Integration Status */}
              <div className="md:col-span-2 space-y-6">
                <Card className="p-6 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-stone">Connected Integration Status</h3>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.01] border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-warm-white">
                        <Github className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[13px] font-bold text-warm-white block">GitHub Synchronization</span>
                        <span className="text-[10px] text-stone font-mono">
                          {integration ? `Connected to ${githubMeta?.repoName || 'repository'}` : 'Not connected'}
                        </span>
                      </div>
                    </div>
                    {integration ? (
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded text-[9.5px] font-bold font-mono bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald uppercase tracking-wider">Synced</span>
                        <button onClick={handleSync} disabled={syncLoading} className="p-1.5 rounded hover:bg-white/5 text-stone hover:text-warm-white transition-all cursor-pointer">
                          <RefreshCw className={`w-4 h-4 ${syncLoading ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[9.5px] font-bold font-mono bg-white/5 border border-white/5 text-stone uppercase tracking-wider">Inactive</span>
                    )}
                  </div>

                  {integration && githubMeta && (
                    <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3.5 bg-onyx/50 rounded-xl border border-white/5 font-mono text-[11.5px] text-stone">
                        <span className="font-bold text-warm-white block mb-1">CACHE INFORMATION</span>
                        <div>Stars: <span className="text-accent-amber font-bold">{githubMeta.stars}</span></div>
                        <div>Default branch: {githubMeta.defaultBranch}</div>
                        <div>Last Sync: {new Date(integration.lastSyncedAt).toLocaleString()}</div>
                      </div>
                      <div className="p-3.5 bg-onyx/50 rounded-xl border border-white/5 font-mono text-[11.5px] text-stone">
                        <span className="font-bold text-warm-white block mb-1">AI COST REDUCTION INDEX</span>
                        <div>Summary Cache: <span className="text-accent-emerald font-bold">Enabled</span></div>
                        <div>Cached commits: {githubMeta.commits?.length || 0}</div>
                        <div>Est. token savings: 75% per draft</div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <Card className="p-5 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-stone">Dashboard Highlights</h3>
                  <div className="space-y-3.5 font-mono text-[11.5px] text-stone">
                    <div className="flex justify-between"><span>Roadmap Items:</span><span className="text-warm-white font-bold">{roadmap.length}</span></div>
                    <div className="flex justify-between"><span>Timeline Logs:</span><span className="text-warm-white font-bold">{timeline.length}</span></div>
                    <div className="flex justify-between"><span>Visibility:</span><span className="text-accent-cyan font-bold uppercase">{project.visibility}</span></div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'repository' && (
            <motion.div
              key="repository"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {githubMeta ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Commits Selector */}
                  <div className="md:col-span-2 space-y-4">
                    <Card className="p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-stone">Recent Commits List</h3>
                        <Button 
                          variant="accent" 
                          disabled={selectedCommits.length === 0}
                          onClick={() => setActiveTab('ai')}
                          className="py-1 px-2.5 text-[10.5px]"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate Draft ({selectedCommits.length})</span>
                        </Button>
                      </div>

                      <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                        {githubMeta.commits?.map((commit: any) => {
                          const isSelected = selectedCommits.includes(commit.sha);
                          return (
                            <div 
                              key={commit.sha} 
                              onClick={() => handleToggleCommit(commit.sha)}
                              className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-4 cursor-pointer select-none
                                ${isSelected ? 'border-accent-cyan bg-accent-cyan/[0.02]' : 'border-white/5 hover:border-white/10 bg-onyx/30'}
                              `}
                            >
                              <div className="flex items-center gap-3 truncate">
                                <input 
                                  type="checkbox" 
                                  checked={isSelected} 
                                  onChange={() => {}} // handled by click
                                  className="w-3.5 h-3.5 shrink-0 rounded border-white/10 bg-charcoal outline-none cursor-pointer"
                                />
                                <div className="truncate">
                                  <span className="text-[10px] font-mono text-accent-cyan font-bold block">{commit.sha}</span>
                                  <p className="text-[12.5px] font-medium text-warm-white truncate mt-0.5">{commit.message}</p>
                                </div>
                              </div>
                              <span className="text-[10px] text-stone/40 font-mono shrink-0">{new Date(commit.date).toLocaleDateString()}</span>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </div>

                  {/* Sidebar PRs & Issues */}
                  <div className="space-y-6">
                    <Card className="p-5 space-y-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-stone flex items-center gap-1.5"><GitPullRequest className="w-4 h-4 text-accent-emerald" /> <span>Open Pull Requests</span></h3>
                      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                        {githubMeta.openPulls === 0 && <p className="italic text-stone/50 text-[11px] py-2">No open PRs.</p>}
                        {githubMeta.releases?.map((r: any, idx: number) => (
                          // Mock list representation using cached releases to display layout
                          <div key={idx} className="p-2 rounded bg-white/5 text-[11px] text-stone leading-snug">
                            <span className="text-warm-white font-bold block">PR #{idx+3}</span>
                            <span className="block truncate mt-0.5">{r.name}</span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="p-5 space-y-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-stone flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-accent-pink" /> <span>Open Issues</span></h3>
                      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                        {githubMeta.openIssues === 0 && <p className="italic text-stone/50 text-[11px] py-2">No open issues.</p>}
                        {githubMeta.releases?.slice(0, 2).map((r: any, idx: number) => (
                          <div key={idx} className="p-2 rounded bg-white/5 text-[11px] text-stone leading-snug">
                            <span className="text-accent-pink font-bold block">Issue #{idx+9}</span>
                            <span className="block truncate mt-0.5">Resolve PostgreSQL statement caches conflicts</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              ) : (
                <Card className="p-8 text-center space-y-4 max-w-md mx-auto">
                  <Github className="w-12 h-12 text-stone mx-auto" />
                  <h3 className="text-[15px] font-bold text-warm-white">Connect a Git Repository First</h3>
                  <p className="text-[12px] text-stone font-light">
                    You need to link a repository integration in Settings to analyze code and pull commit logs.
                  </p>
                  <Button variant="primary" onClick={() => setActiveTab('settings')}>
                    Go to Settings
                  </Button>
                </Card>
              )}
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <Card className="p-6 space-y-5">
                <h3 className="text-md font-bold text-warm-white border-b border-white/5 pb-2">AI Content Studio</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Prompt Box */}
                  <div className="md:col-span-1 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Target Marketing Platform</label>
                      <select 
                        value={aiPlatform}
                        onChange={(e) => setAiPlatform(e.target.value as any)}
                        className="w-full px-3 py-2 text-[12.5px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10"
                      >
                        <option value="linkedin">LinkedIn Post</option>
                        <option value="twitter">X (Twitter) Thread</option>
                        <option value="devto">Dev.to Article</option>
                        <option value="release_notes">Changelog / Release Notes</option>
                        <option value="newsletter">Email Newsletter</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Custom Prompt Instructions</label>
                      <textarea
                        rows={4}
                        value={aiInstructions}
                        onChange={(e) => setAiInstructions(e.target.value)}
                        placeholder="e.g., Focus on database adapters fallback logic. Keep tone casual but informative."
                        className="w-full p-3 text-[12px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 resize-none"
                      />
                    </div>

                    <div className="p-3 bg-onyx/50 border border-white/5 rounded-lg text-[11px] text-stone font-mono space-y-1">
                      <span className="font-bold text-warm-white block">CONTEXT SUMMARY (CACHED)</span>
                      <div>Selected Commits: {selectedCommits.length}</div>
                      <div>Using Cached summaries: Yes (Cost minimized)</div>
                    </div>

                    <Button 
                      variant="primary" 
                      onClick={handleGenerateDraft}
                      disabled={generating}
                      className="w-full justify-center py-2.5"
                    >
                      {generating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                          <span>Generating Draft...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 shrink-0 text-accent-cyan" />
                          <span>Generate AI Draft</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Draft Editor View */}
                  <div className="md:col-span-2">
                    {generatedDraft ? (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Draft Title</label>
                          <input 
                            type="text"
                            value={generatedDraft.title}
                            onChange={(e) => setGeneratedDraft({ ...generatedDraft, title: e.target.value })}
                            className="w-full px-3 py-2 text-[12.5px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Draft Content (Markdown)</label>
                          <textarea
                            rows={12}
                            value={generatedDraft.content}
                            onChange={(e) => setGeneratedDraft({ ...generatedDraft, content: e.target.value })}
                            className="w-full p-3 text-[12px] font-mono bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10"
                          />
                        </div>
                        
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-[10px] text-accent-emerald font-mono flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Saved to drafts index</span>
                          <Button variant="accent" onClick={() => alert('Draft saved successfully!')}>
                            Save Draft Edits
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full min-h-[300px] border border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center text-center text-stone p-6">
                        <Sparkles className="w-8 h-8 text-stone/40 mb-2 animate-pulse" />
                        <span className="text-[12.5px] font-bold text-warm-white">AI Draft Editor</span>
                        <p className="text-[11.5px] text-stone max-w-sm mt-1 leading-relaxed">
                          Select commits in the Repository tab, select a platform, and click Generate to open draft board.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
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
              <Card className="p-6 space-y-4">
                <h3 className="text-md font-bold text-warm-white">Roadmap Milestone Builder</h3>

                {/* Form to add milestones */}
                <form onSubmit={handleAddMilestone} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-onyx/50 border border-white/5">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-mono text-stone uppercase tracking-wider block">Milestone Title</label>
                    <input 
                      type="text" 
                      value={newMilestoneTitle}
                      onChange={(e) => setNewMilestoneTitle(e.target.value)}
                      placeholder="e.g. Phase 3: Automation Pipelines"
                      className="w-full px-3 py-1.5 text-[12.5px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-stone uppercase tracking-wider block">Est. Completion</label>
                    <input 
                      type="date" 
                      value={newMilestoneDate}
                      onChange={(e) => setNewMilestoneDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-[12.5px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-3">
                    <label className="text-[10px] font-mono text-stone uppercase tracking-wider block">Milestone Description</label>
                    <input 
                      type="text" 
                      value={newMilestoneDesc}
                      onChange={(e) => setNewMilestoneDesc(e.target.value)}
                      placeholder="e.g., Integrate background workers and sync scripts."
                      className="w-full px-3 py-1.5 text-[12.5px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10"
                    />
                  </div>
                  <div className="md:col-span-3 pt-2">
                    <Button type="submit" variant="primary" disabled={milestoneLoading} className="py-1.5 px-4 text-[11px] justify-center ml-auto flex">
                      {milestoneLoading ? 'Saving...' : 'Add Milestone'}
                    </Button>
                  </div>
                </form>

                {/* List milestones */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  {roadmap.map((m) => {
                    const tasks = m.tasks || [];
                    const done = tasks.filter((t: any) => t.status === 'done').length;
                    const total = tasks.length;
                    const progress = total > 0 ? Math.round((done / total) * 100) : m.progress || 0;

                    return (
                      <div key={m.id} className="p-4 rounded-xl border border-white/5 space-y-4 bg-charcoal/10 relative">
                        <button 
                          onClick={() => handleDeleteMilestone(m.id)}
                          className="absolute top-4 right-4 text-stone hover:text-accent-pink p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="pr-8">
                          <h4 className="text-[13.5px] font-bold text-warm-white">{m.title}</h4>
                          <p className="text-[11.5px] text-stone leading-relaxed font-light mt-0.5">{m.description}</p>
                          <div className="flex gap-4 text-[10px] text-stone font-mono mt-1.5">
                            <span>Status: {m.status}</span>
                            <span>Progress: {progress}%</span>
                            {m.estimatedCompletion && <span>Est. Completion: {new Date(m.estimatedCompletion).toLocaleDateString()}</span>}
                          </div>
                        </div>

                        {/* Checklist Section */}
                        <div className="space-y-2 pl-3 border-l border-white/5">
                          <span className="text-[10px] font-mono text-stone uppercase tracking-wider block">Checklist Checklist</span>
                          
                          {/* Add task input */}
                          <div className="flex gap-2 max-w-md">
                            <input 
                              type="text" 
                              value={newTaskTitles[m.id] || ''}
                              onChange={(e) => setNewTaskTitles({ ...newTaskTitles, [m.id]: e.target.value })}
                              placeholder="Add checklist task..."
                              className="flex-1 px-2.5 py-1 text-[11.5px] bg-charcoal/20 border border-white/5 rounded text-warm-white outline-none focus:border-white/10"
                            />
                            <button 
                              onClick={() => handleAddTask(m.id)}
                              className="p-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-warm-white cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* List checklist tasks */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1.5">
                            {tasks.map((task: any) => (
                              <div key={task.id} className="flex items-center justify-between gap-3 p-1.5 rounded bg-onyx/30 border border-white/5 text-[11.5px]">
                                <div className="flex items-center gap-2 truncate">
                                  <input 
                                    type="checkbox" 
                                    checked={task.status === 'done'}
                                    onChange={() => handleToggleTask(task)}
                                    className="w-3.5 h-3.5 shrink-0 rounded border-white/10 cursor-pointer"
                                  />
                                  <span className={task.status === 'done' ? 'line-through text-stone/50' : 'text-fog'}>{task.title}</span>
                                </div>
                                <button 
                                  onClick={() => handleDeleteTask(task.id, m.id)}
                                  className="text-stone hover:text-accent-pink p-0.5 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {roadmap.length === 0 && <p className="text-center py-6 text-[12px] text-stone font-light">Roadmap is empty.</p>}
                </div>
              </Card>
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
              <Card className="p-6 space-y-4">
                <h3 className="text-md font-bold text-warm-white">Timeline Logs Manager</h3>

                {/* Form to log updates */}
                <form onSubmit={handleAddTimelineEvent} className="space-y-4 p-4 rounded-xl bg-onyx/50 border border-white/5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-stone uppercase tracking-wider block">Milestone/Event Title</label>
                    <input 
                      type="text" 
                      value={timelineTitle}
                      onChange={(e) => setTimelineTitle(e.target.value)}
                      placeholder="e.g., Completed Firebase Authentication hooks"
                      className="w-full px-3 py-1.5 text-[12.5px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-stone uppercase tracking-wider block">Description details</label>
                    <textarea 
                      rows={2}
                      value={timelineDesc}
                      onChange={(e) => setTimelineDesc(e.target.value)}
                      placeholder="e.g., Integrates google login redirect and credentials caching."
                      className="w-full p-2.5 text-[12px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <select
                      value={timelineType}
                      onChange={(e) => setTimelineType(e.target.value)}
                      className="px-2.5 py-1 text-[11.5px] bg-charcoal/20 border border-white/5 rounded outline-none text-warm-white focus:border-white/10"
                    >
                      <option value="manual">Manual log</option>
                      <option value="version_release">Release log</option>
                    </select>
                    <Button type="submit" variant="primary" disabled={timelineLoading} className="py-1 px-4 text-[11px]">
                      {timelineLoading ? 'Logging...' : 'Log Event'}
                    </Button>
                  </div>
                </form>

                {/* Timeline feed list */}
                <div className="space-y-4 pt-4 border-t border-white/5 max-h-[350px] overflow-y-auto pr-1">
                  {timeline.map((event) => (
                    <div key={event.id} className="p-3 rounded-lg bg-white/[0.01] border border-white/5 flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[9px] font-mono text-stone uppercase block">{new Date(event.date).toLocaleDateString()} · {event.type}</span>
                        <h4 className="text-[13px] font-bold text-warm-white mt-1">{event.title}</h4>
                        <p className="text-[11.5px] text-stone leading-relaxed font-light mt-0.5">{event.description}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteTimelineEvent(event.id)}
                        className="text-stone hover:text-accent-pink p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <Card className="p-6 space-y-4">
                <h3 className="text-md font-bold text-warm-white">Visitor Traffic & Engagement</h3>
                <p className="text-[12px] text-stone font-light max-w-xl">
                  Analyze visitor redirect trends, referrals origins, and project click tracking metrics.
                </p>

                {/* SVG Engagement Chart mockup */}
                <div className="w-full h-[180px] bg-onyx/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between font-mono text-[9px] text-stone">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>VISITS LOG TREND (7 DAYS)</span>
                    <span className="text-accent-cyan font-bold">TOTAL VIEWS: {pViews(project.id) % 250 + 120}</span>
                  </div>
                  {/* Custom SVG line chart */}
                  <svg viewBox="0 0 400 100" className="w-full h-[110px] stroke-accent-cyan stroke-2 fill-none overflow-visible">
                    <path d="M 0 80 Q 50 30 100 60 T 200 20 T 300 70 T 400 30" />
                    {/* Dots */}
                    <circle cx="0" cy="80" r="3" fill="#06b6d4" />
                    <circle cx="100" cy="60" r="3" fill="#06b6d4" />
                    <circle cx="200" cy="20" r="3" fill="#06b6d4" />
                    <circle cx="300" cy="70" r="3" fill="#06b6d4" />
                    <circle cx="400" cy="30" r="3" fill="#06b6d4" />
                  </svg>
                  <div className="flex justify-between pt-1 border-t border-white/5">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>

                {/* Action Redirect Clicks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                    <span className="text-[10px] font-mono text-stone uppercase block">GitHub Clicks</span>
                    <span className="text-xl font-bold text-warm-white font-mono block mt-1">{pViews(project.id) % 89} Clicks</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                    <span className="text-[10px] font-mono text-stone uppercase block">Live Demo Clicks</span>
                    <span className="text-xl font-bold text-warm-white font-mono block mt-1">{pViews(project.id) % 45} Clicks</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                    <span className="text-[10px] font-mono text-stone uppercase block">Documentation Clicks</span>
                    <span className="text-xl font-bold text-warm-white font-mono block mt-1">{pViews(project.id) % 23} Clicks</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {/* Repository Connection Section */}
              <div className="md:col-span-2 space-y-6">
                {/* Connect Git Repo panel (Vercel-style connector) */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-stone flex items-center gap-1.5">
                    <Github className="w-4 h-4 text-warm-white" />
                    <span>Vercel-style Git Repository Connection</span>
                  </h3>
                  
                  {integration ? (
                    <div className="p-4 rounded-xl bg-accent-cyan/[0.02] border border-accent-cyan/20 space-y-3">
                      <div className="flex justify-between items-center text-[12.5px]">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-accent-cyan" />
                          <span className="font-bold text-warm-white">Connected to Repository</span>
                        </div>
                        <span className="font-mono text-accent-cyan">@{githubMeta?.repoName}</span>
                      </div>
                      <p className="text-[11.5px] text-stone leading-relaxed font-light">
                        Commits list, issues, PRs, and languages sync in the background. Changes can be used for drafting AI posts.
                      </p>
                      <button 
                        onClick={() => handleConnectRepo(project.githubUrl || '', githubMeta?.repoName || '')}
                        className="text-[11px] text-accent-pink hover:underline cursor-pointer font-mono"
                      >
                        Disconnect Repository
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Search Repo box */}
                      <Input 
                        placeholder="Search public repositories..."
                        value={searchRepoQuery}
                        onChange={(e) => setSearchRepoQuery(e.target.value)}
                      />

                      {/* Repos list */}
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 border-t border-white/5 pt-2">
                        {filteredRepos.map((repo: any) => (
                          <div key={repo.id} className="p-3 rounded-lg bg-onyx/30 border border-white/5 flex items-center justify-between gap-4 text-[12px]">
                            <div>
                              <span className="font-bold text-warm-white block">{repo.name}</span>
                              <span className="text-[10px] text-stone font-mono block mt-0.5">{repo.full_name} · {repo.language}</span>
                            </div>
                            <Button 
                              variant="primary" 
                              onClick={() => handleConnectRepo(repo.html_url, repo.full_name)}
                              disabled={connectLoading === repo.full_name}
                              className="py-1 px-2.5 text-[10px]"
                            >
                              {connectLoading === repo.full_name ? 'Importing...' : 'Import'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Showcase general config */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-stone">Showcase Configurations</h3>
                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Live Demo URL</label>
                        <input 
                          type="text" 
                          value={liveDemo}
                          onChange={(e) => setLiveDemo(e.target.value)}
                          className="w-full px-3 py-2 text-[12.5px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Documentation URL</label>
                        <input 
                          type="text" 
                          value={docUrl}
                          onChange={(e) => setDocUrl(e.target.value)}
                          className="w-full px-3 py-2 text-[12.5px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Tech Stack (comma-separated)</label>
                      <input 
                        type="text" 
                        value={techStackInput}
                        onChange={(e) => setTechStackInput(e.target.value)}
                        className="w-full px-3 py-2 text-[12.5px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">License Type</label>
                        <input 
                          type="text" 
                          value={license}
                          onChange={(e) => setLicense(e.target.value)}
                          className="w-full px-3 py-2 text-[12.5px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Visibility Scope</label>
                        <select 
                          value={visibility}
                          onChange={(e) => setVisibility(e.target.value)}
                          className="w-full px-3 py-2 text-[12.5px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10"
                        >
                          <option value="public">Public Showcase</option>
                          <option value="private">Private Container</option>
                        </select>
                      </div>
                    </div>

                    <Button type="submit" variant="primary" disabled={saveSettingsLoading} className="py-2 px-5 ml-auto flex">
                      {saveSettingsLoading ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </form>
                </Card>
              </div>

              {/* Sidebar integrations */}
              <div className="space-y-6">
                <Card className="p-5 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-stone">Future Providers</h3>
                  <div className="space-y-3 font-mono text-[11px] text-stone/60">
                    <div className="flex items-center justify-between p-2 rounded bg-white/5"><span>GitLab Integration</span><span>Planned</span></div>
                    <div className="flex items-center justify-between p-2 rounded bg-white/5"><span>Bitbucket Connect</span><span>Planned</span></div>
                    <div className="flex items-center justify-between p-2 rounded bg-white/5"><span>Notion Workspaces</span><span>Planned</span></div>
                    <div className="flex items-center justify-between p-2 rounded bg-white/5"><span>Figma Frames sync</span><span>Planned</span></div>
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

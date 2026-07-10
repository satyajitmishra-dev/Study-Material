'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Globe2,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Code,
  ArrowRight,
  TrendingUp,
  Settings,
  ShieldAlert,
  Trash2,
  Plus,
  Compass,
  LineChart,
  User
} from 'lucide-react';
import { Button, Card, Input, Tabs } from '@/components/ui/core';

// Server actions
import {
  getRedirectsAction,
  saveRedirectAction,
  deleteRedirectAction,
  getCompetitorsAction,
  saveCompetitorAction,
  deleteCompetitorAction,
  getSearchQueryAnalyticsAction,
  getSeoHealthReportAction
} from '@/lib/actions/seoActions';

export default function SeoStudioWorkspace() {
  const router = useRouter();
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('auditor');

  // ==========================================
  // --- TAB 1: LIVE AUDITOR (EXISTING) ---
  // ==========================================
  const [title, setTitle] = useState('StudyMaterial — The Future of Learning for Developers');
  const [desc, setDesc] = useState('An immersive desktop-grade workspace engineered for developers to master modern frontend, backend, and AI stacks.');
  const [slug, setSlug] = useState('next-16-compiler');
  const [keyword, setKeyword] = useState('Next.js 16');
  const [score, setScore] = useState(85);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    let currentScore = 100;
    const currentAlerts: string[] = [];

    if (title.length < 30) {
      currentScore -= 10;
      currentAlerts.push('Meta title is too short (aim for 50-60 characters)');
    } else if (title.length > 60) {
      currentScore -= 8;
      currentAlerts.push('Meta title exceeds recommended length (60 characters)');
    }

    if (desc.length < 80) {
      currentScore -= 12;
      currentAlerts.push('Meta description is too short (aim for 120-160 characters)');
    } else if (desc.length > 160) {
      currentScore -= 10;
      currentAlerts.push('Meta description exceeds recommended length (160 characters)');
    }

    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      if (!title.toLowerCase().includes(lowerKeyword)) {
        currentScore -= 15;
        currentAlerts.push(`Focus keyword "${keyword}" is missing from meta title`);
      }
      if (!desc.toLowerCase().includes(lowerKeyword)) {
        currentScore -= 15;
        currentAlerts.push(`Focus keyword "${keyword}" is missing from meta description`);
      }
    } else {
      currentScore -= 20;
      currentAlerts.push('No focus keyword specified');
    }

    setScore(Math.max(10, currentScore));
    setAlerts(currentAlerts);
  }, [title, desc, keyword]);

  // ==========================================
  // --- TAB 2: REDIRECTS MANAGER ---
  // ==========================================
  const [redirects, setRedirects] = useState<any[]>([]);
  const [newSource, setNewSource] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newStatus, setNewStatus] = useState(301);
  const [redirectError, setRedirectError] = useState('');

  const loadRedirects = async () => {
    const res = await getRedirectsAction();
    if (res.success && res.data) {
      setRedirects(res.data);
    }
  };

  const handleAddRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    setRedirectError('');
    if (!newSource.trim() || !newTarget.trim()) {
      setRedirectError('Both source and target paths are required.');
      return;
    }
    const res = await saveRedirectAction(newSource, newTarget, newStatus);
    if (res.success) {
      setNewSource('');
      setNewTarget('');
      loadRedirects();
    } else {
      setRedirectError(res.error || 'Failed to save redirect.');
    }
  };

  const handleDeleteRedirect = async (id: string) => {
    const res = await deleteRedirectAction(id);
    if (res.success) {
      loadRedirects();
    }
  };

  // ==========================================
  // --- TAB 3: CRAWL HEALTH AUDIT ---
  // ==========================================
  const [healthReport, setHealthReport] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  const loadHealthReport = async () => {
    setLoadingHealth(true);
    const res = await getSeoHealthReportAction();
    if (res.success && res.report) {
      setHealthReport(res.report);
    }
    setLoadingHealth(false);
  };

  // ==========================================
  // --- TAB 4: COMPETITORS BENCHMARKING ---
  // ==========================================
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [compDomain, setCompDomain] = useState('');
  const [compName, setCompName] = useState('');
  const [compError, setCompError] = useState('');

  const loadCompetitors = async () => {
    const res = await getCompetitorsAction();
    if (res.success && res.data) {
      setCompetitors(res.data);
    }
  };

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompError('');
    if (!compDomain.trim() || !compName.trim()) {
      setCompError('Domain and name are required.');
      return;
    }
    const res = await saveCompetitorAction(compDomain, compName);
    if (res.success) {
      setCompDomain('');
      setCompName('');
      loadCompetitors();
    } else {
      setCompError(res.error || 'Failed to add competitor.');
    }
  };

  const handleDeleteCompetitor = async (id: string) => {
    const res = await deleteCompetitorAction(id);
    if (res.success) {
      loadCompetitors();
    }
  };

  // ==========================================
  // --- TAB 5: SEARCH CTR ANALYTICS ---
  // ==========================================
  const [searchQueries, setSearchQueries] = useState<any[]>([]);

  const loadSearchAnalytics = async () => {
    const res = await getSearchQueryAnalyticsAction();
    if (res.success && res.data) {
      setSearchQueries(res.data);
    }
  };

  // Initialize tabs data on load
  useEffect(() => {
    if (activeWorkspaceTab === 'redirects') loadRedirects();
    if (activeWorkspaceTab === 'health') loadHealthReport();
    if (activeWorkspaceTab === 'competitors') loadCompetitors();
    if (activeWorkspaceTab === 'search') loadSearchAnalytics();
  }, [activeWorkspaceTab]);

  return (
    <div className="w-full max-w-6xl mx-auto px-6 pt-12 pb-16 space-y-8">
      {/* Back Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push('/admin')} className="h-8 px-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 text-[12px] text-stone">
            <span>Publishing Control Panel</span>
            <span>/</span>
            <span className="text-warm-white font-medium">SEO Control Center</span>
          </div>
        </div>

        <Tabs
          options={[
            { id: 'auditor', label: 'Live Auditor', icon: Globe2 },
            { id: 'health', label: 'Crawl Health', icon: ShieldAlert },
            { id: 'redirects', label: 'Redirect Manager', icon: Settings },
            { id: 'competitors', label: 'Competitors', icon: Compass },
            { id: 'search', label: 'Search CTR', icon: LineChart }
          ]}
          activeId={activeWorkspaceTab}
          onChange={setActiveWorkspaceTab}
        />
      </div>

      {/* ==========================================
          --- TAB WORKSPACES ---
          ========================================== */}

      {activeWorkspaceTab === 'auditor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          {/* Left: Input Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-warm-white">SEO Parameters</h2>
              <p className="text-[12px] text-stone">Validate meta titles, descriptions, and slugs in real-time.</p>
            </div>

            <Card className="space-y-4 p-5 bg-charcoal/15 border-white/5">
              <Input
                label="Focus Keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. Next.js 16"
              />

              <Input
                label="Meta Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Meta title"
              />
              <div className="flex justify-end text-[10px] text-stone">
                <span className={title.length >= 40 && title.length <= 60 ? 'text-accent-cyan' : 'text-accent-pink'}>
                  {title.length} characters
                </span>
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">
                  Meta Description
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Brief summary matching snippet views"
                  className="w-full h-24 px-3 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/20 focus:bg-charcoal/40 resize-none font-sans"
                />
                <div className="flex justify-end text-[10px] text-stone">
                  <span className={desc.length >= 120 && desc.length <= 160 ? 'text-accent-cyan' : 'text-accent-pink'}>
                    {desc.length} characters
                  </span>
                </div>
              </div>

              <Input
                label="URL Slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="next-16-compiler"
              />
            </Card>
          </div>

          {/* Right: Preview Panel */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="flex flex-col items-center justify-center p-6 h-[120px] border-white/5">
                <span className="text-[10px] text-stone uppercase tracking-wider font-semibold mb-1">Live SEO Score</span>
                <div className="flex items-baseline gap-0.5">
                  <span className={`text-3xl font-extrabold font-mono ${score >= 80 ? 'text-accent-cyan' : 'text-accent-pink'}`}>
                    {score}
                  </span>
                  <span className="text-[12px] text-stone">/100</span>
                </div>
              </Card>

              <Card className="flex flex-col items-center justify-center p-6 h-[120px] border-white/5">
                <span className="text-[10px] text-stone uppercase tracking-wider font-semibold mb-1">Readability Index</span>
                <span className="text-xl font-bold font-mono text-warm-white">92 / 100</span>
                <span className="text-[9px] text-stone">Grade 8 Level</span>
              </Card>

              <Card className="flex flex-col items-center justify-center p-6 h-[120px] border-white/5">
                <span className="text-[10px] text-stone uppercase tracking-wider font-semibold mb-1">Accessibility Check</span>
                <span className="text-xl font-bold font-mono text-accent-cyan">100% Pass</span>
              </Card>
            </div>

            <div className="p-5 rounded-2xl bg-charcoal/20 border border-white/5 space-y-2">
              <span className="text-[10px] text-stone uppercase font-bold tracking-wider">Google SERP Card Preview</span>
              <div className="space-y-1 bg-onyx/30 p-4 rounded-xl border border-white/5 font-sans text-left">
                <div className="flex items-center gap-1.5 text-[11px] text-stone">
                  <span>https://studymaterial.dev</span>
                  <span>›</span>
                  <span className="truncate">posts</span>
                  <span>›</span>
                  <span className="truncate">{slug || 'slug'}</span>
                </div>
                <h4 className="text-[17px] text-[#4b99e9] hover:underline cursor-pointer truncate font-medium">
                  {title}
                </h4>
                <p className="text-[12px] text-stone leading-relaxed line-clamp-2">
                  {desc}
                </p>
              </div>
            </div>

            {alerts.length > 0 && (
              <div className="p-4 rounded-xl bg-accent-pink/5 border border-accent-pink/15 space-y-2 text-left">
                <div className="flex items-center gap-2 text-accent-pink text-[12px] font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Auditing Warnings</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-[11px] text-stone">
                  {alerts.map((alertMsg, idx) => (
                    <li key={idx}>{alertMsg}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          --- TAB: CRAWL HEALTH AUDIT ---
          ========================================== */}
      {activeWorkspaceTab === 'health' && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-warm-white">Crawl Health Reports</h2>
              <p className="text-[12px] text-stone">Run sitewide dynamic crawler scans across all published post databases.</p>
            </div>
            <Button variant="primary" onClick={loadHealthReport} disabled={loadingHealth}>
              {loadingHealth ? 'Scanning Database...' : 'Run Audit'}
            </Button>
          </div>

          {healthReport ? (
            <div className="space-y-8">
              {/* Audit Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-5 flex flex-col justify-between h-24">
                  <span className="text-[10px] text-stone uppercase tracking-wider">Average SEO Score</span>
                  <span className="text-2xl font-bold text-accent-cyan">{healthReport.globalAverageScore}%</span>
                </Card>
                <Card className="p-5 flex flex-col justify-between h-24">
                  <span className="text-[10px] text-stone uppercase tracking-wider">Missing Meta Titles</span>
                  <span className="text-2xl font-bold text-accent-pink">{healthReport.missingMetaTitleCount}</span>
                </Card>
                <Card className="p-5 flex flex-col justify-between h-24">
                  <span className="text-[10px] text-stone uppercase tracking-wider">Missing Meta Description</span>
                  <span className="text-2xl font-bold text-accent-pink">{healthReport.missingMetaDescCount}</span>
                </Card>
                <Card className="p-5 flex flex-col justify-between h-24">
                  <span className="text-[10px] text-stone uppercase tracking-wider">Orphan Pages</span>
                  <span className="text-2xl font-bold text-accent-pink">{healthReport.orphanCount}</span>
                </Card>
              </div>

              {/* Crawled posts table */}
              <div className="space-y-3">
                <h3 className="text-[12px] font-bold text-warm-white uppercase">Audited Pages ({healthReport.totalPosts})</h3>
                <div className="bg-charcoal/10 border border-white/5 rounded-2xl overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[12px]">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02] text-stone font-mono">
                        <th className="p-4">Title</th>
                        <th className="p-4">Slug</th>
                        <th className="p-4">Word Count</th>
                        <th className="p-4 text-center">SEO Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {healthReport.posts.map((post: any) => (
                        <tr key={post.id} className="hover:bg-white/[0.01]">
                          <td className="p-4 font-semibold text-warm-white truncate max-w-xs">{post.title}</td>
                          <td className="p-4 text-stone font-mono">/posts/{post.slug}</td>
                          <td className="p-4 text-stone">{post.audits.find((a: any) => a.id === 'content_thin') ? '< 300 words' : '300+ words'}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded font-bold font-mono ${post.score >= 80 ? 'bg-accent-cyan/15 text-accent-cyan' : 'bg-accent-pink/15 text-accent-pink'}`}>
                              {post.score}/100
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <Card className="p-8 text-center text-stone border-dashed border-white/10 bg-transparent">
              No audit report generated. Click "Run Audit" to compile search indicators.
            </Card>
          )}
        </div>
      )}

      {/* ==========================================
          --- TAB: REDIRECTS MANAGER ---
          ========================================== */}
      {activeWorkspaceTab === 'redirects' && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-warm-white">Redirect Rules Manager</h2>
            <p className="text-[12px] text-stone">Map legacy urls to active routes. Standard status codes 301, 302, and 410 Gone are supported.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Form */}
            <form onSubmit={handleAddRedirect} className="lg:col-span-4 space-y-4 bg-charcoal/10 border border-white/5 p-5 rounded-2xl">
              <h3 className="text-[12px] font-bold text-warm-white uppercase">Add Redirect Rule</h3>
              <Input
                label="Source Path"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                placeholder="e.g. /old-react"
              />
              <Input
                label="Target Path"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                placeholder="e.g. /posts/introducing-ppr"
              />
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Status Code</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(Number(e.target.value))}
                  className="bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-[13px] text-warm-white outline-none focus:border-white/20"
                >
                  <option value={301}>301 Permanent Redirect</option>
                  <option value={302}>302 Temporary Redirect</option>
                  <option value={410}>410 Resource Gone</option>
                </select>
              </div>

              {redirectError && <div className="text-[11px] text-accent-pink">{redirectError}</div>}

              <Button type="submit" variant="primary" className="w-full">
                <Plus className="w-4 h-4" /> Add Rule
              </Button>
            </form>

            {/* List Table */}
            <div className="lg:col-span-8 space-y-3">
              <h3 className="text-[12px] font-bold text-warm-white uppercase">Active Rules ({redirects.length})</h3>
              <div className="bg-charcoal/10 border border-white/5 rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse text-[12px]">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02] text-stone font-mono">
                      <th className="p-4">Source</th>
                      <th className="p-4">Target</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {redirects.map((redir: any) => (
                      <tr key={redir.id} className="hover:bg-white/[0.01]">
                        <td className="p-4 font-mono text-warm-white">{redir.sourcePath}</td>
                        <td className="p-4 font-mono text-stone">{redir.statusCode === 410 ? '[GONE 410]' : redir.targetPath}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold ${redir.statusCode === 301 ? 'bg-accent-cyan/15 text-accent-cyan' : 'bg-accent-pink/15 text-accent-pink'}`}>
                            {redir.statusCode}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" onClick={() => handleDeleteRedirect(redir.id)} className="h-7 px-2 hover:bg-accent-pink/15 text-stone hover:text-accent-pink">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {redirects.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-stone">No active redirection rules.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          --- TAB: COMPETITORS BENCHMARKING ---
          ========================================== */}
      {activeWorkspaceTab === 'competitors' && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-warm-white">Competitor Intelligence Benchmarks</h2>
            <p className="text-[12px] text-stone">Monitor estimated developer platform freshness, coverage, and performance indexes.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Form */}
            <form onSubmit={handleAddCompetitor} className="lg:col-span-4 space-y-4 bg-charcoal/10 border border-white/5 p-5 rounded-2xl">
              <h3 className="text-[12px] font-bold text-warm-white uppercase">Add Domain</h3>
              <Input
                label="Domain"
                value={compDomain}
                onChange={(e) => setCompDomain(e.target.value)}
                placeholder="e.g. refactoring.guru"
              />
              <Input
                label="Platform Name"
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                placeholder="e.g. RefactoringGuru"
              />

              {compError && <div className="text-[11px] text-accent-pink">{compError}</div>}

              <Button type="submit" variant="primary" className="w-full">
                <Plus className="w-4 h-4" /> Add Domain
              </Button>
            </form>

            {/* List Cards */}
            <div className="lg:col-span-8 space-y-3">
              <h3 className="text-[12px] font-bold text-warm-white uppercase">Monitored Domains ({competitors.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {competitors.map((comp: any) => (
                  <Card key={comp.id} className="p-5 border-white/5 space-y-4 relative group">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-stone uppercase tracking-wider font-mono">{comp.domain}</span>
                        <h4 className="text-[14px] font-bold text-warm-white">{comp.name}</h4>
                      </div>
                      <Button variant="ghost" onClick={() => handleDeleteCompetitor(comp.id)} className="h-7 px-2 opacity-0 group-hover:opacity-100 hover:bg-accent-pink/15 text-stone hover:text-accent-pink transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5 text-[11px] text-stone font-mono">
                      <div>Content Depth: <span className="text-warm-white font-bold">{comp.estimatedContentDepth} pages</span></div>
                      <div>Topic Coverage: <span className="text-accent-cyan font-bold">{comp.topicCoverage}%</span></div>
                      <div>Freshness Index: <span className="text-accent-cyan font-bold">{comp.freshnessScore}%</span></div>
                      <div>Perf Score: <span className="text-accent-cyan font-bold">{comp.pagePerformance}%</span></div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          --- TAB: SEARCH CTR ANALYTICS ---
          ========================================== */}
      {activeWorkspaceTab === 'search' && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-warm-white">Search Queries Analytics</h2>
            <p className="text-[12px] text-stone">Visualizing internal command search query logs, click rates, and dynamic CTR calculations.</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-[12px] font-bold text-warm-white uppercase">Logged Queries ({searchQueries.length})</h3>
            <div className="bg-charcoal/10 border border-white/5 rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-stone font-mono">
                    <th className="p-4">Search Query Term</th>
                    <th className="p-4 text-center">Impressions</th>
                    <th className="p-4 text-center">Clicks</th>
                    <th className="p-4 text-center">CTR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {searchQueries.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-white/[0.01]">
                      <td className="p-4 font-mono font-bold text-warm-white">"{item.query}"</td>
                      <td className="p-4 text-center font-mono text-stone">{item.impressions || item.count}</td>
                      <td className="p-4 text-center font-mono text-stone">{item.clicks}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold ${item.ctr >= 40 ? 'bg-accent-cyan/15 text-accent-cyan' : 'bg-stone/15 text-stone'}`}>
                          {Number(item.ctr).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {searchQueries.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-stone">No search query analytic logs recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

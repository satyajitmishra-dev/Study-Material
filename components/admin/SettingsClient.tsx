'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Globe, 
  Cpu, 
  AlertTriangle,
  HardDrive,
  CheckCircle,
  Key
} from 'lucide-react';
import { Card, Button } from '@/components/ui/core';

interface SettingsClientProps {
  initialData: {
    projectId: string;
    projectName: string;
    projectSlug: string;
    organizationId: string;
    organizationName: string;
    envStatus?: {
      openaiKeyPresent: boolean;
      databaseUrlPresent: boolean;
      githubTokenPresent: boolean;
      nextauthUrlPresent: boolean;
      nextauthSecretPresent: boolean;
    };
  };
}

export default function SettingsClient({ initialData }: SettingsClientProps) {
  const [activeSection, setActiveSection] = useState<'general' | 'seo' | 'ai' | 'env' | 'limits' | 'danger'>('general');
  
  // General State
  const [name, setName] = useState(initialData.projectName);
  const [slug, setSlug] = useState(initialData.projectSlug);
  const [desc, setDesc] = useState('An immersive developer-grade workspace.');
  const [timezone, setTimezone] = useState('UTC');
  const [language, setLanguage] = useState('en');

  // SEO & Domains State
  const [domain, setDomain] = useState(`${initialData.projectSlug}.studymaterial.dev`);
  const [seoTitle, setSeoTitle] = useState('Mastering Modern Web Architectures');
  const [seoDesc, setSeoDesc] = useState('A premium workspace containing Next.js, compiler analysis, and spring animation catalogs.');

  // AI & Automation State
  const [aiModel, setAiModel] = useState('gpt-4o-mini');
  const [aiTone, setAiTone] = useState('technical');
  const [autoPublish, setAutoPublish] = useState(false);

  // Statuses
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-white/5 pb-5">
        <span className="text-[11px] font-semibold text-accent-cyan tracking-[0.2em] uppercase font-mono">Scope Scoped configurations</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-warm-white mt-1">Project Settings</h1>
        <p className="text-[13px] text-stone font-light">
          Configure branding, custom domains, SEO parameters, and AI model weights for the active project.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <div className="w-full md:w-56 shrink-0 space-y-1 bg-charcoal/20 border border-white/5 p-2 rounded-xl">
          {[
            { id: 'general', label: 'General & Branding', icon: Settings },
            { id: 'seo', label: 'Domains & SEO', icon: Globe },
            { id: 'ai', label: 'AI & Automation', icon: Cpu },
            { id: 'env', label: 'Environment & API Keys', icon: Key },
            { id: 'limits', label: 'Quotas & Limits', icon: HardDrive },
            { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, color: 'text-accent-pink' }
          ].map(section => {
            const isActive = activeSection === section.id;
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium tracking-wide transition-colors cursor-pointer select-none text-left
                  ${isActive ? 'bg-warm-white text-onyx font-bold' : `text-stone hover:text-warm-white hover:bg-white/[0.02] ${section.color || ''}`}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSave} className="space-y-6">
            
            {activeSection === 'general' && (
              <Card className="p-6 space-y-4 animate-fadeIn">
                <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                  <Settings className="w-4 h-4 text-accent-violet" />
                  <span>General Settings</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Project Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Project URL Slug</label>
                    <input 
                      type="text" 
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-3.5 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Project Description</label>
                  <textarea 
                    rows={3}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full px-3.5 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Timezone</label>
                    <select 
                      value={timezone} 
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all"
                    >
                      <option value="UTC">UTC (GMT+0)</option>
                      <option value="EST">EST (GMT-5)</option>
                      <option value="IST">IST (GMT+5:30)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Default Language</label>
                    <select 
                      value={language} 
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all"
                    >
                      <option value="en">English (en)</option>
                      <option value="es">Spanish (es)</option>
                      <option value="de">German (de)</option>
                    </select>
                  </div>
                </div>
              </Card>
            )}

            {activeSection === 'seo' && (
              <Card className="p-6 space-y-4 animate-fadeIn">
                <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                  <Globe className="w-4 h-4 text-accent-cyan" />
                  <span>Domain & SEO Defaults</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone uppercase tracking-wider flex items-center justify-between">
                    <span>Custom Domain mapping</span>
                    <span className="text-[9.5px] text-accent-emerald bg-accent-emerald/10 px-1.5 py-0.5 rounded font-mono font-bold leading-none">Connected</span>
                  </label>
                  <input 
                    type="text" 
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full px-3.5 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">SEO Title Template</label>
                  <input 
                    type="text" 
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">SEO Meta Description</label>
                  <textarea 
                    rows={2}
                    value={seoDesc}
                    onChange={(e) => setSeoDesc(e.target.value)}
                    className="w-full px-3.5 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all resize-none"
                  />
                </div>
              </Card>
            )}

            {activeSection === 'ai' && (
              <Card className="p-6 space-y-4 animate-fadeIn">
                <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                  <Cpu className="w-4 h-4 text-accent-cyan" />
                  <span>AI Content Automation Preferences</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Core AI Generation Model</label>
                    <select 
                      value={aiModel} 
                      onChange={(e) => setAiModel(e.target.value)}
                      className="w-full px-3 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all"
                    >
                      <option value="gpt-4o-mini">gpt-4o-mini (Faster, cost-effective)</option>
                      <option value="gpt-4o">gpt-4o (High precision code details)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Writing Style Profile</label>
                    <select 
                      value={aiTone} 
                      onChange={(e) => setAiTone(e.target.value)}
                      className="w-full px-3 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all"
                    >
                      <option value="technical">Technical (Developer focus)</option>
                      <option value="casual">Casual (Engaging summaries)</option>
                      <option value="academic">Academic (In-depth analysis)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.01] border border-white/5 mt-2">
                  <div>
                    <span className="text-[12.5px] font-bold text-warm-white block">Auto-Publish Approved Drafts</span>
                    <span className="text-[10px] text-stone leading-normal block">Automatically push to webhooks once quality score exceeds 90.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={autoPublish} 
                    onChange={(e) => setAutoPublish(e.target.checked)}
                    className="w-4 h-4 bg-charcoal border border-white/5 rounded text-accent-cyan outline-none focus:ring-0 cursor-pointer"
                  />
                </div>
              </Card>
            )}

            {activeSection === 'env' && (
              <Card className="p-6 space-y-6 animate-fadeIn text-left">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                    <Key className="w-4 h-4 text-accent-violet" />
                    <span>Environment & API Keys Checklist</span>
                  </h3>
                  <p className="text-[11px] text-stone mt-1">Verification checklist for external service configurations and keys.</p>
                </div>

                <div className="space-y-4 text-[12px]">
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/[0.01]">
                    <div className="space-y-1">
                      <span className="font-bold text-warm-white block">PostgreSQL Connection URL (DATABASE_URL)</span>
                      <p className="text-[10.5px] text-stone font-light">Required for real-time article caching, analytics, and redirects manager.</p>
                    </div>
                    {initialData.envStatus?.databaseUrlPresent ? (
                      <span className="px-2.5 py-1 rounded bg-accent-cyan/15 border border-accent-cyan/25 text-accent-cyan font-bold font-mono text-[10px]">ACTIVE ✅</span>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-accent-pink/15 border border-accent-pink/25 text-accent-pink font-bold font-mono text-[10px]">MISSING ❌</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/[0.01]">
                    <div className="space-y-1">
                      <span className="font-bold text-warm-white block">OpenAI API Key (OPENAI_API_KEY)</span>
                      <p className="text-[10.5px] text-stone font-light">Required for the AI Co-Writer wizard, dynamic summaries, and SEO tag suggestions.</p>
                    </div>
                    {initialData.envStatus?.openaiKeyPresent ? (
                      <span className="px-2.5 py-1 rounded bg-accent-cyan/15 border border-accent-cyan/25 text-accent-cyan font-bold font-mono text-[10px]">ACTIVE ✅</span>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-accent-pink/15 border border-accent-pink/25 text-accent-pink font-bold font-mono text-[10px]">MISSING ❌</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/[0.01]">
                    <div className="space-y-1">
                      <span className="font-bold text-warm-white block">GitHub PAT Token (GITHUB_PAT)</span>
                      <p className="text-[10.5px] text-stone font-light">Used for synchronization automation webhooks and code showcases.</p>
                    </div>
                    {initialData.envStatus?.githubTokenPresent ? (
                      <span className="px-2.5 py-1 rounded bg-accent-cyan/15 border border-accent-cyan/25 text-accent-cyan font-bold font-mono text-[10px]">ACTIVE ✅</span>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-stone/10 border border-white/5 text-stone font-bold font-mono text-[10px]">OPTIONAL ⚪</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/[0.01]">
                    <div className="space-y-1">
                      <span className="font-bold text-warm-white block">NextAuth Secret (NEXTAUTH_SECRET)</span>
                      <p className="text-[10.5px] text-stone font-light">Cryptographic signing secret key for visitor login sessions.</p>
                    </div>
                    {initialData.envStatus?.nextauthSecretPresent ? (
                      <span className="px-2.5 py-1 rounded bg-accent-cyan/15 border border-accent-cyan/25 text-accent-cyan font-bold font-mono text-[10px]">ACTIVE ✅</span>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-accent-pink/15 border border-accent-pink/25 text-accent-pink font-bold font-mono text-[10px]">MISSING ❌</span>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {activeSection === 'limits' && (
              <Card className="p-6 space-y-4 animate-fadeIn">
                <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                  <HardDrive className="w-4 h-4 text-accent-pink" />
                  <span>Project Quotas & Billing Limits</span>
                </h3>

                <div className="space-y-4 text-[13px]">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-stone">Active Members Cap</span>
                    <span className="font-bold text-warm-white">1 of 1 Owner (Single Tenant)</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-stone">AI Tokens monthly quota</span>
                    <span className="font-bold text-warm-white">45,120 / 500,000 Tokens (9.0%)</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-stone">Automation Runs monthly quota</span>
                    <span className="font-bold text-warm-white">24 / 200 Runs (12.0%)</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-stone">Workspace Cost Period</span>
                    <span className="font-bold text-accent-emerald font-mono">$0.00 / Free Plan Tier</span>
                  </div>
                </div>
              </Card>
            )}

            {activeSection === 'danger' && (
              <Card className="p-6 border-accent-pink/20 bg-accent-pink/[0.02] space-y-4 animate-fadeIn">
                <h3 className="text-[14px] font-bold text-accent-pink uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Danger Zone Actions</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="text-[13px] font-bold text-warm-white block">Archive Workspace Project</span>
                      <span className="text-[11px] text-stone font-light leading-normal block mt-0.5">
                        Set project to read-only status and suspend automated AI webhooks triggers.
                      </span>
                    </div>
                    <Button variant="secondary" type="button" className="text-[12px] shrink-0">
                      Archive Project
                    </Button>
                  </div>

                  <div className="p-4 rounded-xl border border-accent-pink/10 bg-accent-pink/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="text-[13px] font-bold text-warm-white block">Delete Workspace Project</span>
                      <span className="text-[11px] text-stone font-light leading-normal block mt-0.5">
                        Permanently purge project container and all associated CMS content, media files, and analytics.
                      </span>
                    </div>
                    <button 
                      type="button" 
                      className="px-4 py-2 text-[12px] font-semibold text-accent-pink hover:text-white bg-accent-pink/10 hover:bg-accent-pink/90 border border-accent-pink/20 rounded-lg cursor-pointer transition-all active:scale-[0.98]"
                    >
                      Delete Project
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {activeSection !== 'limits' && activeSection !== 'danger' && activeSection !== 'env' && (
              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
                <button
                  type="submit"
                  disabled={saveStatus === 'saving'}
                  className="px-5 py-2.5 text-[12px] font-semibold text-onyx bg-warm-white hover:bg-mist disabled:opacity-50 disabled:pointer-events-none rounded-lg cursor-pointer transition-all active:scale-[0.98]"
                >
                  {saveStatus === 'saving' ? 'Saving configuration...' : saveStatus === 'saved' ? 'Settings Saved Successfully!' : 'Save Scope Settings'}
                </button>

                {saveStatus === 'saved' && <span className="text-accent-emerald text-[12.5px] font-medium flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Scope settings synced</span>}
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}

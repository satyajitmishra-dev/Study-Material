'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Terminal, 
  Globe2, 
  BarChart3, 
  Github, 
  ArrowRight, 
  CheckCircle, 
  Eye, 
  Sparkles,
  BookOpen,
  Plus
} from 'lucide-react';
import { Button, Card } from '@/components/ui/core';
import { Storage, ProjectData } from '@/lib/storage';
import { MOCK_PROJECTS } from '@/lib/mockData';

export default function AdminDashboard() {
  const [projects, setProjects] = useState<ProjectData[]>([]);

  useEffect(() => {
    Storage.getProjects(MOCK_PROJECTS).then(setProjects);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-6 pt-12 pb-16 space-y-12">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-accent-violet tracking-[0.2em] uppercase">
            Publishing Studio
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-warm-white">
            Workspace Dashboard
          </h1>
          <p className="text-[14px] text-stone font-light max-w-md">
            Publish lessons, import open-source builds, audit search accessibility, and track student completion performance.
          </p>
        </div>

        <Link href="/admin/import">
          <Button variant="primary" className="magnetic-item">
            <Plus className="w-4 h-4" />
            <span>Connect Repository</span>
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-charcoal/20 border-white/5 p-4 flex flex-col justify-between h-[100px]">
          <span className="text-[10px] text-stone uppercase tracking-wider font-semibold">Total Modules</span>
          <span className="text-2xl font-bold font-mono">12</span>
        </Card>
        <Card className="bg-charcoal/20 border-white/5 p-4 flex flex-col justify-between h-[100px]">
          <span className="text-[10px] text-stone uppercase tracking-wider font-semibold">Sync Nodes</span>
          <span className="text-2xl font-bold font-mono">{projects.length} connected</span>
        </Card>
        <Card className="bg-charcoal/20 border-white/5 p-4 flex flex-col justify-between h-[100px]">
          <span className="text-[10px] text-stone uppercase tracking-wider font-semibold">SEO Indexability</span>
          <span className="text-2xl font-bold font-mono text-accent-emerald">94%</span>
        </Card>
        <Card className="bg-charcoal/20 border-white/5 p-4 flex flex-col justify-between h-[100px]">
          <span className="text-[10px] text-stone uppercase tracking-wider font-semibold">User Views</span>
          <span className="text-2xl font-bold font-mono">14,240</span>
        </Card>
      </div>

      {/* Action Centers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Card className="flex flex-col justify-between h-[200px] border-white/5 hover:border-accent-cyan/20 group">
          <div className="space-y-2">
            <Github className="w-5 h-5 text-accent-cyan" />
            <h3 className="text-[15px] font-bold text-warm-white group-hover:text-accent-cyan transition-colors">GitHub Sync</h3>
            <p className="text-[12px] text-stone/85 leading-relaxed">
              Auto-fetch and import repository files, parse MDX, and generate interactive architecture nodes.
            </p>
          </div>
          <Link href="/admin/import" className="text-[11px] text-stone hover:text-warm-white flex items-center gap-1 mt-4 group-hover:translate-x-0.5 transition-transform">
            <span>Open Importer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        <Card className="flex flex-col justify-between h-[200px] border-white/5 hover:border-accent-pink/20 group">
          <div className="space-y-2">
            <Globe2 className="w-5 h-5 text-accent-pink" />
            <h3 className="text-[15px] font-bold text-warm-white group-hover:text-accent-pink transition-colors">SEO Studio</h3>
            <p className="text-[12px] text-stone/85 leading-relaxed">
              Write rich metadata descriptions, validate headings accessibility, and audit SERP previews.
            </p>
          </div>
          <Link href="/admin/seo" className="text-[11px] text-stone hover:text-warm-white flex items-center gap-1 mt-4 group-hover:translate-x-0.5 transition-transform">
            <span>Open SEO Auditer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        <Card className="flex flex-col justify-between h-[200px] border-white/5 hover:border-accent-violet/20 group">
          <div className="space-y-2">
            <BarChart3 className="w-5 h-5 text-accent-violet" />
            <h3 className="text-[15px] font-bold text-warm-white group-hover:text-accent-violet transition-colors">Analytics Suite</h3>
            <p className="text-[12px] text-stone/85 leading-relaxed">
              Inspect student signups, path completions, interaction times, and engagement metrics.
            </p>
          </div>
          <Link href="/admin/analytics" className="text-[11px] text-stone hover:text-warm-white flex items-center gap-1 mt-4 group-hover:translate-x-0.5 transition-transform">
            <span>Open Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

      </div>

      {/* Recents Lists */}
      <div className="space-y-4">
        <h2 className="text-[14px] font-bold text-warm-white uppercase tracking-wider">
          Connected Code Repositories
        </h2>
        <div className="border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
          {projects.map(proj => (
            <div key={proj.id} className="flex items-center justify-between p-4 bg-charcoal/10 hover:bg-charcoal/20 transition-colors">
              <div className="space-y-0.5">
                <span className="text-[12px] font-bold text-warm-white">{proj.name}</span>
                <p className="text-[10px] text-stone truncate max-w-sm">{proj.tagline}</p>
              </div>
              <div className="flex items-center gap-6 text-[11px] text-stone">
                <span className="font-mono">{proj.githubUrl ? 'github.com/sync' : 'local'}</span>
                <span className="flex items-center gap-1 text-accent-emerald font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Synced
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

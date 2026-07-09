'use client';

import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  RotateCcw, 
  ChevronRight, 
  User, 
  FileText,
  Eye,
  Check,
  SplitSquareVertical
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components/ui/core';
import { rollbackProjectVersionAction } from '@/lib/actions/cms';

interface VersionItem {
  id: string;
  version: number;
  title: string;
  content: string;
  versionNote: string | null;
  createdAt: string;
  authorId: string;
}

interface VersionHistoryClientProps {
  projectId: string;
  projectTitle: string;
  currentContent: string;
  versions: VersionItem[];
}

export default function VersionHistoryClient({ 
  projectId, 
  projectTitle, 
  currentContent, 
  versions 
}: VersionHistoryClientProps) {
  const router = useRouter();
  const [selectedVersion, setSelectedVersion] = useState<VersionItem | null>(versions[0] || null);
  const [diffMode, setDiffMode] = useState<'side-by-side' | 'raw'>('side-by-side');
  const [isRollingBack, setIsRollingBack] = useState(false);

  // Rollback Action Handler
  const handleRollback = async () => {
    if (!selectedVersion) return;
    if (!confirm(`Are you sure you want to rollback this project to Version v${selectedVersion.version}?`)) {
      return;
    }

    setIsRollingBack(true);
    try {
      const res = await rollbackProjectVersionAction(projectId, selectedVersion.id);
      if (res.success) {
        alert(`Successfully rolled back to version v${selectedVersion.version}!`);
        router.push(`/admin/projects/edit/${projectId}`);
      } else {
        alert(res.error || 'Failed to rollback version');
      }
    } catch (e) {
      alert('Error executing rollback transaction.');
    } finally {
      setIsRollingBack(false);
    }
  };

  // Simple and highly effective line-by-line diffing engine
  const lineDiff = useMemo(() => {
    if (!selectedVersion) return { oldLines: [], newLines: [] };
    
    // Clean and normalize texts
    const oldText = selectedVersion.content || '';
    const newText = currentContent || '';

    const oldLines = oldText.split('\n').map(l => l.replace(/<[^>]*>/g, '')); // Strip tags for readability
    const newLines = newText.split('\n').map(l => l.replace(/<[^>]*>/g, ''));

    return { oldLines, newLines };
  }, [selectedVersion, currentContent]);

  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Link href={`/admin/projects/edit/${projectId}`}>
            <Button variant="ghost" className="h-8 px-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="space-y-0.5">
            <h1 className="text-xl font-extrabold text-warm-white">Version Timeline</h1>
            <p className="text-[11px] text-stone">Review and rollback revisions for: <span className="text-accent-cyan font-bold">{projectTitle}</span></p>
          </div>
        </div>

        {selectedVersion && (
          <Button 
            onClick={handleRollback} 
            variant="accent" 
            className="h-9 text-[11px] px-3 font-mono"
            disabled={isRollingBack}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRollingBack ? 'animate-spin' : ''}`} />
            <span>Restore Version v{selectedVersion.version}</span>
          </Button>
        )}
      </div>

      {/* Main timeline layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Timeline Log Sidebar (4 cols) */}
        <Card className="lg:col-span-4 p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Clock className="w-4 h-4 text-accent-cyan" />
            <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider">Revision History ({versions.length})</h3>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
            {versions.map((ver) => {
              const isSelected = selectedVersion?.id === ver.id;
              
              return (
                <button
                  key={ver.id}
                  onClick={() => setSelectedVersion(ver)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3
                    ${isSelected 
                      ? 'bg-warm-white border-warm-white text-onyx shadow-premium font-medium' 
                      : 'bg-charcoal/10 border-white/5 text-stone hover:text-warm-white hover:border-white/12'
                    }
                  `}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-onyx/10 text-onyx' : 'bg-white/5 text-stone'}`}>
                    <FileText className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold">Version v{ver.version}</span>
                      <span className={`text-[9px] font-mono ${isSelected ? 'text-onyx/70' : 'text-stone/50'}`}>
                        {new Date(ver.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className={`text-[10px] line-clamp-2 leading-relaxed ${isSelected ? 'text-onyx/85' : 'text-stone/75'}`}>
                      {ver.versionNote || 'No revision comments.'}
                    </p>

                    <div className="flex items-center gap-1.5 text-[9px] font-mono">
                      <User className="w-3 h-3" />
                      <span className="truncate">Author: {ver.authorId}</span>
                    </div>
                  </div>
                </button>
              );
            })}

            {versions.length === 0 && (
              <div className="text-center py-12 text-stone text-[11px]">
                No historical versions recorded for this project yet. Save adjustments in the wizard to write history.
              </div>
            )}
          </div>
        </Card>

        {/* Diffing engine dashboard (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Controls */}
          <div className="flex items-center justify-between bg-charcoal/20 border border-white/5 rounded-xl p-3">
            <span className="text-[12px] font-bold text-warm-white flex items-center gap-1.5">
              <SplitSquareVertical className="w-4 h-4 text-accent-cyan" />
              <span>Comparing: Version v{selectedVersion?.version || 'N/A'} vs Current Active</span>
            </span>

            <div className="flex items-center gap-1 bg-charcoal/40 border border-white/5 rounded-lg p-0.5 text-[10px]">
              <button 
                onClick={() => setDiffMode('side-by-side')}
                className={`px-2 py-1 rounded cursor-pointer ${diffMode === 'side-by-side' ? 'bg-white/10 text-warm-white font-bold' : 'text-stone hover:text-warm-white'}`}
              >
                Split Diff
              </button>
              <button 
                onClick={() => setDiffMode('raw')}
                className={`px-2 py-1 rounded cursor-pointer ${diffMode === 'raw' ? 'bg-white/10 text-warm-white font-bold' : 'text-stone hover:text-warm-white'}`}
              >
                Visual Layout
              </button>
            </div>
          </div>

          {/* Comparer panes */}
          {selectedVersion && (
            <div className="border border-white/5 rounded-2xl overflow-hidden shadow-premium bg-onyx/40">
              
              {diffMode === 'side-by-side' && (
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5 text-[12px] leading-relaxed select-text font-mono">
                  
                  {/* Left Column: Historical */}
                  <div className="p-5 flex flex-col h-[400px]">
                    <div className="border-b border-white/5 pb-2 mb-3 flex items-center justify-between text-stone text-[10px] uppercase font-bold tracking-wider">
                      <span>v{selectedVersion.version} Historical Snapshot</span>
                      <span className="text-accent-pink">- Delete Markers</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1 text-stone">
                      {lineDiff.oldLines.map((line, idx) => {
                        const isDifferent = line !== lineDiff.newLines[idx];
                        return (
                          <div 
                            key={idx} 
                            className={`px-1.5 py-0.5 rounded ${isDifferent ? 'bg-accent-pink/10 text-accent-pink border border-accent-pink/15' : ''}`}
                          >
                            {isDifferent && <span className="mr-1.5 text-accent-pink font-bold">-</span>}
                            {line || <span className="text-stone/20">&lt;empty line&gt;</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Active */}
                  <div className="p-5 flex flex-col h-[400px]">
                    <div className="border-b border-white/5 pb-2 mb-3 flex items-center justify-between text-stone text-[10px] uppercase font-bold tracking-wider">
                      <span>Current Active Draft</span>
                      <span className="text-accent-emerald">+ Addition Markers</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1 text-stone">
                      {lineDiff.newLines.map((line, idx) => {
                        const isDifferent = line !== lineDiff.oldLines[idx];
                        return (
                          <div 
                            key={idx} 
                            className={`px-1.5 py-0.5 rounded ${isDifferent ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/15' : ''}`}
                          >
                            {isDifferent && <span className="mr-1.5 text-accent-emerald font-bold">+</span>}
                            {line || <span className="text-stone/20">&lt;empty line&gt;</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {diffMode === 'raw' && (
                <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar select-text space-y-4">
                  <div className="border-b border-white/5 pb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-accent-cyan">Rendered Snapshot v{selectedVersion.version}</span>
                    <h2 className="text-2xl font-extrabold text-warm-white mt-1">{selectedVersion.title}</h2>
                  </div>
                  {/* Render raw content HTML */}
                  <div 
                    className="text-[13px] text-stone leading-relaxed prose prose-invert select-text"
                    dangerouslySetInnerHTML={{ __html: selectedVersion.content }} 
                  />
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

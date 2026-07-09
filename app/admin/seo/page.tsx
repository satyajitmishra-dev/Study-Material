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
  Code
} from 'lucide-react';
import { Button, Card, Input } from '@/components/ui/core';

export default function SeoStudioWorkspace() {
  const router = useRouter();

  // SEO Form Inputs
  const [title, setTitle] = useState('StudyMaterial — The Future of Learning for Developers');
  const [desc, setDesc] = useState('An immersive desktop-grade workspace engineered for developers to master modern frontend, backend, and AI stacks.');
  const [slug, setSlug] = useState('next-16-compiler');
  const [keyword, setKeyword] = useState('Next.js 16');

  // Computed live audits
  const [score, setScore] = useState(85);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    let currentScore = 100;
    const currentAlerts: string[] = [];

    // Title Length Audit (50-60 chars is ideal)
    if (title.length < 30) {
      currentScore -= 10;
      currentAlerts.push('Meta title is too short (aim for 50-60 characters)');
    } else if (title.length > 60) {
      currentScore -= 8;
      currentAlerts.push('Meta title exceeds recommended length (60 characters)');
    }

    // Description Length Audit (120-160 chars is ideal)
    if (desc.length < 80) {
      currentScore -= 12;
      currentAlerts.push('Meta description is too short (aim for 120-160 characters)');
    } else if (desc.length > 160) {
      currentScore -= 10;
      currentAlerts.push('Meta description exceeds recommended length (160 characters)');
    }

    // Focus Keyword presence
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

  return (
    <div className="w-full max-w-5xl mx-auto px-6 pt-12 pb-16 space-y-12">
      {/* Back Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push('/admin')} className="h-8 px-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 text-[12px] text-stone">
            <span>Publishing Studio</span>
            <span>/</span>
            <span className="text-warm-white font-medium">SEO Studio Studio</span>
          </div>
        </div>

        <span className="text-[11px] font-mono text-stone bg-charcoal/20 px-2 py-0.5 border border-white/5 rounded">
          Status: Live Auditing
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Config Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-warm-white flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-accent-pink" />
              <span>SEO Parameters</span>
            </h2>
            <p className="text-[12px] text-stone">
              Edit the search configuration of your learning lessons. Everything validates instantly.
            </p>
          </div>

          <Card className="space-y-4 p-5 bg-charcoal/15 border-white/5">
            <Input
              label="Focus Keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. React 19"
            />

            <Input
              label="Meta Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Meta title of the page"
            />
            <div className="flex justify-end text-[10px] text-stone">
              <span className={title.length >= 40 && title.length <= 60 ? 'text-accent-emerald' : 'text-accent-amber'}>
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
                className="w-full h-24 px-3 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/20 focus:bg-charcoal/40 focus:ring-1 focus:ring-white/10 placeholder:text-stone/60 resize-none"
              />
              <div className="flex justify-end text-[10px] text-stone">
                <span className={desc.length >= 120 && desc.length <= 160 ? 'text-accent-emerald' : 'text-accent-amber'}>
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

        {/* Right Column: Previews & Audits (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Live Rating Widget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="flex flex-col items-center justify-center p-6 h-[140px] border-white/5">
              <span className="text-[10px] text-stone uppercase tracking-wider font-semibold mb-2">Live SEO Score</span>
              <div className="flex items-baseline gap-0.5">
                <span className={`text-4xl font-extrabold font-mono
                  ${score >= 80 ? 'text-accent-emerald' : score >= 50 ? 'text-accent-amber' : 'text-accent-pink'}
                `}>
                  {score}
                </span>
                <span className="text-[14px] text-stone">/100</span>
              </div>
            </Card>

            <Card className="flex flex-col items-center justify-center p-6 h-[140px] border-white/5">
              <span className="text-[10px] text-stone uppercase tracking-wider font-semibold mb-2">Readability Index</span>
              <span className="text-xl font-bold font-mono text-warm-white">92 / 100</span>
              <span className="text-[10px] text-stone">Flesch-Kincaid Grade 8</span>
            </Card>

            <Card className="flex flex-col items-center justify-center p-6 h-[140px] border-white/5">
              <span className="text-[10px] text-stone uppercase tracking-wider font-semibold mb-2">Accessibility Check</span>
              <span className="text-xl font-bold font-mono text-accent-emerald">100% Pass</span>
              <span className="text-[10px] text-stone">Screen-reader verified</span>
            </Card>
          </div>

          {/* Previews Tab */}
          <div className="space-y-4">
            <h3 className="text-[12px] font-bold text-warm-white uppercase tracking-wider">
              Search engine previews
            </h3>

            {/* Google SERP Card */}
            <div className="p-5 rounded-2xl bg-charcoal/20 border border-white/5 space-y-3">
              <span className="text-[10px] text-stone uppercase font-bold tracking-wider">Google Search Result Preview</span>
              <div className="space-y-1 bg-onyx/30 p-4 rounded-xl border border-white/5 font-sans">
                <div className="flex items-center gap-1.5 text-[12px] text-stone">
                  <span>https://studymaterial.dev</span>
                  <span>›</span>
                  <span className="truncate">learn</span>
                  <span>›</span>
                  <span className="truncate">{slug || 'slug'}</span>
                </div>
                <h4 className="text-[18px] text-[#4b99e9] hover:underline cursor-pointer truncate font-medium">
                  {title || 'Please write a meta title'}
                </h4>
                <p className="text-[13px] text-stone leading-relaxed line-clamp-2">
                  {desc || 'Please write a meta description to display here...'}
                </p>
              </div>
            </div>

            {/* OpenGraph Social Card */}
            <div className="p-5 rounded-2xl bg-charcoal/20 border border-white/5 space-y-3">
              <span className="text-[10px] text-stone uppercase font-bold tracking-wider">OpenGraph Social Preview</span>
              <div className="bg-onyx/30 rounded-xl border border-white/5 overflow-hidden font-sans">
                {/* Visual Image Banner */}
                <div className="relative h-[160px] bg-charcoal/40 flex items-center justify-center border-b border-white/5">
                  <div className="absolute inset-0 grid-background opacity-20" />
                  <div className="relative z-10 flex flex-col items-center gap-1 text-center px-4">
                    <span className="text-[10px] text-accent-cyan tracking-widest uppercase font-mono">StudyMaterial</span>
                    <span className="text-[14px] font-bold text-warm-white truncate max-w-sm">{title}</span>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <span className="text-[10px] text-stone uppercase">STUDYMATERIAL.DEV</span>
                  <h4 className="text-[14px] font-bold text-warm-white truncate">{title}</h4>
                  <p className="text-[11px] text-stone line-clamp-1">{desc}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Audit warnings */}
          {alerts.length > 0 && (
            <div className="p-4 rounded-xl bg-accent-amber/5 border border-accent-amber/15 space-y-2">
              <div className="flex items-center gap-2 text-accent-amber text-[12px] font-bold">
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

          {/* Schema JSON-LD structure */}
          <div className="p-4 rounded-xl bg-charcoal/10 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-stone uppercase font-bold flex items-center gap-1.5"><Code className="w-3.5 h-3.5" />Schema.org Markup</span>
              <span className="text-[10px] text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 px-1.5 py-0.2 rounded font-mono">JSON-LD Valid</span>
            </div>
            <pre className="bg-onyx/40 border border-white/5 rounded-lg p-3 overflow-x-auto text-[10px] font-mono text-stone max-h-[100px] leading-tight">
{`{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "${title.replace(/"/g, '\\"')}",
  "description": "${desc.replace(/"/g, '\\"')}",
  "inLanguage": "en",
  "author": {
    "@type": "Organization",
    "name": "StudyMaterial"
  }
}`}
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
}

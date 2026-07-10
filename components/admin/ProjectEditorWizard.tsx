'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Globe,
  Smartphone,
  Tablet as TabletIcon,
  Monitor,
  Check,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Clock,
  Eye,
  FileCheck,
  Search,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, Input } from '@/components/ui/core';
import { CmsProjectSchema, CmsProjectInput } from '@/lib/validation/cms';
import { saveProjectAction, generateAiContentAction } from '@/lib/actions/cms';
import TipTapEditor from './TipTapEditor';
import { SeoEngine, SeoAuditResult } from '@/lib/seo/SeoEngine';

interface ProjectEditorWizardProps {
  project: any | null; // CmsProject or null
}

const STEPS = [
  { id: 'basic', name: '1. Basic Info' },
  { id: 'content', name: '2. Editor & Content' },
  { id: 'seo', name: '3. SEO Studio' },
  { id: 'preview', name: '4. Preview' },
  { id: 'publish', name: '5. Publish Config' },
];

export default function ProjectEditorWizard({ project }: ProjectEditorWizardProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<string>('basic');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [serpTab, setSerpTab] = useState<'google' | 'twitter' | 'facebook'>('google');

  // Autosave status: idle | saving | saved | offline | error
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'offline' | 'error'>('saved');
  const [isDirtyState, setIsDirtyState] = useState(false);

  // Initialize React Hook Form
  const defaultValues: Partial<CmsProjectInput> = {
    title: project?.title || '',
    slug: project?.slug || '',
    description: project?.description || '',
    category: project?.category || 'React',
    tags: project?.tags || [],
    language: project?.language || 'en',
    visibility: project?.visibility || 'public',
    thumbnail: project?.thumbnail || '',
    coverImage: project?.coverImage || '',
    content: project?.content || '',
    seoTitle: project?.seoTitle || '',
    seoDescription: project?.seoDescription || '',
    seoKeywords: project?.seoKeywords || '',
    ogImage: project?.ogImage || '',
    canonical: project?.canonical || '',
    robots: project?.robots || 'index, follow',
    schemaJson: project?.schemaJson || '',
    seoScore: project?.seoScore || 0,
    status: project?.status || 'draft',
    scheduledAt: project?.scheduledAt ? new Date(project.scheduledAt).toISOString().slice(0, 16) : '',
    versionNote: '',
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors }
  } = useForm<CmsProjectInput>({
    resolver: zodResolver(CmsProjectSchema),
    defaultValues,
  });

  const formValues = watch();

  // Live SEO Audit Analysis using our SEO Engine
  const seoAnalysis = useMemo(() => {
    return SeoEngine.analyze({
      title: formValues.title || '',
      slug: formValues.slug || '',
      content: formValues.content || '',
      seoTitle: formValues.seoTitle,
      seoDescription: formValues.seoDescription,
      seoKeywords: formValues.seoKeywords,
      canonical: formValues.canonical,
      ogImage: formValues.ogImage,
      schemaJson: formValues.schemaJson,
    });
  }, [
    formValues.title,
    formValues.slug,
    formValues.content,
    formValues.seoTitle,
    formValues.seoDescription,
    formValues.seoKeywords,
    formValues.canonical,
    formValues.ogImage,
    formValues.schemaJson
  ]);

  // Sync SEO Score into formState so it can be saved in Postgres
  useEffect(() => {
    setValue('seoScore', seoAnalysis.score, { shouldDirty: false });
  }, [seoAnalysis.score, setValue]);

  // Watch Title and generate Slug automatically in create mode
  const titleVal = watch('title');
  useEffect(() => {
    if (!project && titleVal) {
      const generated = titleVal
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue('slug', generated, { shouldValidate: true });
    }
  }, [titleVal, project, setValue]);

  // Track changes to trigger autosave
  useEffect(() => {
    setIsDirtyState(true);
    setSaveStatus('idle');
  }, [formValues]);

  // Autosave function
  const triggerAutosave = useCallback(async (values: CmsProjectInput) => {
    if (!isDirtyState) return;

    // Check Network connectivity
    if (typeof window !== 'undefined' && !navigator.onLine) {
      setSaveStatus('offline');
      // Buffer in offline queue
      localStorage.setItem(`sm_draft_queue_${project?.id || 'new'}`, JSON.stringify(values));
      return;
    }

    setSaveStatus('saving');
    try {
      const res = await saveProjectAction(project?.id || null, {
        ...values,
        status: project?.status || 'draft', // Keep original status during autosaves
        versionNote: values.versionNote || 'Autosaved revision',
      });

      if (res.success) {
        setSaveStatus('saved');
        setIsDirtyState(false);
        // Clear offline draft recovery queue
        localStorage.removeItem(`sm_draft_queue_${project?.id || 'new'}`);
        if (!project && res.project) {
          // If we created a new project, redirect to edit path without full page reload
          router.replace(`/admin/projects/edit/${res.project.id}`);
        }
      } else {
        setSaveStatus('error');
      }
    } catch (e) {
      setSaveStatus('error');
    }
  }, [project, isDirtyState, router]);

  // Autosave execution: check changes every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (isDirtyState) {
        triggerAutosave(formValues as CmsProjectInput);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [isDirtyState, formValues, triggerAutosave]);

  // Reconnection Sync Handler
  useEffect(() => {
    const handleOnline = () => {
      const queued = localStorage.getItem(`sm_draft_queue_${project?.id || 'new'}`);
      if (queued) {
        try {
          const parsed = JSON.parse(queued);
          triggerAutosave(parsed);
        } catch (e) { }
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [project, triggerAutosave]);

  // Warn on closing tabs with unsaved edits
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyState && saveStatus !== 'saved') {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirtyState, saveStatus]);

  // AI Content Generator helper
  const runAiAssistant = async (mode: 'summarize' | 'rewrite' | 'faq' | 'seo') => {
    const promptSource = mode === 'seo' ? formValues.title : formValues.content;
    if (!promptSource) {
      alert('Please add some content/title first for the AI to analyze.');
      return;
    }

    setIsAiLoading(true);
    try {
      const res = await generateAiContentAction(promptSource, mode);
      if (res.success && res.text) {
        if (mode === 'seo') {
          try {
            const parsedSeo = JSON.parse(res.text);
            setValue('seoTitle', parsedSeo.title);
            setValue('seoDescription', parsedSeo.description);
            setAiOutput('SEO parameters populated!');
          } catch (e) {
            setAiOutput(res.text);
          }
        } else {
          setAiOutput(res.text);
        }
      } else {
        setAiOutput('AI failed to respond. Check environment settings.');
      }
    } catch (e) {
      setAiOutput('Error querying OpenAI endpoint.');
    }
    setIsAiLoading(false);
  };

  // Submit / Publish Final Form
  const onFormSubmit = async (data: CmsProjectInput) => {
    setSaveStatus('saving');
    try {
      const res = await saveProjectAction(project?.id || null, {
        ...data,
        versionNote: data.versionNote || 'Published final release version',
      });

      if (res.success) {
        setSaveStatus('saved');
        router.push('/admin/projects');
      } else {
        setSaveStatus('error');
        alert(res.error || 'Failed to save project settings.');
      }
    } catch (err) {
      setSaveStatus('error');
    }
  };

  // Computed live audits for previews
  const wordCount = formValues.content ? formValues.content.split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 pb-12">
      {/* Wizard Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/projects">
            <Button variant="ghost" className="h-8 px-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-[12px] text-stone">
            <span>CMS Studio</span>
            <span>/</span>
            <span className="text-warm-white font-medium">
              {project ? `Edit: ${project.title}` : 'Create New Project'}
            </span>
          </div>
        </div>

        {/* Autosave Status Badge */}
        <div className="flex items-center gap-4 text-[11px] font-mono">
          {saveStatus === 'saving' && (
            <span className="text-accent-cyan flex items-center gap-1.5 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-accent-emerald flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              Saved
            </span>
          )}
          {saveStatus === 'offline' && (
            <span className="text-accent-pink flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 animate-bounce" />
              Offline (Queued)
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-accent-red flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Save Failed (Retry)
            </span>
          )}
          {saveStatus === 'idle' && (
            <span className="text-stone">
              Unsaved changes...
            </span>
          )}

          <Button type="button" onClick={() => triggerAutosave(formValues as CmsProjectInput)} variant="secondary" className="h-7 text-[10px] px-2.5">
            <Save className="w-3.5 h-3.5" />
            <span>Force Save</span>
          </Button>
        </div>
      </div>

      {/* Step Indicator Navigation */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveStep(s.id)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium tracking-wide transition-all cursor-pointer
                ${activeStep === s.id
                  ? 'bg-warm-white text-onyx shadow-premium font-semibold'
                  : 'text-stone hover:text-warm-white hover:bg-white/5'
                }
              `}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: BASIC INFO */}
      {activeStep === 'basic' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <Card className="lg:col-span-8 p-6 space-y-6">
            <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider">Project Parameters</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Title" {...register('title')} placeholder="Enter project title" />
              <Input label="Slug" {...register('slug')} placeholder="enter-slug-value" />
            </div>
            {errors.title && <p className="text-accent-pink text-[11px] font-mono">{errors.title.message}</p>}
            {errors.slug && <p className="text-accent-pink text-[11px] font-mono">{errors.slug.message}</p>}

            <Input label="Description" {...register('description')} placeholder="Add a concise overview of the post..." />
            {errors.description && <p className="text-accent-pink text-[11px] font-mono">{errors.description.message}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-stone uppercase tracking-wider block mb-1.5">Category</label>
                <select {...register('category')} className="w-full bg-charcoal/20 border border-white/5 rounded-lg text-[13px] px-3 py-2 text-warm-white outline-none focus:border-white/20">
                  <option value="React">React</option>
                  <option value="TypeScript">TypeScript</option>
                  <option value="AI">AI</option>
                  <option value="Backend">Backend</option>
                  <option value="CSS">CSS</option>
                  <option value="Database">Database</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone uppercase tracking-wider block mb-1.5">Language</label>
                <select {...register('language')} className="w-full bg-charcoal/20 border border-white/5 rounded-lg text-[13px] px-3 py-2 text-warm-white outline-none focus:border-white/20">
                  <option value="en">English (US)</option>
                  <option value="de">German</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone uppercase tracking-wider block mb-1.5">Visibility</label>
                <select {...register('visibility')} className="w-full bg-charcoal/20 border border-white/5 rounded-lg text-[13px] px-3 py-2 text-warm-white outline-none focus:border-white/20">
                  <option value="public">Public (All)</option>
                  <option value="private">Private (Admin only)</option>
                  <option value="members">Members Only</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-4 p-5 space-y-4">
            <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider">Asset Attachments</h3>
            <Input label="Cover Image URL" {...register('coverImage')} placeholder="https://unsplash.com/..." />
            <Input label="Thumbnail URL" {...register('thumbnail')} placeholder="https://unsplash.com/..." />
            <p className="text-[11px] text-stone">You can link directly to unsplash/external photos here, or use the Media Library in Phase 6 to fetch cropped assets.</p>
          </Card>
        </motion.div>
      )}

      {/* STEP 2: CONTENT EDITOR */}
      {activeStep === 'content' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <Controller
              control={control}
              name="content"
              render={({ field }) => (
                <TipTapEditor content={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          {/* AI Content Assistant sidebar panel */}
          <Card className="lg:col-span-4 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-accent-violet animate-pulse" />
                <span>AI Co-Writer</span>
              </h3>
            </div>

            <p className="text-[11px] text-stone">Highlight elements or write text, then trigger AI transformations using GPT-4o-mini.</p>

            <div className="grid grid-cols-2 gap-2">
              <Button type="button" onClick={() => runAiAssistant('rewrite')} variant="secondary" className="text-[10px] py-1.5" disabled={isAiLoading}>
                Professional Rewrite
              </Button>
              <Button type="button" onClick={() => runAiAssistant('summarize')} variant="secondary" className="text-[10px] py-1.5" disabled={isAiLoading}>
                Summarize Content
              </Button>
              <Button type="button" onClick={() => runAiAssistant('faq')} variant="secondary" className="text-[10px] py-1.5" disabled={isAiLoading}>
                Generate FAQ
              </Button>
              <Button type="button" onClick={() => runAiAssistant('seo')} variant="secondary" className="text-[10px] py-1.5" disabled={isAiLoading}>
                Auto SEO Metas
              </Button>
            </div>

            {isAiLoading && (
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center gap-2 text-[11px] text-stone">
                <RefreshCw className="w-4 h-4 animate-spin text-accent-cyan" />
                Running model inferences...
              </div>
            )}

            {aiOutput && !isAiLoading && (
              <div className="p-4 bg-charcoal/20 border border-white/5 rounded-xl space-y-2 relative">
                <span className="text-[9px] font-mono text-accent-cyan uppercase tracking-wider block">AI Response Draft:</span>
                <p className="text-[11px] text-stone leading-relaxed whitespace-pre-wrap select-text">{aiOutput}</p>
                <Button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(aiOutput);
                    alert('Copied AI draft output to clipboard!');
                  }}
                  variant="ghost"
                  className="absolute top-2 right-2 p-1 h-6 text-[9px]"
                >
                  Copy
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* STEP 3: SEO STUDIO */}
      {activeStep === 'seo' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <Card className="lg:col-span-8 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-accent-pink" />
                <span>SEO Parameters</span>
              </h3>
              <Button 
                type="button" 
                onClick={() => runAiAssistant('seo')} 
                variant="secondary" 
                className="text-[10px] py-1 flex items-center gap-1.5"
                disabled={isAiLoading}
              >
                <Sparkles className="w-3.5 h-3.5 text-accent-violet animate-pulse-slow" />
                <span>AI Generate Metas</span>
              </Button>
            </div>

            <div className="space-y-4">
              <Input label="Meta Title" {...register('seoTitle')} placeholder="Optimized SERP Title (ideal: 50-60 chars)" />
              <Input label="Meta Description" {...register('seoDescription')} placeholder="SERP Snippet Description (ideal: 120-160 chars)" />
              <Input label="Focus Keywords (Comma separated)" {...register('seoKeywords')} placeholder="e.g. Next.js 16, React Compiler" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Canonical URL" {...register('canonical')} placeholder="https://yoursite.com/canonical-slug" />
                <Input label="Robots Rules" {...register('robots')} placeholder="index, follow" />
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Structured JSON-LD Schema</label>
                <textarea
                  {...register('schemaJson')}
                  placeholder='{"@context": "https://schema.org", "@type": "Article"}'
                  className="w-full h-24 bg-charcoal/20 border border-white/5 rounded-lg text-[13px] px-3 py-2 text-warm-white outline-none focus:border-white/20 font-mono placeholder:text-stone/30"
                />
              </div>

              {/* Live SERP previews panel */}
              <div className="border-t border-white/5 pt-6 mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[12px] font-bold text-warm-white uppercase tracking-wider">SERP Snippet Previews</h4>

                  <div className="flex items-center gap-1 bg-charcoal/40 border border-white/5 rounded-lg p-0.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setSerpTab('google')}
                      className={`px-2 py-1 rounded cursor-pointer ${serpTab === 'google' ? 'bg-white/10 text-warm-white font-bold' : 'text-stone hover:text-warm-white'}`}
                    >
                      Google Search
                    </button>
                    <button
                      type="button"
                      onClick={() => setSerpTab('twitter')}
                      className={`px-2 py-1 rounded cursor-pointer ${serpTab === 'twitter' ? 'bg-white/10 text-warm-white font-bold' : 'text-stone hover:text-warm-white'}`}
                    >
                      Twitter Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setSerpTab('facebook')}
                      className={`px-2 py-1 rounded cursor-pointer ${serpTab === 'facebook' ? 'bg-white/10 text-warm-white font-bold' : 'text-stone hover:text-warm-white'}`}
                    >
                      Facebook Post
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-onyx/45 border border-white/5 min-h-[140px] flex items-center justify-center">
                  {serpTab === 'google' && (
                    <div className="w-full text-left font-sans space-y-1.5 select-text">
                      <span className="text-[11px] text-stone font-light block">https://studymaterial.utool.in › preview › {formValues.slug || 'untitled'}</span>
                      <span className="text-[17px] text-[#8ab4f8] hover:underline cursor-pointer font-medium block leading-tight truncate">
                        {formValues.seoTitle || formValues.title || 'Untitled Document'}
                      </span>
                      <p className="text-[12px] text-[#bdc1c6] leading-relaxed line-clamp-2 select-text">
                        {formValues.seoDescription || 'Please write a meta description to populate this search snippet layout.'}
                      </p>
                    </div>
                  )}

                  {serpTab === 'twitter' && (
                    <div className="w-full text-left border border-white/10 rounded-2xl overflow-hidden bg-charcoal/20 select-text max-w-md mx-auto">
                      {formValues.coverImage ? (
                        <img src={formValues.coverImage} alt="twitter" className="w-full h-36 object-cover border-b border-white/10" />
                      ) : (
                        <div className="w-full h-36 bg-white/5 border-b border-white/10 flex items-center justify-center text-[11px] text-stone">No coverImage set</div>
                      )}
                      <div className="p-3 space-y-1">
                        <span className="text-[9px] text-stone/70 uppercase tracking-wider block font-mono">studymaterial.dev</span>
                        <h4 className="text-[11px] font-bold text-warm-white truncate">{formValues.seoTitle || formValues.title || 'Untitled'}</h4>
                        <p className="text-[10px] text-stone line-clamp-2 leading-tight">{formValues.seoDescription || 'No description set.'}</p>
                      </div>
                    </div>
                  )}

                  {serpTab === 'facebook' && (
                    <div className="w-full text-left border border-white/10 rounded bg-[#242526] select-text max-w-md mx-auto">
                      <div className="p-3 border-b border-white/5 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-accent-violet flex items-center justify-center text-[8px] font-bold text-white font-mono">SM</div>
                        <div>
                          <h5 className="text-[11px] font-bold text-warm-white leading-none">StudyMaterial Workspace</h5>
                          <span className="text-[9px] text-stone font-light">Sponsored • 🌐</span>
                        </div>
                      </div>
                      {formValues.coverImage ? (
                        <img src={formValues.coverImage} alt="facebook" className="w-full h-44 object-cover" />
                      ) : (
                        <div className="w-full h-44 bg-white/5 flex items-center justify-center text-[11px] text-stone">No coverImage set</div>
                      )}
                      <div className="p-3 bg-[#3a3b3c] space-y-1">
                        <span className="text-[9px] text-stone uppercase block font-mono">studymaterial.dev</span>
                        <h4 className="text-[11px] font-bold text-warm-white truncate">{formValues.seoTitle || formValues.title || 'Untitled'}</h4>
                        <p className="text-[10px] text-stone line-clamp-2 leading-tight">{formValues.seoDescription || 'No description set.'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </Card>

          {/* SEO Score bar & live audits */}
          <Card className="lg:col-span-4 p-5 space-y-4">
            <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider">SEO Index Audit</h3>

            <div className="flex items-center justify-between">
              <span className="text-[12px] text-stone">Realtime SEO Score</span>
              <span className={`text-2xl font-bold font-mono 
                ${seoAnalysis.score >= 90 ? 'text-accent-emerald' : seoAnalysis.score >= 70 ? 'text-accent-cyan' : 'text-accent-pink'}
              `}>
                {seoAnalysis.score}/100
              </span>
            </div>

            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300
                  ${seoAnalysis.score >= 90 ? 'bg-accent-emerald' : seoAnalysis.score >= 70 ? 'bg-accent-cyan' : 'bg-accent-pink'}
                `}
                style={{ width: `${seoAnalysis.score}%` }}
              />
            </div>

            {/* Diagnostic checklist */}
            <div className="pt-3 border-t border-white/5 space-y-3">
              <span className="text-[10px] text-stone uppercase tracking-wider font-semibold block">Audit Reports ({seoAnalysis.audits.length})</span>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {seoAnalysis.audits.map((audit: SeoAuditResult) => {
                  const colors: Record<'success' | 'warning' | 'error', string> = {
                    success: 'bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald',
                    warning: 'bg-accent-orange/10 border-accent-orange/20 text-accent-orange',
                    error: 'bg-accent-pink/10 border-accent-pink/20 text-accent-pink'
                  };
                  return (
                    <div
                      key={audit.id}
                      className={`p-2.5 rounded-lg border text-[11px] leading-relaxed flex items-start gap-2 ${colors[audit.status]}`}
                    >
                      <span className="mt-0.5 font-bold shrink-0">•</span>
                      <span>{audit.message}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* STEP 4: RESPONSIVE PREVIEW */}
      {activeStep === 'preview' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Device Toggles */}
          <div className="flex items-center justify-center gap-3 bg-charcoal/20 border border-white/5 rounded-xl p-2.5 max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              className={`p-2 rounded-lg cursor-pointer ${previewDevice === 'desktop' ? 'bg-white/10 text-warm-white font-bold' : 'text-stone hover:text-warm-white'}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('tablet')}
              className={`p-2 rounded-lg cursor-pointer ${previewDevice === 'tablet' ? 'bg-white/10 text-warm-white font-bold' : 'text-stone hover:text-warm-white'}`}
            >
              <TabletIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              className={`p-2 rounded-lg cursor-pointer ${previewDevice === 'mobile' ? 'bg-white/10 text-warm-white font-bold' : 'text-stone hover:text-warm-white'}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Simulated Device Sandbox Container */}
          <div className="flex justify-center w-full">
            <div
              className={`bg-charcoal/30 border border-white/10 rounded-2xl overflow-hidden shadow-premium transition-all duration-300 flex flex-col
                ${previewDevice === 'desktop' ? 'w-full max-w-4xl h-[520px]' : ''}
                ${previewDevice === 'tablet' ? 'w-[640px] h-[520px]' : ''}
                ${previewDevice === 'mobile' ? 'w-[360px] h-[520px]' : ''}
              `}
            >
              {/* Device Header Simulator */}
              <div className="bg-charcoal/40 border-b border-white/5 px-4 py-2 text-[10px] font-mono text-stone/85 flex items-center justify-between">
                <span>https://studymaterial.utool.in/preview/{formValues.slug || 'untitled'}</span>
                <span className="uppercase text-accent-cyan tracking-wider font-bold">Responsive View</span>
              </div>

              {/* Rendered Viewport */}
              <div className="flex-1 overflow-y-auto p-8 bg-onyx text-warm-white custom-scrollbar select-text">
                {formValues.coverImage && (
                  <img
                    src={formValues.coverImage}
                    alt="cover"
                    className="w-full h-36 object-cover rounded-xl border border-white/5 mb-6"
                  />
                )}
                <div className="space-y-4">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-accent-cyan">{formValues.category || 'general'}</span>
                  <h1 className="text-3xl font-extrabold tracking-tight">{formValues.title || 'Untitled Project Document'}</h1>
                  <div className="flex items-center gap-3 text-[11px] text-stone border-b border-white/5 pb-4 mb-4">
                    <span>Reading: {readingTime} min</span>
                    <span>•</span>
                    <span>Language: {formValues.language}</span>
                  </div>
                  {/* HTML render */}
                  <div
                    className="text-[13px] text-stone/95 leading-relaxed prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: formValues.content }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 5: PUBLISH CONFIG */}
      {activeStep === 'publish' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <Card className="lg:col-span-8 p-6 space-y-6">
            <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider">Release Workflow</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-stone uppercase tracking-wider block mb-1.5">Publication Status</label>
                <select {...register('status')} className="w-full bg-charcoal/20 border border-white/5 rounded-lg text-[13px] px-3 py-2 text-warm-white outline-none focus:border-white/20">
                  <option value="draft">Save as Draft</option>
                  <option value="published">Publish Immediately</option>
                  <option value="scheduled">Schedule Publication</option>
                  <option value="archived">Archive Content</option>
                </select>
              </div>

              {formValues.status === 'scheduled' && (
                <Input
                  label="Publish Date & Time"
                  type="datetime-local"
                  {...register('scheduledAt')}
                />
              )}
            </div>

            {/* Version rollback Note */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">
                Version Release Note (Required for Audit Trail)
              </label>
              <textarea
                {...register('versionNote')}
                placeholder="Describe what changed in this version snapshot (e.g. 'Updated introduction context, fixed links')."
                className="w-full h-24 bg-charcoal/20 border border-white/5 rounded-lg text-[13px] px-3 py-2 text-warm-white outline-none focus:border-white/20 placeholder:text-stone/30"
              />
              {errors.versionNote && <p className="text-accent-pink text-[11px] font-mono">{errors.versionNote.message}</p>}
            </div>

            <Button type="submit" variant="primary" className="magnetic-item w-full py-2.5">
              <Save className="w-4 h-4" />
              <span>Confirm & Save Changes</span>
            </Button>
          </Card>

          <Card className="lg:col-span-4 p-5 space-y-4 text-[12px] text-stone">
            <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-accent-cyan" />
              <span>Release Summary</span>
            </h3>
            <div className="space-y-3 font-mono">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Title Length:</span>
                <span className="text-warm-white">{formValues.title.length} chars</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Slug Status:</span>
                <span className="text-accent-emerald">Valid</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Total Words:</span>
                <span className="text-warm-white">{wordCount}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Reading Time:</span>
                <span className="text-warm-white">{readingTime} min</span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Bottom Step Nav Controls */}
      <div className="flex justify-between items-center border-t border-white/5 pt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            const currentIdx = STEPS.findIndex(s => s.id === activeStep);
            if (currentIdx > 0) setActiveStep(STEPS[currentIdx - 1].id);
          }}
          disabled={activeStep === 'basic'}
          className="text-[12px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Step</span>
        </Button>

        <Button
          type="button"
          variant={activeStep === 'publish' ? 'accent' : 'secondary'}
          onClick={() => {
            const currentIdx = STEPS.findIndex(s => s.id === activeStep);
            if (currentIdx < STEPS.length - 1) {
              setActiveStep(STEPS[currentIdx + 1].id);
            } else {
              handleSubmit(onFormSubmit)();
            }
          }}
          className="text-[12px]"
        >
          <span>{activeStep === 'publish' ? 'Save & Finish' : 'Next Step'}</span>
          {activeStep !== 'publish' && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>

    </form>
  );
}

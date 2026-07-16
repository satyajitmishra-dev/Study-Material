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
import { saveProjectAction, generateAiContentAction, createCategoryAction } from '@/lib/actions/cms';
import TipTapEditor from './TipTapEditor';
import ImageUploadField from './ImageUploadField';
import { SeoEngine, SeoAuditResult } from '@/lib/seo/SeoEngine';
import { QualityScoreEngine } from '@/lib/seo/QualityScoreEngine';

interface ProjectEditorWizardProps {
  project: any | null; // CmsProject or null
  categories?: any[]; // Dynamic categories from database
}

const DEFAULT_CATEGORIES = [
  { id: '1', name: 'React', slug: 'react' },
  { id: '2', name: 'TypeScript', slug: 'typescript' },
  { id: '3', name: 'AI', slug: 'ai' },
  { id: '4', name: 'Backend', slug: 'backend' },
  { id: '5', name: 'CSS', slug: 'css' },
  { id: '6', name: 'Database', slug: 'database' }
];

const STEPS = [
  { id: 'basic', name: '1. Basic Info' },
  { id: 'content', name: '2. Editor' },
  { id: 'preview', name: '3. Preview' },
  { id: 'seo', name: '4. SEO Studio' },
  { id: 'publish', name: '5. Guidelines & Publish' },
  { id: 'share', name: '6. Share' },
];

export default function ProjectEditorWizard({ project, categories = [] }: ProjectEditorWizardProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<string>('basic');

  // Dynamic Category state management
  const initialCategories = useMemo(() => {
    const list = [...categories];
    // Add default ones if they are not already in the database list
    DEFAULT_CATEGORIES.forEach(d => {
      if (!list.some(c => c.name.toLowerCase() === d.name.toLowerCase() || c.slug === d.slug)) {
        list.push(d);
      }
    });
    return list;
  }, [categories]);

  const [categoriesList, setCategoriesList] = useState(initialCategories);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    setCategoriesList(initialCategories);
  }, [initialCategories]);

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name.');
      return;
    }
    setIsAddingCategory(true);
    try {
      const res = await createCategoryAction(newCategoryName, newCategoryDesc);
      if (res.success && res.category) {
        setCategoriesList(prev => [...prev, res.category]);
        setValue('category', res.category.name, { shouldDirty: true, shouldValidate: true });
        setNewCategoryName('');
        setNewCategoryDesc('');
        setShowNewCategoryInput(false);
      } else {
        alert(res.error || 'Failed to create category.');
      }
    } catch (err) {
      alert('An error occurred while creating category.');
    } finally {
      setIsAddingCategory(false);
    }
  };
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

  // Content Quality Score engine analysis
  const qualityAnalysis = useMemo(() => {
    return QualityScoreEngine.analyze(formValues.title || '', formValues.content || '');
  }, [formValues.title, formValues.content]);

  // Sync Quality Score to Zod state
  useEffect(() => {
    setValue('qualityScore', qualityAnalysis.score, { shouldDirty: false });
  }, [qualityAnalysis.score, setValue]);

  const [acceptedGuidelines, setAcceptedGuidelines] = useState(false);
  const [newPostUrl, setNewPostUrl] = useState('');

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
    if (!acceptedGuidelines && data.status === 'published') {
      alert('Please check and accept the Community Guidelines before publishing.');
      return;
    }
    setSaveStatus('saving');
    try {
      const res = await saveProjectAction(project?.id || null, {
        ...data,
        qualityScore: qualityAnalysis.score,
        postHash: `hash-${data.title.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        versionNote: data.versionNote || 'Published final release version',
      });

      if (res.success && res.project) {
        setSaveStatus('saved');
        setIsDirtyState(false);
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        setNewPostUrl(`${baseUrl}/posts/${res.project.slug}`);
        setActiveStep('share');
      } else {
        setSaveStatus('error');
        alert(res.error || 'Failed to save publication settings.');
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
                <select
                  {...register('category')}
                  className="w-full bg-charcoal/20 border border-white/5 rounded-lg text-[13px] px-3 py-2 text-warm-white outline-none focus:border-white/20"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__new__') {
                      setShowNewCategoryInput(true);
                      const prevVal = watch('category') || categoriesList[0]?.name || 'React';
                      setValue('category', prevVal);
                    } else {
                      setValue('category', val, { shouldDirty: true, shouldValidate: true });
                    }
                  }}
                >
                  {categoriesList.map((cat) => (
                    <option key={cat.id || cat.slug} value={cat.name} className="bg-[#1c1c1e] text-warm-white">
                      {cat.name}
                    </option>
                  ))}
                  <option value="__new__" className="bg-[#1c1c1e] text-accent-cyan font-semibold">
                    + Add New Category...
                  </option>
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

            {showNewCategoryInput && (
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-[12px] font-bold text-accent-cyan uppercase tracking-wider font-mono">Create New Project Category</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Category Name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Next.js, Docker, Web3"
                  />
                  <Input
                    label="Description (Optional)"
                    value={newCategoryDesc}
                    onChange={(e) => setNewCategoryDesc(e.target.value)}
                    placeholder="Provide a brief description of the topic..."
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 text-[11px] px-3.5"
                    onClick={() => {
                      setShowNewCategoryInput(false);
                      setNewCategoryName('');
                      setNewCategoryDesc('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-8 text-[11px] px-3.5 bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20 hover:bg-accent-cyan/20 font-semibold"
                    onClick={handleAddNewCategory}
                    disabled={isAddingCategory}
                  >
                    {isAddingCategory ? 'Creating...' : 'Create Category'}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <Card className="lg:col-span-4 p-5 space-y-5">
            <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider">Asset Attachments</h3>
            <ImageUploadField
              label="Cover Image"
              value={watch('coverImage') || ''}
              onChange={(url) => setValue('coverImage', url, { shouldDirty: true })}
              field="coverImage"
              aspectRatio="16/9"
            />
            <ImageUploadField
              label="Thumbnail"
              value={watch('thumbnail') || ''}
              onChange={(url) => setValue('thumbnail', url, { shouldDirty: true })}
              field="thumbnail"
              aspectRatio="1/1"
            />
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

            {/* Quality Score Analysis widget */}
            <div className="border-t border-white/5 pt-4 mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-stone font-semibold">Content Quality Score</span>
                <span className={`text-[16px] font-bold font-mono ${
                  qualityAnalysis.score >= 80 ? 'text-accent-emerald' : qualityAnalysis.score >= 50 ? 'text-accent-cyan' : 'text-accent-pink'
                }`}>
                  {qualityAnalysis.score}/100
                </span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    qualityAnalysis.score >= 80 ? 'bg-accent-emerald' : qualityAnalysis.score >= 50 ? 'bg-accent-cyan' : 'bg-accent-pink'
                  }`}
                  style={{ width: `${qualityAnalysis.score}%` }}
                />
              </div>

              <div className="space-y-1.5 pt-2 max-h-[180px] overflow-y-auto custom-scrollbar">
                {qualityAnalysis.suggestions.length > 0 ? (
                  qualityAnalysis.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[10.5px] text-stone/80">
                      <span className="text-accent-orange font-bold shrink-0">•</span>
                      <span>{s}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-accent-emerald font-mono">✓ High quality draft ready to publish!</p>
                )}
              </div>
            </div>
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
              {formValues.seoTitle && (
                <div className="flex items-center gap-2 -mt-2">
                  <div className={`h-1 flex-1 rounded-full ${(formValues.seoTitle?.length || 0) <= 60 ? 'bg-accent-emerald/30' : 'bg-accent-pink/30'}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${(formValues.seoTitle?.length || 0) <= 60 ? 'bg-accent-emerald' : 'bg-accent-pink'}`}
                      style={{ width: `${Math.min(100, ((formValues.seoTitle?.length || 0) / 60) * 100)}%` }}
                    />
                  </div>
                  <span className={`text-[9px] font-mono ${(formValues.seoTitle?.length || 0) <= 60 ? 'text-accent-emerald' : 'text-accent-pink'}`}>
                    {formValues.seoTitle?.length || 0}/60
                  </span>
                </div>
              )}

              <Input label="Meta Description" {...register('seoDescription')} placeholder="SERP Snippet Description (ideal: 120-160 chars)" />
              {formValues.seoDescription && (
                <div className="flex items-center gap-2 -mt-2">
                  <div className={`h-1 flex-1 rounded-full ${(formValues.seoDescription?.length || 0) <= 160 ? 'bg-accent-emerald/30' : 'bg-accent-pink/30'}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${(formValues.seoDescription?.length || 0) <= 160 ? 'bg-accent-emerald' : 'bg-accent-pink'}`}
                      style={{ width: `${Math.min(100, ((formValues.seoDescription?.length || 0) / 160) * 100)}%` }}
                    />
                  </div>
                  <span className={`text-[9px] font-mono ${(formValues.seoDescription?.length || 0) <= 160 ? 'text-accent-emerald' : 'text-accent-pink'}`}>
                    {formValues.seoDescription?.length || 0}/160
                  </span>
                </div>
              )}

              {/* Smart Keywords with auto-comma */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Focus Keywords (Comma Separated)</label>
                <input
                  {...register('seoKeywords')}
                  placeholder="e.g. Next.js 16, React Compiler, server components"
                  className="w-full px-3 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none transition-all duration-200 focus:border-white/20 focus:bg-charcoal/40 focus:ring-1 focus:ring-white/10 placeholder:text-stone/60"
                  onPaste={(e) => {
                    e.preventDefault();
                    const pasted = e.clipboardData.getData('text/plain').trim();
                    const current = (formValues.seoKeywords || '').trim();
                    // Normalize: split by newlines, tabs, semicolons, pipes, or commas → rejoin with comma+space
                    const keywords = pasted
                      .split(/[\n\r\t;|,]+/)
                      .map((k: string) => k.trim())
                      .filter(Boolean);
                    const normalized = keywords.join(', ');
                    const newValue = current
                      ? `${current.replace(/,\s*$/, '')}, ${normalized}`
                      : normalized;
                    setValue('seoKeywords', newValue, { shouldDirty: true });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = (formValues.seoKeywords || '').trim();
                      if (val && !val.endsWith(',')) {
                        setValue('seoKeywords', val + ', ', { shouldDirty: true });
                      }
                    }
                  }}
                />
                {formValues.seoKeywords && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {formValues.seoKeywords.split(',').map((kw: string, idx: number) => {
                      const trimmed = kw.trim();
                      if (!trimmed) return null;
                      return (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-accent-cyan/10 border border-accent-cyan/15 text-[10px] text-accent-cyan font-medium">
                          {trimmed}
                        </span>
                      );
                    })}
                  </div>
                )}
                <p className="text-[10px] text-stone/50 mt-0.5">Paste keywords from any format — they auto-normalize to comma-separated. Press Enter to add a separator.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Smart Canonical URL */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Canonical URL</label>
                  <input
                    {...register('canonical')}
                    placeholder="Auto-generated from slug"
                    className="w-full px-3 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none transition-all duration-200 focus:border-white/20 focus:bg-charcoal/40 focus:ring-1 focus:ring-white/10 placeholder:text-stone/60"
                  />
                  {!formValues.canonical && formValues.slug && (
                    <button
                      type="button"
                      onClick={() => {
                        const baseUrl = typeof window !== 'undefined'
                          ? window.location.origin
                          : 'https://studymaterial.utool.in';
                        setValue('canonical', `${baseUrl}/posts/${formValues.slug}`, { shouldDirty: true });
                      }}
                      className="flex items-center gap-1.5 text-[10px] text-accent-cyan hover:text-accent-cyan/80 cursor-pointer transition-colors w-fit"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Auto-generate: /posts/{formValues.slug}</span>
                    </button>
                  )}
                  {formValues.canonical && (
                    <span className="text-[10px] text-accent-emerald font-mono truncate">✓ {formValues.canonical}</span>
                  )}
                </div>

                {/* Robots Rules with Template Selector */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Robots Rules</label>
                  <input
                    {...register('robots')}
                    placeholder="index, follow"
                    className="w-full px-3 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none transition-all duration-200 focus:border-white/20 focus:bg-charcoal/40 focus:ring-1 focus:ring-white/10 placeholder:text-stone/60"
                  />
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {[
                      { value: 'index, follow', label: 'Index & Follow', hint: 'Default — crawl and follow links', color: 'text-accent-emerald border-accent-emerald/20 bg-accent-emerald/5' },
                      { value: 'noindex, follow', label: 'No Index', hint: 'Hide from search, follow links', color: 'text-accent-orange border-accent-orange/20 bg-accent-orange/5' },
                      { value: 'index, nofollow', label: 'No Follow', hint: 'Index page but don\'t follow links', color: 'text-accent-cyan border-accent-cyan/20 bg-accent-cyan/5' },
                      { value: 'noindex, nofollow', label: 'Block All', hint: 'Hide completely from search engines', color: 'text-accent-pink border-accent-pink/20 bg-accent-pink/5' },
                      { value: 'noindex, nofollow, noarchive', label: 'Block + No Cache', hint: 'Block crawling and cached copies', color: 'text-accent-pink border-accent-pink/20 bg-accent-pink/5' },
                    ].map(template => (
                      <button
                        key={template.value}
                        type="button"
                        title={template.hint}
                        onClick={() => setValue('robots', template.value, { shouldDirty: true })}
                        className={`px-1.5 py-0.5 rounded border text-[9px] font-medium cursor-pointer transition-all hover:opacity-80 ${
                          formValues.robots === template.value
                            ? template.color + ' font-bold'
                            : 'text-stone/60 border-white/5 bg-transparent hover:border-white/10'
                        }`}
                      >
                        {template.label}
                      </button>
                    ))}
                  </div>
                  {formValues.robots && (
                    <p className="text-[9px] text-stone/40 mt-0.5 font-mono">
                      {formValues.robots === 'index, follow' && '✓ Search engines will crawl this page and follow all outbound links.'}
                      {formValues.robots === 'noindex, follow' && '⚠ Page hidden from search results, but links will be followed.'}
                      {formValues.robots === 'index, nofollow' && '⚠ Page indexed, but outbound links will NOT pass authority.'}
                      {formValues.robots === 'noindex, nofollow' && '🚫 Page is fully hidden — not indexed and links are not followed.'}
                      {formValues.robots === 'noindex, nofollow, noarchive' && '🚫 Fully blocked — not indexed, not followed, and no cached copy stored.'}
                    </p>
                  )}
                </div>
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

            {/* Community Guidelines Checkbox */}
            {formValues.status === 'published' && (
              <div className="p-4 rounded-xl bg-onyx/40 border border-white/5 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="guidelines-checkbox"
                  checked={acceptedGuidelines}
                  onChange={(e) => setAcceptedGuidelines(e.target.checked)}
                  className="mt-0.5 w-4.5 h-4.5 accent-accent-cyan rounded border-white/10 bg-transparent cursor-pointer"
                />
                <label htmlFor="guidelines-checkbox" className="text-[12px] text-stone leading-relaxed select-none cursor-pointer">
                  I accept the <span className="text-accent-cyan hover:underline font-bold">Community Guidelines</span>. I certify that this content contains no plagiarism, spam, marketing links, or abusive language.
                </label>
              </div>
            )}

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
                <span>Quality Score:</span>
                <span className={`font-bold ${qualityAnalysis.score >= 80 ? 'text-accent-emerald' : 'text-accent-cyan'}`}>{qualityAnalysis.score}/100</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Title Length:</span>
                <span className="text-warm-white">{formValues.title.length} chars</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Total Words:</span>
                <span className="text-warm-white">{qualityAnalysis.wordCount}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Reading Time:</span>
                <span className="text-warm-white">{qualityAnalysis.readingTimeMin} min</span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* STEP 6: SHARE PANEL */}
      {activeStep === 'share' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto text-center py-12 space-y-6">
          <div className="w-16 h-16 rounded-full bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center mx-auto text-accent-emerald">
            <Check className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-warm-white">🎉 Your Content is Live!</h2>
            <p className="text-[13px] text-stone leading-relaxed font-light">
              It has been successfully compiled and index-synced into the portal discovery engines. Share it with your network!
            </p>
          </div>

          <Card className="p-5 space-y-4 bg-charcoal/20 border-white/5 text-left">
            <span className="text-[10px] font-mono text-stone uppercase tracking-wider block font-bold">Share Links</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`https://twitter.com/intent/tweet?text=Check out my latest post: ${encodeURIComponent(formValues.title)} ${encodeURIComponent(newPostUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-warm-white text-[12px] font-bold transition-all"
              >
                <span>Share on X</span>
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(newPostUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-warm-white text-[12px] font-bold transition-all"
              >
                <span>Share on LinkedIn</span>
              </a>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={newPostUrl}
                className="flex-1 bg-onyx px-3 py-1.5 rounded-lg border border-white/5 text-[11px] text-stone font-mono select-all outline-none"
              />
              <Button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(newPostUrl);
                  alert('Copied link to clipboard!');
                }}
                className="h-9 text-[11px]"
              >
                Copy Link
              </Button>
            </div>
          </Card>

          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/studio/projects')}
            className="w-full justify-center text-[12px] uppercase font-bold tracking-wider py-2.5"
          >
            Back to Dashboard
          </Button>
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
            if (activeStep === 'publish') {
              handleSubmit(onFormSubmit)();
            } else if (activeStep === 'share') {
              router.push('/studio/projects');
            } else if (currentIdx < STEPS.length - 1) {
              setActiveStep(STEPS[currentIdx + 1].id);
            }
          }}
          className="text-[12px]"
          disabled={activeStep === 'share'}
        >
          <span>{activeStep === 'publish' ? 'Save & Finish' : activeStep === 'share' ? 'Done' : 'Next Step'}</span>
          {activeStep !== 'publish' && activeStep !== 'share' && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>

    </form>
  );
}

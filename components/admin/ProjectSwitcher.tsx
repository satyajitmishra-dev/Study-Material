'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Plus, 
  Search, 
  Check, 
  Folder, 
  X, 
  Sparkles,
  Command,
  HelpCircle,
  Globe
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  setActiveProjectAction, 
  getProjectsAction, 
  createProjectAction 
} from '@/lib/actions/projectContext';

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface ProjectSwitcherProps {
  activeProject: {
    projectId: string;
    projectName: string;
    projectSlug: string;
    organizationName: string;
  };
}

export default function ProjectSwitcher({ activeProject }: ProjectSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create Project Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [newProjName, setNewProjName] = useState('');
  const [newProjSlug, setNewProjSlug] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load all projects on open
  useEffect(() => {
    if (isOpen) {
      getProjectsAction().then((data: any) => {
        setProjects(data);
      });
      // Focus search input
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered projects
  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-generate slug from name
  useEffect(() => {
    if (wizardStep === 1) {
      setNewProjSlug(
        newProjName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  }, [newProjName, wizardStep]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => 
        prev < filteredProjects.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => 
        prev > 0 ? prev - 1 : filteredProjects.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filteredProjects.length) {
        handleSwitchProject(filteredProjects[focusedIndex].id);
      } else if (searchQuery.trim().length > 0 && filteredProjects.length === 0) {
        // Trigger create project
        handleOpenCreateWizard();
      }
    }
  };

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[focusedIndex]) {
        (items[focusedIndex] as HTMLElement).scrollIntoView({
          block: 'nearest'
        });
      }
    }
  }, [focusedIndex]);

  const handleSwitchProject = async (id: string) => {
    await setActiveProjectAction(id);
    setIsOpen(false);
    router.refresh();
  };

  const handleOpenCreateWizard = () => {
    setIsOpen(false);
    setWizardStep(1);
    setNewProjName('');
    setNewProjSlug('');
    setNewProjDesc('');
    setShowCreateModal(true);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName || !newProjSlug) return;
    
    setIsSubmitting(true);
    try {
      const res = await createProjectAction(newProjName, newProjSlug, newProjDesc);
      if (res.success) {
        setShowCreateModal(false);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full select-none" ref={containerRef}>
      {/* Switcher Button Capsule */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-charcoal/40 hover:bg-charcoal/70 border border-white/5 hover:border-white/10 shadow-premium transition-all duration-200 cursor-pointer group active:scale-[0.99]"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-accent-violet to-accent-cyan flex items-center justify-center text-[11px] font-extrabold text-white shadow-glow-violet/5 shrink-0">
            {activeProject.projectName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0 text-left">
            <span className="text-[10px] text-stone font-semibold tracking-wider uppercase font-mono truncate leading-none">
              {activeProject.organizationName}
            </span>
            <span className="text-[13px] font-bold text-warm-white tracking-tight truncate mt-1">
              {activeProject.projectName}
            </span>
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-stone group-hover:text-warm-white transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Switcher Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 right-0 z-50 mt-2 p-2 rounded-xl bg-onyx-dark/95 border border-white/10 backdrop-blur-xl shadow-premium space-y-2 overflow-hidden"
          >
            {/* Search Input Container */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone" />
              <input 
                ref={searchInputRef}
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setFocusedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                className="w-full pl-8.5 pr-3 py-2 text-[12px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white placeholder:text-stone/50 outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all font-sans"
              />
              <span className="absolute right-3 top-2.5 flex items-center gap-0.5 text-[9px] font-mono text-stone/40">
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </span>
            </div>

            {/* Switchable List */}
            <div 
              ref={listRef}
              className="max-h-[220px] overflow-y-auto custom-scrollbar space-y-0.5 pr-1"
            >
              {filteredProjects.map((p, idx) => {
                const isActive = p.id === activeProject.projectId;
                const isFocused = idx === focusedIndex;

                return (
                  <div
                    key={p.id}
                    onClick={() => handleSwitchProject(p.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[12.5px] cursor-pointer transition-all duration-100
                      ${isActive ? 'bg-white/5 text-warm-white font-semibold' : 'text-stone hover:text-warm-white hover:bg-white/[0.02]'}
                      ${isFocused ? 'border border-white/10 bg-white/[0.03]' : 'border border-transparent'}
                    `}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Folder className="w-3.5 h-3.5 text-stone/60 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{p.name}</span>
                        <span className="text-[9.5px] text-stone/50 font-mono truncate">{p.slug}</span>
                      </div>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 text-accent-cyan" />}
                  </div>
                );
              })}

              {filteredProjects.length === 0 && (
                <div className="py-6 text-center text-stone/60 text-[12px] flex flex-col items-center justify-center gap-2">
                  <HelpCircle className="w-5 h-5 text-stone/40" />
                  <span>No projects found matching query.</span>
                </div>
              )}
            </div>

            {/* Footer Quick Actions */}
            <div className="border-t border-white/5 pt-2 flex flex-col gap-1">
              <button 
                onClick={handleOpenCreateWizard}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11.5px] text-accent-cyan hover:text-white bg-accent-cyan/5 hover:bg-accent-cyan/10 border border-accent-cyan/10 hover:border-accent-cyan/20 cursor-pointer font-medium tracking-wide transition-all justify-center active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Project</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multi-Step Creation Wizard Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md p-6 rounded-2xl bg-charcoal/90 border border-white/10 backdrop-blur-xl shadow-premium space-y-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-cyan" />
                  <h3 className="text-[16px] font-bold text-warm-white tracking-tight">
                    Create Workspace Project
                  </h3>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 text-stone hover:text-warm-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Wizard Steps indicator */}
              <div className="flex items-center justify-between px-2">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all
                      ${step === wizardStep 
                        ? 'bg-accent-cyan border-accent-cyan text-onyx shadow-glow-cyan/5' 
                        : step < wizardStep 
                          ? 'bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan' 
                          : 'bg-white/5 border-white/10 text-stone'
                      }`}
                    >
                      {step}
                    </div>
                    <span className={`text-[11px] font-medium transition-colors
                      ${step === wizardStep ? 'text-warm-white font-bold' : 'text-stone'}`}
                    >
                      {step === 1 ? 'Metadata' : step === 2 ? 'Details' : 'Confirm'}
                    </span>
                    {step < 3 && <div className="w-6 h-px bg-white/5" />}
                  </div>
                ))}
              </div>

              {/* Wizard Content Form */}
              <form onSubmit={handleCreateProject} className="space-y-4">
                {wizardStep === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">
                        Project Name
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Study Materials"
                        value={newProjName}
                        onChange={(e) => setNewProjName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-stone uppercase tracking-wider flex items-center justify-between">
                        <span>Project Slug</span>
                        <span className="text-[9.5px] font-normal text-stone/50 font-mono lower-case">Auto-generated</span>
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. study-materials"
                        value={newProjSlug}
                        onChange={(e) => setNewProjSlug(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all font-mono"
                      />
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">
                        Project Description
                      </label>
                      <textarea 
                        rows={3}
                        placeholder="Provide a short description of the website, brand, or client represented by this project..."
                        value={newProjDesc}
                        onChange={(e) => setNewProjDesc(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all resize-none font-sans"
                      />
                    </div>
                    <div className="p-3.5 rounded-lg bg-white/[0.01] border border-white/5 flex gap-2.5 items-start">
                      <Globe className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11.5px] font-bold text-warm-white">Default Domain Scoping</span>
                        <span className="text-[10px] text-stone leading-relaxed">
                          Your CMS content and media directories will automatically be isolated under the <strong>{newProjSlug || 'project'}.localhost</strong> domain context.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-4 text-left animate-fadeIn">
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                      <div className="flex justify-between text-[12.5px] border-b border-white/5 pb-2">
                        <span className="text-stone">Organization:</span>
                        <span className="text-warm-white font-semibold">{activeProject.organizationName}</span>
                      </div>
                      <div className="flex justify-between text-[12.5px] border-b border-white/5 pb-2">
                        <span className="text-stone">Project Name:</span>
                        <span className="text-warm-white font-semibold">{newProjName}</span>
                      </div>
                      <div className="flex justify-between text-[12.5px] border-b border-white/5 pb-2">
                        <span className="text-stone">URL Slug:</span>
                        <span className="text-warm-white font-mono text-[11.5px]">{newProjSlug}</span>
                      </div>
                      <div className="flex flex-col gap-1 text-[12.5px]">
                        <span className="text-stone">Description:</span>
                        <p className="text-warm-white text-[11.5px] italic font-light leading-relaxed">
                          {newProjDesc || 'No description provided.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Wizard Navigation Footer */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
                  {wizardStep > 1 ? (
                    <button 
                      type="button"
                      onClick={() => setWizardStep(prev => prev - 1)}
                      className="px-3.5 py-2 text-[12px] font-medium text-stone hover:text-warm-white hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5 transition-all cursor-pointer"
                    >
                      Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {wizardStep < 3 ? (
                    <button 
                      type="button"
                      disabled={wizardStep === 1 && (!newProjName || !newProjSlug)}
                      onClick={() => setWizardStep(prev => prev + 1)}
                      className="px-4 py-2 text-[12px] font-semibold text-onyx bg-warm-white hover:bg-mist disabled:opacity-50 disabled:pointer-events-none rounded-lg cursor-pointer transition-all active:scale-[0.98]"
                    >
                      Next
                    </button>
                  ) : (
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-[12px] font-semibold text-onyx bg-accent-cyan hover:bg-accent-cyan/95 disabled:opacity-50 disabled:pointer-events-none rounded-lg cursor-pointer transition-all active:scale-[0.98] shadow-glow-cyan/5 flex items-center gap-1.5"
                    >
                      {isSubmitting ? 'Creating...' : 'Create & Switch'}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

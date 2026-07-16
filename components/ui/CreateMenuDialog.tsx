'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  FolderGit2, 
  BookMarked, 
  Compass, 
  Award, 
  Share2, 
  Calendar, 
  HelpCircle, 
  MessageSquare, 
  Plus, 
  X,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface CreateMenuDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateMenuDialog({ isOpen, onClose }: CreateMenuDialogProps) {
  const createItems = [
    { title: 'Write Article', desc: 'Draft tech articles & tutorials', icon: FileText, color: 'text-accent-pink bg-accent-pink/10 border-accent-pink/20', href: '/studio/projects/create?type=article' },
    { title: 'Showcase Project', desc: 'Register repository & live demo links', icon: FolderGit2, color: 'text-accent-violet bg-accent-violet/10 border-accent-violet/20', href: '/studio/projects/create?type=project' },
    { title: 'Upload Notes', desc: 'Add lecture slides, sheets, cheat files', icon: BookMarked, color: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20', href: '/notes/upload' },
    { title: 'Create Roadmap', desc: 'Publish interactive curriculum nodes', icon: Compass, color: 'text-accent-orange bg-accent-orange/10 border-accent-orange/20', href: '/studio/projects/create?type=roadmap' },
    { title: 'Create Announcement', desc: 'Share platform or project updates', icon: Award, color: 'text-accent-amber bg-accent-amber/10 border-accent-amber/20', href: '/studio/projects/create?type=announcement' },
    { title: 'Share Resource', desc: 'Bookmark technical references & links', icon: Share2, color: 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20', href: '/community' },
    { title: 'Create Event', desc: 'Schedule AMA or coding study group', icon: Calendar, color: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20', href: '/community' },
    { title: 'Ask Question', desc: 'Query community on developer road blocks', icon: HelpCircle, color: 'text-accent-pink bg-accent-pink/10 border-accent-pink/20', href: '/community' },
    { title: 'Create Discussion', desc: 'Start topic on architectural designs', icon: MessageSquare, color: 'text-accent-violet bg-accent-violet/10 border-accent-violet/20', href: '/community' },
    { title: 'Create Poll', desc: 'Gather votes on tools and frameworks', icon: Plus, color: 'text-accent-orange bg-accent-orange/10 border-accent-orange/20', href: '/community' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-onyx/85 backdrop-blur-md"
          />

          {/* Modal box */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-charcoal/80 border border-white/10 rounded-2xl shadow-premium p-6 overflow-hidden backdrop-blur-xl space-y-6"
          >
            {/* Background design */}
            <div className="absolute inset-0 grid-background opacity-10 pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-accent-cyan glow-glow" />

            {/* Header */}
            <div className="flex justify-between items-center relative z-10 border-b border-white/5 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-accent-cyan font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Universal Create Flow</span>
                </span>
                <h3 className="text-xl font-bold text-warm-white">Create New Workspace Content</h3>
              </div>
              <button 
                onClick={onClose} 
                className="p-1 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 text-stone hover:text-warm-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Creation Menu Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 max-h-[360px] overflow-y-auto pr-1">
              {createItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link href={item.href} key={idx} onClick={onClose}>
                    <div className="p-4 rounded-xl border border-white/5 hover:border-white/10 bg-charcoal/30 hover:bg-charcoal/50 flex gap-4 transition-all duration-150 cursor-pointer group">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5 truncate">
                        <h4 className="text-[13px] font-bold text-warm-white group-hover:text-accent-cyan transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-stone font-light leading-normal whitespace-normal">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-2 text-center text-[10px] text-stone/50 font-mono">
              StudyMaterial Creation Wizard engine v4.0. Select any tile to proceed.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Terminal, 
  BookOpen, 
  Code2, 
  Globe2, 
  BarChart3, 
  ArrowRight,
  Sun,
  Moon,
  Trash2
} from 'lucide-react';
import { Storage } from '@/lib/storage';
import { MOCK_COURSES, MOCK_PROJECTS } from '@/lib/mockData';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle Global keypresses for close and navigate
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const activeItem = filteredItems[selectedIndex];
        if (activeItem) {
          activeItem.action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, query]);

  // Base list of items
  const items = [
    // Workspaces
    { id: 'ws-home', title: 'Open Home Dashboard', category: 'Workspaces', icon: Terminal, action: () => { router.push('/'); onClose(); } },
    { id: 'ws-learn', title: 'Open Learning Workspace', category: 'Workspaces', icon: BookOpen, action: () => { router.push('/learn'); onClose(); } },
    { id: 'ws-projects', title: 'Open Project Space', category: 'Workspaces', icon: Code2, action: () => { router.push('/projects'); onClose(); } },
    { id: 'ws-admin', title: 'Open Publishing Studio', category: 'Workspaces', icon: Terminal, action: () => { router.push('/admin'); onClose(); } },
    { id: 'ws-seo', title: 'Open SEO Studio', category: 'Workspaces', icon: Globe2, action: () => { router.push('/admin/seo'); onClose(); } },
    { id: 'ws-analytics', title: 'Open Analytics Center', category: 'Workspaces', icon: BarChart3, action: () => { router.push('/admin/analytics'); onClose(); } },
    
    // Quick Actions
    { id: 'act-dark', title: 'Switch to Dark Mode', category: 'System Settings', icon: Moon, action: () => { document.documentElement.classList.add('dark'); onClose(); } },
    { id: 'act-light', title: 'Switch to Light Mode', category: 'System Settings', icon: Sun, action: () => { document.documentElement.classList.remove('dark'); onClose(); } },
    { id: 'act-reset', title: 'Reset Local Learning Progress', category: 'Danger Zone', icon: Trash2, action: () => { Storage.saveProgress({}); alert('Progress reset.'); onClose(); } },
  ];

  // Map courses and projects into command items dynamically
  MOCK_COURSES.forEach(c => {
    items.push({
      id: `course-${c.id}`,
      title: `Start Course: ${c.title}`,
      category: 'Courses',
      icon: BookOpen,
      action: () => { router.push(`/learn/${c.id}`); onClose(); }
    });
  });

  MOCK_PROJECTS.forEach(p => {
    items.push({
      id: `proj-${p.id}`,
      title: `View Project: ${p.name}`,
      category: 'Projects',
      icon: Code2,
      action: () => { router.push(`/projects/${p.id}`); onClose(); }
    });
  });

  // Filter items based on query
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  // Group items by category for rendering
  const categories = Array.from(new Set(filteredItems.map(item => item.category)));

  // Flattened index mapping helper to sync visual items index with flat list
  let flatIndexCounter = 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-onyx/85 backdrop-blur-sm"
          />

          {/* Palette Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-charcoal/80 border border-white/10 rounded-2xl shadow-premium overflow-hidden backdrop-blur-xl flex flex-col max-h-[500px]"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-onyx/40">
              <Search className="w-5 h-5 text-stone shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search workspaces, lessons, projects, or action palette..."
                className="w-full bg-transparent border-0 outline-0 ring-0 text-[14px] text-warm-white placeholder-stone"
              />
              <span className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-stone">ESC</span>
            </div>

            {/* Results List */}
            <div className="overflow-y-auto flex-1 p-2 space-y-4">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-stone text-[13px]">
                  No matching results found
                </div>
              ) : (
                categories.map(category => {
                  const categoryItems = filteredItems.filter(i => i.category === category);
                  return (
                    <div key={category} className="space-y-1">
                      <h3 className="px-3 text-[11px] font-semibold text-stone uppercase tracking-widest py-1">
                        {category}
                      </h3>
                      {categoryItems.map(item => {
                        const itemIndex = flatIndexCounter++;
                        const isSelected = itemIndex === selectedIndex;
                        const Icon = item.icon;
                        
                        return (
                          <div
                            key={item.id}
                            onClick={item.action}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-[13px]
                              ${isSelected 
                                ? 'bg-white/10 text-warm-white' 
                                : 'text-stone hover:bg-white/5 hover:text-fog'
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className={`w-4 h-4 ${isSelected ? 'text-warm-white' : 'text-stone'}`} />
                              <span>{item.title}</span>
                            </div>
                            {isSelected && (
                              <div className="flex items-center gap-1 text-[11px] text-stone">
                                <span>Execute</span>
                                <ArrowRight className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/5 bg-onyx/20 flex items-center justify-between text-[11px] text-stone">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
              </div>
              <div>
                <span>Press <kbd className="bg-white/5 border border-white/10 px-1 py-0.5 rounded">Ctrl + K</kbd> anywhere</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

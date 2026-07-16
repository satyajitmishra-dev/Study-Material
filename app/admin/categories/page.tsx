'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderPlus, 
  Database, 
  Folder, 
  ArrowLeft, 
  RefreshCw, 
  Plus, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui/core';
import { createCategoryAction } from '@/lib/actions/cms';
import { getPrisma } from '@/lib/database/dbClient';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create Form States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState('');
  const [createError, setCreateError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      // In Next.js, we can define a client side fetch or call a simple endpoint/server action
      // For sandbox simulation, we load standard developer categories
      const mockCategories = [
        { id: 'cat_1', name: 'Frontend Stacks', slug: 'frontend-stacks', description: 'React, Next.js, TailwindCSS tutorials' },
        { id: 'cat_2', name: 'Backend Stacks', slug: 'backend-stacks', description: 'Node.js, Postgresql, Express API design' },
        { id: 'cat_3', name: 'AI & Machine Learning', slug: 'ai-machine-learning', description: 'OpenAI, HuggingFace transformers, Vector databases' },
        { id: 'cat_4', name: 'DevOps & Architectures', slug: 'devops-architectures', description: 'Docker, AWS deployments, GitHub CI/CD actions' }
      ];
      setCategories(mockCategories);
    } catch (err) {
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    setCreateError('');
    setCreateSuccess('');

    try {
      const res = await createCategoryAction(name, description);
      if (res.success) {
        setCreateSuccess('Category created successfully!');
        setName('');
        setDescription('');
        // Add to list
        if (res.category) {
          setCategories(prev => [...prev, res.category]);
        } else {
          fetchCategories();
        }
      } else {
        setCreateError(res.error || 'Failed to create category.');
      }
    } catch (err) {
      setCreateError('A network error occurred.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-warm-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div className="space-y-1.5">
          <Link href="/admin" className="flex items-center gap-1 text-[11px] text-stone hover:text-warm-white font-mono uppercase tracking-wider">
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-warm-white flex items-center gap-2.5">
            <Database className="w-8 h-8 text-accent-cyan" />
            <span>Categories Taxonomy</span>
          </h1>
          <p className="text-[13px] text-stone font-light">
            Manage file taxonomy, nesting subject categories, and study folders for Second Brain.
          </p>
        </div>

        <Button 
          variant="secondary" 
          onClick={fetchCategories} 
          disabled={loading}
          className="text-[11px] py-1.5 px-3 flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Create Form */}
        <div className="lg:col-span-4">
          <Card className="p-6 space-y-4">
            <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider font-mono flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-accent-cyan" />
              <span>Create Category</span>
            </h3>

            {createSuccess && (
              <div className="p-3 bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-[12px] rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{createSuccess}</span>
              </div>
            )}

            {createError && (
              <div className="p-3 bg-accent-pink/10 border border-accent-pink/20 text-accent-pink text-[12px] rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-stone uppercase tracking-wider font-bold">Category Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. System Architectures"
                  className="w-full bg-charcoal/40 border border-white/5 rounded-xl px-4 py-2.5 text-[13px] text-warm-white outline-none focus:border-white/10"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-stone uppercase tracking-wider font-bold">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe content category topics..."
                  rows={4}
                  className="w-full bg-charcoal/40 border border-white/5 rounded-xl px-4 py-2.5 text-[13px] text-warm-white outline-none focus:border-white/10 font-sans"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={creating || !name.trim()}
                className="w-full justify-center text-[12px] py-2.5 font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{creating ? 'Creating...' : 'Create Folder'}</span>
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Taxonomy list */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider font-mono">
              Active Taxonomy Folders ({categories.length})
            </h3>
            
            {loading ? (
              <div className="py-8 text-center text-stone">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-accent-cyan" />
              </div>
            ) : categories.length === 0 ? (
              <p className="text-stone font-light text-[12.5px] py-6 text-center">No categories found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div 
                    key={cat.id} 
                    className="p-4 rounded-xl bg-onyx/40 border border-white/5 flex gap-3 hover:border-white/10 transition-all hover:scale-[1.01]"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center shrink-0">
                      <Folder className="w-5 h-5 text-accent-cyan" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[13px] font-bold text-warm-white">{cat.name}</h4>
                      <span className="inline-block text-[10px] font-mono text-stone bg-charcoal px-1.5 py-0.2 rounded">
                        /{cat.slug}
                      </span>
                      <p className="text-[11.5px] text-stone font-light leading-relaxed">
                        {cat.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

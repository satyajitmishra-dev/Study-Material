'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FolderPlus, Trash2, ArrowRight, Bookmark, SlidersHorizontal, Plus, Grid, List } from 'lucide-react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui/core';
import { bookmarkPostAction, manageCollectionAction } from '@/lib/actions/public';

export default function BookmarksHubPage() {
  const [visitorId, setVisitorId] = useState('');
  const [collections, setCollections] = useState<any[]>([
    { id: 'all', name: 'All Bookmarks', description: 'Everything you have bookmarked.' },
    { id: 'fav', name: 'Favorites', description: 'Pristine technical references.' }
  ]);
  const [activeCollection, setActiveCollection] = useState('all');
  
  // Bookmarked posts list
  const [savedPosts, setSavedPosts] = useState<any[]>([]);

  // Dialog forms
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');

  // Bulk delete selections
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let vid = localStorage.getItem('sm_visitor_id');
    if (!vid) {
      vid = `vis_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
      localStorage.setItem('sm_visitor_id', vid);
    }
    setVisitorId(vid);

    // Mock load bookmarked posts (in sandbox, retrieve all available posts)
    fetch('/api/v1/posts?limit=10')
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          // In sandbox, treat first 2 posts as bookmarked for immediate visual representation
          setSavedPosts(res.data.slice(0, 2).map((p: any) => ({
            ...p,
            collectionId: 'all'
          })));
        }
      });
  }, []);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const res = await manageCollectionAction(newFolderName, newFolderDesc, visitorId);
    if (res.success && res.collection) {
      setCollections(prev => [...prev, {
        id: res.collection.id,
        name: newFolderName,
        description: newFolderDesc
      }]);
      setNewFolderName('');
      setNewFolderDesc('');
      setShowFolderModal(false);
    }
  };

  const handleRemoveBookmark = async (id: string) => {
    const res = await bookmarkPostAction(id, undefined, visitorId);
    if (res.success) {
      setSavedPosts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleBulkDelete = async () => {
    const ids = Object.keys(selectedIds).filter(k => selectedIds[k]);
    for (const id of ids) {
      await bookmarkPostAction(id, undefined, visitorId);
    }
    setSavedPosts(prev => prev.filter(p => !selectedIds[p.id]));
    setSelectedIds({});
  };

  const filteredPosts = activeCollection === 'all'
    ? savedPosts
    : savedPosts.filter(p => p.collectionId === activeCollection);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedCount = Object.keys(selectedIds).filter(k => selectedIds[k]).length;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <span className="text-[11px] font-semibold text-accent-cyan tracking-[0.2em] uppercase font-mono">Personal Collections</span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-warm-white mt-1">Saved Bookmarks</h1>
          <p className="text-[13px] text-stone font-light mt-1">
            Manage your bookmark collections, folders, and read lists.
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowFolderModal(true)} className="text-[12px] py-2">
          <FolderPlus className="w-4 h-4" />
          <span>New Collection</span>
        </Button>
      </div>

      {/* Grid of collections */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {collections.map(col => {
          const isActive = col.id === activeCollection;
          return (
            <div 
              key={col.id} 
              onClick={() => setActiveCollection(col.id)}
              className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-200 cursor-pointer flex flex-col justify-between h-[110px]
                ${isActive 
                  ? 'bg-white/5 border-accent-cyan shadow-glow-cyan/5 text-accent-cyan' 
                  : 'bg-charcoal/20 border-white/5 text-stone hover:border-white/10 hover:text-warm-white'
                }
              `}
            >
              <div className="space-y-1">
                <Folder className="w-4 h-4 text-stone" />
                <h4 className="text-[13px] font-bold text-warm-white">{col.name}</h4>
              </div>
              <span className="text-[10px] font-mono text-stone/80 mt-2 block">
                {col.id === 'all' ? `${savedPosts.length} saved` : '0 saved'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bulk actions and toolbar */}
      <div className="flex items-center justify-between text-[11px] text-stone border-b border-white/5 pb-2">
        <span className="font-semibold uppercase tracking-wider font-mono">Bookmarked Articles</span>
        
        {selectedCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 bg-accent-pink/10 border border-accent-pink/20 px-3 py-1 rounded-lg text-accent-pink"
          >
            <span>{selectedCount} selected</span>
            <button onClick={handleBulkDelete} className="hover:text-warm-white flex items-center gap-1 cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bulk Remove</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Bookmarked list */}
      <div className="space-y-4">
        {filteredPosts.map(post => {
          const isChecked = !!selectedIds[post.id];
          return (
            <Card key={post.id} className="p-4 flex items-center gap-4 group">
              <input 
                type="checkbox" 
                checked={isChecked}
                onChange={() => toggleSelect(post.id)}
                className="w-4 h-4 rounded border-white/10 accent-accent-cyan cursor-pointer shrink-0"
              />
              <div className="flex-1 truncate">
                <span className="text-[9px] font-mono text-accent-cyan uppercase">{post.categoryRef?.name || 'React'}</span>
                <h4 className="text-[14px] font-bold text-warm-white hover:text-accent-cyan transition-colors truncate">
                  <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                </h4>
              </div>
              
              <div className="flex items-center gap-3 shrink-0">
                <button 
                  onClick={() => handleRemoveBookmark(post.id)}
                  className="p-1.5 rounded hover:bg-white/5 border border-transparent text-stone hover:text-accent-pink cursor-pointer"
                  title="Remove Bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link href={`/posts/${post.slug}`} className="text-stone hover:text-warm-white">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </Card>
          );
        })}

        {filteredPosts.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl">
            <Bookmark className="w-12 h-12 text-stone/40 animate-pulse" />
            <h4 className="text-[13px] font-bold text-warm-white mt-3">No bookmarks in folder</h4>
            <p className="text-[11px] text-stone mt-1">Bookmark technical articles to read them offline or save references.</p>
          </div>
        )}
      </div>

      {/* Create Folder Modal Dialog */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-onyx/85 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-charcoal border border-white/10 rounded-2xl p-6 shadow-premium space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-lg font-bold text-warm-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-accent-cyan" />
                <span>Create Collection Folder</span>
              </h3>
              <button onClick={() => setShowFolderModal(false)} className="text-stone hover:text-warm-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-stone tracking-wider font-mono">Folder Name</label>
                <input 
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Java Tutorials, AI reference sheet..."
                  className="w-full bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-[12px] text-warm-white outline-none focus:border-white/10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-stone tracking-wider font-mono">Description (Optional)</label>
                <textarea 
                  value={newFolderDesc}
                  onChange={(e) => setNewFolderDesc(e.target.value)}
                  placeholder="Short description..."
                  className="w-full bg-charcoal/20 border border-white/5 rounded-lg p-3 text-[12px] text-warm-white outline-none focus:border-white/10 h-20"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button variant="secondary" type="button" onClick={() => setShowFolderModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Create Folder</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

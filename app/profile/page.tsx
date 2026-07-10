'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Clock, 
  CheckCircle, 
  Bookmark, 
  MessageSquare, 
  Highlighter, 
  TrendingUp, 
  ExternalLink,
  User,
  Shield,
  Key,
  Trash2,
  Link as LinkIcon,
  Laptop,
  Check,
  AlertTriangle,
  Code
} from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Card, Button } from '@/components/ui/core';
import { saveProfileFieldsAction, deleteUserAccountAction } from '@/lib/actions/user';
import { savePublicProfileSettingsAction, fetchMyProfileSettingsAction } from '@/lib/actions/profileActions';

interface Note {
  id: string;
  postTitle: string;
  postSlug: string;
  highlightText: string;
  noteContent: string;
  updatedAt: Date;
}

export default function ProfileDashboardPage() {
  const { data: session, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState<'reader' | 'account' | 'security' | 'developer' | 'portfolio'>('reader');
  
  // Profile settings state
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [preferencesJson, setPreferencesJson] = useState('{\n  "theme": "dark",\n  "autosaveInterval": 5,\n  "editorMode": "tactile",\n  "reducedMotion": false\n}');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Developer Platform states
  const [username, setUsername] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Senior Engineer');

  // API keys state
  const [apiKeys, setApiKeys] = useState<{ id: string; name: string; key: string; createdAt: string }[]>([
    { id: 'key_1', name: 'Dev SDK Token', key: 'sm_live_9f8a...bc32', createdAt: '2026-06-15' }
  ]);
  const [newKeyName, setNewKeyName] = useState('');

  // Delete account confirmation
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // User Stats
  const [streak, setStreak] = useState(3);
  const [timeSpent, setTimeSpent] = useState(145); // minutes
  const [completedCount, setCompletedCount] = useState(4);
  
  // User Lists
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [likedPosts, setLikedPosts] = useState<any[]>([]);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setAvatar((session.user as any).avatar || session.user.image || '');
      
      fetchMyProfileSettingsAction().then(res => {
        if (res.success && res.user) {
          setUsername(res.user.username || '');
          const ap: any = res.user.authorProfile || {};
          setHeadline(ap.headline || '');
          setCoverImage(ap.coverImage || '');
          setBio(ap.bio || '');
          setLocation(ap.location || '');
          setWebsite(ap.website || '');
          setGithub(ap.github || '');
          setLinkedin(ap.linkedin || '');
          setTwitter(ap.twitter || '');
          setPortfolio(ap.portfolio || '');
          setExperienceLevel(ap.experienceLevel || 'Senior Engineer');
        }
      });
    }
  }, [session]);

  useEffect(() => {
    // Mock load profile information (in sandbox, retrieve published projects)
    fetch('/api/v1/posts?limit=5')
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setRecentHistory(res.data.slice(0, 3));
          setLikedPosts(res.data.slice(0, 1));
        }
      });
      
    // Seed mock notes
    setUserNotes([
      {
        id: 'note_1',
        postTitle: 'Introducing Partial Prerendering',
        postSlug: 'introducing-partial-prerendering',
        highlightText: 'Partial Prerendering (PPR) is a layout-first prerendering model...',
        noteContent: 'Crucial for dynamic dashboard widgets in Next.js 16. Implement <Suspense> boundaries carefully.',
        updatedAt: new Date()
      }
    ]);
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    try {
      JSON.parse(preferencesJson);
      
      const res = await saveProfileFieldsAction({
        name,
        avatar,
        preferences: preferencesJson
      });
      
      const resDev = await savePublicProfileSettingsAction({
        username,
        coverImage,
        headline,
        bio,
        location,
        website,
        github,
        linkedin,
        twitter,
        portfolio,
        experienceLevel
      });
      
      if (res.success && resDev.success) {
        setSaveStatus('saved');
        await updateSession();
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        if (resDev.error === 'USERNAME_TAKEN') {
          alert('This username is already taken. Please pick another one.');
        } else if (resDev.error === 'INVALID_USERNAME_FORMAT') {
          alert('Username must be 3-20 characters long and contain only lowercase letters, numbers, hyphens, or underscores.');
        }
      }
    } catch (err) {
      alert('Invalid Preferences JSON formatting');
      setSaveStatus('error');
    }
  };

  const handleGenerateApiKey = () => {
    if (!newKeyName) return;
    const rawRandom = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const mockKey = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      key: `sm_live_${rawRandom.substring(0, 6)}...${rawRandom.substring(rawRandom.length - 6)}`,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setApiKeys([...apiKeys, mockKey]);
    setNewKeyName('');
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
  };

  const handleDeleteAccount = async () => {
    if (confirmDelete) {
      try {
        await deleteUserAccountAction();
        signOut({ callbackUrl: '/login' });
      } catch (err) {
        alert('Failed to delete account.');
      }
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Profile Header */}
      <div className="border-b border-white/5 pb-5">
        <span className="text-[11px] font-semibold text-accent-violet tracking-[0.2em] uppercase font-mono">Personal Hub</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-warm-white mt-1">User Account Center</h1>
        <p className="text-[13px] text-stone font-light mt-1">
          Update profile configurations, analyze reading achievements, and generate developer tokens.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-white/5 pb-0.5 gap-6">
        {[
          { id: 'reader', label: 'Reader Stats', icon: BookmarksIcon },
          { id: 'account', label: 'Profile Settings', icon: User },
          { id: 'portfolio', label: 'Showcase Portfolio', icon: Code },
          { id: 'security', label: 'Security & Sessions', icon: Shield },
          { id: 'developer', label: 'Developer API Keys', icon: Key },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-[13px] font-medium tracking-wide flex items-center gap-2 cursor-pointer border-b-2 transition-all select-none
                ${isActive ? 'border-accent-cyan text-warm-white font-bold' : 'border-transparent text-stone hover:text-warm-white'}`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[400px]">
        {activeTab === 'reader' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Streak & Goal Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card glowColor="violet" className="flex items-center gap-5 p-5 relative overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-accent-pink/15 border border-accent-pink/20 flex items-center justify-center text-accent-pink shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                  <Flame className="w-6 h-6 fill-current animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] text-stone uppercase tracking-wider font-mono font-bold block">Reading Streak</span>
                  <span className="text-2xl font-bold text-warm-white font-mono mt-0.5">{streak} Days Active</span>
                </div>
              </Card>

              <Card className="flex items-center gap-5 p-5">
                <div className="w-12 h-12 rounded-xl bg-accent-cyan/15 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-stone uppercase tracking-wider font-mono font-bold block">Time Spent Reading</span>
                  <span className="text-2xl font-bold text-warm-white font-mono mt-0.5">{timeSpent} Minutes</span>
                </div>
              </Card>

              <Card className="flex items-center gap-5 p-5">
                <div className="w-12 h-12 rounded-xl bg-accent-emerald/15 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-stone uppercase tracking-wider font-mono font-bold block">Articles Completed</span>
                  <span className="text-2xl font-bold text-warm-white font-mono mt-0.5">{completedCount} Completed</span>
                </div>
              </Card>
            </div>

            {/* History & Notes Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-warm-white flex items-center gap-2">
                  <Highlighter className="w-5 h-5 text-accent-cyan" />
                  <span>Highlights & Private Notes</span>
                </h3>
                <div className="space-y-4">
                  {userNotes.map((note) => (
                    <div key={note.id} className="p-4 rounded-xl bg-charcoal/10 border border-white/5 space-y-3 relative overflow-hidden">
                      <div className="border-l-4 border-yellow-400 pl-3">
                        <p className="text-[11.5px] italic text-stone/80 line-clamp-2">
                          "{note.highlightText}"
                        </p>
                      </div>
                      <div className="p-3 bg-charcoal/20 border border-white/5 rounded-lg text-[12px] text-stone leading-relaxed font-light">
                        <span className="font-bold text-warm-white block text-[10px] font-mono uppercase tracking-wider mb-1">Annotation</span>
                        {note.noteContent}
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-stone font-mono pt-1">
                        <Link href={`/posts/${note.postSlug}`} className="hover:text-warm-white flex items-center gap-0.5">
                          <span>Source: {note.postTitle}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {userNotes.length === 0 && (
                    <div className="py-12 border border-dashed border-white/5 rounded-xl text-center text-[11px] text-stone">
                      No highlights or annotations saved.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-warm-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-stone" />
                    <span>Recently Read</span>
                  </h3>
                  <div className="space-y-2.5 bg-charcoal/10 border border-white/5 rounded-2xl p-3">
                    {recentHistory.map((post) => (
                      <div key={post.id} className="p-2.5 rounded-lg hover:bg-white/5 flex items-center justify-between text-[12px]">
                        <div className="truncate">
                          <span className="text-[9px] font-mono text-accent-cyan uppercase block">{post.categoryRef?.name || 'Development'}</span>
                          <span className="font-bold text-warm-white truncate hover:underline block">
                            <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                          </span>
                        </div>
                        <Link href={`/posts/${post.slug}`} className="text-stone hover:text-warm-white font-mono text-[10px]">
                          Read →
                        </Link>
                      </div>
                    ))}
                    {recentHistory.length === 0 && (
                      <div className="text-center py-6 text-[11px] text-stone">
                        Reading stream empty.
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-warm-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent-amber" />
                    <span>Reacted Guides</span>
                  </h3>
                  <div className="space-y-2.5 bg-charcoal/10 border border-white/5 rounded-2xl p-3">
                    {likedPosts.map((post) => (
                      <div key={post.id} className="p-2.5 rounded-lg hover:bg-white/5 flex items-center justify-between text-[12px]">
                        <div className="truncate">
                          <span className="font-bold text-warm-white truncate hover:underline block">
                            <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                          </span>
                        </div>
                        <span className="text-[10px] text-accent-amber font-mono font-bold uppercase tracking-wider">
                          👍 reacted
                        </span>
                      </div>
                    ))}
                    {likedPosts.length === 0 && (
                      <div className="text-center py-6 text-[11px] text-stone">
                        No reacted guides yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="space-y-6 max-w-2xl animate-fadeIn">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <Card className="p-6 space-y-4">
                <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-accent-violet" />
                  <span>Profile Information</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Account Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Account Email</label>
                    <input 
                      type="email" 
                      disabled
                      value={session?.user?.email || ''}
                      className="w-full px-3.5 py-2 text-[13px] bg-charcoal/5 border border-white/5 rounded-lg text-stone/50 outline-none cursor-not-allowed"
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Avatar Image URL</label>
                  <input 
                    type="text" 
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-3.5 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all font-mono"
                  />
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                  <Code className="w-4 h-4 text-accent-cyan" />
                  <span>Application Preferences (JSON)</span>
                </h3>
                <textarea 
                  rows={5}
                  value={preferencesJson}
                  onChange={(e) => setPreferencesJson(e.target.value)}
                  className="w-full p-3 text-[12px] font-mono bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all resize-none"
                />
              </Card>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={saveStatus === 'saving'}
                  className="px-5 py-2.5 text-[12px] font-semibold text-onyx bg-warm-white hover:bg-mist disabled:opacity-50 disabled:pointer-events-none rounded-lg cursor-pointer transition-all active:scale-[0.98]"
                >
                  {saveStatus === 'saving' ? 'Saving settings...' : saveStatus === 'saved' ? 'Saved Successfully!' : 'Save Profile Changes'}
                </button>

                {saveStatus === 'saved' && <span className="text-accent-emerald text-[12px] font-medium flex items-center gap-1"><Check className="w-4 h-4" /> Profile Synced</span>}
              </div>
            </form>

            {/* Danger Zone */}
            <Card className="p-6 border-accent-pink/20 bg-accent-pink/[0.02] space-y-4">
              <h3 className="text-[14px] font-bold text-accent-pink uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Danger Zone</span>
              </h3>
              <p className="text-[12px] text-stone font-light leading-relaxed">
                Permanently delete your profile account, session histories, custom annotations, notes, and collections. This action is irreversible.
              </p>
              <div>
                <button
                  onClick={handleDeleteAccount}
                  className={`px-4 py-2.5 text-[12px] font-semibold rounded-lg transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5
                    ${confirmDelete 
                      ? 'bg-accent-pink text-white hover:bg-accent-pink/90 animate-bounce' 
                      : 'bg-accent-pink/10 text-accent-pink border border-accent-pink/20 hover:bg-accent-pink/20'}`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{confirmDelete ? 'Click again to confirm immediate deletion' : 'Delete Account'}</span>
                </button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-6 max-w-2xl animate-fadeIn">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <Card className="p-6 space-y-4">
                <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                  <Code className="w-4 h-4 text-accent-cyan" />
                  <span>Public Portfolio Showcase Credentials</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Unique Username</label>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. satyajitmishra-dev"
                      className="w-full px-3.5 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Experience Level Badge</label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full px-3.5 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all"
                    >
                      <option value="Junior Engineer">Junior Engineer</option>
                      <option value="Mid Engineer">Mid Engineer</option>
                      <option value="Senior Engineer">Senior Engineer</option>
                      <option value="Lead Architect">Lead Architect</option>
                      <option value="Principal Architect">Principal Architect</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Headline / Role Title</label>
                    <input 
                      type="text" 
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Full Stack Architect | Next.js Edge Core Team"
                      className="w-full px-3.5 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Location</label>
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. New Delhi, India"
                      className="w-full px-3.5 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Bio Description</label>
                  <textarea 
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Provide a professional description..."
                    className="w-full p-3 text-[12.5px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Cover Image Banner URL</label>
                  <input 
                    type="text" 
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all font-mono"
                  />
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-accent-violet" />
                  <span>Developer Social Hooks</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Website URL</label>
                    <input 
                      type="text" 
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-3.5 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">GitHub URL</label>
                    <input 
                      type="text" 
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      className="w-full px-3.5 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">LinkedIn URL</label>
                    <input 
                      type="text" 
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full px-3.5 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Twitter/X URL</label>
                    <input 
                      type="text" 
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      className="w-full px-3.5 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Portfolio Link</label>
                  <input 
                    type="text" 
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    className="w-full px-3.5 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 font-mono"
                  />
                </div>
              </Card>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={saveStatus === 'saving'}
                  className="px-5 py-2.5 text-[12px] font-semibold text-onyx bg-warm-white hover:bg-mist disabled:opacity-50 disabled:pointer-events-none rounded-lg cursor-pointer transition-all active:scale-[0.98]"
                >
                  {saveStatus === 'saving' ? 'Saving settings...' : saveStatus === 'saved' ? 'Saved Successfully!' : 'Save Showcase Portfolio'}
                </button>

                {saveStatus === 'saved' && <span className="text-accent-emerald text-[12px] font-medium flex items-center gap-1"><Check className="w-4 h-4" /> Showcase Synced</span>}
              </div>
            </form>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6 max-w-2xl animate-fadeIn">
            {/* Active Sessions */}
            <Card className="p-6 space-y-4">
              <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                <Laptop className="w-4 h-4 text-accent-cyan" />
                <span>Active Device Sessions</span>
              </h3>
              
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 flex items-center justify-between">
                  <div className="flex gap-3 items-center">
                    <Laptop className="w-5 h-5 text-accent-cyan" />
                    <div>
                      <span className="text-[13px] font-bold text-warm-white block">Windows PC · Chrome Browser</span>
                      <span className="text-[10px] text-stone font-mono">IP: 103.45.12.88 (New Delhi, India) · Current Session</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan uppercase tracking-wider font-mono">Active</span>
                </div>
              </div>
              
              <div className="pt-2">
                <Button variant="secondary" className="text-[11.5px] py-1.5 px-3">
                  Revoke All Other Sessions
                </Button>
              </div>
            </Card>

            {/* Connected Accounts */}
            <Card className="p-6 space-y-4">
              <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-accent-violet" />
                <span>Connected Third-Party Accounts</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.01] border border-white/5">
                  <span className="text-[12.5px] font-bold text-warm-white">Google OAuth Service</span>
                  <span className="text-[11px] font-bold text-accent-emerald uppercase tracking-wider font-mono">Linked</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.01] border border-white/5 opacity-55">
                  <span className="text-[12.5px] font-bold text-stone">GitHub Sync Account</span>
                  <button className="text-[11px] font-bold text-stone hover:text-warm-white cursor-pointer font-mono">Connect →</button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'developer' && (
          <div className="space-y-6 max-w-2xl animate-fadeIn">
            {/* API Keys */}
            <Card className="p-6 space-y-4">
              <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 text-accent-cyan" />
                <span>Personal API Keys</span>
              </h3>

              <p className="text-[12px] text-stone font-light leading-relaxed">
                Personal API tokens allow programmatic integration to read bookmarks, fetch highlights, and submit search queries from local scripts.
              </p>

              <div className="space-y-3 pt-2">
                {apiKeys.map(k => (
                  <div key={k.id} className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 flex items-center justify-between font-mono text-[12px]">
                    <div>
                      <span className="text-[12.5px] font-bold text-warm-white font-sans block">{k.name}</span>
                      <span className="text-stone/60 text-[11px] block mt-1">{k.key}</span>
                      <span className="text-[9px] text-stone/40 block mt-0.5">Created: {k.createdAt}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteKey(k.id)}
                      className="p-1.5 rounded hover:bg-accent-pink/10 text-stone hover:text-accent-pink transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Generate new key */}
              <div className="flex gap-3 items-end border-t border-white/5 pt-4 mt-2">
                <div className="flex-1 space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Token Name</label>
                  <input 
                    type="text" 
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. VSCode Extension"
                    className="w-full px-3.5 py-2 text-[12.5px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all"
                  />
                </div>
                <button 
                  onClick={handleGenerateApiKey}
                  className="px-4 py-2 text-[12px] font-semibold text-onyx bg-accent-cyan hover:bg-accent-cyan/95 rounded-lg cursor-pointer transition-all active:scale-[0.98]"
                >
                  Generate Key
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>

    </div>
  );
}

// Simple Bookmarks Icon fallback
function BookmarksIcon(props: any) {
  return <Bookmark {...props} />;
}

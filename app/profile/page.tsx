'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Code,
  Sparkles,
  Camera,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  History,
  AlertCircle,
  Plus,
  Briefcase,
  GraduationCap,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Card, Button, Input } from '@/components/ui/core';
import { saveProfileFieldsAction, deleteUserAccountAction } from '@/lib/actions/user';
import { 
  savePublicProfileSettingsAction, 
  fetchMyProfileSettingsAction,
  saveDraftBackupAction,
  getDraftVersionHistoryAction,
  updateProfilePrivacySettingsAction
} from '@/lib/actions/profileActions';
import ProfilePhotoManager from '@/components/public/ProfilePhotoManager';

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
  const [preferencesJson, setPreferencesJson] = useState('{\n  "theme": "dark",\n  "autosaveInterval": 3,\n  "editorMode": "tactile",\n  "reducedMotion": false\n}');
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
  const [youtube, setYoutube] = useState('');
  const [discord, setDiscord] = useState('');
  const [hashnode, setHashnode] = useState('');
  const [devto, setDevto] = useState('');
  const [leetcode, setLeetcode] = useState('');
  const [codeforces, setCodeforces] = useState('');
  const [medium, setMedium] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Senior Engineer');
  const [availability, setAvailability] = useState('available');

  // Privacy Visibility
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private' | 'unlisted'>('public');
  const [hiddenFields, setHiddenFields] = useState<string[]>([]);

  // Complex lists
  const [skills, setSkills] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  // Editing lists helpers
  const [newSkill, setNewSkill] = useState({ name: '', years: 1, level: 'Intermediate' });
  const [newExp, setNewExp] = useState({ company: '', role: '', duration: '', description: '' });
  const [newEdu, setNewEdu] = useState({ college: '', degree: '', branch: '', duration: '', cgpa: '', achievements: '' });
  const [newAch, setNewAch] = useState({ title: '', description: '', issuer: '', date: '', verificationUrl: '' });

  // Autosave and History states
  const [isDirty, setIsDirty] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'offline'>('idle');
  const [draftHistory, setDraftHistory] = useState<any[]>([]);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  // API keys state
  const [apiKeys, setApiKeys] = useState<{ id: string; name: string; key: string; createdAt: string }[]>([
    { id: 'key_1', name: 'Dev SDK Token', key: 'sm_live_9f8a...bc32', createdAt: '2026-06-15' }
  ]);
  const [newKeyName, setNewKeyName] = useState('');

  // Delete account confirmation
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  
  // User Stats
  const [streak, setStreak] = useState(3);
  const [timeSpent, setTimeSpent] = useState(145); // minutes
  const [completedCount, setCompletedCount] = useState(4);
  
  // User Lists
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [likedPosts, setLikedPosts] = useState<any[]>([]);

  // Fetch profiles
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setAvatar((session.user as any).avatar || session.user.image || '');
      
      fetchMyProfileSettingsAction().then(res => {
        if (res.success && res.user) {
          setUsername(res.user.username || '');
          setProfileVisibility((res.user.profileVisibility as any) || 'public');
          setHiddenFields(res.user.hiddenFields || []);
          
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
          setYoutube(ap.youtube || '');
          setDiscord(ap.discord || '');
          setHashnode(ap.hashnode || '');
          setDevto(ap.devto || '');
          setLeetcode(ap.leetcode || '');
          setCodeforces(ap.codeforces || '');
          setMedium(ap.medium || '');
          setExperienceLevel(ap.experienceLevel || 'Senior Engineer');
          setAvailability(ap.availability || 'available');

          setSkills(ap.skills ? JSON.parse(ap.skills) : []);
          setExperience(ap.experience ? JSON.parse(ap.experience) : []);
          setEducation(ap.education ? JSON.parse(ap.education) : []);
          setAchievements(ap.achievementsJson ? JSON.parse(ap.achievementsJson) : []);
          
          // Once loaded, set dirty false
          setIsDirty(false);
          loadDraftHistory();
        }
      });
    }
  }, [session]);

  // Load drafts backups history
  const loadDraftHistory = async () => {
    try {
      const res = await getDraftVersionHistoryAction('profile');
      if (res.success) {
        setDraftHistory(res.history || []);
      }
    } catch (e) {}
  };

  // Autosave hook
  useEffect(() => {
    if (!isDirty) return;
    
    setAutosaveStatus('saving');
    
    const delayDebounce = setTimeout(async () => {
      try {
        const draftContent = JSON.stringify({
          username, name, avatar, coverImage, headline, bio, location, website, github, linkedin, twitter, portfolio,
          youtube, discord, hashnode, devto, leetcode, codeforces, medium, experienceLevel, availability,
          skills, experience, education, achievements, profileVisibility, hiddenFields
        });
        
        await saveDraftBackupAction('profile', draftContent);
        localStorage.setItem('profile_draft_local', draftContent);
        
        setAutosaveStatus('saved');
        setIsDirty(false);
        loadDraftHistory();
        setTimeout(() => setAutosaveStatus('idle'), 2000);
      } catch (e) {
        setAutosaveStatus('offline');
      }
    }, 3000); // 3 seconds idle

    return () => clearTimeout(delayDebounce);
  }, [
    username, name, avatar, coverImage, headline, bio, location, website, github, linkedin, twitter, portfolio,
    youtube, discord, hashnode, devto, leetcode, codeforces, medium, experienceLevel, availability,
    skills, experience, education, achievements, profileVisibility, hiddenFields, isDirty
  ]);

  // Offline Draft recovery prompt
  useEffect(() => {
    const local = localStorage.getItem('profile_draft_local');
    if (local && !isDirty) {
      const parsed = JSON.parse(local);
      // Prompt user to recover if local draft has differences
      if (parsed.bio !== bio && bio === '') {
        const confirmRestore = window.confirm("We found an unsaved local profile draft. Do you want to recover it?");
        if (confirmRestore) {
          restoreDraftFromContent(parsed);
        } else {
          localStorage.removeItem('profile_draft_local');
        }
      }
    }
  }, [bio]);

  // Leaving page warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const restoreDraftFromContent = (data: any) => {
    if (data.username) setUsername(data.username);
    if (data.name) setName(data.name);
    if (data.avatar) setAvatar(data.avatar);
    if (data.coverImage) setCoverImage(data.coverImage);
    if (data.headline) setHeadline(data.headline);
    if (data.bio) setBio(data.bio);
    if (data.location) setLocation(data.location);
    if (data.website) setWebsite(data.website);
    if (data.github) setGithub(data.github);
    if (data.linkedin) setLinkedin(data.linkedin);
    if (data.twitter) setTwitter(data.twitter);
    if (data.portfolio) setPortfolio(data.portfolio);
    if (data.youtube) setYoutube(data.youtube);
    if (data.discord) setDiscord(data.discord);
    if (data.hashnode) setHashnode(data.hashnode);
    if (data.devto) setDevto(data.devto);
    if (data.leetcode) setLeetcode(data.leetcode);
    if (data.codeforces) setCodeforces(data.codeforces);
    if (data.medium) setMedium(data.medium);
    if (data.experienceLevel) setExperienceLevel(data.experienceLevel);
    if (data.availability) setAvailability(data.availability);
    if (data.skills) setSkills(data.skills);
    if (data.experience) setExperience(data.experience);
    if (data.education) setEducation(data.education);
    if (data.achievements) setAchievements(data.achievements);
    if (data.profileVisibility) setProfileVisibility(data.profileVisibility);
    if (data.hiddenFields) setHiddenFields(data.hiddenFields);
    
    setIsDirty(true);
  };

  useEffect(() => {
    fetch('/api/v1/posts?limit=5')
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setRecentHistory(res.data.slice(0, 3));
          setLikedPosts(res.data.slice(0, 1));
        }
      });
      
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

  const loadSessions = async () => {
    try {
      const { getActiveSessionsAction } = await import('@/lib/actions/authActions');
      const res = await getActiveSessionsAction();
      if (res.success) {
        setSessions(res.sessions || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (activeTab === 'security') {
      loadSessions();
    }
  }, [activeTab]);

  const handleRevokeSession = async (sessId: string) => {
    const confirmRevoke = window.confirm("Are you sure you want to log out this device session?");
    if (!confirmRevoke) return;

    try {
      const { revokeSessionAction } = await import('@/lib/actions/authActions');
      const res = await revokeSessionAction(sessId);
      if (res.success) {
        loadSessions();
      } else {
        alert("Failed to terminate session.");
      }
    } catch (e) {
      alert("Error revoking session.");
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    const confirmRevoke = window.confirm("Are you sure you want to log out all OTHER devices?");
    if (!confirmRevoke) return;

    try {
      const { revokeAllSessionsAction } = await import('@/lib/actions/authActions');
      const res = await revokeAllSessionsAction();
      if (res.success) {
        loadSessions();
      } else {
        alert("Failed to terminate sessions.");
      }
    } catch (e) {
      alert("Error revoking sessions.");
    }
  };

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
        name,
        avatar,
        coverImage,
        headline,
        bio,
        location,
        website,
        github,
        linkedin,
        twitter,
        portfolio,
        youtube,
        discord,
        hashnode,
        devto,
        leetcode,
        codeforces,
        medium,
        experienceLevel,
        availability,
        skills: JSON.stringify(skills),
        experience: JSON.stringify(experience),
        education: JSON.stringify(education),
        achievementsJson: JSON.stringify(achievements)
      });

      await updateProfilePrivacySettingsAction({
        profileVisibility,
        hiddenFields
      });
      
      if (res.success && resDev.success) {
        setSaveStatus('saved');
        setIsDirty(false);
        localStorage.removeItem('profile_draft_local');
        await updateSession();
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        alert(resDev.error || 'Failed to save settings.');
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
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    const res = await deleteUserAccountAction();
    if (res.success) {
      signOut({ callbackUrl: '/' });
    } else {
      alert('Failed to delete account');
      setConfirmDelete(false);
    }
  };

  const toggleHiddenField = (field: string) => {
    setIsDirty(true);
    if (hiddenFields.includes(field)) {
      setHiddenFields(hiddenFields.filter(f => f !== field));
    } else {
      setHiddenFields([...hiddenFields, field]);
    }
  };

  // Add / Remove helpers for portfolio lists
  const addSkill = () => {
    if (!newSkill.name.trim()) return;
    setSkills([...skills, { ...newSkill, popularity: 90 }]);
    setNewSkill({ name: '', years: 1, level: 'Intermediate' });
    setIsDirty(true);
  };

  const removeSkill = (name: string) => {
    setSkills(skills.filter(s => s.name !== name));
    setIsDirty(true);
  };

  const addExperience = () => {
    if (!newExp.company || !newExp.role) return;
    setExperience([...experience, newExp]);
    setNewExp({ company: '', role: '', duration: '', description: '' });
    setIsDirty(true);
  };

  const removeExperience = (idx: number) => {
    setExperience(experience.filter((_, i) => i !== idx));
    setIsDirty(true);
  };

  const addEducation = () => {
    if (!newEdu.college || !newEdu.degree) return;
    setEducation([...education, newEdu]);
    setNewEdu({ college: '', degree: '', branch: '', duration: '', cgpa: '', achievements: '' });
    setIsDirty(true);
  };

  const removeEducation = (idx: number) => {
    setEducation(education.filter((_, i) => i !== idx));
    setIsDirty(true);
  };

  const addAchievement = () => {
    if (!newAch.title || !newAch.issuer) return;
    setAchievements([...achievements, newAch]);
    setNewAch({ title: '', description: '', issuer: '', date: '', verificationUrl: '' });
    setIsDirty(true);
  };

  const removeAchievement = (idx: number) => {
    setAchievements(achievements.filter((_, i) => i !== idx));
    setIsDirty(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 animate-fadeIn relative">
      {/* Top Wizard Setup Banner Link */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gradient-to-r from-accent-cyan/10 to-accent-violet/5 border border-accent-cyan/15 rounded-2xl gap-4">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-warm-white">Need a guided setup?</h4>
            <p className="text-[11.5px] text-stone font-light">Launch the step-by-step developer wizard to build your professional profile card.</p>
          </div>
        </div>
        <Link href="/profile/setup">
          <Button variant="accent" className="text-[11px] py-1.5 px-3 bg-accent-cyan/15 hover:bg-accent-cyan/20 border border-accent-cyan/20 text-accent-cyan font-bold shrink-0">
            Start Wizard Setup
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-warm-white tracking-tight">Account & Developer Space</h1>
          <p className="text-[13px] text-stone font-light mt-1">Configure profile settings, developer portfolio badges, security keys, and reading lists.</p>
        </div>

        {/* Autosave Status Badge */}
        <div className="flex items-center gap-3">
          {autosaveStatus !== 'idle' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-charcoal border border-white/5 text-[10px] font-mono">
              {autosaveStatus === 'saving' && <span className="text-accent-cyan animate-pulse">Autosaving draft...</span>}
              {autosaveStatus === 'saved' && <span className="text-accent-emerald flex items-center gap-1"><Check className="w-3 h-3" /> Draft Autosaved</span>}
              {autosaveStatus === 'offline' && <span className="text-accent-pink">Autosave failed (Offline)</span>}
            </div>
          )}

          <Button
            type="button"
            variant="secondary"
            className="h-8 text-[11px] px-3 font-mono"
            onClick={() => { loadDraftHistory(); setShowHistoryPanel(!showHistoryPanel); }}
          >
            <History className="w-3.5 h-3.5 text-stone" />
            <span>Versions ({draftHistory.length})</span>
          </Button>
        </div>
      </div>

      {/* Version History Rollback Side panel */}
      {showHistoryPanel && (
        <Card className="p-4 bg-charcoal/50 border border-white/10 space-y-3 animate-fadeIn max-w-md">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-[11px] font-bold font-mono text-accent-cyan uppercase tracking-wider">Autosave Draft History</span>
            <button onClick={() => setShowHistoryPanel(false)} className="text-stone hover:text-warm-white text-[11px]">✕</button>
          </div>
          <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
            {draftHistory.map((h, i) => (
              <div key={h.id} className="p-2.5 rounded-lg bg-charcoal/20 border border-white/5 flex items-center justify-between text-[11px] font-mono">
                <div>
                  <span className="text-warm-white block font-bold">Draft Version #{draftHistory.length - i}</span>
                  <span className="text-[9.5px] text-stone/50 block mt-0.5">{new Date(h.createdAt).toLocaleString()}</span>
                </div>
                <button
                  onClick={() => {
                    const parsed = JSON.parse(h.content);
                    restoreDraftFromContent(parsed);
                    alert("Draft version loaded! Click Save below to apply.");
                  }}
                  className="px-2 py-0.5 rounded bg-accent-cyan/10 hover:bg-accent-cyan/20 border border-accent-cyan/20 text-accent-cyan cursor-pointer transition-colors"
                >
                  Restore
                </button>
              </div>
            ))}
            {draftHistory.length === 0 && (
              <p className="text-[11px] text-stone/50 italic py-4 text-center">No version backups recorded yet.</p>
            )}
          </div>
        </Card>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/5 gap-6 text-[13px] font-medium tracking-wide">
        {[
          { id: 'reader', label: 'Reader Stats' },
          { id: 'account', label: 'Basic Info' },
          { id: 'portfolio', label: 'Showcase Portfolio' },
          { id: 'developer', label: 'Personal Keys' },
          { id: 'security', label: 'Security & Access' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`pb-3 border-b-2 cursor-pointer transition-all ${activeTab === t.id ? 'border-accent-cyan text-warm-white font-bold' : 'border-transparent text-stone hover:text-warm-white'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* TAB 1: READER STATS */}
        {activeTab === 'reader' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Stats matrix grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-5 flex items-center gap-4 bg-charcoal/10 border-white/5">
                <div className="w-10 h-10 rounded-xl bg-accent-pink/15 text-accent-pink flex items-center justify-center font-bold">🔥</div>
                <div>
                  <span className="text-[10px] text-stone block uppercase font-mono font-bold tracking-wider">Daily Streak</span>
                  <span className="text-xl font-black text-warm-white font-mono mt-0.5">{streak} Days</span>
                </div>
              </Card>
              <Card className="p-5 flex items-center gap-4 bg-charcoal/10 border-white/5">
                <div className="w-10 h-10 rounded-xl bg-accent-cyan/15 text-accent-cyan flex items-center justify-center font-bold">⏱️</div>
                <div>
                  <span className="text-[10px] text-stone block uppercase font-mono font-bold tracking-wider">Reading Time</span>
                  <span className="text-xl font-black text-warm-white font-mono mt-0.5">{timeSpent} Mins</span>
                </div>
              </Card>
              <Card className="p-5 flex items-center gap-4 bg-charcoal/10 border-white/5">
                <div className="w-10 h-10 rounded-xl bg-accent-emerald/15 text-accent-emerald flex items-center justify-center font-bold">✓</div>
                <div>
                  <span className="text-[10px] text-stone block uppercase font-mono font-bold tracking-wider">Completed posts</span>
                  <span className="text-xl font-black text-warm-white font-mono mt-0.5">{completedCount} Articles</span>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Highlight Notes */}
              <Card className="p-6 space-y-4">
                <h3 className="text-sm font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                  <Highlighter className="w-4 h-4 text-accent-cyan" />
                  <span>My Highlights & Notes</span>
                </h3>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {userNotes.map(n => (
                    <div key={n.id} className="p-3.5 rounded-xl bg-charcoal/20 border border-white/5 space-y-2">
                      <span className="text-[11px] font-mono text-stone">{n.postTitle}</span>
                      <blockquote className="border-l-2 border-accent-cyan pl-3 italic text-[12px] text-stone/80">
                        "{n.highlightText}"
                      </blockquote>
                      <p className="text-[12.5px] text-warm-white font-light font-sans">{n.noteContent}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Liked articles */}
              <Card className="p-6 space-y-4">
                <h3 className="text-sm font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent-pink" />
                  <span>Liked Articles</span>
                </h3>
                <div className="space-y-3">
                  {likedPosts.map(p => (
                    <div key={p.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[13px] font-bold text-warm-white block">{p.title}</span>
                        <span className="text-[10px] text-stone block mt-0.5">Likes: {p.likes || 12}</span>
                      </div>
                      <Link href={`/posts/${p.slug}`}>
                        <Button variant="secondary" className="h-7 text-[10px] px-2.5">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                  {likedPosts.length === 0 && (
                    <p className="text-[12px] text-stone/50 italic py-6 text-center">No liked articles yet.</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: BASIC INFO */}
        {activeTab === 'account' && (
          <div className="space-y-6 max-w-2xl animate-fadeIn">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <Card className="p-6 space-y-4">
                <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-accent-cyan" />
                  <span>Public Avatar settings</span>
                </h3>

                <ProfilePhotoManager 
                  initialValue={avatar}
                  onChange={(url) => { setAvatar(url); setIsDirty(true); }}
                  label="Avatar Photo"
                />
              </Card>

              <Card className="p-6 space-y-4">
                <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                  <Code className="w-4 h-4 text-accent-cyan" />
                  <span>Application Preferences (JSON)</span>
                </h3>
                <textarea 
                  rows={5}
                  value={preferencesJson}
                  onChange={(e) => { setPreferencesJson(e.target.value); setIsDirty(true); }}
                  className="w-full p-3 text-[12px] font-mono bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all resize-none"
                />
              </Card>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={saveStatus === 'saving'}
                  className="px-5 py-2.5 text-[12px] font-semibold text-onyx bg-warm-white hover:bg-mist disabled:opacity-50 disabled:pointer-events-none rounded-lg cursor-pointer transition-all active:scale-[0.98]"
                >
                  {saveStatus === 'saving' ? 'Saving settings...' : saveStatus === 'saved' ? 'Saved Successfully!' : 'Save Account Settings'}
                </button>
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

        {/* TAB 3: SHOWCASE PORTFOLIO */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6 animate-fadeIn">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              
              {/* Privacy settings */}
              <Card className="p-6 space-y-4">
                <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent-emerald" />
                  <span>Profile Visibility & Privacy Controls</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11.5px] font-semibold text-stone uppercase tracking-wider block mb-1.5">Visibility Scope</label>
                    <div className="grid grid-cols-3 gap-2 p-0.5 bg-charcoal/50 border border-white/5 rounded-lg text-[10.5px]">
                      {[
                        { id: 'public', label: 'Public', icon: Eye },
                        { id: 'private', label: 'Private', icon: Lock },
                        { id: 'unlisted', label: 'Unlisted', icon: EyeOff }
                      ].map(v => {
                        const Icon = v.icon;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => { setProfileVisibility(v.id as any); setIsDirty(true); }}
                            className={`flex items-center justify-center gap-1 py-1.5 rounded cursor-pointer transition-all ${profileVisibility === v.id ? 'bg-white/10 text-warm-white font-bold' : 'text-stone hover:text-warm-white'}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{v.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hide fields checkboxes */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-stone uppercase tracking-wider font-bold block">Hide Elements from viewers:</span>
                    <div className="grid grid-cols-2 gap-2 text-[12px] text-stone">
                      {[
                        { id: 'email', label: 'Hide Email' },
                        { id: 'location', label: 'Hide Location' },
                        { id: 'followers', label: 'Hide Followers' },
                        { id: 'following', label: 'Hide Following' },
                        { id: 'activity', label: 'Hide Activity' },
                        { id: 'projects', label: 'Hide Projects' },
                        { id: 'socialLinks', label: 'Hide Social Links' }
                      ].map(f => (
                        <label key={f.id} className="flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={hiddenFields.includes(f.id)}
                            onChange={() => toggleHiddenField(f.id)}
                            className="rounded border-white/5 bg-charcoal/40 text-accent-cyan focus:ring-0 focus:ring-offset-0"
                          />
                          <span>{f.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Core Credentials */}
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
                      onChange={(e) => { setUsername(e.target.value); setIsDirty(true); }}
                      placeholder="e.g. satyajitmishra-dev"
                      className="w-full px-3.5 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Availability Scope</label>
                    <select
                      value={availability}
                      onChange={(e) => { setAvailability(e.target.value); setIsDirty(true); }}
                      className="w-full px-3.5 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all"
                    >
                      <option value="available">Available for Hire</option>
                      <option value="busy">Busy / Working</option>
                      <option value="not_looking">Not Looking</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Headline / Role Title</label>
                    <input 
                      type="text" 
                      value={headline}
                      onChange={(e) => { setHeadline(e.target.value); setIsDirty(true); }}
                      placeholder="e.g. Full Stack Architect | Next.js Edge Core Team"
                      className="w-full px-3.5 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Location</label>
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => { setLocation(e.target.value); setIsDirty(true); }}
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
                    onChange={(e) => { setBio(e.target.value); setIsDirty(true); }}
                    placeholder="Provide a professional description..."
                    className="w-full p-3 text-[12.5px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Cover Image Banner URL</label>
                  <input 
                    type="text" 
                    value={coverImage}
                    onChange={(e) => { setCoverImage(e.target.value); setIsDirty(true); }}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 focus:bg-charcoal/40 transition-all font-mono"
                  />
                </div>
              </Card>

              {/* Skills Manager chips */}
              <Card className="p-6 space-y-4">
                <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                  <Code className="w-4 h-4 text-accent-cyan" />
                  <span>Technical Skills Chips Manager</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Add form */}
                  <div className="md:col-span-5 space-y-3 p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                    <Input 
                      label="Skill Name"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      placeholder="e.g. Next.js"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-stone block mb-1">Level</label>
                        <select 
                          value={newSkill.level}
                          onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                          className="w-full bg-charcoal/20 border border-white/5 rounded px-2 py-1 text-[11px] text-warm-white"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-stone block mb-1">Years</label>
                        <input 
                          type="number" 
                          min={1} 
                          value={newSkill.years}
                          onChange={(e) => setNewSkill({ ...newSkill, years: parseInt(e.target.value) || 1 })}
                          className="w-full bg-charcoal/20 border border-white/5 rounded px-2 py-1 text-[11px] text-warm-white text-center font-mono"
                        />
                      </div>
                    </div>
                    <Button type="button" variant="accent" className="w-full py-1 text-[11px]" onClick={addSkill}>
                      Add Skill
                    </Button>
                  </div>
                  {/* List */}
                  <div className="md:col-span-7 flex flex-wrap gap-2 content-start">
                    {skills.map(s => (
                      <div key={s.name} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-cyan/5 border border-accent-cyan/15 text-[11.5px] font-mono text-accent-cyan">
                        <span>{s.name}</span>
                        <span className="text-[10px] text-stone/50">· {s.level} ({s.years}y)</span>
                        <button type="button" onClick={() => removeSkill(s.name)} className="p-0.5 rounded-full hover:bg-white/10 text-stone hover:text-warm-white cursor-pointer">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Experiences Timeline Editor */}
              <Card className="p-6 space-y-4">
                <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-accent-cyan" />
                  <span>Experiences Timeline</span>
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                    <Input label="Company" value={newExp.company} onChange={(e) => setNewExp({ ...newExp, company: e.target.value })} placeholder="Vercel" />
                    <Input label="Role" value={newExp.role} onChange={(e) => setNewExp({ ...newExp, role: e.target.value })} placeholder="Principal Architect" />
                    <Input label="Duration" value={newExp.duration} onChange={(e) => setNewExp({ ...newExp, duration: e.target.value })} placeholder="2024 - Present" />
                    <div className="sm:col-span-3">
                      <Input label="Description" value={newExp.description} onChange={(e) => setNewExp({ ...newExp, description: e.target.value })} placeholder="Brief summary of achievements..." />
                    </div>
                    <div className="sm:col-span-3 flex justify-end">
                      <Button type="button" variant="accent" className="py-1 text-[11px]" onClick={addExperience}>Add Experience</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {experience.map((exp, idx) => (
                      <div key={idx} className="p-3 bg-charcoal/20 border border-white/5 rounded-xl flex justify-between items-start">
                        <div>
                          <span className="text-[13px] font-bold text-warm-white">{exp.role} @ {exp.company}</span>
                          <span className="text-[10px] font-mono text-stone block">{exp.duration}</span>
                          <p className="text-[12px] text-stone mt-1">{exp.description}</p>
                        </div>
                        <button type="button" onClick={() => removeExperience(idx)} className="p-1 hover:bg-accent-pink/10 text-stone hover:text-accent-pink rounded cursor-pointer">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Education Timeline */}
              <Card className="p-6 space-y-4">
                <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-accent-cyan" />
                  <span>Education Credentials</span>
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                    <Input label="College" value={newEdu.college} onChange={(e) => setNewEdu({ ...newEdu, college: e.target.value })} placeholder="Stanford University" />
                    <Input label="Degree & Branch" value={newEdu.degree} onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value, branch: e.target.value })} placeholder="M.S. Computer Science" />
                    <Input label="Duration" value={newEdu.duration} onChange={(e) => setNewEdu({ ...newEdu, duration: e.target.value })} placeholder="2019 - 2021" />
                    <div className="sm:col-span-3">
                      <Input label="CGPA & Achievements" value={newEdu.achievements} onChange={(e) => setNewEdu({ ...newEdu, achievements: e.target.value })} placeholder="Optional: 3.9 GPA, Honors" />
                    </div>
                    <div className="sm:col-span-3 flex justify-end">
                      <Button type="button" variant="accent" className="py-1 text-[11px]" onClick={addEducation}>Add Education</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {education.map((edu, idx) => (
                      <div key={idx} className="p-3 bg-charcoal/20 border border-white/5 rounded-xl flex justify-between items-start">
                        <div>
                          <span className="text-[13px] font-bold text-warm-white">{edu.degree} — {edu.college}</span>
                          <span className="text-[10px] font-mono text-stone block">{edu.duration}</span>
                          <p className="text-[12px] text-stone mt-1">{edu.achievements}</p>
                        </div>
                        <button type="button" onClick={() => removeEducation(idx)} className="p-1 hover:bg-accent-pink/10 text-stone hover:text-accent-pink rounded cursor-pointer">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Achievements Showcase */}
              <Card className="p-6 space-y-4">
                <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-accent-cyan" />
                  <span>Showcased Achievements</span>
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                    <Input label="Title" value={newAch.title} onChange={(e) => setNewAch({ ...newAch, title: e.target.value })} placeholder="LeetCode Guardian" />
                    <Input label="Issuer" value={newAch.issuer} onChange={(e) => setNewAch({ ...newAch, issuer: e.target.value })} placeholder="LeetCode" />
                    <Input label="Verification Link" value={newAch.verificationUrl} onChange={(e) => setNewAch({ ...newAch, verificationUrl: e.target.value })} placeholder="https://leetcode.com/..." />
                    <div className="sm:col-span-3">
                      <Input label="Description" value={newAch.description} onChange={(e) => setNewAch({ ...newAch, description: e.target.value })} placeholder="Top 1% rating globally" />
                    </div>
                    <div className="sm:col-span-3 flex justify-end">
                      <Button type="button" variant="accent" className="py-1 text-[11px]" onClick={addAchievement}>Add Achievement</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {achievements.map((ach, idx) => (
                      <div key={idx} className="p-3 bg-charcoal/20 border border-white/5 rounded-xl flex justify-between items-start">
                        <div>
                          <span className="text-[13px] font-bold text-warm-white">{ach.title} ({ach.issuer})</span>
                          <span className="text-[12px] text-stone block">{ach.description}</span>
                          {ach.verificationUrl && <a href={ach.verificationUrl} target="_blank" className="text-[10px] text-accent-cyan font-mono hover:underline mt-1 block">Verify Link →</a>}
                        </div>
                        <button type="button" onClick={() => removeAchievement(idx)} className="p-1 hover:bg-accent-pink/10 text-stone hover:text-accent-pink rounded cursor-pointer">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Developer Social hooks */}
              <Card className="p-6 space-y-4">
                <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-accent-violet" />
                  <span>Developer Social hooks</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Website URL" value={website} onChange={(e) => { setWebsite(e.target.value); setIsDirty(true); }} className="font-mono text-[12px]" />
                  <Input label="GitHub URL" value={github} onChange={(e) => { setGithub(e.target.value); setIsDirty(true); }} className="font-mono text-[12px]" />
                  <Input label="LinkedIn URL" value={linkedin} onChange={(e) => { setLinkedin(e.target.value); setIsDirty(true); }} className="font-mono text-[12px]" />
                  <Input label="Twitter URL" value={twitter} onChange={(e) => { setTwitter(e.target.value); setIsDirty(true); }} className="font-mono text-[12px]" />
                  <Input label="Portfolio Link" value={portfolio} onChange={(e) => { setPortfolio(e.target.value); setIsDirty(true); }} className="font-mono text-[12px]" />
                  <Input label="YouTube URL" value={youtube} onChange={(e) => { setYoutube(e.target.value); setIsDirty(true); }} className="font-mono text-[12px]" />
                  <Input label="Discord Handle" value={discord} onChange={(e) => { setDiscord(e.target.value); setIsDirty(true); }} className="font-mono text-[12px]" />
                  <Input label="LeetCode Username" value={leetcode} onChange={(e) => { setLeetcode(e.target.value); setIsDirty(true); }} className="font-mono text-[12px]" />
                  <Input label="Medium Page" value={medium} onChange={(e) => { setMedium(e.target.value); setIsDirty(true); }} className="font-mono text-[12px]" />
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

        {/* TAB 4: API KEYS */}
        {activeTab === 'developer' && (
          <div className="space-y-6 max-w-2xl animate-fadeIn">
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

        {/* TAB 5: SECURITY */}
        {activeTab === 'security' && (
          <div className="space-y-6 max-w-2xl animate-fadeIn">
            {/* Active Sessions */}
            <Card className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h3 className="text-[14px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-accent-cyan" />
                  <span>Active Device Sessions</span>
                </h3>
                {sessions.length > 1 && (
                  <button
                    onClick={handleRevokeAllOtherSessions}
                    className="px-2.5 py-1 bg-accent-pink/15 hover:bg-accent-pink/25 border border-accent-pink/25 text-accent-pink text-[10px] font-mono font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    Revoke All Others
                  </button>
                )}
              </div>
              
              <div className="space-y-3.5 pt-2">
                {sessions.map(s => {
                  const isCurrent = s.sessionToken === (session as any)?.sessionToken;
                  return (
                    <div key={s.id} className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 flex items-center justify-between">
                      <div className="flex gap-3 items-center">
                        <Laptop className="w-5 h-5 text-accent-cyan" />
                        <div>
                          <span className="text-[13px] font-bold text-warm-white block">
                            {s.os || 'OS'} · {s.browser || 'Browser'}
                          </span>
                          <span className="text-[10px] text-stone font-mono">
                            IP: {s.ipAddress} ({s.location || 'Localhost'}) · Last Active: {new Date(s.lastActiveAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isCurrent ? (
                          <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan uppercase tracking-wider font-mono">
                            Current Session
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRevokeSession(s.id)}
                            className="px-2.5 py-1 bg-accent-pink/10 hover:bg-accent-pink/20 border border-accent-pink/20 text-accent-pink text-[10px] font-bold rounded cursor-pointer transition-colors"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {sessions.length === 0 && (
                  <p className="text-[11.5px] text-stone/40 italic py-4 text-center">No active sessions loaded.</p>
                )}
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
      </div>
    </div>
  );
}

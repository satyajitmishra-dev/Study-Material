'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle, 
  MapPin, 
  Globe, 
  Briefcase, 
  Code, 
  Camera, 
  Lightbulb, 
  Plus, 
  X,
  FileCheck
} from 'lucide-react';
import { Button, Card, Input } from '@/components/ui/core';
import ProfilePhotoManager from './ProfilePhotoManager';
import { savePublicProfileSettingsAction, checkUsernameAvailabilityAction } from '@/lib/actions/profileActions';

interface WizardProps {
  initialUser: any;
  onFinish: () => void;
}

const STEPS = [
  { id: 'username', label: 'Username System' },
  { id: 'photos', label: 'Avatar & Banner' },
  { id: 'bio', label: 'Bio & Headline' },
  { id: 'skills', label: 'Skills & Timeline' },
  { id: 'socials', label: 'Social Matrix' },
  { id: 'preview', label: 'Review & Launch' }
];

export default function ProfileSetupWizard({ initialUser, onFinish }: WizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile fields state
  const [username, setUsername] = useState(initialUser?.username || '');
  const [name, setName] = useState(initialUser?.name || '');
  const [avatar, setAvatar] = useState(initialUser?.avatar || initialUser?.image || '');
  const [coverImage, setCoverImage] = useState(initialUser?.authorProfile?.coverImage || '');
  const [headline, setHeadline] = useState(initialUser?.authorProfile?.headline || '');
  const [bio, setBio] = useState(initialUser?.authorProfile?.bio || '');
  const [location, setLocation] = useState(initialUser?.authorProfile?.location || '');
  const [website, setWebsite] = useState(initialUser?.authorProfile?.website || '');
  const [github, setGithub] = useState(initialUser?.authorProfile?.github || '');
  const [linkedin, setLinkedin] = useState(initialUser?.authorProfile?.linkedin || '');
  const [twitter, setTwitter] = useState(initialUser?.authorProfile?.twitter || '');
  const [portfolio, setPortfolio] = useState(initialUser?.authorProfile?.portfolio || '');
  const [youtube, setYoutube] = useState(initialUser?.authorProfile?.youtube || '');
  const [discord, setDiscord] = useState(initialUser?.authorProfile?.discord || '');
  const [hashnode, setHashnode] = useState(initialUser?.authorProfile?.hashnode || '');
  const [devto, setDevto] = useState(initialUser?.authorProfile?.devto || '');
  const [leetcode, setLeetcode] = useState(initialUser?.authorProfile?.leetcode || '');
  const [codeforces, setCodeforces] = useState(initialUser?.authorProfile?.codeforces || '');
  const [medium, setMedium] = useState(initialUser?.authorProfile?.medium || '');
  const [experienceLevel, setExperienceLevel] = useState(initialUser?.authorProfile?.experienceLevel || 'Mid Engineer');
  const [availability, setAvailability] = useState(initialUser?.authorProfile?.availability || 'available');

  // Skills chips list
  const [skills, setSkills] = useState<{ name: string; years: number; level: string; popularity: number }[]>(
    initialUser?.authorProfile?.skills ? JSON.parse(initialUser.authorProfile.skills) : []
  );
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillYears, setNewSkillYears] = useState(1);
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');

  // Username validation state
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameError, setUsernameError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Debounced Username validation trigger
  useEffect(() => {
    if (!username || username === initialUser?.username) {
      setUsernameStatus('idle');
      setUsernameError('');
      setSuggestions([]);
      return;
    }

    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailabilityAction(username);
        if (res.status === 'available') {
          setUsernameStatus('available');
          setUsernameError('');
          setSuggestions([]);
        } else if (res.status === 'taken') {
          setUsernameStatus('taken');
          setUsernameError('Username is taken.');
          setSuggestions(res.suggestions || []);
        } else {
          setUsernameStatus('invalid');
          setUsernameError(res.message || 'Invalid format.');
          setSuggestions([]);
        }
      } catch (err) {
        setUsernameStatus('idle');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, initialUser]);

  // Compute profile strength percentage
  const profileStrength = () => {
    let score = 0;
    if (username.length >= 3) score += 15;
    if (avatar) score += 15;
    if (coverImage) score += 10;
    if (bio.trim().length >= 10) score += 15;
    if (headline.trim().length >= 5) score += 10;
    if (location.trim().length >= 3) score += 5;
    if (skills.length > 0) score += 10;
    const socialUrls = [github, linkedin, twitter, website, youtube, discord, leetcode, medium];
    if (socialUrls.some(Boolean)) score += 15;
    if (experienceLevel) score += 5;
    return score;
  };

  const getMissingRecommendations = () => {
    const recs = [];
    if (!avatar) recs.push({ label: 'Profile Photo', points: 15, hint: 'Upload an avatar or generate a gradientfallback.' });
    if (!bio || bio.trim().length < 10) recs.push({ label: 'Bio Details', points: 15, hint: 'Write a short summary about your technical interests.' });
    if (skills.length === 0) recs.push({ label: 'Technical Skills', points: 10, hint: 'Add key skills chips (e.g. Next.js, Prisma).' });
    if (!github && !linkedin && !twitter) recs.push({ label: 'Social Handles', points: 15, hint: 'Connect GitHub, LinkedIn, or Twitter accounts.' });
    if (!coverImage) recs.push({ label: 'Profile Banner', points: 10, hint: 'Provide a cover image URL to elevate profile aesthetics.' });
    return recs;
  };

  const addSkillChip = () => {
    if (!newSkillName.trim()) return;
    if (skills.some(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) return;
    
    setSkills([
      ...skills,
      {
        name: newSkillName.trim(),
        years: newSkillYears,
        level: newSkillLevel,
        popularity: Math.floor(Math.random() * 20) + 80 // mock popularity score
      }
    ]);
    setNewSkillName('');
    setNewSkillYears(1);
    setNewSkillLevel('Intermediate');
  };

  const removeSkillChip = (name: string) => {
    setSkills(skills.filter(s => s.name !== name));
  };

  const handleNextStep = () => {
    if (stepIndex === 0 && usernameStatus !== 'available' && username !== initialUser?.username) {
      alert('Please select an available username first.');
      return;
    }
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const handleFinishSetup = async () => {
    setSaving(true);
    try {
      const res = await savePublicProfileSettingsAction({
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
        skills: JSON.stringify(skills)
      });

      if (res.success) {
        onFinish();
      } else {
        alert(res.error || 'Failed to complete profile wizard.');
      }
    } catch (err) {
      alert('Error saving profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const activeStep = STEPS[stepIndex];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-fadeIn">
      {/* Wizard Header Progress */}
      <div className="border-b border-white/5 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-accent-cyan uppercase tracking-wider font-bold">Showcase Setup</span>
          <h1 className="text-2xl font-extrabold text-warm-white tracking-tight mt-1">Profile Creation Wizard</h1>
          <p className="text-[12.5px] text-stone font-light">
            Step {stepIndex + 1} of {STEPS.length}: {activeStep.label}
          </p>
        </div>

        {/* Profile Strength Indicator */}
        <div className="flex items-center gap-3 bg-charcoal/20 border border-white/5 px-4 py-2 rounded-xl">
          <div className="text-right">
            <span className="text-[10px] text-stone block uppercase font-mono tracking-wider font-bold">Profile Strength</span>
            <span className="text-[13px] font-bold text-warm-white font-mono mt-0.5">{profileStrength()}%</span>
          </div>
          <div className="w-16 h-2 rounded-full bg-white/5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${profileStrength() >= 75 ? 'bg-accent-emerald' : profileStrength() >= 45 ? 'bg-accent-amber' : 'bg-accent-pink'}`}
              style={{ width: `${profileStrength()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stepper Dots Indicator */}
      <div className="flex justify-between items-center px-1">
        {STEPS.map((s, idx) => {
          const isActive = idx === stepIndex;
          const isCompleted = idx < stepIndex;
          return (
            <div key={s.id} className="flex flex-col items-center gap-1.5 flex-1 relative">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono border transition-all duration-200
                  ${isActive ? 'bg-accent-cyan text-onyx border-accent-cyan shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 
                    isCompleted ? 'bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald' : 
                    'bg-charcoal border-white/5 text-stone'}`}
              >
                {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
              </div>
              <span className={`text-[9px] font-mono tracking-wider hidden sm:block ${isActive ? 'text-warm-white font-bold' : 'text-stone/60'}`}>
                {s.label}
              </span>
              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className={`absolute left-[calc(50%+15px)] right-[calc(-50%+15px)] top-3 h-[1px] -z-10 bg-white/5 ${idx < stepIndex ? 'bg-accent-emerald/30' : ''}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Wizard Form Panels */}
      <div className="min-h-[350px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep.id}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.2 }}
          >
            {/* STEP 1: USERNAME */}
            {activeStep.id === 'username' && (
              <Card className="p-6 space-y-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-stone">Enterprise Username Check</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Input 
                      label="Account Display Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Satyajit Mishra"
                    />

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">Unique Profile Username</label>
                      <div className="relative group">
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="e.g. satyajit-dev"
                          className="w-full px-3 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 font-mono"
                        />
                        {usernameStatus === 'checking' && (
                          <span className="absolute right-3 top-2.5 text-[10px] font-mono text-stone animate-pulse">Checking...</span>
                        )}
                        {usernameStatus === 'available' && (
                          <span className="absolute right-3 top-2.5 text-[10px] font-mono text-accent-emerald font-bold">Available</span>
                        )}
                        {usernameStatus === 'taken' && (
                          <span className="absolute right-3 top-2.5 text-[10px] font-mono text-accent-pink font-bold">Taken</span>
                        )}
                        {usernameStatus === 'invalid' && (
                          <span className="absolute right-3 top-2.5 text-[10px] font-mono text-accent-amber font-bold">Invalid</span>
                        )}
                      </div>
                      
                      <span className="text-[10px] text-stone/50 block font-mono">
                        URL Preview: https://studymaterial.utool.in/u/{username || 'username'}
                      </span>

                      {usernameError && (
                        <p className="text-accent-pink text-[11px] font-mono flex items-center gap-1 mt-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>{usernameError}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Username suggestions panel */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-stone uppercase tracking-wider font-bold block">Username Guidance</span>
                    <p className="text-[12px] text-stone leading-relaxed font-light">
                      Must be 3-30 characters long, lowercase letters, numbers, and hyphens. No special characters, spaces, or consecutive hyphens.
                    </p>

                    {suggestions.length > 0 && (
                      <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-2">
                        <span className="text-[9px] font-mono text-accent-cyan uppercase tracking-wider block">Available Suggestions:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {suggestions.map(sug => (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => setUsername(sug)}
                              className="px-2 py-0.5 rounded border border-white/5 bg-white/5 text-[11px] font-mono text-stone hover:text-warm-white hover:border-white/10 transition-colors"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* STEP 2: PHOTOS */}
            {activeStep.id === 'photos' && (
              <div className="space-y-6">
                <ProfilePhotoManager 
                  initialValue={avatar}
                  onChange={setAvatar}
                  label="Developer Avatar Image"
                />

                <Card className="p-5 space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-stone">Profile Cover Photo Banner</h3>
                  <p className="text-[11px] text-stone leading-relaxed font-light">
                    Paste a cover image URL (ideal aspect ratio 16:9) to skin your profile header block.
                  </p>
                  <Input 
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="font-mono text-[12px]"
                  />
                  {coverImage && (
                    <div className="w-full h-24 rounded-lg overflow-hidden border border-white/5 mt-2">
                      <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* STEP 3: BIO */}
            {activeStep.id === 'bio' && (
              <Card className="p-6 space-y-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-stone">Headline & Bio Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Input 
                        label="Profile Professional Headline"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value.substring(0, 80))}
                        placeholder="e.g. Principal Software Architect | Open Source Creator"
                      />
                      <span className="text-[9px] font-mono text-stone/50 block text-right">{headline.length}/80 characters</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        label="Location / Coordinates"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Bhubaneswar, India"
                      />

                      <div>
                        <label className="text-[11px] font-semibold text-stone uppercase tracking-wider block mb-1.5">Availability Scope</label>
                        <select 
                          value={availability}
                          onChange={(e) => setAvailability(e.target.value)}
                          className="w-full bg-charcoal/20 border border-white/5 rounded-lg text-[13px] px-3 py-2 text-warm-white outline-none focus:border-white/20"
                        >
                          <option value="available">Available for Hire / Contract</option>
                          <option value="busy">Busy / Working</option>
                          <option value="not_looking">Not Looking / Employed</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-stone uppercase tracking-wider block">Developer Professional Bio</label>
                    <textarea 
                      rows={5}
                      value={bio}
                      onChange={(e) => setBio(e.target.value.substring(0, 300))}
                      placeholder="Share a short summary outlining compile designs, libraries, or architectures you write..."
                      className="w-full p-3 text-[12.5px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/10 resize-none font-light leading-relaxed"
                    />
                    <div className="flex justify-between items-center text-[9px] font-mono text-stone/50">
                      <span>Live counter (Removes scripts/HTML headings automatically)</span>
                      <span>{bio.length}/300 characters</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* STEP 4: SKILLS */}
            {activeStep.id === 'skills' && (
              <Card className="p-6 space-y-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-stone">Skills Chips & Competency</h3>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Add skill chip form */}
                  <div className="md:col-span-5 space-y-4 p-4 rounded-xl bg-onyx/50 border border-white/5">
                    <span className="text-[10px] font-mono text-accent-cyan uppercase tracking-wider font-bold block">Add Skill Badge</span>
                    
                    <Input 
                      label="Skill Name"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="e.g. Next.js, Prisma, Rust"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-stone uppercase tracking-wider block mb-1">Level</label>
                        <select 
                          value={newSkillLevel}
                          onChange={(e) => setNewSkillLevel(e.target.value)}
                          className="w-full bg-charcoal/20 border border-white/5 rounded-lg text-[12px] px-2.5 py-1.5 text-warm-white outline-none focus:border-white/20"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-stone uppercase tracking-wider block">Years</label>
                        <input 
                          type="number"
                          min={1}
                          max={30}
                          value={newSkillYears}
                          onChange={(e) => setNewSkillYears(parseInt(e.target.value) || 1)}
                          className="w-full px-2.5 py-1.5 text-[12px] bg-charcoal/20 border border-white/5 rounded-lg outline-none text-warm-white focus:border-white/10 font-mono text-center"
                        />
                      </div>
                    </div>

                    <Button 
                      type="button"
                      variant="accent"
                      className="w-full py-1.5 text-[11px] justify-center mt-2"
                      onClick={addSkillChip}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Skill Chip</span>
                    </Button>
                  </div>

                  {/* Skills lists display */}
                  <div className="md:col-span-7 space-y-4">
                    <span className="text-[10px] font-mono text-stone uppercase tracking-wider font-bold block">Configured Chips</span>
                    
                    <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto pr-1">
                      {skills.map(s => (
                        <div 
                          key={s.name} 
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-cyan/5 border border-accent-cyan/15 text-[12px] text-accent-cyan hover:bg-accent-cyan/10 transition-all font-mono font-medium"
                        >
                          <span>{s.name}</span>
                          <span className="text-[10px] text-stone/70">· {s.level} ({s.years}y)</span>
                          <button 
                            onClick={() => removeSkillChip(s.name)}
                            className="p-0.5 rounded-full hover:bg-white/10 text-stone hover:text-warm-white transition-colors cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {skills.length === 0 && (
                        <p className="italic text-stone/50 text-[12px] py-4 text-center w-full">No skill badges configured yet.</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/5">
                      <label className="text-[11px] font-semibold text-stone uppercase tracking-wider block mb-1">Experience Level Badge</label>
                      <select 
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full max-w-[200px] bg-charcoal/20 border border-white/5 rounded-lg text-[12px] px-3 py-1.5 text-warm-white outline-none focus:border-white/20"
                      >
                        <option value="Junior Engineer">Junior Engineer</option>
                        <option value="Mid Engineer">Mid Engineer</option>
                        <option value="Senior Engineer">Senior Engineer</option>
                        <option value="Lead Architect">Lead Architect</option>
                        <option value="Principal Architect">Principal Architect</option>
                      </select>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* STEP 5: SOCIALS */}
            {activeStep.id === 'socials' && (
              <Card className="p-6 space-y-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-stone">Developer Social Links Matrix</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="GitHub profile link"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="font-mono text-[12px]"
                  />
                  <Input 
                    label="LinkedIn Profile"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="font-mono text-[12px]"
                  />
                  <Input 
                    label="Twitter / X profile"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="https://twitter.com/..."
                    className="font-mono text-[12px]"
                  />
                  <Input 
                    label="Website URL"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://mysite.dev"
                    className="font-mono text-[12px]"
                  />
                  <Input 
                    label="LeetCode Profile"
                    value={leetcode}
                    onChange={(e) => setLeetcode(e.target.value)}
                    placeholder="https://leetcode.com/..."
                    className="font-mono text-[12px]"
                  />
                  <Input 
                    label="Medium Page"
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                    placeholder="https://medium.com/@..."
                    className="font-mono text-[12px]"
                  />
                </div>
              </Card>
            )}

            {/* STEP 6: PREVIEW */}
            {activeStep.id === 'preview' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* Profile strengths audit checklist */}
                <div className="md:col-span-5 space-y-4">
                  <Card className="p-5 space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-stone flex items-center gap-1">
                      <Lightbulb className="w-4 h-4 text-accent-cyan" />
                      <span>Profile Optimization Check</span>
                    </h3>

                    <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                      {getMissingRecommendations().map((rec, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-charcoal/20 border border-white/5 space-y-1 text-[11.5px] leading-snug">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-accent-pink font-bold">-{rec.points}% score</span>
                            <span className="text-stone uppercase">{rec.label}</span>
                          </div>
                          <p className="text-warm-white font-medium">{rec.hint}</p>
                        </div>
                      ))}
                      {getMissingRecommendations().length === 0 && (
                        <div className="p-3 bg-accent-emerald/5 border border-accent-emerald/20 text-accent-emerald rounded-lg text-center text-[12px] font-medium flex flex-col items-center gap-1.5">
                          <CheckCircle className="w-8 h-8 text-accent-emerald" />
                          <span>100% Strength Achieved! Perfect Setup!</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Developer Profile card preview mockup */}
                <div className="md:col-span-7 space-y-4">
                  <span className="text-[10px] font-mono text-stone uppercase tracking-wider font-bold block">Developer Card Preview</span>

                  <Card className="p-5 space-y-4 relative overflow-hidden bg-gradient-to-r from-charcoal/20 to-onyx">
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-xl border border-white/10 bg-charcoal shrink-0 overflow-hidden relative">
                        {avatar ? (
                          <img src={avatar} alt="avatar preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[24px]">👨‍💻</div>
                        )}
                      </div>
                      <div className="truncate">
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-accent-cyan/15 border border-accent-cyan/20 text-accent-cyan uppercase tracking-wider">
                          {experienceLevel}
                        </span>
                        <h4 className="text-[15px] font-bold text-warm-white truncate mt-1">{name || 'Your Name'}</h4>
                        <span className="text-[10px] font-mono text-stone block">@{username || 'username'}</span>
                      </div>
                    </div>

                    <p className="text-[12.5px] text-stone leading-relaxed font-light line-clamp-2">
                      {headline || 'Your Professional headline role title goes here.'}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {skills.slice(0, 4).map(s => (
                        <span key={s.name} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono text-stone">
                          {s.name}
                        </span>
                      ))}
                      {skills.length > 4 && <span className="text-[10px] font-mono text-stone/50">+{skills.length - 4} more</span>}
                    </div>

                    {location && (
                      <span className="text-[11px] text-stone font-mono flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-accent-pink" />
                        <span>{location}</span>
                      </span>
                    )}
                  </Card>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between border-t border-white/5 pt-5">
        <Button
          type="button"
          variant="secondary"
          onClick={handlePrevStep}
          disabled={stepIndex === 0 || saving}
          className="text-[11.5px] py-2 px-4 select-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Step</span>
        </Button>

        {stepIndex === STEPS.length - 1 ? (
          <Button
            type="button"
            variant="accent"
            onClick={handleFinishSetup}
            disabled={saving}
            className="text-[11.5px] py-2 px-5 bg-accent-cyan/15 text-accent-cyan font-bold"
          >
            {saving ? 'Completing profile...' : 'Finish Setup & Launch'}
            <Sparkles className="w-4 h-4 text-accent-cyan" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            onClick={handleNextStep}
            disabled={saving}
            className="text-[11.5px] py-2 px-5"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components/ui/core';
import { createNoteAction } from '@/lib/actions/noteActions';
import { 
  BookMarked, 
  Upload, 
  FileText, 
  AlertCircle, 
  Trash2, 
  Save, 
  ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function UploadNotePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/notes/upload');
    }
  }, [status, router]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-onyx text-warm-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
          <span className="text-[12px] font-mono text-stone">Authenticating session...</span>
        </div>
      </div>
    );
  }

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [fileName, setFileName] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'unlisted'>('public');
  const [technology, setTechnology] = useState('');
  const [category, setCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [language, setLanguage] = useState('en');
  const [license, setLicense] = useState('MIT');
  const [coverImage, setCoverImage] = useState('');

  // Academic Metadata
  const [university, setUniversity] = useState('');
  const [semester, setSemester] = useState('');
  const [branch, setBranch] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');

  // Unsaved changes warning state
  const [isDirty, setIsDirty] = useState(false);

  // Load draft from LocalStorage
  useEffect(() => {
    const draft = localStorage.getItem('sm_note_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setTitle(parsed.title || '');
        setDescription(parsed.description || '');
        setTechnology(parsed.technology || '');
        setCategory(parsed.category || '');
        setVisibility(parsed.visibility || 'public');
        setUniversity(parsed.university || '');
        setSemester(parsed.semester || '');
        setBranch(parsed.branch || '');
        setSubject(parsed.subject || '');
        setTopic(parsed.topic || '');
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save draft periodically
  useEffect(() => {
    if (title || description || university) {
      setIsDirty(true);
      const draft = { title, description, technology, category, visibility, university, semester, branch, subject, topic };
      localStorage.setItem('sm_note_draft', JSON.stringify(draft));
    }
  }, [title, description, technology, category, visibility, university, semester, branch, subject, topic]);

  // Alert on tab close if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !success) {
        e.preventDefault();
        e.returnValue = 'You have unsaved draft changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, success]);

  // Client-side file validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['pdf', 'docx', 'pptx', 'md', 'txt', 'zip', 'png', 'jpg', 'jpeg'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (!ext || !allowedExtensions.includes(ext)) {
      setError(`Invalid file format. Allowed: PDF, DOCX, PPTX, Markdown, TXT, ZIP, Images.`);
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('File size exceeds the 20MB maximum limit.');
      return;
    }

    setError('');
    setFileName(file.name);
    setFileType(ext.toUpperCase());
    setFileSize(file.size);
    // Directly mock URL storage since notes are documents (for sandbox dev)
    setFileUrl(`/uploads/notes/${file.name}`);
  };

  const handleClearDraft = () => {
    localStorage.removeItem('sm_note_draft');
    setTitle('');
    setDescription('');
    setTechnology('');
    setCategory('');
    setUniversity('');
    setSemester('');
    setBranch('');
    setSubject('');
    setTopic('');
    setFileName('');
    setFileUrl('');
    setIsDirty(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError('Title is required');
      return;
    }
    if (!fileUrl) {
      setError('Please choose a file to upload');
      return;
    }

    setLoading(true);
    setError('');

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    try {
      const res = await createNoteAction({
        title,
        description,
        fileUrl,
        fileType,
        fileSize,
        visibility,
        technology: technology || undefined,
        category: category || undefined,
        tags,
        language,
        license,
        coverImage: coverImage || undefined,
        university: university || undefined,
        semester: semester ? parseInt(semester) : undefined,
        branch: branch || undefined,
        subject: subject || undefined,
        topic: topic || undefined,
      });

      if (res.success) {
        setSuccess(true);
        localStorage.removeItem('sm_note_draft');
        setIsDirty(false);
        router.push('/');
      } else {
        setError(res.error || 'Failed to upload note.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pt-12 pb-16 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-stone hover:text-warm-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-[10px] font-mono text-accent-cyan uppercase tracking-wider">Notes workspace</span>
          <h1 className="text-2xl font-black text-warm-white">Upload Note Document</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-accent-pink/10 border border-accent-pink/20 text-accent-pink text-[12.5px] rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. File Upload Card */}
        <Card className="p-6 border-white/5 bg-charcoal/20 space-y-4">
          <h3 className="text-[13.5px] font-bold text-warm-white font-mono uppercase tracking-wide flex items-center gap-2">
            <span className="w-1 h-3 bg-accent-cyan rounded-full" /> Note File Attachment
          </h3>
          
          <div className="border border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-3 bg-charcoal/30 relative">
            <input 
              type="file" 
              accept=".pdf,.docx,.pptx,.md,.txt,.zip,image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-stone">
              <Upload className="w-5 h-5 text-accent-cyan" />
            </div>
            {fileName ? (
              <div className="space-y-1">
                <span className="text-[13px] font-semibold text-warm-white">{fileName}</span>
                <p className="text-[11px] text-stone">{fileType} File • {formatBytes(fileSize)}</p>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-[12.5px] font-semibold text-warm-white">Drag and drop file here, or click to browse</span>
                <p className="text-[11.5px] text-stone font-light">PDF, DOCX, PPTX, ZIP, Markdown, TXT (Max 20MB)</p>
              </div>
            )}
          </div>
        </Card>

        {/* 2. Primary Metadata Card */}
        <Card className="p-6 border-white/5 bg-charcoal/20 space-y-4">
          <h3 className="text-[13.5px] font-bold text-warm-white font-mono uppercase tracking-wide flex items-center gap-2">
            <span className="w-1 h-3 bg-accent-cyan rounded-full" /> Note Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px]">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[11px] font-mono text-stone uppercase font-bold">Note Title *</label>
              <input 
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g. Java Collections Framework Notes"
                className="w-full bg-charcoal/30 border border-white/5 rounded-lg px-3 py-2 text-warm-white outline-none focus:border-white/10"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[11px] font-mono text-stone uppercase font-bold">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a brief overview of topics covered in these notes..."
                rows={4}
                className="w-full bg-charcoal/30 border border-white/5 rounded-lg px-3 py-2 text-warm-white outline-none focus:border-white/10 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-stone uppercase font-bold">Technology / Subject</label>
              <input 
                type="text"
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
                placeholder="E.g. Java, AWS, Compiler Design"
                className="w-full bg-charcoal/30 border border-white/5 rounded-lg px-3 py-2 text-warm-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-stone uppercase font-bold">Category</label>
              <input 
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="E.g. Computer Science, Web Engineering"
                className="w-full bg-charcoal/30 border border-white/5 rounded-lg px-3 py-2 text-warm-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-stone uppercase font-bold">Tags (Comma-separated)</label>
              <input 
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="E.g. OOP, collections, cheat-sheet"
                className="w-full bg-charcoal/30 border border-white/5 rounded-lg px-3 py-2 text-warm-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-stone uppercase font-bold">Visibility *</label>
              <select
                value={visibility}
                onChange={(e: any) => setVisibility(e.target.value)}
                className="w-full bg-charcoal/30 border border-white/5 rounded-lg p-2 text-stone outline-none cursor-pointer"
              >
                <option value="public">Public (Visible in Home & Search)</option>
                <option value="private">Private (Only visible in my Workspace)</option>
                <option value="unlisted">Unlisted (Visible only via Direct Link)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* 3. Academic Metadata Card */}
        <Card className="p-6 border-white/5 bg-charcoal/20 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[13.5px] font-bold text-warm-white font-mono uppercase tracking-wide flex items-center gap-2">
              <span className="w-1 h-3 bg-accent-amber rounded-full" /> Academic Context (Optional)
            </h3>
            <span className="text-[10px] text-stone font-mono uppercase">University/College</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px]">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-stone uppercase font-bold">University / College Name</label>
              <input 
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="E.g. Stanford University"
                className="w-full bg-charcoal/30 border border-white/5 rounded-lg px-3 py-2 text-warm-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-stone uppercase font-bold">Semester</label>
              <input 
                type="number"
                min={1}
                max={10}
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="E.g. 4"
                className="w-full bg-charcoal/30 border border-white/5 rounded-lg px-3 py-2 text-warm-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-stone uppercase font-bold">Branch / Department</label>
              <input 
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="E.g. Computer Science & Eng"
                className="w-full bg-charcoal/30 border border-white/5 rounded-lg px-3 py-2 text-warm-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-stone uppercase font-bold">Subject Code / Name</label>
              <input 
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="E.g. CS244: Operating Systems"
                className="w-full bg-charcoal/30 border border-white/5 rounded-lg px-3 py-2 text-warm-white outline-none"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[11px] font-mono text-stone uppercase font-bold">Topic Name</label>
              <input 
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="E.g. Semaphores, Lock synchronization, Deadlock avoidance"
                className="w-full bg-charcoal/30 border border-white/5 rounded-lg px-3 py-2 text-warm-white outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Buttons / Actions */}
        <div className="flex justify-between items-center pt-2">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleClearDraft}
            className="text-[12px] border-white/5 bg-charcoal/20 text-accent-pink hover:bg-accent-pink/5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Discard Draft</span>
          </Button>

          <div className="flex gap-3">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading}
              className="text-[12px] font-bold uppercase tracking-wider py-2 px-6"
            >
              {loading ? 'Uploading...' : 'Publish Note'}
            </Button>
          </div>
        </div>

      </form>
    </div>
  );
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

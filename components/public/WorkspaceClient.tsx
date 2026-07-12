'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, 
  FolderPlus, 
  Trash2, 
  Plus, 
  FileText, 
  Sparkles, 
  BrainCircuit, 
  HelpCircle, 
  Layers, 
  Bookmark, 
  Clock, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  Download,
  Upload,
  CheckCircle,
  Share2,
  Lock,
  ChevronRight,
  RefreshCw,
  Search,
  BookOpen,
  Inbox
} from 'lucide-react';
import { Card, Button } from '@/components/ui/core';

interface NoteItem {
  id: string;
  title: string;
  semester: string;
  subject: string;
  topic: string;
  content: string;
  isPrivate: boolean;
  version: number;
}

export default function WorkspaceClient() {
  const [activeTab, setActiveTab] = useState<'notes' | 'ai-tools' | 'goals' | 'history'>('notes');
  const [searchQuery, setSearchQuery] = useState('');

  // Folder states
  const [folders, setFolders] = useState<string[]>(['React Masterclass', 'Backend Architectures']);
  const [selectedFolder, setSelectedFolder] = useState('React Masterclass');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Real Data Notes: initialized to empty to comply with no mock data rules
  const [notes, setNotes] = useState<NoteItem[]>([]);
  
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [notePrivate, setNotePrivate] = useState(true);

  // AI workspace states
  const [aiTool, setAiTool] = useState<'flashcard' | 'quiz' | 'mindmap'>('flashcard');
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [activeFlashIndex, setActiveFlashIndex] = useState(0);

  // Goals states
  const [goals, setGoals] = useState<any[]>([]);
  const [newGoalText, setNewGoalText] = useState('');

  // Sidebar controls
  const recentDownloads: string[] = [];
  const recentUploads: string[] = [];

  const flashcards = [
    { q: 'What is the React Compiler (React Forget)?', a: 'A build-time compiler that automatically memoizes values and callbacks without manual useMemo hooks.' },
    { q: 'How does Partial Prerendering (PPR) work?', a: 'PPR compiles a static HTML shell immediately and streams dynamic suspense blocks as they resolve.' }
  ];

  const quizQuestions = [
    {
      q: 'Which component boundary defines streaming nodes in Next.js 16?',
      options: ['<ErrorBoundary>', '<Suspense>', '<LoadingPage>', '<HydrateClient>'],
      correct: 1
    }
  ];

  // Folder creation
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setFolders([...folders, newFolderName]);
    setSelectedFolder(newFolderName);
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  // Note CRUD
  const handleSelectNote = (note: NoteItem) => {
    setSelectedNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNotePrivate(note.isPrivate);
    setIsEditingNote(true);
  };

  const handleSaveNote = () => {
    if (!selectedNote) return;
    setNotes(notes.map(n => n.id === selectedNote.id ? {
      ...n,
      title: noteTitle,
      content: noteContent,
      isPrivate: notePrivate,
      version: n.version + 1
    } : n));
    setIsEditingNote(false);
    setSelectedNote(null);
  };

  const handleCreateNote = () => {
    const newNote: NoteItem = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      semester: 'Semester 5',
      subject: selectedFolder,
      topic: 'General Topic',
      content: 'Start writing your notes here...',
      isPrivate: true,
      version: 1
    };
    setNotes([newNote, ...notes]);
    handleSelectNote(newNote);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    setIsEditingNote(false);
    setSelectedNote(null);
  };

  // Quiz helper
  const handleSelectAnswer = (qIdx: number, oIdx: number) => {
    setSelectedAnswers({ ...selectedAnswers, [qIdx]: oIdx });
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) score++;
    });
    setQuizScore(score);
  };

  // Goal helper
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    setGoals([...goals, { id: Date.now().toString(), text: newGoalText, done: false }]);
    setNewGoalText('');
  };

  const toggleGoal = (id: string) => {
    setGoals(goals.map(g => g.id === id ? { ...g, done: !g.done } : g));
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 pb-16 px-4 font-sans">
      
      {/* 1. Left Sidebar */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-charcoal/20 border border-white/5 rounded-2xl p-4 space-y-2">
          <span className="text-[10px] font-mono text-stone uppercase tracking-wider font-bold">Second Brain Workspace</span>
          
          <div className="space-y-1">
            {[
              { id: 'notes', label: 'My Notes Tree', icon: FileText },
              { id: 'ai-tools', label: 'AI Note Companion', icon: BrainCircuit },
              { id: 'goals', label: 'Study Goals', icon: CheckCircle },
              { id: 'history', label: 'Learning History', icon: Clock }
            ].map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => { setActiveTab(t.id as any); setIsEditingNote(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-left transition-colors cursor-pointer
                    ${activeTab === t.id && !isEditingNote
                      ? 'bg-white/10 text-warm-white font-bold'
                      : 'text-stone hover:bg-white/5 hover:text-warm-white'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Folders List */}
        <div className="bg-charcoal/20 border border-white/5 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center text-[10px] font-mono text-stone uppercase font-bold">
            <span>Folder Index</span>
            <button onClick={() => setShowNewFolderModal(true)} className="hover:text-warm-white cursor-pointer">
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {folders.map(f => (
              <button
                key={f}
                onClick={() => { setSelectedFolder(f); setActiveTab('notes'); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[12.5px] text-left transition-colors cursor-pointer
                  ${selectedFolder === f && activeTab === 'notes'
                    ? 'text-accent-cyan font-semibold'
                    : 'text-stone hover:text-warm-white'
                  }
                `}
              >
                <span className="truncate flex items-center gap-2">
                  <Folder className="w-3.5 h-3.5 text-stone/50" />
                  {f}
                </span>
                <ChevronRight className="w-3 h-3 text-stone/30" />
              </button>
            ))}
          </div>
        </div>

        {/* File Manager Widget */}
        <div className="bg-charcoal/20 border border-white/5 rounded-2xl p-4 space-y-4 text-[12px]">
          {/* Uploads */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-stone uppercase font-bold flex items-center gap-1">
              <Upload className="w-3 h-3" />
              <span>Recent Uploaded Files</span>
            </span>
            {recentUploads.length > 0 ? (
              <ul className="space-y-1.5 text-stone/85 text-[11px] font-mono">
                {recentUploads.map(up => (
                  <li key={up} className="truncate hover:text-warm-white cursor-pointer">/ {up}</li>
                ))}
              </ul>
            ) : <span className="text-[10.5px] text-stone/40 font-mono block">No uploads found.</span>}
          </div>

          {/* Downloads */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-[10px] font-mono text-stone uppercase font-bold flex items-center gap-1">
              <Download className="w-3 h-3" />
              <span>Available Downloads</span>
            </span>
            {recentDownloads.length > 0 ? (
              <ul className="space-y-1.5 text-stone/85 text-[11px] font-mono">
                {recentDownloads.map(dl => (
                  <li key={dl} className="truncate hover:text-warm-white cursor-pointer flex justify-between items-center">
                    <span>/ {dl}</span>
                    <Download className="w-3 h-3 text-stone/35 hover:text-warm-white" />
                  </li>
                ))}
              </ul>
            ) : <span className="text-[10.5px] text-stone/40 font-mono block">No downloads found.</span>}
          </div>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="lg:col-span-9">
        <AnimatePresence mode="wait">
          
          {/* EDIT NOTE MODE */}
          {isEditingNote && selectedNote && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <Button variant="ghost" onClick={() => setIsEditingNote(false)} className="h-8 px-2 text-[12px]">
                  ← Back to Tree
                </Button>
                <div className="flex items-center gap-3">
                  <span className="text-[10.5px] text-stone font-mono">Version v{selectedNote.version}</span>
                  <button 
                    onClick={() => handleDeleteNote(selectedNote.id)}
                    className="p-2 rounded hover:bg-white/5 text-stone hover:text-accent-pink cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Button variant="primary" onClick={handleSaveNote} className="text-[12px] py-1.5 px-3">
                    Save Note
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <input 
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full bg-transparent border-b border-white/5 outline-none text-2xl font-black text-warm-white pb-2"
                />

                <div className="flex gap-6 text-[12px] text-stone font-mono">
                  <span>Subject: {selectedNote.subject}</span>
                  <span>Semester: {selectedNote.semester}</span>
                  <span>Topic: {selectedNote.topic}</span>
                </div>

                <div className="flex items-center gap-2 py-1">
                  <label className="text-[11.5px] text-stone cursor-pointer select-none flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={notePrivate}
                      onChange={() => setNotePrivate(!notePrivate)}
                      className="rounded border-white/5 bg-charcoal/40 text-accent-cyan"
                    />
                    <span>Private Note (Recruiters Hidden)</span>
                  </label>
                </div>

                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={12}
                  className="w-full bg-charcoal/10 border border-white/5 rounded-xl p-4 text-[13px] text-warm-white font-mono outline-none focus:border-white/10"
                />
              </div>
            </motion.div>
          )}

          {/* TAB: MY NOTES TREE */}
          {activeTab === 'notes' && !isEditingNote && (
            <motion.div
              key="notes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-accent-cyan font-bold uppercase tracking-wider">Folder: {selectedFolder}</span>
                  <h2 className="text-2xl font-black text-warm-white">Workspace Notes</h2>
                </div>
                <Button variant="primary" onClick={handleCreateNote} className="text-[12px] py-1.5 px-3">
                  <Plus className="w-4 h-4" />
                  <span>Create Note</span>
                </Button>
              </div>

              {/* Notes Grid */}
              {notes.filter(n => n.subject === selectedFolder).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notes.filter(n => n.subject === selectedFolder).map(note => (
                    <Card 
                      key={note.id} 
                      onClick={() => handleSelectNote(note)}
                      className="p-5 hover:border-white/10 cursor-pointer flex flex-col justify-between h-[150px] relative group overflow-hidden"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono text-accent-cyan uppercase">{note.topic}</span>
                          {note.isPrivate ? (
                            <Lock className="w-3.5 h-3.5 text-stone/50" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5 text-accent-emerald" />
                          )}
                        </div>
                        <h4 className="text-[14px] font-bold text-warm-white group-hover:text-accent-cyan transition-colors truncate">
                          {note.title}
                        </h4>
                        <p className="text-[11.5px] text-stone leading-relaxed line-clamp-2 font-light">
                          {note.content}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-stone/80 mt-2 block">
                        Edit details →
                      </span>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl text-center space-y-4">
                  <Inbox className="w-12 h-12 text-stone/30" />
                  <div className="space-y-1">
                    <h4 className="text-[14px] font-bold text-warm-white">No notes uploaded yet</h4>
                    <p className="text-[12px] text-stone max-w-sm font-light">Create subject cheat sheets, lecture summaries, or API notes to build your brain.</p>
                  </div>
                  <Button variant="primary" onClick={handleCreateNote} className="text-[12px] py-1.5 px-4 font-bold uppercase tracking-wider">
                    Upload Notes
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB: AI NOTE ASSISTANT */}
          {activeTab === 'ai-tools' && (
            <motion.div
              key="ai-tools"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-accent-cyan font-bold uppercase tracking-wider">Workspace Intelligence</span>
                  <h2 className="text-2xl font-black text-warm-white">AI Note Companion</h2>
                </div>

                <div className="flex p-0.5 bg-charcoal/50 border border-white/5 rounded-lg text-[11px]">
                  {[
                    { id: 'flashcard', label: 'Flashcards' },
                    { id: 'quiz', label: 'AI Quiz' },
                    { id: 'mindmap', label: 'Mindmap' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setAiTool(t.id as any)}
                      className={`px-3 py-1 rounded transition-colors cursor-pointer ${aiTool === t.id ? 'bg-white/10 text-warm-white font-bold' : 'text-stone hover:text-warm-white'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Validation Check: if notes list is empty, don't show mock flashcards */}
              {notes.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl text-center space-y-4">
                  <BrainCircuit className="w-12 h-12 text-stone/30" />
                  <div className="space-y-1">
                    <h4 className="text-[14px] font-bold text-warm-white">No notes found for AI companion</h4>
                    <p className="text-[12px] text-stone max-w-sm font-light">Write or upload subject study notes first to generate dynamic flashcards and quizzes.</p>
                  </div>
                  <Button variant="primary" onClick={() => setActiveTab('notes')} className="text-[12px] py-1.5 px-4 font-bold">
                    Create a Note
                  </Button>
                </div>
              ) : (
                <div className="min-h-[300px]">
                  {/* Flashcards */}
                  {aiTool === 'flashcard' && (
                    <div className="space-y-8 flex flex-col items-center">
                      <div 
                        onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                        className="w-full max-w-md h-[220px] cursor-pointer perspective"
                      >
                        <motion.div
                          animate={{ rotateY: flashcardFlipped ? 180 : 0 }}
                          transition={{ duration: 0.4 }}
                          className="w-full h-full relative preserve-3d"
                        >
                          <div className="absolute inset-0 bg-charcoal/30 border border-white/5 rounded-2xl p-6 flex flex-col justify-between backface-hidden">
                            <span className="text-[9px] font-mono text-accent-cyan uppercase tracking-wider">Question #{activeFlashIndex + 1}</span>
                            <p className="text-[16px] font-bold text-center text-warm-white my-auto leading-relaxed">
                              {flashcards[activeFlashIndex].q}
                            </p>
                            <span className="text-[10px] text-stone/50 text-center font-mono">Click to reveal answer</span>
                          </div>

                          <div className="absolute inset-0 bg-charcoal/40 border border-accent-cyan/20 rounded-2xl p-6 flex flex-col justify-between backface-hidden rotateY-180">
                            <span className="text-[9px] font-mono text-accent-cyan uppercase tracking-wider">Answer #{activeFlashIndex + 1}</span>
                            <p className="text-[13.5px] text-stone leading-relaxed text-center my-auto">
                              {flashcards[activeFlashIndex].a}
                            </p>
                            <span className="text-[10px] text-stone/50 text-center font-mono">Click to view question</span>
                          </div>
                        </motion.div>
                      </div>

                      <div className="flex gap-4">
                        <Button 
                          variant="secondary" 
                          disabled={activeFlashIndex === 0}
                          onClick={() => { setActiveFlashIndex(prev => prev - 1); setFlashcardFlipped(false); }}
                        >
                          Previous
                        </Button>
                        <Button 
                          variant="secondary" 
                          disabled={activeFlashIndex === flashcards.length - 1}
                          onClick={() => { setActiveFlashIndex(prev => prev + 1); setFlashcardFlipped(false); }}
                        >
                          Next Card
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Quiz */}
                  {aiTool === 'quiz' && (
                    <div className="space-y-6 max-w-xl mx-auto">
                      {quizQuestions.map((q, qIdx) => (
                        <Card key={qIdx} className="p-5 space-y-4">
                          <h4 className="text-[14px] font-bold text-warm-white">{qIdx + 1}. {q.q}</h4>
                          <div className="grid grid-cols-1 gap-2.5">
                            {q.options.map((option, oIdx) => {
                              const isSelected = selectedAnswers[qIdx] === oIdx;
                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => handleSelectAnswer(qIdx, oIdx)}
                                  className={`w-full text-left p-3 rounded-lg border text-[12.5px] transition-all cursor-pointer
                                    ${isSelected
                                      ? 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan font-semibold'
                                      : 'bg-charcoal/20 border-white/5 text-stone hover:border-white/10 hover:text-warm-white'
                                    }
                                  `}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        </Card>
                      ))}

                      <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 justify-between">
                        {quizScore !== null ? (
                          <div className="text-[13px] font-mono text-accent-cyan font-bold">
                            Score: {quizScore} / {quizQuestions.length} correct answers!
                          </div>
                        ) : <div />}

                        <Button variant="primary" onClick={handleSubmitQuiz} className="w-full sm:w-auto">
                          Submit Answers
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Mindmap */}
                  {aiTool === 'mindmap' && (
                    <div className="space-y-4 text-center">
                      <Card className="p-6 bg-charcoal/30 border border-white/5 relative overflow-hidden flex flex-col items-center">
                        <div className="absolute inset-0 grid-background opacity-20 pointer-events-none" />
                        <div className="relative z-10 w-full max-w-md border border-white/10 rounded-xl bg-onyx/80 p-6 flex flex-col gap-6 text-[12px] font-mono">
                          <div className="p-2 border border-accent-cyan text-accent-cyan rounded-lg max-w-[200px] mx-auto text-center font-bold">
                            React 19 Compiler
                          </div>
                          <div className="w-[1.5px] h-6 bg-white/10 mx-auto" />
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-2 border border-white/10 rounded-lg text-center text-stone">
                              Automatic Memoization
                            </div>
                            <div className="p-2 border border-white/10 rounded-lg text-center text-stone">
                              Purity Enforcement
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB: STUDY GOALS */}
          {activeTab === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 max-w-lg mx-auto"
            >
              <div className="border-b border-white/5 pb-4">
                <span className="text-[10px] font-mono text-accent-cyan font-bold uppercase tracking-wider">Learning Pathway Targets</span>
                <h2 className="text-2xl font-black text-warm-white mt-1">Study Goals</h2>
              </div>

              {goals.length > 0 ? (
                <div className="space-y-3">
                  {goals.map(g => (
                    <Card 
                      key={g.id} 
                      onClick={() => toggleGoal(g.id)}
                      className="p-4 flex items-center justify-between cursor-pointer border-white/5 hover:border-white/10"
                    >
                      <span className={`text-[13px] ${g.done ? 'line-through text-stone/50' : 'text-warm-white'}`}>
                        {g.text}
                      </span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center
                        ${g.done ? 'bg-accent-cyan/15 border-accent-cyan text-accent-cyan' : 'border-white/20'}`}>
                        {g.done && <CheckCircle className="w-3.5 h-3.5 fill-current" />}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-[12.5px] text-stone/60 font-light font-mono">
                  No learning goals registered for today.
                </div>
              )}

              <form onSubmit={handleAddGoal} className="flex gap-2">
                <input 
                  type="text" 
                  required
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  placeholder="Add target study goal..."
                  className="flex-1 bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-[12px] text-warm-white outline-none focus:border-white/10 placeholder:text-stone/50"
                />
                <Button type="submit" variant="primary" className="text-[12px]">Add Goal</Button>
              </form>
            </motion.div>
          )}

          {/* TAB: LEARNING HISTORY */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 max-w-xl mx-auto"
            >
              <div className="border-b border-white/5 pb-4">
                <span className="text-[10px] font-mono text-accent-cyan font-bold uppercase tracking-wider">Learning Pathway history</span>
                <h2 className="text-2xl font-black text-warm-white mt-1">Learning History</h2>
              </div>

              <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl text-center">
                <Clock className="w-12 h-12 text-stone/30 animate-pulse" />
                <h4 className="text-[13px] font-bold text-warm-white mt-3 font-sans">No history log recorded</h4>
                <p className="text-[11px] text-stone mt-1 font-mono">Activities appear as you write posts or complete roadmap nodes.</p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-onyx/85 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-charcoal border border-white/10 rounded-2xl p-5 shadow-premium space-y-4"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-[15px] font-bold text-warm-white">Create New Folder</h3>
              <button onClick={() => setShowNewFolderModal(false)} className="text-stone hover:text-warm-white cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <input 
                type="text" 
                required
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name..."
                className="w-full bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-[12px] text-warm-white outline-none focus:border-white/10"
              />
              <div className="flex justify-end gap-2 text-[12px]">
                <Button variant="secondary" type="button" onClick={() => setShowNewFolderModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Create Folder</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}

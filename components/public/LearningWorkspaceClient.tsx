'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Play, 
  MessageSquare, 
  FileText, 
  Send, 
  Sparkles,
  ChevronRight,
  BookOpen,
  Check
} from 'lucide-react';
import { Button, Card, Tabs } from '@/components/ui/core';
import { Storage, LearningProgress, UserNote } from '@/lib/storage';
import { MOCK_COURSES, CourseStep, Course } from '@/lib/mockData';

export default function LearningWorkspaceClient() {
  const { course: courseId } = useParams() as { course: string };
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [activeStep, setActiveStep] = useState<CourseStep | null>(null);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<'ai' | 'notes'>('ai');
  
  // Note state
  const [noteContent, setNoteContent] = useState('');
  const [notesList, setNotesList] = useState<UserNote[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Welcome to your StudyMaterial Workspace. Ask me anything about today\'s topics!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load course and progress
  useEffect(() => {
    const foundCourse = MOCK_COURSES.find(c => c.id === courseId);
    if (foundCourse) {
      setCourse(foundCourse);
      setActiveStep(foundCourse.chapters[0].steps[0]);
    } else {
      router.push('/');
    }

    Storage.getProgress().then((allProgress) => {
      if (allProgress[courseId]) {
        setProgress(allProgress[courseId]);
        // Resume last active step if set
        if (allProgress[courseId].activeStepId && foundCourse) {
          const step = foundCourse.chapters
            .flatMap(ch => ch.steps)
            .find(s => s.id === allProgress[courseId].activeStepId);
          if (step) setActiveStep(step);
        }
      } else {
        setProgress({
          courseId,
          completedSteps: [],
          lastAccessed: new Date().toISOString()
        });
      }
    });

    Storage.getNotes().then((notes) => {
      setNotesList(notes);
    });
  }, [courseId, router]);

  // Load initial notes when step changes
  useEffect(() => {
    if (!activeStep) return;
    const stepNote = notesList.find(n => n.courseId === courseId && n.stepId === activeStep.id);
    setNoteContent(stepNote ? stepNote.content : '');
  }, [activeStep, notesList, courseId]);

  // Debounced note saving
  const handleNoteChange = (content: string) => {
    setNoteContent(content);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      if (activeStep) {
        const updatedNotes = await Storage.saveNote(courseId, activeStep.id, content);
        setNotesList(updatedNotes);
      }
    }, 1000);
  };

  // Toggle step completion
  const handleToggleComplete = async (stepId: string) => {
    if (!progress) return;
    const isCompleted = progress.completedSteps.includes(stepId);
    const updatedAll = await Storage.updateCourseProgress(courseId, stepId, !isCompleted);
    setProgress(updatedAll[courseId]);
  };

  // Handle AI Question submit
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiTyping) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setIsAiTyping(true);

    // Dynamic responses based on context
    setTimeout(() => {
      let aiResponse = "I'm analyzing your request relative to the current compiler configuration. Could you expand on the code structure you're deploying?";
      if (userText.toLowerCase().includes('compiler') || userText.toLowerCase().includes('memoization')) {
        aiResponse = "The React Compiler parses code at AST level to detect changes in hook dependence. If you modify props inside render path, it disables memoization to ensure safety.";
      } else if (userText.toLowerCase().includes('ppr') || userText.toLowerCase().includes('caching')) {
        aiResponse = "Partial Prerendering works by generating a dynamic node payload that maps to React Suspense components. At request time, Next.js streams the fallback instantly while executing the dynamic content fetches.";
      } else if (userText.toLowerCase().includes('spring')) {
        aiResponse = "Spring physics are highly reactive. Reducing mass makes transitions snappy (fast snaps), while increasing damping reduces overshoot oscillations (soft bounds).";
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
      setIsAiTyping(false);
      
      // scroll to bottom
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }, 1500);
  };

  if (!course || !activeStep || !progress) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-stone text-[13px]">
        Loading learning workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-6">
      
      {/* Workspace Header */}
      <div className="px-6 pb-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push('/learn')} className="h-8 px-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 text-[12px] text-stone">
            <BookOpen className="w-4 h-4" />
            <span>Learning Workspace</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-warm-white font-medium">{course.title}</span>
          </div>
        </div>
        
        {/* Course Progress Stat */}
        <div className="flex items-center gap-3">
          <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent-cyan" 
              style={{ width: `${(progress.completedSteps.length / course.chapters.flatMap(c => c.steps).length) * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-stone">
            {progress.completedSteps.length}/{course.chapters.flatMap(c => c.steps).length} Done
          </span>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* Left Column: Navigation Sidebar (20%) */}
        <div className="lg:col-span-3 border-r border-white/5 p-4 space-y-6 h-[calc(100vh-80px)] overflow-y-auto">
          <div className="space-y-4">
            <h3 className="px-2 text-[10px] font-semibold text-stone uppercase tracking-widest">
              Course Outline
            </h3>
            <div className="space-y-4">
              {course.chapters.map(chapter => (
                <div key={chapter.id} className="space-y-1">
                  <h4 className="px-2 text-[12px] font-bold text-stone/90 leading-tight">
                    {chapter.title}
                  </h4>
                  <div className="space-y-0.5">
                    {chapter.steps.map(step => {
                      const isActive = step.id === activeStep.id;
                      const isDone = progress.completedSteps.includes(step.id);

                      return (
                        <div
                          key={step.id}
                          onClick={() => setActiveStep(step)}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-[12px] group
                            ${isActive 
                              ? 'bg-white/5 text-warm-white font-medium' 
                              : 'text-stone hover:bg-white/5 hover:text-fog'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleComplete(step.id);
                              }}
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors
                                ${isDone 
                                  ? 'bg-accent-cyan border-accent-cyan text-onyx' 
                                  : 'border-white/20 group-hover:border-white/40'
                                }
                              `}
                            >
                              {isDone && <Check className="w-2.5 h-2.5 stroke-[3px]" />}
                            </button>
                            <span className="truncate">{step.title}</span>
                          </div>
                          <span className="text-[10px] text-stone/60 shrink-0">{step.duration}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Notion-style Content Pane (55%) */}
        <div className="lg:col-span-6 p-8 h-[calc(100vh-80px)] overflow-y-auto bg-onyx/20">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Metadata tags */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase font-mono tracking-widest text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded border border-accent-cyan/10">
                {course.category}
              </span>
              <span className="text-[12px] text-stone">
                Difficulty: {course.difficulty}
              </span>
            </div>

            {/* Step Title */}
            <h1 className="text-3xl font-extrabold tracking-tight text-warm-white">
              {activeStep.title}
            </h1>

            {/* Custom Lesson Content */}
            <article className="prose prose-invert max-w-none text-stone/90 text-[14px] leading-relaxed space-y-4 font-inter">
              {activeStep.content.split('\n\n').map((paragraph, idx) => {
                // Check if code block
                if (paragraph.startsWith('```')) {
                  const code = paragraph.replace(/```tsx\n|```bash\n|```/g, '');
                  return (
                    <pre key={idx} className="bg-charcoal/30 border border-white/5 rounded-xl p-4 overflow-x-auto text-[12px] font-mono text-fog my-4 shadow-sm">
                      <code>{code}</code>
                    </pre>
                  );
                }
                
                // Check if heading
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2 key={idx} className="text-xl font-bold text-warm-white pt-6 border-b border-white/5 pb-2 font-sans">
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                }

                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="text-md font-bold text-warm-white pt-4 font-sans">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }

                // Check if list items
                if (paragraph.startsWith('* ') || paragraph.startsWith('1. ')) {
                  return (
                    <ul key={idx} className="list-disc pl-5 space-y-1.5 my-2">
                      {paragraph.split('\n').map((li, liIdx) => (
                        <li key={liIdx}>{li.replace(/^\* |^\d+\. /, '')}</li>
                      ))}
                    </ul>
                  );
                }

                return (
                  <p key={idx} className="leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
            </article>

            {/* Bottom Actions */}
            <div className="pt-8 border-t border-white/5 flex items-center justify-between">
              <Button 
                variant={progress.completedSteps.includes(activeStep.id) ? 'secondary' : 'primary'}
                onClick={() => handleToggleComplete(activeStep.id)}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {progress.completedSteps.includes(activeStep.id) ? 'Completed' : 'Mark as Complete'}
                </span>
              </Button>

              <div className="text-[12px] text-stone">
                Autosaved to workspace cache
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Assistant & Workspace Notes (25%) */}
        <div className="lg:col-span-3 border-l border-white/5 p-4 flex flex-col h-[calc(100vh-80px)] overflow-hidden">
          <div className="flex justify-center mb-4">
            <Tabs
              options={[
                { id: 'ai', label: 'AI Assistant', icon: MessageSquare },
                { id: 'notes', label: 'Workspace Notes', icon: FileText }
              ]}
              activeId={activeRightTab}
              onChange={(id) => setActiveRightTab(id as 'ai' | 'notes')}
              layoutId="workspace-right-tabs"
            />
          </div>

          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {activeRightTab === 'ai' ? (
                <motion.div
                  key="ai-chat"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col h-full"
                >
                  <div className="flex-1 overflow-y-auto space-y-4 p-1 pb-16">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] rounded-xl p-3 text-[12px] leading-relaxed shadow-sm
                          ${msg.sender === 'user' 
                            ? 'bg-warm-white text-onyx font-medium' 
                            : 'bg-charcoal/40 text-stone border border-white/5'
                          }
                        `}>
                          {msg.text}
                        </div>
                      </div>
                    ))}

                    {isAiTyping && (
                      <div className="flex items-center gap-1.5 text-stone text-[11px] p-2 bg-charcoal/20 rounded-xl border border-white/5 w-fit">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse-slow text-accent-cyan" />
                        <span>AI Tutor is drafting response...</span>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="absolute bottom-0 left-0 right-0 py-2 bg-onyx flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask the AI Tutor..."
                      className="flex-1 bg-charcoal/30 border border-white/5 rounded-lg px-3 py-2 text-[12px] text-warm-white outline-none focus:border-white/20"
                    />
                    <Button type="submit" variant="primary" className="px-3">
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="workspace-notes"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col h-full"
                >
                  <textarea
                    value={noteContent}
                    onChange={(e) => handleNoteChange(e.target.value)}
                    placeholder="Write down notes, code snippets, or key findings for this lesson. Notes are saved automatically to your workspace profile..."
                    className="w-full flex-1 bg-charcoal/15 border border-white/5 rounded-xl p-4 text-[12px] leading-relaxed text-fog outline-none focus:border-white/10 resize-none font-inter"
                  />
                  <div className="text-[10px] text-stone/60 pt-2 flex items-center justify-end gap-1">
                    <Check className="w-3 h-3 text-accent-cyan" />
                    <span>Workspace notes synced</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}

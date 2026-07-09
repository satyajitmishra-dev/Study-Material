'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Github, 
  Globe, 
  Star, 
  GitFork, 
  Terminal, 
  HelpCircle, 
  MessageSquare,
  Bookmark,
  Share2,
  Check,
  Send
} from 'lucide-react';
import { Button, Card } from '@/components/ui/core';
import ArchitectureDiagram from '@/components/ArchitectureDiagram';
import { MOCK_PROJECTS } from '@/lib/mockData';
import { ProjectData, Storage } from '@/lib/storage';

export default function ProjectWorkspace() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // Comments
  const [comments, setComments] = useState<Array<{ user: string; text: string; date: string }>>([
    { user: 'alex_dev', text: 'This architecture handles high load very gracefully. The edge routers reduce latencies by almost 45%.', date: '2 days ago' },
    { user: 'sara_codes', text: 'Stunning design system implementation. Easy to configure using the postcss variables.', date: '1 week ago' }
  ]);
  const [commentInput, setCommentInput] = useState('');

  useEffect(() => {
    const foundProject = MOCK_PROJECTS.find(p => p.id === id);
    if (foundProject) {
      setProject(foundProject);
    } else {
      router.push('/');
    }
  }, [id, router]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setComments(prev => [
      { user: 'current_user', text: commentInput, date: 'Just now' },
      ...prev
    ]);
    setCommentInput('');
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-stone text-[13px]">
        Loading project workspace...
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-6 pt-12 pb-16 space-y-12">
      {/* Back & Workspace Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push('/')} className="h-8 px-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 text-[12px] text-stone">
            <Terminal className="w-4 h-4" />
            <span>Project Space</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={isBookmarked ? 'text-accent-cyan' : 'text-stone'}
          >
            <Bookmark className="w-4 h-4" />
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </Button>
          <Button variant="ghost" onClick={() => alert('Link copied to clipboard.')}>
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </Button>
        </div>
      </div>

      {/* Hero Info */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-3">
          <span className="text-[10px] font-mono tracking-widest text-accent-violet bg-accent-violet/10 border border-accent-violet/10 px-2 py-0.5 rounded uppercase">
            {project.category}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-warm-white">
            {project.name}
          </h1>
          <p className="text-[14px] text-stone max-w-xl leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Action Panel */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer" className="w-full md:w-auto">
              <Button variant="secondary" className="w-full justify-center">
                <Github className="w-4 h-4" />
                <span>GitHub</span>
                <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-stone">
                  ★ {project.stars}
                </span>
              </Button>
            </a>
          )}
          {project.demoUrl && (
            <a href={project.demoUrl} target="_blank" rel="noreferrer" className="w-full md:w-auto">
              <Button variant="primary" className="w-full justify-center">
                <Globe className="w-4 h-4" />
                <span>Live Demo</span>
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Architecture Section */}
      {project.architectureNodes && project.architectureEdges && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-warm-white">
            System Architecture
          </h2>
          <ArchitectureDiagram 
            nodes={project.architectureNodes}
            edges={project.architectureEdges}
          />
        </div>
      )}

      {/* Code / Installation Section */}
      {project.installationSteps && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-warm-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-stone" />
            <span>Setup & Installation</span>
          </h2>
          <Card className="bg-charcoal/35 border-white/5 p-5 space-y-4">
            {project.installationSteps.map((step, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-onyx/50 border border-white/5 font-mono text-[12px] text-fog">
                <div className="flex items-center gap-3 truncate">
                  <span className="text-stone/40 select-none">$</span>
                  <span className="truncate">{step}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(step, idx)}
                  className="text-stone hover:text-warm-white transition-colors shrink-0 cursor-pointer"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-4 h-4 text-accent-emerald" />
                  ) : (
                    <span className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">Copy</span>
                  )}
                </button>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* FAQ & Comments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* FAQ Accordion */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-warm-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-stone" />
            <span>Project FAQ</span>
          </h2>
          <div className="space-y-3">
            {project.faq ? (
              project.faq.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-charcoal/20 border border-white/5 space-y-2">
                  <h4 className="text-[13px] font-bold text-warm-white">{item.question}</h4>
                  <p className="text-[12px] text-stone leading-relaxed">{item.answer}</p>
                </div>
              ))
            ) : (
              <div className="text-[12px] text-stone p-4 border border-dashed border-white/10 rounded-xl">
                No FAQ listed for this workspace project.
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-warm-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-stone" />
            <span>Developer Discussions</span>
          </h2>
          <Card className="p-4 space-y-4 bg-charcoal/20 border-white/5">
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Share architectural feedback..."
                className="flex-1 bg-charcoal/30 border border-white/5 rounded-lg px-3 py-2 text-[12px] text-warm-white outline-none focus:border-white/20"
              />
              <Button type="submit" variant="primary" className="px-3">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {comments.map((comment, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-onyx/40 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-stone">
                    <span className="font-semibold text-warm-white">@{comment.user}</span>
                    <span>{comment.date}</span>
                  </div>
                  <p className="text-[12px] text-stone/90 leading-relaxed">
                    {comment.text}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}

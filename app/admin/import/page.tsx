'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Github, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  FolderGit, 
  Star,
  GitFork,
  ArrowRight,
  Import
} from 'lucide-react';
import { Button, Card, Input } from '@/components/ui/core';
import { Storage } from '@/lib/storage';

type ImportStep = 'idle' | 'connecting' | 'indexing' | 'generating' | 'preview';

export default function GitHubImportWorkspace() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState('');
  const [importStep, setImportStep] = useState<ImportStep>('idle');
  const [importProgress, setImportProgress] = useState(0);

  // Scraped Metadata Mock
  const [scrapedMeta, setScrapedMeta] = useState({
    name: '',
    owner: '',
    description: '',
    stars: 0,
    forks: 0,
  });

  const handleStartImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.includes('github.com')) {
      alert('Please enter a valid GitHub repository URL.');
      return;
    }

    // Extract name and owner
    const parts = repoUrl.replace('https://', '').replace('http://', '').split('/');
    const owner = parts[1] || 'anonymous';
    const name = parts[2] || 'scraped-repo';

    setScrapedMeta({
      name: name.replace('.git', ''),
      owner,
      description: `A master workspace project imported directly from ${owner}/${name} featuring Next.js, and high performance edge routing.`,
      stars: Math.floor(Math.random() * 400) + 100,
      forks: Math.floor(Math.random() * 80) + 12,
    });

    // Run animations sequence
    setImportStep('connecting');
    setImportProgress(20);

    setTimeout(() => {
      setImportStep('indexing');
      setImportProgress(55);
    }, 1500);

    setTimeout(() => {
      setImportStep('generating');
      setImportProgress(85);
    }, 3000);

    setTimeout(() => {
      setImportStep('preview');
      setImportProgress(100);
    }, 4500);
  };

  const handlePublishProject = async () => {
    // Add to storage
    await Storage.addProject({
      id: scrapedMeta.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: scrapedMeta.name,
      tagline: `Imported workspace covering ${scrapedMeta.name} modules.`,
      category: 'Cloud',
      stars: scrapedMeta.stars,
      forks: scrapedMeta.forks,
      description: scrapedMeta.description,
      githubUrl: repoUrl,
      demoUrl: `https://${scrapedMeta.name.toLowerCase()}.studymaterial.dev`,
      installationSteps: [
        `git clone ${repoUrl}`,
        `cd ${scrapedMeta.name}`,
        'npm install',
        'npm run dev'
      ],
      architectureNodes: [
        { id: 'origin', label: 'Origin Server', type: 'Gateway Router', description: 'GitHub endpoint hosting production code repositories.', x: 20, y: 150 },
        { id: 'import', label: 'Sync Manager', type: 'Scraper Engine', description: 'Scrapes structures and populates AST nodes.', x: 50, y: 150 },
        { id: 'cdn', label: 'Edge Edge CDN', type: 'Edge Replica', description: 'Caches visual diagrams and MDX content streams.', x: 80, y: 150 }
      ],
      architectureEdges: [
        { from: 'origin', to: 'import' },
        { from: 'import', to: 'cdn' }
      ]
    });

    router.push('/admin');
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-6 pt-12 pb-16 space-y-12">
      {/* Back Header */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <Button variant="ghost" onClick={() => router.push('/admin')} className="h-8 px-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2 text-[12px] text-stone">
          <span>Publishing Studio</span>
          <span>/</span>
          <span className="text-warm-white font-medium">GitHub Repository Connect</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* Step 1: Input URL Screen */}
        {importStep === 'idle' && (
          <motion.div
            key="idle-screen"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-warm-white flex items-center gap-2">
                <Github className="w-5 h-5 text-accent-cyan" />
                <span>Connect GitHub Repository</span>
              </h2>
              <p className="text-[12px] text-stone">
                Enter your repository URL. StudyMaterial will scrape file structures, compile metadata descriptions, and scaffold a visual system architecture graph automatically.
              </p>
            </div>

            <form onSubmit={handleStartImport} className="space-y-4">
              <Input
                label="GitHub Repository URL"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repository"
                required
              />
              <Button type="submit" variant="primary" className="w-full">
                <span>Start Import Scraper</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </motion.div>
        )}

        {/* Step 2: Loader Sequence */}
        {(importStep === 'connecting' || importStep === 'indexing' || importStep === 'generating') && (
          <motion.div
            key="loading-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8 py-12 flex flex-col items-center justify-center text-center"
          >
            <Loader2 className="w-8 h-8 text-accent-cyan animate-spin" />
            
            <div className="space-y-2 max-w-sm">
              <h3 className="text-[15px] font-bold text-warm-white">
                {importStep === 'connecting' && 'Checking Network Bridge...'}
                {importStep === 'indexing' && 'Parsing Directory Structure...'}
                {importStep === 'generating' && 'Mapping AST & Architectural Diagrams...'}
              </h3>
              <p className="text-[12px] text-stone">
                {importStep === 'connecting' && 'Opening terminal tunnel connection to GitHub API...'}
                {importStep === 'indexing' && 'Parsing root configs, MDX document layers, and files...'}
                {importStep === 'generating' && 'Generating nodes based on dependency configurations...'}
              </p>
            </div>

            {/* Bar loader */}
            <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent-cyan"
                initial={{ width: 0 }}
                animate={{ width: `${importProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}

        {/* Step 3: Scraped Metadata & Preview Publish Screen */}
        {importStep === 'preview' && (
          <motion.div
            key="preview-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-accent-emerald text-[12px] font-semibold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Repository Connected</span>
              </div>
              <h2 className="text-xl font-bold text-warm-white">Configure Workspace Project</h2>
              <p className="text-[12px] text-stone font-light">
                Verify the parsed details before publishing this module to your Learning catalog.
              </p>
            </div>

            {/* Visual Thumbnail Card */}
            <Card glowColor="cyan" className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <FolderGit className="w-5 h-5 text-accent-cyan" />
                  <span className="text-[14px] font-bold text-warm-white">{scrapedMeta.name}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-stone font-mono">
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" />{scrapedMeta.stars}</span>
                  <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5" />{scrapedMeta.forks}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-stone uppercase font-semibold">Parsed Description</span>
                <p className="text-[12px] text-stone leading-relaxed bg-onyx/20 p-3 rounded-lg border border-white/5">
                  {scrapedMeta.description}
                </p>
              </div>

              {/* Scraped Architecture Node count */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-onyx/30 text-[11px] text-stone">
                <span>Auto-Scaffolded Architecture Nodes</span>
                <span className="font-mono text-warm-white">3 blocks (Edge-first)</span>
              </div>
            </Card>

            <div className="flex items-center gap-3 pt-4">
              <Button variant="secondary" onClick={() => setImportStep('idle')} className="w-full">
                Back
              </Button>
              <Button variant="primary" onClick={handlePublishProject} className="w-full">
                <span>Publish Workspace Project</span>
                <Sparkles className="w-4 h-4 fill-current" />
              </Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

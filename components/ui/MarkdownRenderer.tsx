'use client';

import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  Info, 
  Lightbulb, 
  AlertCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Terminal 
} from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface AlertConfig {
  type: 'NOTE' | 'TIP' | 'IMPORTANT' | 'WARNING' | 'CAUTION';
  title: string;
  body: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = async (code: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(idx);
      setTimeout(() => {
        setCopiedIndex((prev) => (prev === idx ? null : prev));
      }, 2000);
    } catch (e) {
      console.error('Failed to copy code', e);
    }
  };

  const parseAlert = (text: string): AlertConfig | null => {
    const alertMatch = text.match(/^>?\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)$/is);
    if (!alertMatch) return null;
    return {
      type: alertMatch[1] as AlertConfig['type'],
      title: alertMatch[1],
      body: alertMatch[2]?.trim() || '',
    };
  };

  const getAlertStyles = (type: AlertConfig['type']) => {
    switch (type) {
      case 'NOTE':
        return {
          containerClass: 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan',
          icon: <Info className="w-4 h-4 shrink-0 mt-0.5" />,
        };
      case 'TIP':
        return {
          containerClass: 'border-accent-emerald/40 bg-accent-emerald/10 text-accent-emerald',
          icon: <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />,
        };
      case 'IMPORTANT':
        return {
          containerClass: 'border-accent-violet/40 bg-accent-violet/10 text-accent-violet',
          icon: <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />,
        };
      case 'WARNING':
        return {
          containerClass: 'border-accent-amber/40 bg-accent-amber/10 text-accent-amber',
          icon: <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />,
        };
      case 'CAUTION':
        return {
          containerClass: 'border-accent-pink/40 bg-accent-pink/10 text-accent-pink',
          icon: <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />,
        };
    }
  };

  // Simple token/block parser
  const renderBlocks = () => {
    const lines = content.split('\n');
    const blocks: React.ReactNode[] = [];
    let currentCodeBlock: { language: string; lines: string[] } | null = null;
    let codeIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block start/end
      if (line.trim().startsWith('```')) {
        if (currentCodeBlock) {
          // Close block
          const codeString = currentCodeBlock.lines.join('\n');
          const lang = currentCodeBlock.language || 'text';
          const idx = codeIndex++;

          blocks.push(
            <div key={`code-${idx}`} className="my-4 rounded-xl overflow-hidden border border-white/10 bg-onyx/90 shadow-premium">
              <div className="flex items-center justify-between px-4 py-2 bg-charcoal/80 border-b border-white/5 text-[11px] font-mono text-stone">
                <span className="flex items-center gap-1.5 text-warm-white font-semibold">
                  <Terminal className="w-3.5 h-3.5 text-accent-cyan" />
                  {lang.toUpperCase()}
                </span>
                <button
                  onClick={() => handleCopyCode(codeString, idx)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-warm-white transition-all duration-150"
                  title="Copy code to clipboard"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-accent-emerald" />
                      <span className="text-accent-emerald font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-[13px] font-mono text-stone/95 leading-relaxed">
                <code>{codeString}</code>
              </pre>
            </div>
          );
          currentCodeBlock = null;
        } else {
          // Open block
          const lang = line.trim().substring(3).trim();
          currentCodeBlock = { language: lang, lines: [] };
        }
        continue;
      }

      if (currentCodeBlock) {
        currentCodeBlock.lines.push(line);
        continue;
      }

      // Check GitHub Alert blocks
      if (line.trim().startsWith('>') || line.trim().startsWith('[!')) {
        const alertConfig = parseAlert(line);
        if (alertConfig) {
          const styles = getAlertStyles(alertConfig.type);
          blocks.push(
            <div key={`alert-${i}`} className={`my-3 p-4 rounded-xl border flex items-start gap-3 ${styles.containerClass}`}>
              {styles.icon}
              <div className="space-y-1">
                <div className="text-xs font-mono font-bold tracking-wider uppercase">{alertConfig.title}</div>
                {alertConfig.body && (
                  <div className="text-[13px] text-warm-white/90 leading-relaxed font-sans font-light">
                    {alertConfig.body}
                  </div>
                )}
              </div>
            </div>
          );
          continue;
        }
      }

      // Headings
      if (line.startsWith('# ')) {
        blocks.push(
          <h1 key={`h1-${i}`} className="text-2xl font-extrabold text-warm-white mt-6 mb-3 border-b border-white/5 pb-2">
            {line.substring(2)}
          </h1>
        );
        continue;
      }
      if (line.startsWith('## ')) {
        blocks.push(
          <h2 key={`h2-${i}`} className="text-xl font-bold text-warm-white mt-5 mb-2.5">
            {line.substring(3)}
          </h2>
        );
        continue;
      }
      if (line.startsWith('### ')) {
        blocks.push(
          <h3 key={`h3-${i}`} className="text-lg font-semibold text-warm-white mt-4 mb-2">
            {line.substring(4)}
          </h3>
        );
        continue;
      }

      // Lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        blocks.push(
          <li key={`li-${i}`} className="ml-5 list-disc text-[13.5px] text-stone/90 leading-relaxed my-1">
            {line.trim().substring(2)}
          </li>
        );
        continue;
      }

      // Paragraphs
      if (line.trim().length > 0) {
        blocks.push(
          <p key={`p-${i}`} className="text-[13.5px] text-stone/90 leading-relaxed my-2">
            {line}
          </p>
        );
      }
    }

    return blocks;
  };

  return (
    <div className={`markdown-renderer space-y-1 ${className}`}>
      {renderBlocks()}
    </div>
  );
}

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { generateHTML } from '@tiptap/html';
import { getParserExtensions, migrateContentToTipTapJson } from '@/lib/migration/contentMigration';
import { 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Github, 
  Star, 
  GitFork, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  Maximize2
} from 'lucide-react';
import { fetchGitHubRepoAction } from '@/lib/actions/gitHubEmbed';

// Import KaTeX stylesheet for formulas
import 'katex/dist/katex.min.css';

interface TipTapRendererProps {
  content: string; // JSON string, HTML, or Markdown
  className?: string;
  theme?: 'dark' | 'light' | 'sepia' | 'contrast';
  fontFamily?: 'sans' | 'serif' | 'mono';
  fontSize?: 'sm' | 'md' | 'lg' | 'xl';
  lineHeight?: 'tight' | 'normal' | 'loose';
  readingWidth?: 'narrow' | 'medium' | 'wide' | 'full';
  focusMode?: boolean;
  copyProtection?: boolean; // Toggles copy/rightclick protection
}

export default function TipTapRenderer({
  content,
  className = '',
  theme = 'dark',
  fontFamily = 'sans',
  fontSize = 'md',
  lineHeight = 'normal',
  readingWidth = 'medium',
  focusMode = false,
  copyProtection = false,
}: TipTapRendererProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isHydrated, setIsHydrated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parsing and generating HTML
  useEffect(() => {
    async function loadAndParse() {
      try {
        const jsonDoc = await migrateContentToTipTapJson(content);
        const extensions = getParserExtensions();
        const generated = generateHTML(jsonDoc, extensions);
        setHtmlContent(generated);
      } catch (err) {
        console.error('Failed to parse TipTap content in renderer:', err);
        setHtmlContent(content); // Fallback to raw string
      }
    }
    loadAndParse();
  }, [content]);

  // Client-Side Hydration for Math, Mermaid, GitHub Embeds, Code Playgrounds, and Quiz blocks
  useEffect(() => {
    if (!htmlContent || !containerRef.current) return;

    const hydrateElements = async () => {
      // 1. Hydrate KaTeX Math Formulas
      const mathElements = containerRef.current?.querySelectorAll('.math-inline, .math-block') || [];
      if (mathElements.length > 0) {
        try {
          const katex = (await import('katex')).default;
          mathElements.forEach((el) => {
            const rawFormula = el.getAttribute('data-formula') || el.textContent || '';
            const isBlock = el.classList.contains('math-block');
            try {
              katex.render(rawFormula, el as HTMLElement, {
                displayMode: isBlock,
                throwOnError: false,
              });
            } catch (err) {
              console.error('KaTeX rendering error:', err);
            }
          });
        } catch (e) {
          console.error('Failed to load KaTeX library:', e);
        }
      }

      // 2. Hydrate Mermaid Diagrams
      const mermaidElements = containerRef.current?.querySelectorAll('pre.language-mermaid, .mermaid-block') || [];
      if (mermaidElements.length > 0) {
        try {
          const mermaid = (await import('mermaid')).default;
          mermaid.initialize({
            startOnLoad: false,
            theme: theme === 'light' ? 'default' : 'dark',
            securityLevel: 'loose',
          });
          
          for (let i = 0; i < mermaidElements.length; i++) {
            const el = mermaidElements[i];
            const codeEl = el.querySelector('code') || el;
            const code = (codeEl.textContent || '').trim();
            const id = `mermaid-svg-${i}-${Math.floor(Math.random() * 1000)}`;

            if (code) {
              try {
                const { svg } = await mermaid.render(id, code);
                el.innerHTML = `<div class="flex justify-center my-6 p-4 bg-charcoal/10 rounded-2xl border border-white/5 overflow-x-auto">${svg}</div>`;
              } catch (err) {
                console.error('Mermaid render error:', err);
                el.innerHTML = `<div class="p-3 border border-accent-pink/20 bg-accent-pink/5 text-accent-pink rounded-xl text-xs font-mono">⚠️ Mermaid diagram syntax error</div>`;
              }
            }
          }
        } catch (e) {
          console.error('Failed to load Mermaid library:', e);
        }
      }

      // 3. Hydrate GitHub Repo Embeds
      const githubEmbeds = containerRef.current?.querySelectorAll('.github-embed') || [];
      githubEmbeds.forEach(async (el) => {
        const url = el.getAttribute('data-url');
        if (!url) return;

        // Render loading state
        el.innerHTML = `
          <div class="animate-pulse flex items-center justify-between p-4 bg-charcoal/20 border border-white/5 rounded-xl my-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-white/5"></div>
              <div class="space-y-1.5">
                <div class="h-3 w-32 bg-white/10 rounded"></div>
                <div class="h-2.5 w-48 bg-white/5 rounded"></div>
              </div>
            </div>
          </div>
        `;

        const res = await fetchGitHubRepoAction(url);
        if (res.success && res.data) {
          const repo = res.data;
          el.innerHTML = `
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-charcoal/30 border border-white/5 rounded-xl hover:border-white/15 transition-all duration-200 shadow-premium my-6 select-text">
              <div class="space-y-2 max-w-xl">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-stone shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                  <a href="${repo.htmlUrl}" target="_blank" rel="noopener noreferrer" class="text-sm font-semibold text-accent-cyan hover:underline">${repo.owner}/${repo.name}</a>
                  ${repo.latestRelease ? `<span class="px-1.5 py-0.5 rounded bg-accent-cyan/10 border border-accent-cyan/20 text-[10px] text-accent-cyan font-mono">${repo.latestRelease}</span>` : ''}
                </div>
                <p class="text-xs text-stone font-light leading-relaxed">${repo.description || 'No description provided.'}</p>
                <div class="flex items-center gap-4 text-[11px] text-stone font-mono">
                  <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-accent-violet shrink-0"></span> ${repo.language || 'Code'}</span>
                  <span class="flex items-center gap-1"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> ${repo.stars} stars</span>
                  <span class="flex items-center gap-1"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg> ${repo.forks} forks</span>
                  ${repo.license ? `<span>📄 ${repo.license}</span>` : ''}
                </div>
              </div>
              <a href="${repo.htmlUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg text-warm-white transition-colors shrink-0 text-center justify-center">
                <span>View Source</span>
              </a>
            </div>
          `;
        } else {
          el.innerHTML = `
            <div class="p-4 bg-charcoal/20 border border-white/5 rounded-xl my-4 flex items-center justify-between text-xs text-stone">
              <span>Could not fetch GitHub repository metadata for ${url}</span>
              <a href="${url}" target="_blank" rel="noopener noreferrer" class="text-accent-cyan underline">Open Link</a>
            </div>
          `;
        }
      });

      // 4. Hydrate Code Playgrounds
      const codeBlocks = containerRef.current?.querySelectorAll('pre') || [];
      codeBlocks.forEach((pre, idx) => {
        // Skip if already hydrated
        if (pre.parentElement?.classList.contains('code-playground-container')) return;

        const codeEl = pre.querySelector('code');
        const code = codeEl?.textContent || '';
        const langClass = Array.from(codeEl?.classList || []).find(c => c.startsWith('language-'));
        const lang = langClass ? langClass.substring(9) : 'text';
        
        // Wrap pre in code playground structure
        const container = document.createElement('div');
        container.className = 'code-playground-container my-6 rounded-xl border border-white/5 bg-onyx/90 overflow-hidden shadow-premium text-left';
        
        const header = document.createElement('div');
        header.className = 'flex items-center justify-between px-4 py-2 bg-charcoal/80 border-b border-white/5 text-[11px] font-mono text-stone';
        header.innerHTML = `
          <span class="flex items-center gap-1.5 text-warm-white font-semibold capitalize">
            <svg class="w-3.5 h-3.5 text-accent-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
            ${lang}
          </span>
          <div class="flex items-center gap-2">
            <button class="copy-btn flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-warm-white transition-colors">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span>Copy</span>
            </button>
            <button class="expand-btn flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-warm-white transition-colors">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
        `;

        pre.className = 'p-4 overflow-x-auto text-[13px] font-mono text-stone/95 leading-relaxed max-h-[300px] transition-all duration-300';
        
        // Setup parent node swapping
        pre.parentNode?.replaceChild(container, pre);
        container.appendChild(header);
        container.appendChild(pre);

        // Add copy button click listener
        const copyBtn = header.querySelector('.copy-btn');
        copyBtn?.addEventListener('click', async () => {
          await navigator.clipboard.writeText(code);
          copyBtn.innerHTML = `
            <svg class="w-3 h-3 text-accent-emerald" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span class="text-accent-emerald font-bold">Copied!</span>
          `;
          setTimeout(() => {
            copyBtn.innerHTML = `
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span>Copy</span>
            `;
          }, 2000);
        });

        // Add expand/collapse click listener
        const expandBtn = header.querySelector('.expand-btn');
        let collapsed = false;
        expandBtn?.addEventListener('click', () => {
          collapsed = !collapsed;
          if (collapsed) {
            pre.style.maxHeight = '0px';
            pre.style.padding = '0px';
            expandBtn.innerHTML = `<svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>`;
          } else {
            pre.style.maxHeight = '300px';
            pre.style.padding = '16px';
            expandBtn.innerHTML = `<svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`;
          }
        });
      });

      // 5. Hydrate Quiz Blocks
      const quizBlocks = containerRef.current?.querySelectorAll('.quiz-block') || [];
      quizBlocks.forEach((el, index) => {
        const question = el.getAttribute('data-question') || '';
        const optionsStr = el.getAttribute('data-options') || '[]';
        const answerIdx = parseInt(el.getAttribute('data-answer') || '0', 10);
        const explanation = el.getAttribute('data-explanation') || '';
        
        let options: string[] = [];
        try {
          options = JSON.parse(optionsStr);
        } catch {
          options = [];
        }

        // Render HTML for Interactive Quiz Card
        let optionsHtml = options.map((opt, oIdx) => `
          <button 
            type="button" 
            data-option-idx="${oIdx}" 
            class="quiz-option-btn w-full text-left px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-xs hover:bg-white/10 hover:border-white/10 transition-colors flex items-center justify-between"
          >
            <span>${opt}</span>
            <div class="checkbox-indicator w-4 h-4 rounded-full border border-white/10 shrink-0 ml-3"></div>
          </button>
        `).join('');

        el.innerHTML = `
          <div class="my-6 p-6 rounded-2xl bg-charcoal/20 border border-white/5 text-left shadow-premium select-text">
            <div class="flex items-center gap-2 mb-4">
              <span class="px-2 py-0.5 rounded bg-accent-violet/15 border border-accent-violet/20 text-[10px] font-mono text-accent-violet font-semibold uppercase">Knowledge Check</span>
            </div>
            <h4 class="text-sm font-bold text-warm-white leading-relaxed mb-4">${question}</h4>
            <div class="space-y-2 quiz-options-container">${optionsHtml}</div>
            <div class="quiz-explanation-box hidden mt-4 p-4 rounded-xl border border-white/5 text-xs leading-relaxed transition-all"></div>
          </div>
        `;

        // Interactive click listeners
        const optionBtns = el.querySelectorAll('.quiz-option-btn');
        const explanationBox = el.querySelector('.quiz-explanation-box') as HTMLDivElement;

        optionBtns.forEach((btn, bIdx) => {
          btn.addEventListener('click', () => {
            // Disable further clicks
            optionBtns.forEach(b => b.setAttribute('disabled', 'true'));

            const isCorrect = bIdx === answerIdx;
            
            // Highlight selected button
            const indicator = btn.querySelector('.checkbox-indicator');
            if (isCorrect) {
              btn.classList.add('bg-accent-emerald/10', 'border-accent-emerald/20', 'text-accent-emerald');
              if (indicator) {
                indicator.classList.add('bg-accent-emerald', 'border-accent-emerald');
                indicator.innerHTML = `<svg class="w-3 h-3 text-onyx" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`;
              }
            } else {
              btn.classList.add('bg-accent-pink/10', 'border-accent-pink/20', 'text-accent-pink');
              if (indicator) {
                indicator.classList.add('bg-accent-pink', 'border-accent-pink');
                indicator.innerHTML = `<svg class="w-3 h-3 text-onyx" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
              }
              
              // Also highlight correct button
              const correctBtn = optionBtns[answerIdx] as HTMLButtonElement;
              correctBtn.classList.add('bg-accent-emerald/10', 'border-accent-emerald/20', 'text-accent-emerald');
              const correctIndicator = correctBtn.querySelector('.checkbox-indicator');
              if (correctIndicator) {
                correctIndicator.classList.add('bg-accent-emerald', 'border-accent-emerald');
              }
            }

            // Show explanation
            if (explanationBox) {
              explanationBox.classList.remove('hidden');
              explanationBox.className = `quiz-explanation-box mt-4 p-4 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
                isCorrect 
                  ? 'bg-accent-emerald/5 border-accent-emerald/10 text-accent-emerald/90' 
                  : 'bg-accent-orange/5 border-accent-orange/10 text-accent-orange/90'
              }`;
              explanationBox.innerHTML = `
                <div class="font-bold mb-1">${isCorrect ? '🎉 Correct Answer!' : '❌ Incorrect'}</div>
                <div>${explanation}</div>
              `;
            }
          });
        });
      });

      setIsHydrated(true);
    };

    hydrateElements();
  }, [htmlContent, theme]);

  // Typography settings mapping
  const fontStyles = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
  };

  const fontSizes = {
    sm: 'text-[13px] leading-relaxed',
    md: 'text-[15px] leading-relaxed',
    lg: 'text-[17px] leading-relaxed',
    xl: 'text-[19px] leading-relaxed',
  };

  const lineHeights = {
    tight: 'leading-normal',
    normal: 'leading-relaxed',
    loose: 'leading-loose',
  };

  const colWidths = {
    narrow: 'max-w-xl mx-auto',
    medium: 'max-w-2xl mx-auto',
    wide: 'max-w-4xl mx-auto',
    full: 'max-w-none',
  };

  const themeStyles = {
    dark: 'text-fog/90 bg-transparent',
    light: 'text-stone bg-transparent',
    sepia: 'text-[#433422] bg-[#f4ece1] p-6 rounded-2xl border border-[#e4dcd1]',
    contrast: 'text-white bg-black p-6 rounded-2xl border border-white/20',
  };

  // Copy protection handlers
  const handleCopy = (e: React.ClipboardEvent) => {
    if (copyProtection) {
      e.preventDefault();
      alert('🔒 Copy protection is enabled on this article.');
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (copyProtection) {
      e.preventDefault();
      alert('🔒 Context menu is disabled on this article.');
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (copyProtection && e.target instanceof HTMLImageElement) {
      e.preventDefault();
      alert('🔒 Image downloading is protected.');
    }
  };

  return (
    <div 
      ref={containerRef}
      onCopy={handleCopy}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      className={`
        tiptap-renderer select-text outline-none
        prose prose-invert prose-stone
        ${fontStyles[fontFamily]}
        ${fontSizes[fontSize]}
        ${lineHeights[lineHeight]}
        ${colWidths[readingWidth]}
        ${themeStyles[theme]}
        ${focusMode ? 'prose-focus-active' : ''}
        ${className}
      `}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

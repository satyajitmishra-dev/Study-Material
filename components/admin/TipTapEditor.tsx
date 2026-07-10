'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  Bold, 
  Italic, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Link as LinkIcon,
  Strikethrough,
  Minus,
  Undo2,
  Redo2,
  Sparkles,
  Keyboard,
  Clipboard,
  Type
} from 'lucide-react';
import { Button } from '@/components/ui/core';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

// --- Markdown → HTML converter for paste handling ---
function markdownToHtml(md: string): string {
  let html = md;

  // Code blocks (```...```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) => {
    return `<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()}</code></pre>`;
  });

  // Headers
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Horizontal rules
  html = html.replace(/^(?:---|\*\*\*|___)\s*$/gm, '<hr>');

  // Bold + Italic combined
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<s>$1</s>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote><p>$1</p></blockquote>');

  // Unordered lists
  html = html.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Paragraphs: wrap remaining plain lines
  html = html.replace(/^(?!<[a-z]|$)(.+)$/gm, '<p>$1</p>');

  // Clean up consecutive blockquotes
  html = html.replace(/<\/blockquote>\s*<blockquote>/g, '\n');

  return html.trim();
}

function looksLikeMarkdown(text: string): boolean {
  const mdPatterns = [
    /^#{1,6}\s+/m,           // Headers
    /\*\*[^*]+\*\*/,         // Bold
    /\*[^*]+\*/,             // Italic
    /~~[^~]+~~/,             // Strikethrough
    /`[^`]+`/,               // Inline code
    /```[\s\S]*?```/,        // Code blocks
    /^\s*[-*]\s+/m,          // Unordered list
    /^\s*\d+\.\s+/m,         // Ordered list
    /^>\s+/m,                // Blockquote
    /\[.+\]\(.+\)/,          // Links
    /^(?:---|\*\*\*|___)\s*$/m, // Horizontal rules
  ];
  let hits = 0;
  for (const pattern of mdPatterns) {
    if (pattern.test(text)) hits++;
  }
  return hits >= 2; // Need at least 2 markdown patterns to be confident
}

export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: content || '<p>Write something spectacular... Use <strong>/</strong> to insert blocks.</p>',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);

      // Handle slash command trigger
      const textAfterCursor = editor.state.selection.$from.parent.textContent;
      const cursorOffset = editor.state.selection.$from.parentOffset;
      const textBeforeCursor = textAfterCursor.slice(0, cursorOffset);
      
      const slashIndex = textBeforeCursor.lastIndexOf('/');
      if (slashIndex !== -1 && slashIndex === textBeforeCursor.length - 1) {
        setShowSlashMenu(true);
        setSlashQuery('');
      } else {
        setShowSlashMenu(false);
      }
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[350px] text-[14px] text-stone/90 leading-relaxed max-w-none prose prose-invert prose-stone',
      },
      // Smart markdown paste handler
      handlePaste: (view, event) => {
        const clipboardText = event.clipboardData?.getData('text/plain');
        const clipboardHtml = event.clipboardData?.getData('text/html');
        
        // Only convert if it's plain text that looks like markdown
        // (not if the clipboard already has HTML formatting)
        if (clipboardText && !clipboardHtml && looksLikeMarkdown(clipboardText)) {
          event.preventDefault();
          const convertedHtml = markdownToHtml(clipboardText);
          
          const editorInstance = (view as any).editor || null;
          if (editorInstance) {
            editorInstance.chain().focus().insertContent(convertedHtml).run();
          } else {
            // Fallback: insert via view dispatch
            const { tr } = view.state;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = convertedHtml;
            // Let TipTap parse it
            view.pasteHTML(convertedHtml);
          }
          
          setPasteNotice('Markdown auto-formatted ✓');
          setTimeout(() => setPasteNotice(null), 2500);
          return true;
        }
        return false;
      },
    },
  });

  // Sync content updates
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Listen to selection changes to position floating bubble menu
  useEffect(() => {
    if (!editor) return;

    const updateMenu = () => {
      const { from, to } = editor.state.selection;
      if (from === to) {
        setMenuPosition(null);
        return;
      }

      const { view } = editor;
      try {
        const startCoords = view.coordsAtPos(from);
        const editorRect = view.dom.getBoundingClientRect();
        
        setMenuPosition({
          top: startCoords.top - editorRect.top - 10,
          left: startCoords.left - editorRect.left + ((view.coordsAtPos(to).left - startCoords.left) / 2),
        });
      } catch (e) {
        setMenuPosition(null);
      }
    };

    editor.on('selectionUpdate', updateMenu);

    const handleBlur = () => {
      setTimeout(() => {
        if (!editor.isFocused) setMenuPosition(null);
      }, 150);
    };
    editor.on('blur', handleBlur);

    return () => {
      editor.off('selectionUpdate', updateMenu);
      editor.off('blur', handleBlur);
    };
  }, [editor]);

  if (!editor) return null;

  const wordCount = editor.storage.characterCount ? editor.storage.characterCount.words() : editor.state.doc.textContent.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const insertBlock = (type: string, level?: number) => {
    editor.chain().focus().deleteRange({
      from: editor.state.selection.$from.pos - 1,
      to: editor.state.selection.$from.pos,
    }).run();

    if (type === 'h1') {
      editor.chain().focus().setHeading({ level: 1 }).run();
    } else if (type === 'h2') {
      editor.chain().focus().setHeading({ level: 2 }).run();
    } else if (type === 'h3') {
      editor.chain().focus().setHeading({ level: 3 }).run();
    } else if (type === 'bullet') {
      editor.chain().focus().toggleBulletList().run();
    } else if (type === 'ordered') {
      editor.chain().focus().toggleOrderedList().run();
    } else if (type === 'quote') {
      editor.chain().focus().toggleBlockquote().run();
    } else if (type === 'codeblock') {
      editor.chain().focus().toggleCodeBlock().run();
    } else if (type === 'hr') {
      editor.chain().focus().setHorizontalRule().run();
    } else if (type === 'callout') {
      editor.chain().focus().insertContent('<p style="padding: 12px; background: rgba(255,255,255,0.03); border-left: 3px solid #8b5cf6; border-radius: 4px;">ℹ️ <strong>Callout:</strong> </p>').run();
    }
    
    setShowSlashMenu(false);
  };

  const shortcuts = [
    { keys: 'Ctrl+B', label: 'Bold' },
    { keys: 'Ctrl+I', label: 'Italic' },
    { keys: 'Ctrl+E', label: 'Code' },
    { keys: 'Ctrl+Shift+X', label: 'Strikethrough' },
    { keys: 'Ctrl+Z', label: 'Undo' },
    { keys: 'Ctrl+Shift+Z', label: 'Redo' },
    { keys: '/', label: 'Insert Block' },
  ];

  return (
    <div className="border border-white/5 bg-charcoal/10 rounded-2xl p-5 relative min-h-[460px] flex flex-col justify-between">
      
      {/* Editor Main Menu Toolbar */}
      <div className="flex items-center gap-1.5 border-b border-white/5 pb-3 mb-4 flex-wrap text-stone">
        <Button 
          variant={editor.isActive('bold') ? 'accent' : 'ghost'} 
          className="p-1.5 h-8 w-8"
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </Button>
        
        <Button 
          variant={editor.isActive('italic') ? 'accent' : 'ghost'} 
          className="p-1.5 h-8 w-8"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </Button>

        <Button 
          variant={editor.isActive('strike') ? 'accent' : 'ghost'} 
          className="p-1.5 h-8 w-8"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough (Ctrl+Shift+X)"
        >
          <Strikethrough className="w-4 h-4" />
        </Button>

        <Button 
          variant={editor.isActive('code') ? 'accent' : 'ghost'} 
          className="p-1.5 h-8 w-8"
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline Code (Ctrl+E)"
        >
          <Code className="w-4 h-4" />
        </Button>

        <div className="w-[1px] h-5 bg-white/5 mx-1" />

        <Button 
          variant={editor.isActive('heading', { level: 1 }) ? 'accent' : 'ghost'} 
          className="p-1.5 h-8 w-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </Button>

        <Button 
          variant={editor.isActive('heading', { level: 2 }) ? 'accent' : 'ghost'} 
          className="p-1.5 h-8 w-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>

        <Button 
          variant={editor.isActive('heading', { level: 3 }) ? 'accent' : 'ghost'} 
          className="p-1.5 h-8 w-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </Button>

        <div className="w-[1px] h-5 bg-white/5 mx-1" />

        <Button 
          variant={editor.isActive('bulletList') ? 'accent' : 'ghost'} 
          className="p-1.5 h-8 w-8"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </Button>

        <Button 
          variant={editor.isActive('orderedList') ? 'accent' : 'ghost'} 
          className="p-1.5 h-8 w-8"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        <Button 
          variant={editor.isActive('blockquote') ? 'accent' : 'ghost'} 
          className="p-1.5 h-8 w-8"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </Button>

        <Button 
          variant="ghost" 
          className="p-1.5 h-8 w-8"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className="w-4 h-4" />
        </Button>

        <div className="w-[1px] h-5 bg-white/5 mx-1" />

        <Button 
          variant="ghost" 
          className="p-1.5 h-8 w-8"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </Button>

        <Button 
          variant="ghost" 
          className="p-1.5 h-8 w-8"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </Button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Markdown paste badge */}
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-stone/50 select-none">
          <Clipboard className="w-3 h-3" />
          <span>MD Paste</span>
        </div>

        {/* Shortcuts toggle */}
        <Button 
          variant="ghost" 
          className="p-1.5 h-8 w-8"
          onClick={() => setShowShortcuts(!showShortcuts)}
          title="Keyboard Shortcuts"
        >
          <Keyboard className="w-4 h-4" />
        </Button>
      </div>

      {/* Keyboard Shortcuts Panel */}
      {showShortcuts && (
        <div className="mb-3 p-3 bg-white/5 border border-white/5 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-accent-cyan font-bold uppercase tracking-wider font-mono">Keyboard Shortcuts</span>
            <button type="button" onClick={() => setShowShortcuts(false)} className="text-stone hover:text-warm-white text-[10px] cursor-pointer">Close</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {shortcuts.map(s => (
              <div key={s.keys} className="flex items-center gap-2 text-[10px]">
                <kbd className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5 text-stone font-mono text-[9px]">{s.keys}</kbd>
                <span className="text-stone/70">{s.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-[10px]">
              <kbd className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5 text-accent-cyan font-mono text-[9px]">Paste MD</kbd>
              <span className="text-stone/70">Auto-format</span>
            </div>
          </div>
        </div>
      )}

      {/* Markdown paste notification toast */}
      {pasteNotice && (
        <div className="mb-2 flex items-center gap-2 px-3 py-1.5 bg-accent-emerald/10 border border-accent-emerald/20 rounded-lg text-[11px] text-accent-emerald font-medium animate-in fade-in slide-in-from-top-1 duration-150">
          <Type className="w-3.5 h-3.5" />
          <span>{pasteNotice}</span>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="relative flex-1 py-2">
        {editor && menuPosition && (
          <div 
            className="absolute z-40 flex items-center gap-1 bg-onyx border border-white/10 p-1.5 rounded-xl shadow-premium backdrop-blur-md"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <button 
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded hover:bg-white/5 text-[11px] font-bold cursor-pointer transition-colors ${editor.isActive('bold') ? 'text-accent-cyan' : 'text-stone'}`}
            >
              Bold
            </button>
            <button 
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded hover:bg-white/5 text-[11px] italic cursor-pointer transition-colors ${editor.isActive('italic') ? 'text-accent-cyan' : 'text-stone'}`}
            >
              Italic
            </button>
            <button 
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-1.5 rounded hover:bg-white/5 text-[11px] line-through cursor-pointer transition-colors ${editor.isActive('strike') ? 'text-accent-cyan' : 'text-stone'}`}
            >
              Strike
            </button>
            <button 
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`p-1.5 rounded hover:bg-white/5 text-[11px] font-mono cursor-pointer transition-colors ${editor.isActive('code') ? 'text-accent-cyan' : 'text-stone'}`}
            >
              Code
            </button>
          </div>
        )}
        <EditorContent editor={editor} />

        {/* Notion Slash Command Menu Dialog */}
        {showSlashMenu && (
          <div className="absolute top-10 left-4 z-40 w-48 rounded-xl bg-onyx border border-white/10 p-1.5 shadow-premium backdrop-blur-md">
            <div className="text-[10px] text-stone uppercase font-bold tracking-wider px-2 py-1 border-b border-white/5 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-accent-cyan animate-pulse" />
              <span>Insert Block</span>
            </div>
            
            <div className="space-y-0.5 max-h-[280px] overflow-y-auto custom-scrollbar">
              <button 
                onClick={() => insertBlock('h1')} 
                className="w-full text-left px-2 py-1.5 text-[11px] text-stone hover:text-warm-white hover:bg-white/5 rounded flex items-center gap-2 cursor-pointer"
              >
                <Heading1 className="w-3.5 h-3.5 text-accent-cyan" />
                <span>Heading 1</span>
                <span className="ml-auto text-[9px] text-stone/40 font-mono"># </span>
              </button>
              
              <button 
                onClick={() => insertBlock('h2')} 
                className="w-full text-left px-2 py-1.5 text-[11px] text-stone hover:text-warm-white hover:bg-white/5 rounded flex items-center gap-2 cursor-pointer"
              >
                <Heading2 className="w-3.5 h-3.5 text-accent-cyan" />
                <span>Heading 2</span>
                <span className="ml-auto text-[9px] text-stone/40 font-mono">## </span>
              </button>

              <button 
                onClick={() => insertBlock('h3')} 
                className="w-full text-left px-2 py-1.5 text-[11px] text-stone hover:text-warm-white hover:bg-white/5 rounded flex items-center gap-2 cursor-pointer"
              >
                <Heading3 className="w-3.5 h-3.5 text-accent-cyan" />
                <span>Heading 3</span>
                <span className="ml-auto text-[9px] text-stone/40 font-mono">### </span>
              </button>

              <button 
                onClick={() => insertBlock('bullet')} 
                className="w-full text-left px-2 py-1.5 text-[11px] text-stone hover:text-warm-white hover:bg-white/5 rounded flex items-center gap-2 cursor-pointer"
              >
                <List className="w-3.5 h-3.5 text-accent-violet" />
                <span>Bullet List</span>
                <span className="ml-auto text-[9px] text-stone/40 font-mono">- </span>
              </button>

              <button 
                onClick={() => insertBlock('ordered')} 
                className="w-full text-left px-2 py-1.5 text-[11px] text-stone hover:text-warm-white hover:bg-white/5 rounded flex items-center gap-2 cursor-pointer"
              >
                <ListOrdered className="w-3.5 h-3.5 text-accent-violet" />
                <span>Numbered List</span>
                <span className="ml-auto text-[9px] text-stone/40 font-mono">1. </span>
              </button>

              <button 
                onClick={() => insertBlock('quote')} 
                className="w-full text-left px-2 py-1.5 text-[11px] text-stone hover:text-warm-white hover:bg-white/5 rounded flex items-center gap-2 cursor-pointer"
              >
                <Quote className="w-3.5 h-3.5 text-accent-pink" />
                <span>Blockquote</span>
                <span className="ml-auto text-[9px] text-stone/40 font-mono">&gt; </span>
              </button>

              <button 
                onClick={() => insertBlock('codeblock')} 
                className="w-full text-left px-2 py-1.5 text-[11px] text-stone hover:text-warm-white hover:bg-white/5 rounded flex items-center gap-2 cursor-pointer"
              >
                <Code className="w-3.5 h-3.5 text-accent-orange" />
                <span>Code Block</span>
                <span className="ml-auto text-[9px] text-stone/40 font-mono">```</span>
              </button>

              <button 
                onClick={() => insertBlock('hr')} 
                className="w-full text-left px-2 py-1.5 text-[11px] text-stone hover:text-warm-white hover:bg-white/5 rounded flex items-center gap-2 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5 text-stone" />
                <span>Divider</span>
                <span className="ml-auto text-[9px] text-stone/40 font-mono">---</span>
              </button>

              <button 
                onClick={() => insertBlock('callout')} 
                className="w-full text-left px-2 py-1.5 text-[11px] text-stone hover:text-warm-white hover:bg-white/5 rounded flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-accent-emerald" />
                <span>Callout Box</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Editor Footer Counts */}
      <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-[11px] text-stone font-mono">
        <span>Press <kbd className="bg-white/5 px-1 py-0.5 rounded border border-white/5">/</kbd> to insert elements • Paste <kbd className="bg-white/5 px-1 py-0.5 rounded border border-white/5">MD</kbd> auto-formats</span>
        <div className="flex items-center gap-3">
          <span>Words: {wordCount}</span>
          <span>•</span>
          <span>Reading time: {readingTime} min</span>
        </div>
      </div>

    </div>
  );
}

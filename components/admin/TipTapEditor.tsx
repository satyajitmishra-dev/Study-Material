'use client';

import React, { useEffect, useState } from 'react';
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
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/core';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

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
    } else if (type === 'callout') {
      editor.chain().focus().insertContent('<p style="padding: 12px; background: rgba(255,255,255,0.03); border-left: 3px solid #8b5cf6; border-radius: 4px;">ℹ️ <strong>Callout:</strong> </p>').run();
    }
    
    setShowSlashMenu(false);
  };

  return (
    <div className="border border-white/5 bg-charcoal/10 rounded-2xl p-5 relative min-h-[460px] flex flex-col justify-between">
      
      {/* Editor Main Menu Toolbar */}
      <div className="flex items-center gap-1.5 border-b border-white/5 pb-3 mb-4 flex-wrap text-stone">
        <Button 
          variant={editor.isActive('bold') ? 'accent' : 'ghost'} 
          className="p-1.5 h-8 w-8"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-4 h-4" />
        </Button>
        
        <Button 
          variant={editor.isActive('italic') ? 'accent' : 'ghost'} 
          className="p-1.5 h-8 w-8"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-4 h-4" />
        </Button>

        <Button 
          variant={editor.isActive('code') ? 'accent' : 'ghost'} 
          className="p-1.5 h-8 w-8"
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="w-4 h-4" />
        </Button>

        <div className="w-[1px] h-5 bg-white/5 mx-1" />

        <Button 
          variant={editor.isActive('heading', { level: 1 }) ? 'accent' : 'ghost'} 
          className="p-1.5 h-8 w-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="w-4 h-4" />
        </Button>

        <Button 
          variant={editor.isActive('heading', { level: 2 }) ? 'accent' : 'ghost'} 
          className="p-1.5 h-8 w-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="w-4 h-4" />
        </Button>

        <Button 
          variant={editor.isActive('heading', { level: 3 }) ? 'accent' : 'ghost'} 
          className="p-1.5 h-8 w-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="w-4 h-4" />
        </Button>

        <div className="w-[1px] h-5 bg-white/5 mx-1" />

        <Button 
          variant={editor.isActive('bulletList') ? 'accent' : 'ghost'} 
          className="p-1.5 h-8 w-8"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-4 h-4" />
        </Button>

        <Button 
          variant={editor.isActive('orderedList') ? 'accent' : 'ghost'} 
          className="p-1.5 h-8 w-8"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        <Button 
          variant={editor.isActive('blockquote') ? 'accent' : 'ghost'} 
          className="p-1.5 h-8 w-8"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="w-4 h-4" />
        </Button>
      </div>

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
          <div className="absolute top-10 left-4 z-40 w-44 rounded-xl bg-onyx border border-white/10 p-1.5 shadow-premium backdrop-blur-md">
            <div className="text-[10px] text-stone uppercase font-bold tracking-wider px-2 py-1 border-b border-white/5 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-accent-cyan animate-pulse" />
              <span>Insert Block</span>
            </div>
            
            <div className="space-y-0.5 max-h-[220px] overflow-y-auto custom-scrollbar">
              <button 
                onClick={() => insertBlock('h1')} 
                className="w-full text-left px-2 py-1.5 text-[11px] text-stone hover:text-warm-white hover:bg-white/5 rounded flex items-center gap-2 cursor-pointer"
              >
                <Heading1 className="w-3.5 h-3.5 text-accent-cyan" />
                Heading 1
              </button>
              
              <button 
                onClick={() => insertBlock('h2')} 
                className="w-full text-left px-2 py-1.5 text-[11px] text-stone hover:text-warm-white hover:bg-white/5 rounded flex items-center gap-2 cursor-pointer"
              >
                <Heading2 className="w-3.5 h-3.5 text-accent-cyan" />
                Heading 2
              </button>

              <button 
                onClick={() => insertBlock('h3')} 
                className="w-full text-left px-2 py-1.5 text-[11px] text-stone hover:text-warm-white hover:bg-white/5 rounded flex items-center gap-2 cursor-pointer"
              >
                <Heading3 className="w-3.5 h-3.5 text-accent-cyan" />
                Heading 3
              </button>

              <button 
                onClick={() => insertBlock('bullet')} 
                className="w-full text-left px-2 py-1.5 text-[11px] text-stone hover:text-warm-white hover:bg-white/5 rounded flex items-center gap-2 cursor-pointer"
              >
                <List className="w-3.5 h-3.5 text-accent-violet" />
                Bullet List
              </button>

              <button 
                onClick={() => insertBlock('ordered')} 
                className="w-full text-left px-2 py-1.5 text-[11px] text-stone hover:text-warm-white hover:bg-white/5 rounded flex items-center gap-2 cursor-pointer"
              >
                <ListOrdered className="w-3.5 h-3.5 text-accent-violet" />
                Numbered List
              </button>

              <button 
                onClick={() => insertBlock('quote')} 
                className="w-full text-left px-2 py-1.5 text-[11px] text-stone hover:text-warm-white hover:bg-white/5 rounded flex items-center gap-2 cursor-pointer"
              >
                <Quote className="w-3.5 h-3.5 text-accent-pink" />
                Blockquote
              </button>

              <button 
                onClick={() => insertBlock('callout')} 
                className="w-full text-left px-2 py-1.5 text-[11px] text-stone hover:text-warm-white hover:bg-white/5 rounded flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-accent-emerald" />
                Callout Box
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Editor Footer Counts */}
      <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-[11px] text-stone font-mono">
        <span>Press <kbd className="bg-white/5 px-1 py-0.5 rounded border border-white/5">/</kbd> to insert elements</span>
        <div className="flex items-center gap-3">
          <span>Words: {wordCount}</span>
          <span>•</span>
          <span>Reading time: {readingTime} min</span>
        </div>
      </div>

    </div>
  );
}

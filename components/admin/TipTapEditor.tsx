'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Youtube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextAlign from '@tiptap/extension-text-align';

import { NodeSelection } from '@tiptap/pm/state';

// Custom Node Extensions
import { 
  CalloutNode, 
  MathInlineNode, 
  MathBlockNode, 
  MermaidBlockNode, 
  GithubEmbedNode, 
  QuizBlockNode 
} from './editorExtensions';

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
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Video,
  Image as ImageIcon,
  HelpCircle,
  Play,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  Columns,
  Maximize2,
  Minimize2,
  Check,
  Github
} from 'lucide-react';
import { Button } from '@/components/ui/core';
import { generateAiContentAction } from '@/lib/actions/cms';

interface TipTapEditorProps {
  content: string; // Serialized TipTap JSON String or HTML
  onChange: (contentString: string) => void;
}

// Dialog States
type ModalType = 'link' | 'image' | 'video' | 'table' | 'math' | 'mermaid' | 'quiz' | 'callout' | 'github' | null;

export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSplitView, setIsSplitView] = useState(false);

  // Dialog management
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalInput1, setModalInput1] = useState('');
  const [modalInput2, setModalInput2] = useState('');
  const [modalInput3, setModalInput3] = useState('');
  const [modalOptions, setModalOptions] = useState<string[]>(['Option 1', 'Option 2']);

  // Slash Suggestion menu states
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);
  const [slashInsertPos, setSlashInsertPos] = useState<number | null>(null);

  // Hover block toolbar states
  const [hoveredBlock, setHoveredBlock] = useState<{ element: HTMLElement; top: number; left: number } | null>(null);
  const [showBlockDropdown, setShowBlockDropdown] = useState(false);

  // Selection Bubble Menu / AI Menu states
  const [showAiDropdown, setShowAiDropdown] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponseText, setAiResponseText] = useState('');

  // 1. Initializing TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disabling default code block in favor of premium
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accent-cyan underline cursor-pointer',
          rel: 'noopener noreferrer',
          target: '_blank'
        }
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl border border-white/5 my-6 max-w-full h-auto'
        }
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse w-full my-6 border border-white/10 rounded-xl overflow-hidden'
        }
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-white/5 border border-white/10 font-bold px-4 py-2 text-left text-xs font-mono text-stone'
        }
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-white/10 px-4 py-2 text-xs text-stone/90'
        }
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: 'rounded-xl overflow-hidden shadow-premium my-6 aspect-video max-w-full'
        }
      }),
      Placeholder.configure({
        placeholder: 'Write something spectacular... Use / to insert advanced blocks, or highlight text for AI.'
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list space-y-1.5 my-4'
        }
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2.5 text-[14px]'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      // Custom NodeView extensions
      CalloutNode,
      MathInlineNode,
      MathBlockNode,
      MermaidBlockNode,
      GithubEmbedNode,
      QuizBlockNode
    ],
    content: '',
    onUpdate: ({ editor }) => {
      // Return stringified TipTap JSON document representation as source of truth
      const json = editor.getJSON();
      onChange(JSON.stringify(json));

      // Handle Slash Commands suggestions
      const { state } = editor;
      const { selection } = state;
      const textAfterCursor = selection.$from.parent.textContent;
      const cursorOffset = selection.$from.parentOffset;
      const textBeforeCursor = textAfterCursor.slice(0, cursorOffset);
      
      const slashIndex = textBeforeCursor.lastIndexOf('/');
      if (slashIndex !== -1 && slashIndex === textBeforeCursor.length - 1) {
        setShowSlashMenu(true);
        setSlashQuery('');
        setSlashSelectedIndex(0);
        setSlashInsertPos(selection.$from.pos);
      } else if (showSlashMenu) {
        // If they keep typing, update query
        const query = textBeforeCursor.substring(slashIndex + 1);
        setSlashQuery(query);
        setSlashSelectedIndex(0);
      }
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[460px] text-[14px] text-stone/95 leading-relaxed max-w-none prose prose-invert prose-stone select-text',
      }
    }
  });

  // Sync initial content
  useEffect(() => {
    if (!editor || !content) return;
    try {
      const parsed = JSON.parse(content);
      // Only set if content actually changed to avoid cycles
      if (JSON.stringify(editor.getJSON()) !== content) {
        editor.commands.setContent(parsed);
      }
    } catch (e) {
      // If content is HTML, parse/set normally
      if (editor.getHTML() !== content) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  // Slash commands block options
  const slashItems = [
    { label: 'Heading 1', value: 'h1', desc: 'Large title', icon: <Heading1 className="w-3.5 h-3.5" /> },
    { label: 'Heading 2', value: 'h2', desc: 'Medium title', icon: <Heading2 className="w-3.5 h-3.5" /> },
    { label: 'Heading 3', value: 'h3', desc: 'Small title', icon: <Heading3 className="w-3.5 h-3.5" /> },
    { label: 'Bullet List', value: 'bullet', desc: 'Simple list', icon: <List className="w-3.5 h-3.5" /> },
    { label: 'Numbered List', value: 'ordered', desc: 'Numbered list', icon: <ListOrdered className="w-3.5 h-3.5" /> },
    { label: 'Task Checklist', value: 'task', desc: 'Todo tasks list', icon: <Check className="w-3.5 h-3.5 text-accent-cyan" /> },
    { label: 'Blockquote', value: 'quote', desc: 'Quote container', icon: <Quote className="w-3.5 h-3.5" /> },
    { label: 'Code Playground', value: 'codeblock', desc: 'Syntax highlighting sandbox', icon: <Code className="w-3.5 h-3.5 text-accent-orange" /> },
    { label: 'Callout Box', value: 'callout', desc: 'Highlighted alert info box', icon: <Sparkles className="w-3.5 h-3.5 text-accent-violet" /> },
    { label: 'Table Grid', value: 'table', desc: 'Insert data table spreadsheet', icon: <TableIcon className="w-3.5 h-3.5 text-accent-cyan" /> },
    { label: 'GitHub Repository Card', value: 'github', desc: 'Rich dynamic repo card', icon: <Github className="w-3.5 h-3.5 text-white" /> },
    { label: 'KaTeX Math Formula', value: 'math', desc: 'LaTeX math blocks', icon: <HelpCircle className="w-3.5 h-3.5 text-accent-pink" /> },
    { label: 'Mermaid Diagram Flow', value: 'mermaid', desc: 'Render flowcharts', icon: <Play className="w-3.5 h-3.5 text-accent-emerald" /> },
    { label: 'Interactive Quiz Card', value: 'quiz', desc: 'Add a quiz questionnaire', icon: <HelpCircle className="w-3.5 h-3.5 text-accent-amber" /> },
    { label: 'YouTube Video Embed', value: 'youtube', desc: 'Embed media stream', icon: <Video className="w-3.5 h-3.5 text-accent-pink" /> },
    { label: 'Image Upload', value: 'image', desc: 'Responsive cover images', icon: <ImageIcon className="w-3.5 h-3.5 text-stone" /> },
    { label: 'Horizontal Divider', value: 'hr', desc: 'Structural page divider', icon: <Minus className="w-3.5 h-3.5" /> },
  ];

  const filteredSlashItems = slashItems.filter(item => 
    item.label.toLowerCase().includes(slashQuery.toLowerCase()) ||
    item.value.toLowerCase().includes(slashQuery.toLowerCase())
  );

  // Executing Block Inserts
  const insertBlock = (type: string) => {
    if (!editor) return;

    // Delete the slash trigger
    if (slashInsertPos !== null) {
      editor.chain().focus().deleteRange({
        from: slashInsertPos - 1,
        to: slashInsertPos
      }).run();
    } else {
      editor.chain().focus().run();
    }

    setShowSlashMenu(false);
    setSlashInsertPos(null);

    // Direct inserts
    if (type === 'h1') {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    } else if (type === 'h2') {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (type === 'h3') {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    } else if (type === 'bullet') {
      editor.chain().focus().toggleBulletList().run();
    } else if (type === 'ordered') {
      editor.chain().focus().toggleOrderedList().run();
    } else if (type === 'task') {
      editor.chain().focus().toggleTaskList().run();
    } else if (type === 'quote') {
      editor.chain().focus().toggleBlockquote().run();
    } else if (type === 'hr') {
      editor.chain().focus().setHorizontalRule().run();
    } else {
      // Trigger modal configuration
      setModalInput1('');
      setModalInput2('');
      setModalInput3('');
      if (type === 'callout') setModalInput1('info');
      if (type === 'quiz') setModalOptions(['Option A', 'Option B']);
      setActiveModal(type as ModalType);
    }
  };

  // Keyboard navigation inside Slash menu
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSlashMenu && filteredSlashItems.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashSelectedIndex(prev => (prev + 1) % filteredSlashItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashSelectedIndex(prev => (prev - 1 + filteredSlashItems.length) % filteredSlashItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        insertBlock(filteredSlashItems[slashSelectedIndex].value);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSlashMenu(false);
      }
    }
  };

  // Modal Submissions
  const handleModalSubmit = () => {
    if (!editor) return;

    if (activeModal === 'link') {
      if (modalInput1) {
        editor.chain().focus().setLink({ href: modalInput1 }).run();
      } else {
        editor.chain().focus().unsetLink().run();
      }
    } else if (activeModal === 'image') {
      if (modalInput1) {
        editor.chain().focus().setImage({ 
          src: modalInput1, 
          alt: modalInput2 || 'Image',
          title: modalInput3 || 'Image Caption'
        }).run();
      }
    } else if (activeModal === 'video') {
      if (modalInput1) {
        editor.chain().focus().setYoutubeVideo({ src: modalInput1 }).run();
      }
    } else if (activeModal === 'table') {
      const rows = parseInt(modalInput1) || 3;
      const cols = parseInt(modalInput2) || 3;
      editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    } else if (activeModal === 'callout') {
      editor.chain().focus().insertContent({
        type: 'callout',
        attrs: { type: modalInput1 },
        content: [{ type: 'text', text: modalInput2 || 'Callout text info...' }]
      }).run();
    } else if (activeModal === 'math') {
      const isBlock = modalInput2 === 'block';
      if (isBlock) {
        editor.chain().focus().insertContent({
          type: 'mathBlock',
          attrs: { formula: modalInput1 || 'E=mc^2' }
        }).run();
      } else {
        editor.chain().focus().insertContent({
          type: 'mathInline',
          attrs: { formula: modalInput1 || 'E=mc^2' }
        }).run();
      }
    } else if (activeModal === 'mermaid') {
      editor.chain().focus().insertContent({
        type: 'mermaidBlock',
        attrs: { code: modalInput1 || 'graph TD\n  A --> B' }
      }).run();
    } else if (activeModal === 'github') {
      editor.chain().focus().insertContent({
        type: 'githubEmbed',
        attrs: { url: modalInput1 }
      }).run();
    } else if (activeModal === 'quiz') {
      editor.chain().focus().insertContent({
        type: 'quizBlock',
        attrs: {
          question: modalInput1 || 'Quiz Question?',
          options: modalOptions,
          answerIndex: parseInt(modalInput2) || 0,
          explanation: modalInput3 || 'Explanation.'
        }
      }).run();
    }

    setActiveModal(null);
  };

  // Hover block mouse detection
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!editor || !containerRef.current) return;

    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target) return;

    // Find the direct top-level child element of the EditorContent container (.tiptap)
    const blockEl = target.closest('.tiptap > *') as HTMLElement;
    if (blockEl && containerRef.current.contains(blockEl)) {
      const editorRect = containerRef.current.getBoundingClientRect();
      const blockRect = blockEl.getBoundingClientRect();

      setHoveredBlock({
        element: blockEl,
        top: blockRect.top - editorRect.top + blockEl.offsetHeight / 2,
        left: -12, // Align left gutter
      });
    } else {
      // Hide if mouse moves outside bounds
      const editorRect = containerRef.current.getBoundingClientRect();
      if (e.clientX < editorRect.left - 40 || e.clientX > editorRect.right + 40) {
        setHoveredBlock(null);
        setShowBlockDropdown(false);
      }
    }
  };

  // Drag handle selected node setup
  const handleDragStart = (e: React.DragEvent) => {
    if (!editor || !hoveredBlock) return;
    const pos = editor.view.posAtDOM(hoveredBlock.element, 0);
    const selection = NodeSelection.create(editor.state.doc, pos);
    editor.view.dispatch(editor.state.tr.setSelection(selection));
  };

  // Hover Block Actions
  const handleBlockAction = (action: 'duplicate' | 'delete' | 'moveup' | 'movedown') => {
    if (!editor || !hoveredBlock) return;
    const pos = editor.view.posAtDOM(hoveredBlock.element, 0);
    const resolvedPos = editor.state.doc.resolve(pos);
    const node = resolvedPos.nodeAfter;
    if (!node) return;

    if (action === 'delete') {
      editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
    } else if (action === 'duplicate') {
      editor.chain().focus().insertContentAt(pos + node.nodeSize, node.toJSON()).run();
    } else if (action === 'moveup') {
      const json = node.toJSON();
      editor.chain().focus()
        .deleteRange({ from: pos, to: pos + node.nodeSize })
        .insertContentAt(Math.max(0, pos - 12), json)
        .run();
    }

    setHoveredBlock(null);
    setShowBlockDropdown(false);
  };

  // Contextual AI assist execution
  const runContextualAi = async (option: string) => {
    if (!editor) return;
    const selection = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(selection.from, selection.to, ' ');

    if (!selectedText.trim()) return;

    setIsAiLoading(true);
    setShowAiDropdown(false);
    try {
      const res = await generateAiContentAction(
        selectedText, 
        option as any
      );

      if (res.success && res.text) {
        editor.chain().focus().insertContent(res.text).run();
      } else {
        alert(res.error || 'AI request failed.');
      }
    } catch (e) {
      alert('Failed to connect to AI server endpoint.');
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!editor) return null;

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onKeyDownCapture={handleKeyDown}
      className={`
        relative border border-white/5 bg-charcoal/10 rounded-2xl p-5 flex flex-col justify-between select-text
        ${isFullscreen ? 'fixed inset-0 z-50 bg-[#1c1c1e] p-8' : 'min-h-[500px]'}
      `}
    >
      
      {/* Editor Main Menu Toolbar */}
      <div className="flex items-center gap-1.5 border-b border-white/5 pb-3 mb-4 flex-wrap text-stone z-30 select-none">
        
        {/* Undo / Redo */}
        <Button 
          type="button"
          variant="ghost" 
          className="p-1 h-8 w-8"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button 
          type="button"
          variant="ghost" 
          className="p-1 h-8 w-8"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </Button>

        <div className="w-[1px] h-5 bg-white/5 mx-1" />

        {/* Text Formats */}
        <Button 
          type="button"
          variant={editor.isActive('bold') ? 'accent' : 'ghost'} 
          className="p-1 h-8 w-8 font-bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button 
          type="button"
          variant={editor.isActive('italic') ? 'accent' : 'ghost'} 
          className="p-1 h-8 w-8 italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button 
          type="button"
          variant={editor.isActive('underline') ? 'accent' : 'ghost'} 
          className="p-1 h-8 w-8 underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <span className="font-serif text-sm font-semibold border-b border-warm-white pb-0.5">U</span>
        </Button>
        <Button 
          type="button"
          variant={editor.isActive('strike') ? 'accent' : 'ghost'} 
          className="p-1 h-8 w-8"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </Button>
        <Button 
          type="button"
          variant={editor.isActive('code') ? 'accent' : 'ghost'} 
          className="p-1 h-8 w-8"
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </Button>

        <div className="w-[1px] h-5 bg-white/5 mx-1" />

        {/* Alignments */}
        <Button 
          type="button"
          variant={editor.isActive({ textAlign: 'left' }) ? 'accent' : 'ghost'} 
          className="p-1 h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button 
          type="button"
          variant={editor.isActive({ textAlign: 'center' }) ? 'accent' : 'ghost'} 
          className="p-1 h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button 
          type="button"
          variant={editor.isActive({ textAlign: 'right' }) ? 'accent' : 'ghost'} 
          className="p-1 h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </Button>
        <Button 
          type="button"
          variant={editor.isActive({ textAlign: 'justify' }) ? 'accent' : 'ghost'} 
          className="p-1 h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          title="Justify Align"
        >
          <AlignJustify className="w-4 h-4" />
        </Button>

        <div className="w-[1px] h-5 bg-white/5 mx-1" />

        {/* Headings */}
        <Button 
          type="button"
          variant={editor.isActive('heading', { level: 1 }) ? 'accent' : 'ghost'} 
          className="p-1 h-8 w-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button 
          type="button"
          variant={editor.isActive('heading', { level: 2 }) ? 'accent' : 'ghost'} 
          className="p-1 h-8 w-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button 
          type="button"
          variant={editor.isActive('heading', { level: 3 }) ? 'accent' : 'ghost'} 
          className="p-1 h-8 w-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </Button>

        <div className="w-[1px] h-5 bg-white/5 mx-1" />

        {/* Media / Link dialog inserts */}
        <Button 
          type="button"
          variant={editor.isActive('link') ? 'accent' : 'ghost'} 
          className="p-1 h-8 w-8"
          onClick={() => {
            setModalInput1(editor.getAttributes('link').href || '');
            setActiveModal('link');
          }}
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </Button>

        <Button 
          type="button"
          variant="ghost" 
          className="p-1 h-8 w-8"
          onClick={() => insertBlock('table')}
          title="Insert Table Grid"
        >
          <TableIcon className="w-4 h-4" />
        </Button>

        <Button 
          type="button"
          variant="ghost" 
          className="p-1 h-8 w-8"
          onClick={() => insertBlock('image')}
          title="Upload / Paste Image"
        >
          <ImageIcon className="w-4 h-4" />
        </Button>

        {/* Layout Modes */}
        <div className="flex-1" />

        <Button
          type="button"
          variant={isSplitView ? 'accent' : 'secondary'}
          className="h-8 text-[10px] px-2.5 flex items-center gap-1"
          onClick={() => setIsSplitView(!isSplitView)}
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Split Preview</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="h-8 w-8 p-1 shrink-0"
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Zen Mode'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>

      </div>

      {/* Editor Content Gutter / Grid Area */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-[420px]">
        
        {/* Editor Main Content Area */}
        <div className="flex-1 relative border border-white/5 bg-charcoal/10 rounded-xl p-4 overflow-y-auto max-h-[550px] custom-scrollbar">
          
          {/* Notion Hover block indicator */}
          {hoveredBlock && (
            <div 
              className="absolute z-20 flex items-center gap-0.5 bg-onyx border border-white/10 rounded-lg p-0.5 shadow-premium animate-in fade-in slide-in-from-left-1 duration-100"
              style={{
                top: `${hoveredBlock.top}px`,
                left: `${hoveredBlock.left}px`,
                transform: 'translate(-100%, -50%)'
              }}
            >
              <button
                type="button"
                className="p-1 rounded hover:bg-white/10 cursor-pointer text-stone hover:text-warm-white"
                onClick={() => insertBlock('h1')}
                title="Add block"
              >
                <Plus className="w-3 h-3" />
              </button>
              
              {/* Drag handles container */}
              <div
                draggable
                onDragStart={handleDragStart}
                className="p-1 rounded hover:bg-white/10 cursor-grab active:cursor-grabbing text-stone hover:text-warm-white flex flex-col gap-0.5"
                onClick={() => setShowBlockDropdown(!showBlockDropdown)}
                title="Block Operations Menu"
              >
                <span className="block w-1.5 h-1.5 rounded-full bg-stone" />
                <span className="block w-1.5 h-1.5 rounded-full bg-stone" />
                <span className="block w-1.5 h-1.5 rounded-full bg-stone" />
              </div>

              {/* Block Actions Dropdown */}
              {showBlockDropdown && (
                <div className="absolute top-6 left-0 z-40 bg-onyx border border-white/10 p-1.5 rounded-xl shadow-premium w-36 text-left flex flex-col gap-0.5 animate-in zoom-in-95 duration-100">
                  <button 
                    type="button"
                    onClick={() => handleBlockAction('duplicate')}
                    className="w-full text-left px-2.5 py-1.5 text-[10.5px] rounded hover:bg-white/5 text-stone hover:text-warm-white cursor-pointer"
                  >
                    Duplicate Block
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleBlockAction('moveup')}
                    className="w-full text-left px-2.5 py-1.5 text-[10.5px] rounded hover:bg-white/5 text-stone hover:text-warm-white cursor-pointer"
                  >
                    Move Block Up
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleBlockAction('delete')}
                    className="w-full text-left px-2.5 py-1.5 text-[10.5px] rounded hover:bg-accent-pink/15 text-accent-pink cursor-pointer"
                  >
                    Delete Block
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Selection bubble menu contextual AI actions */}
          {editor && (
            <BubbleMenu 
              editor={editor} 
              className="flex items-center gap-1 bg-onyx border border-white/10 p-1.5 rounded-xl shadow-premium backdrop-blur-md z-45"
            >
              <button
                type="button"
                onClick={() => setShowAiDropdown(!showAiDropdown)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-accent-violet/10 hover:bg-accent-violet/20 text-accent-violet text-[11px] font-bold cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>AI Assist</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              <div className="w-[1px] h-4 bg-white/5 mx-1" />

              <button 
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1 rounded hover:bg-white/5 text-[11px] font-bold cursor-pointer transition-colors ${editor.isActive('bold') ? 'text-accent-cyan' : 'text-stone'}`}
              >
                Bold
              </button>
              <button 
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1 rounded hover:bg-white/5 text-[11px] italic cursor-pointer transition-colors ${editor.isActive('italic') ? 'text-accent-cyan' : 'text-stone'}`}
              >
                Italic
              </button>

              {/* Contextual AI Writing Assist Dropdown */}
              {showAiDropdown && (
                <div className="absolute top-8 left-0 z-50 bg-[#1c1c1e] border border-white/10 rounded-xl p-1.5 w-44 shadow-premium flex flex-col gap-0.5 text-left animate-in zoom-in-95 duration-100 max-h-[220px] overflow-y-auto custom-scrollbar">
                  {[
                    { label: '✨ Improve Writing', value: 'rewrite' },
                    { label: '✍️ Fix Grammar', value: 'grammar' },
                    { label: '💡 Explain Better', value: 'explain' },
                    { label: '⚡ Continue Writing', value: 'continue' },
                    { label: '📝 Summarize Selection', value: 'summarize' },
                    { label: '📊 Generate FAQ schema', value: 'faq' }
                  ].map(aiOpt => (
                    <button
                      key={aiOpt.value}
                      type="button"
                      onClick={() => runContextualAi(aiOpt.value)}
                      className="w-full text-left px-2 py-1 text-[11px] rounded hover:bg-white/5 text-stone hover:text-warm-white cursor-pointer"
                    >
                      {aiOpt.label}
                    </button>
                  ))}
                </div>
              )}
            </BubbleMenu>
          )}

          <EditorContent editor={editor} />

          {/* AI Loader indicator */}
          {isAiLoading && (
            <div className="absolute bottom-4 right-4 z-40 bg-onyx/80 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2 shadow-premium text-xs text-accent-cyan animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>AI is thinking...</span>
            </div>
          )}

          {/* Suggestion autocomplete menu */}
          {showSlashMenu && filteredSlashItems.length > 0 && (
            <div className="absolute z-40 w-52 rounded-xl bg-[#1c1c1e] border border-white/10 p-1.5 shadow-premium backdrop-blur-md max-h-[280px] overflow-y-auto custom-scrollbar select-none text-left"
              style={{
                top: `${(editor.state.selection.$from.pos * 1.5) % 350 + 40}px`,
                left: '20px'
              }}
            >
              <div className="text-[10px] text-stone uppercase font-bold tracking-wider px-2 py-1.5 border-b border-white/5 mb-1 flex items-center gap-1 select-none">
                <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
                <span>Advanced Blocks</span>
              </div>
              <div className="space-y-0.5">
                {filteredSlashItems.map((item, idx) => (
                  <button 
                    key={item.value}
                    type="button"
                    onClick={() => insertBlock(item.value)} 
                    className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2.5 transition-colors cursor-pointer
                      ${idx === slashSelectedIndex ? 'bg-white/5 text-warm-white' : 'text-stone hover:text-warm-white hover:bg-white/5'}
                    `}
                  >
                    <span className="text-accent-cyan shrink-0">{item.icon}</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">{item.label}</span>
                      <span className="text-[9px] text-stone/50 font-light truncate">{item.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Split View preview column */}
        {isSplitView && (
          <div className="flex-1 border border-white/5 bg-[#1c1c1e]/40 rounded-xl p-4 overflow-y-auto max-h-[550px] custom-scrollbar text-left">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-accent-cyan border-b border-white/5 pb-2 mb-4 font-mono select-none">Live WYSIWYG Sandbox</h4>
            <div className="prose prose-invert prose-stone max-w-none text-[13px]" dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
          </div>
        )}

      </div>

      {/* Editor footer */}
      <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-[11px] text-stone font-mono select-none">
        <span>Type <kbd className="bg-white/5 px-1 py-0.5 rounded border border-white/5">/</kbd> for advanced inserts • Bubble Menu for Contextual AI assist</span>
        <span>Words: {editor.state.doc.textContent.split(/\s+/).filter(Boolean).length}</span>
      </div>

      {/* Modal Dialog Overlay renderer */}
      {activeModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#1c1c1e] border border-white/10 rounded-2xl p-5 max-w-md w-full shadow-premium space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-warm-white uppercase tracking-wider flex items-center gap-1.5 capitalize">
                <Sparkles className="w-4 h-4 text-accent-cyan" />
                <span>Configure {activeModal} Block</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setActiveModal(null)} 
                className="text-stone hover:text-warm-white text-xs cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Inputs based on type */}
            <div className="space-y-3.5">
              {activeModal === 'link' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-stone">Link URL (External opens in new tab)</label>
                  <input 
                    type="text" 
                    value={modalInput1}
                    onChange={(e) => setModalInput1(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-warm-white outline-none focus:border-white/20"
                  />
                </div>
              )}

              {activeModal === 'image' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-stone">Image URL (Cloudinary or unsplash)</label>
                    <input 
                      type="text" 
                      value={modalInput1}
                      onChange={(e) => setModalInput1(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-warm-white outline-none focus:border-white/20"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-stone">Alt Description (A11y Enforcement)</label>
                    <input 
                      type="text" 
                      value={modalInput2}
                      onChange={(e) => setModalInput2(e.target.value)}
                      placeholder="Enforce screen reader accessibility tag"
                      className="w-full bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-warm-white outline-none focus:border-white/20"
                      required
                    />
                  </div>
                </>
              )}

              {activeModal === 'video' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-stone">YouTube Stream Link</label>
                  <input 
                    type="text" 
                    value={modalInput1}
                    onChange={(e) => setModalInput1(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-warm-white outline-none focus:border-white/20"
                  />
                </div>
              )}

              {activeModal === 'table' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-stone">Rows Count</label>
                    <input 
                      type="number" 
                      value={modalInput1}
                      onChange={(e) => setModalInput1(e.target.value)}
                      placeholder="3"
                      className="w-full bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-warm-white outline-none focus:border-white/20"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-stone">Columns Count</label>
                    <input 
                      type="number" 
                      value={modalInput2}
                      onChange={(e) => setModalInput2(e.target.value)}
                      placeholder="3"
                      className="w-full bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-warm-white outline-none focus:border-white/20"
                    />
                  </div>
                </div>
              )}

              {activeModal === 'callout' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-stone">Callout Alert Level</label>
                    <select 
                      value={modalInput1}
                      onChange={(e) => setModalInput1(e.target.value)}
                      className="w-full bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-warm-white outline-none focus:border-white/20"
                    >
                      <option value="info">Info (Cyan)</option>
                      <option value="tip">Tip (Emerald)</option>
                      <option value="warning">Warning (Amber)</option>
                      <option value="danger">Danger (Pink)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-stone">Alert Content Text</label>
                    <input 
                      type="text" 
                      value={modalInput2}
                      onChange={(e) => setModalInput2(e.target.value)}
                      placeholder="Type details..."
                      className="w-full bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-warm-white outline-none focus:border-white/20"
                    />
                  </div>
                </>
              )}

              {activeModal === 'math' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-stone">LaTeX Formula Equation</label>
                    <textarea 
                      value={modalInput1}
                      onChange={(e) => setModalInput1(e.target.value)}
                      placeholder="e.g. \int x dx"
                      className="w-full h-24 bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-warm-white outline-none focus:border-white/20 font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-stone">Layout Mode</label>
                    <select
                      value={modalInput2}
                      onChange={(e) => setModalInput2(e.target.value)}
                      className="w-full bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-warm-white outline-none focus:border-white/20"
                    >
                      <option value="inline">Inline Text</option>
                      <option value="block">Centered Block</option>
                    </select>
                  </div>
                </>
              )}

              {activeModal === 'mermaid' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-stone">Mermaid Graph Syntax Code</label>
                  <textarea 
                    value={modalInput1}
                    onChange={(e) => setModalInput1(e.target.value)}
                    placeholder="graph TD&#10;  A[Start] --> B[Process]"
                    className="w-full h-32 bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-warm-white outline-none focus:border-white/20 font-mono"
                  />
                </div>
              )}

              {activeModal === 'github' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-stone">GitHub Repository URL</label>
                  <input 
                    type="text" 
                    value={modalInput1}
                    onChange={(e) => setModalInput1(e.target.value)}
                    placeholder="https://github.com/facebook/react"
                    className="w-full bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-warm-white outline-none focus:border-white/20"
                  />
                </div>
              )}

              {activeModal === 'quiz' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-stone">Question</label>
                    <input 
                      type="text" 
                      value={modalInput1}
                      onChange={(e) => setModalInput1(e.target.value)}
                      placeholder="Question content..."
                      className="w-full bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-warm-white outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-stone">Options (Comma separated)</label>
                    <input 
                      type="text" 
                      value={modalOptions.join(', ')}
                      onChange={(e) => setModalOptions(e.target.value.split(',').map(s => s.trim()))}
                      placeholder="Option A, Option B, Option C"
                      className="w-full bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-warm-white outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-stone">Correct Answer Index (0-based)</label>
                    <input 
                      type="number" 
                      value={modalInput2}
                      onChange={(e) => setModalInput2(e.target.value)}
                      placeholder="0"
                      className="w-full bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-warm-white outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-stone">Answer Explanation</label>
                    <input 
                      type="text" 
                      value={modalInput3}
                      onChange={(e) => setModalInput3(e.target.value)}
                      placeholder="Why is it correct?"
                      className="w-full bg-charcoal/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-warm-white outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setActiveModal(null)}
                className="h-8 text-[11px]"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="primary" 
                onClick={handleModalSubmit}
                className="h-8 text-[11px]"
              >
                Insert Block
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

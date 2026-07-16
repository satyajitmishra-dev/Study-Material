import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Youtube from '@tiptap/extension-youtube';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextAlign from '@tiptap/extension-text-align';

// A simple local Markdown to HTML converter to avoid importing external packages
function markdownToHtml(md: string): string {
  let html = md;

  // Code blocks (```...```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    const languageClass = lang ? ` class="language-${lang}"` : '';
    return `<pre><code${languageClass}>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()}</code></pre>`;
  });

  // Headers (must match start of line)
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

  // Task lists
  html = html.replace(/^-\s+\[\s*\]\s+(.+)$/gm, '<li data-type="taskItem" data-checked="false">$1</li>');
  html = html.replace(/^-\s+\[[xX]\]\s+(.+)$/gm, '<li data-type="taskItem" data-checked="true">$1</li>');

  // Unordered lists (standard)
  html = html.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Wrap remaining plain lines into paragraphs (unless they're already block elements)
  const blockTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'blockquote', 'ul', 'ol', 'li', 'hr', 'table', 'tr', 'td', 'th'];
  const blockRegex = new RegExp(`^<(${blockTags.join('|')})`, 'i');
  
  html = html.split('\n').map(line => {
    const trimmed = line.trim();
    if (trimmed.length === 0) return '';
    if (blockRegex.test(trimmed)) return trimmed;
    return `<p>${trimmed}</p>`;
  }).join('\n');

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
  return hits >= 2;
}

// Lazy loading generateJSON to prevent Edge/SSR issues if library isn't loaded
let generateJSONFn: any = null;
async function getGenerateJSON() {
  if (!generateJSONFn) {
    const htmlModule = await import('@tiptap/html');
    generateJSONFn = htmlModule.generateJSON;
  }
  return generateJSONFn;
}

export const getParserExtensions = () => [
  StarterKit,
  Underline,
  Link.configure({ openOnClick: false }),
  Image,
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
  Youtube,
  TaskList,
  TaskItem.configure({ nested: true }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
];

export function isTipTapJson(content: string): boolean {
  if (!content) return false;
  const trimmed = content.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      return parsed && typeof parsed === 'object' && parsed.type === 'doc';
    } catch {
      return false;
    }
  }
  return false;
}

export async function migrateContentToTipTapJson(content: string): Promise<any> {
  if (!content) {
    return { type: 'doc', content: [] };
  }

  // 1. Check if it's already a valid TipTap JSON doc
  if (isTipTapJson(content)) {
    return JSON.parse(content);
  }

  // 2. Determine if it is raw Markdown or HTML
  let htmlContent = content;
  if (looksLikeMarkdown(content)) {
    htmlContent = markdownToHtml(content);
  }

  // 3. Convert HTML to TipTap JSON using generateJSON
  try {
    const generateJSON = await getGenerateJSON();
    const extensions = getParserExtensions();
    const doc = generateJSON(htmlContent, extensions);
    return doc;
  } catch (err) {
    console.error('Failed to parse content to TipTap JSON, falling back to raw paragraph:', err);
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: content }]
        }
      ]
    };
  }
}

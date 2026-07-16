import { Node } from '@tiptap/core';

// 1. Custom Callout Block Node
export const CalloutNode = Node.create({
  name: 'callout',
  group: 'block',
  content: 'inline*',
  defining: true,
  addAttributes() {
    return {
      type: { default: 'info' } // info | tip | warning | danger
    };
  },
  parseHTML() {
    return [
      {
        tag: 'div[class*=callout-block]',
        getAttrs: dom => ({
          type: (dom as HTMLElement).getAttribute('data-type') || 'info'
        })
      }
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    const type = node.attrs.type;
    const icons = {
      info: 'ℹ️',
      tip: '💡',
      warning: '⚠️',
      danger: '🚫'
    };
    const icon = icons[type as keyof typeof icons] || 'ℹ️';

    return ['div', { 
      class: `callout-block p-4 border-l-4 rounded-r-xl my-4 bg-white/5 border-l-accent-cyan flex items-start gap-3 callout-${type}`,
      'data-type': type,
      ...HTMLAttributes 
    }, ['span', { class: 'callout-icon select-none shrink-0' }, icon], ['div', { class: 'callout-content flex-1' }, 0]];
  }
});

// 2. Custom Math Inline Node ($math$)
export const MathInlineNode = Node.create({
  name: 'mathInline',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,
  addAttributes() {
    return {
      formula: { default: 'E=mc^2' }
    };
  },
  parseHTML() {
    return [
      {
        tag: 'span[class*=math-inline]',
        getAttrs: dom => ({
          formula: (dom as HTMLElement).getAttribute('data-formula') || ''
        })
      }
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    return ['span', {
      class: 'math-inline font-mono text-accent-cyan px-1.5 py-0.5 bg-white/5 rounded border border-white/5 cursor-pointer',
      'data-formula': node.attrs.formula,
      ...HTMLAttributes
    }, `$${node.attrs.formula}$`];
  }
});

// 3. Custom Math Block Node ($$math$$)
export const MathBlockNode = Node.create({
  name: 'mathBlock',
  group: 'block',
  selectable: true,
  atom: true,
  addAttributes() {
    return {
      formula: { default: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}' }
    };
  },
  parseHTML() {
    return [
      {
        tag: 'div[class*=math-block]',
        getAttrs: dom => ({
          formula: (dom as HTMLElement).getAttribute('data-formula') || ''
        })
      }
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    return ['div', {
      class: 'math-block font-mono text-accent-cyan p-4 bg-charcoal/20 border border-dashed border-white/5 rounded-xl text-center cursor-pointer my-4',
      'data-formula': node.attrs.formula,
      ...HTMLAttributes
    }, `$$${node.attrs.formula}$$`];
  }
});

// 4. Custom Mermaid Diagram Block Node
export const MermaidBlockNode = Node.create({
  name: 'mermaidBlock',
  group: 'block',
  defining: true,
  code: true,
  addAttributes() {
    return {
      code: { default: 'graph TD\n  A[Start] --> B(Process)' }
    };
  },
  parseHTML() {
    return [
      {
        tag: 'pre[class*=mermaid-block]',
        getAttrs: dom => ({
          code: dom.textContent || ''
        })
      }
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    return ['pre', {
      class: 'mermaid-block border border-dashed border-white/10 bg-charcoal/10 p-4 rounded-xl font-mono text-xs my-4 cursor-pointer',
      'data-code': node.attrs.code,
      ...HTMLAttributes
    }, ['code', node.attrs.code]];
  }
});

// 5. Custom GitHub Repo Embed Node
export const GithubEmbedNode = Node.create({
  name: 'githubEmbed',
  group: 'block',
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      url: { default: '' }
    };
  },
  parseHTML() {
    return [
      {
        tag: 'div[class*=github-embed]',
        getAttrs: dom => ({
          url: (dom as HTMLElement).getAttribute('data-url') || ''
        })
      }
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    return ['div', {
      class: 'github-embed p-4 border border-dashed border-white/10 bg-charcoal/5 rounded-xl text-xs flex items-center justify-between text-stone gap-2 my-4 cursor-pointer',
      'data-url': node.attrs.url,
      ...HTMLAttributes
    }, `GitHub Embed: ${node.attrs.url || 'No URL specified'}`];
  }
});

// 6. Custom Interactive Quiz Block Node
export const QuizBlockNode = Node.create({
  name: 'quizBlock',
  group: 'block',
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      question: { default: 'Double click to edit quiz details...' },
      options: { default: ['Option 1', 'Option 2'] },
      answerIndex: { default: 0 },
      explanation: { default: 'Explanation text goes here.' }
    };
  },
  parseHTML() {
    return [
      {
        tag: 'div[class*=quiz-block]',
        getAttrs: dom => {
          const el = dom as HTMLElement;
          let options = [];
          try {
            options = JSON.parse(el.getAttribute('data-options') || '[]');
          } catch {
            options = [];
          }
          return {
            question: el.getAttribute('data-question') || '',
            options,
            answerIndex: parseInt(el.getAttribute('data-answer') || '0', 10),
            explanation: el.getAttribute('data-explanation') || ''
          };
        }
      }
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    return ['div', {
      class: 'quiz-block my-4 p-4 border border-dashed border-accent-violet/30 bg-accent-violet/5 rounded-xl text-xs text-stone flex flex-col gap-1 cursor-pointer',
      'data-question': node.attrs.question,
      'data-options': JSON.stringify(node.attrs.options),
      'data-answer': node.attrs.answerIndex,
      'data-explanation': node.attrs.explanation,
      ...HTMLAttributes
    }, `📝 Quiz Card: "${node.attrs.question}" (Answer Index: ${node.attrs.answerIndex})`];
  }
});

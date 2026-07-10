import { ProjectData } from './storage';

export interface CourseStep {
  id: string;
  title: string;
  duration: string;
  type: 'text' | 'video' | 'interactive';
  content: string; // MDX-like content
}

export interface CourseChapter {
  id: string;
  title: string;
  steps: CourseStep[];
}

export interface Course {
  id: string;
  title: string;
  tagline: string;
  category: 'React' | 'TypeScript' | 'AI' | 'Backend' | 'CSS' | 'Database' | 'Cloud';
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  chapters: CourseChapter[];
}

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'available' | 'completed';
  category: string;
  x: number;
  y: number;
}

export const MOCK_COURSES: Course[] = [
  {
    id: 'next-16-compiler',
    title: 'Next.js 16 & React Compiler',
    tagline: 'Deep dive into automated memoization, Partial Prerendering (PPR), and Next.js 16 caching layers.',
    category: 'React',
    duration: '6 hrs',
    difficulty: 'Advanced',
    chapters: [
      {
        id: 'intro',
        title: '1. React Compiler Archetype',
        steps: [
          {
            id: 'compiler-overview',
            title: 'Automatic Memoization',
            duration: '15 mins',
            type: 'text',
            content: `## The Era of Automatic Memoization

In React 19 and Next.js 16, the **React Compiler** (formerly React Forget) is enabled by default. This compiler automatically memoizes component outputs, props, and dependency arrays.

### What has changed?
Previously, to avoid unnecessary re-renders, developers had to manually write \`useMemo\` and \`useCallback\`. This led to cluttered code and subtle bugs when dependencies were misconfigured.

\`\`\`tsx
// Before (React 18)
const Component = ({ items, filter }) => {
  const filtered = useMemo(() => {
    return items.filter(filter);
  }, [items, filter]);
  
  return <List items={filtered} />;
};
\`\`\`

With the React Compiler, the code is simplified to pure JavaScript:

\`\`\`tsx
// Now (React 19 / Next.js 16)
const Component = ({ items, filter }) => {
  const filtered = items.filter(filter); // Automatically memoized!
  return <List items={filtered} />;
};
\`\`\`

### How it Works under the Hood
The compiler analyzes your code using strict rules of JavaScript and React (e.g. components must be pure, props must be read-only). It transforms your code at build time, injecting cache slots to track dependencies and reuse outputs unless inputs change.`
          },
          {
            id: 'rules-of-react',
            title: 'Strict Purity Rules',
            duration: '20 mins',
            type: 'text',
            content: `## Enforcing the Rules of React

To enable the compiler to safely optimize your React code, your components and hooks must adhere to strict rules of purity.

1. **Never mutate props or state directly**: Mutations bypass the compiler's change detection. Always use state setters or immutable updates.
2. **Side effects belong in event handlers or useEffect**: Do not perform side effects (like API calls or setting cookies) directly in the render path.
3. **Components must be pure**: The exact same props should always yield the same visual output.

### Linting for the Compiler
You can use the official eslint plugin to detect compiler-breaking practices:
\`\`\`bash
npm install eslint-plugin-react-compiler
\`\`\`

If the compiler detects a rule violation, it will safely skip optimizing that component and fall back to standard React execution.`
          }
        ]
      },
      {
        id: 'ppr-caching',
        title: '2. Partial Prerendering (PPR)',
        steps: [
          {
            id: 'ppr-fundamentals',
            title: 'Partial Prerendering',
            duration: '25 mins',
            type: 'text',
            content: `## Combining Static and Dynamic Shells

Partial Prerendering (PPR) allows you to combine static layouts with dynamic components on the same route. Next.js compiles a static HTML shell immediately and streams dynamic holes as soon as they resolve.

### Visual Architecture
\`\`\`
┌─────────────────────────────────────────┐
│ Layout (Static Shell)                   │
├───────────────────┬─────────────────────┤
│ Sidebar (Static)  │ Content (Dynamic)   │
│                   │ ┌─────────────────┐ │
│                   │ │ <Suspense>      │ │
│                   │ │ loading...      │ │
│                   │ └─────────────────┘ │
└───────────────────┴─────────────────────┘
\`\`\`

### Implementation Example
Wrap your dynamic fetch components in React \`Suspense\` boundaries. Next.js compiles everything outside \`Suspense\` into a static file, serving it instantly, and uses HTTP streaming for the nested suspense fallback content.`
          }
        ]
      }
    ]
  },
  {
    id: 'framer-motion-physics',
    title: 'Framer Motion Physics & Spatial UI',
    tagline: 'Crafting responsive, Apple-grade interface dynamics with spring animations and viewport triggers.',
    category: 'CSS',
    duration: '4 hrs',
    difficulty: 'Intermediate',
    chapters: [
      {
        id: 'springs',
        title: '1. Designing Natural Motion',
        steps: [
          {
            id: 'spring-physics',
            title: 'Spring vs. Tween',
            duration: '15 mins',
            type: 'text',
            content: `## Emulating Physical Forces

Great UI motion uses spring physics rather than traditional linear or cubic easing curves. Springs simulate tension, friction, and mass, creating organic responses to user input.

### Motion Config Tokens
Use these configurations for natural desktop physics:

*   **Fast Snappy**: \`mass: 0.5, stiffness: 220, damping: 25\` (120-180ms equivalent)
*   **Smooth Fluid**: \`mass: 0.8, stiffness: 140, damping: 20\` (180-250ms equivalent)
*   **Slow Ambient**: \`mass: 1.0, stiffness: 80, damping: 18\` (250-350ms equivalent)`
          }
        ]
      }
    ]
  }
];

export const MOCK_PROJECTS: ProjectData[] = [
  {
    id: 'studymaterial-core',
    name: 'StudyMaterial Core App',
    tagline: 'The world\'s most premium developer learning platform shell built with Next.js 16.',
    category: 'React',
    githubUrl: 'https://github.com/studymaterial/studymaterial',
    demoUrl: 'https://studymaterial.utool.in',
    stars: 1240,
    forks: 82,
    description: 'An open-source flagship implementation demonstrating Next.js 16 App Router, React 19 Compiler, Tailwind CSS v4 CSS-first design tokens, and smooth Framer Motion micro-interactions.',
    installationSteps: [
      'git clone https://github.com/studymaterial/studymaterial.git',
      'cd studymaterial',
      'npm install',
      'npm run dev'
    ],
    architectureNodes: [
      { id: 'client', label: 'Client Space', type: 'Client Workspace', description: 'Next.js App Router shell with Floating Dock and Command Palette.', x: 100, y: 150 },
      { id: 'compiler', label: 'React Compiler', type: 'Compiler Engine', description: 'At-build auto-memoization compiler optimizing re-renders.', x: 300, y: 150 },
      { id: 'storage', label: 'Abstract Storage', type: 'Data Layer', description: 'Persistence layer separating local dev storage from production DB.', x: 500, y: 100 },
      { id: 'edge', label: 'Vercel Edge API', type: 'Routing Engine', description: 'Edge-rendered middleware, route handlers and caching layers.', x: 500, y: 200 }
    ],
    architectureEdges: [
      { from: 'client', to: 'compiler' },
      { from: 'compiler', to: 'storage' },
      { from: 'compiler', to: 'edge' }
    ],
    faq: [
      { question: 'Why use Tailwind CSS v4 over Tailwind v3?', answer: 'Tailwind CSS v4 removes the config JS block and replaces it with native CSS @theme custom properties, compiling in Rust with substantial performance increases.' },
      { question: 'Is the storage layer production-ready?', answer: 'Yes. It uses an abstract provider interface. In local-dev, it persists to LocalStorage; in production, you swap the provider to connect to Postgres or Redis.' }
    ]
  },
  {
    id: 'raycast-command-palette',
    name: 'Raycast Command Center',
    tagline: 'Highly responsive spotlight-style search overlay with keyboard hotkeys.',
    category: 'TypeScript',
    githubUrl: 'https://github.com/studymaterial/raycast-palette',
    demoUrl: 'https://palette.studymaterial.dev',
    stars: 540,
    forks: 31,
    description: 'A modular, high-fidelity command palette utilizing search indexing, category filters, and fast response times suitable for premium dashboard integration.',
    installationSteps: [
      'npm install @studymaterial/command-palette',
      'import { CommandPalette } from "@studymaterial/command-palette"'
    ]
  }
];

export const MOCK_ROADMAP: RoadmapNode[] = [
  { id: 'r1', title: 'Modern React & Compiler', description: 'Learn automated memoization, React 19 server components, and actions.', status: 'completed', category: 'React', x: 200, y: 50 },
  { id: 'r2', title: 'Next.js 16 Framework', description: 'Master Partial Prerendering (PPR), file-based routing, and Edge API handlers.', status: 'available', category: 'React', x: 200, y: 180 },
  { id: 'r3', title: 'Tailwind CSS v4 & Styling', description: 'Design premium layouts using CSS @theme properties and fluid typography.', status: 'available', category: 'CSS', x: 100, y: 300 },
  { id: 'r4', title: 'Edge Databases & Caching', description: 'Scale database architectures with edge replication and tags-based invalidation.', status: 'locked', category: 'Database', x: 300, y: 300 },
  { id: 'r5', title: 'AI-Native Integration', description: 'Incorporate client-side streaming, structured output schema, and local LLMs.', status: 'locked', category: 'AI', x: 200, y: 450 }
];

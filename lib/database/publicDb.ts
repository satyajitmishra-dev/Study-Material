import { getPrisma } from './dbClient';
import {
  CmsProject,
  CmsAnalytics,
  User,
  Category,
  Tag,
  PostTag,
  Visitor,
  Reaction,
  Bookmark,
  Collection,
  Highlight,
  Note,
  ReadingSession,
  Follow,
  PostSeries,
  SeriesPost,
  Comment,
  CommentReply,
  SpamReport,
  Notification,
  AuthorProfile,
  CmsSetting,
  ShareEvent,
  Integration,
  ProjectRoadmap,
  RoadmapTask,
  ProjectTimeline,
  Project
} from '@prisma/client';

// --- IN-MEMORY FALLBACK DATABASE FOR SANDBOX DEV ---
let inMemoryCategories: Category[] = [];
let inMemoryTags: Tag[] = [];
let inMemoryPostTags: PostTag[] = [];
let inMemoryVisitors: Visitor[] = [];
let inMemoryReactions: Reaction[] = [];
let inMemoryBookmarks: Bookmark[] = [];
let inMemoryCollections: Collection[] = [];
let inMemoryHighlights: Highlight[] = [];
let inMemoryNotes: Note[] = [];
let inMemoryReadingSessions: ReadingSession[] = [];
let inMemoryFollows: Follow[] = [];
let inMemorySeries: PostSeries[] = [];
let inMemorySeriesPosts: SeriesPost[] = [];
let inMemoryComments: Comment[] = [];
let inMemoryCommentReplies: CommentReply[] = [];
let inMemorySpamReports: SpamReport[] = [];
let inMemoryNotifications: Notification[] = [];
let inMemoryAuthorProfiles: AuthorProfile[] = [];
let inMemorySettings: CmsSetting[] = [];
let inMemoryShareEvents: ShareEvent[] = [];
let inMemoryIntegrations: Integration[] = [];
let inMemoryRoadmaps: ProjectRoadmap[] = [];
let inMemoryRoadmapTasks: RoadmapTask[] = [];
let inMemoryTimelines: ProjectTimeline[] = [];
let inMemoryProjects: any[] = [];
let inMemoryUserNotes: any[] = [];
let inMemoryDiscussions: any[] = [];
let inMemoryDiscussionAnswers: any[] = [];
let inMemoryDiscussionReplies: any[] = [];
let inMemoryDiscussionVotes: any[] = [];
let inMemoryPolls: any[] = [];
let inMemoryPollOptions: any[] = [];
let inMemoryPollVotes: any[] = [];
let inMemoryEvents: any[] = [];
let inMemoryEventRegistrations: any[] = [];
let inMemoryCuratedRoadmaps: any[] = [];
let inMemoryRoadmapStepNodes: any[] = [];
let inMemoryUserRoadmapProgress: any[] = [];
let inMemoryRoadmapSuggestions: any[] = [];
let inMemoryPlatformResources: any[] = [];
export let inMemoryUsernameHistories: any[] = [];
export let inMemoryDraftBackups: any[] = [];
export let inMemoryCmsRedirects: any[] = [];
export let inMemoryProjectContributors: any[] = [];
export let inMemoryProjectSyncHistories: any[] = [];
export let inMemoryProjectVersions: any[] = [];

// Seed initial records in Sandbox Mode
const seedPublicSandboxDb = () => {
  if (inMemoryCategories.length > 0) return;

  const now = new Date();

  // Categories
  inMemoryCategories.push(
    { id: 'cat_react', name: 'React', slug: 'react', description: 'Modern UI engineering, server components, and dynamic frameworks.', createdAt: now, updatedAt: now, projectId: 'proj_sandbox_1' },
    { id: 'cat_css', name: 'CSS', slug: 'css', description: 'Modern layout engines, spring variables, and fluid transitions.', createdAt: now, updatedAt: now, projectId: 'proj_sandbox_1' },
    { id: 'cat_ai', name: 'AI', slug: 'ai', description: 'Neural systems, prompt workflows, embeddings, and generative designs.', createdAt: now, updatedAt: now, projectId: 'proj_sandbox_1' },
    { id: 'cat_backend', name: 'Backend', slug: 'backend', description: 'Server structures, caching variables, and secure routing APIs.', createdAt: now, updatedAt: now, projectId: 'proj_sandbox_1' }
  );

  // Tags
  inMemoryTags.push(
    { id: 'tag_nextjs', name: 'Next.js', slug: 'nextjs', description: 'Full-stack application framework capabilities.', createdAt: now, updatedAt: now, projectId: 'proj_sandbox_1' },
    { id: 'tag_ppr', name: 'PPR', slug: 'ppr', description: 'Partial Prerendering streaming holes.', createdAt: now, updatedAt: now, projectId: 'proj_sandbox_1' },
    { id: 'tag_framer', name: 'Framer Motion', slug: 'framer', description: 'Interactive spring physics components.', createdAt: now, updatedAt: now, projectId: 'proj_sandbox_1' },
    { id: 'tag_prisma', name: 'Prisma', slug: 'prisma', description: 'Structured schema and database client.', createdAt: now, updatedAt: now, projectId: 'proj_sandbox_1' }
  );

  // Settings
  inMemorySettings.push(
    {
      id: 'set_home',
      key: 'homepage_layout',
      value: JSON.stringify(['hero', 'trending', 'categories', 'series', 'latest', 'newsletter']),
      updatedAt: now
    },
    {
      id: 'set_nav',
      key: 'navbar_menu',
      value: JSON.stringify([
        { label: 'Home', href: '/' },
        { label: 'Articles', href: '/posts' },
        { label: 'Categories', href: '/categories' },
        { label: 'Tags', href: '/tags' },
        { label: 'Saved Bookmarks', href: '/saved' }
      ]),
      updatedAt: now
    },
    {
      id: 'set_flags',
      key: 'feature_flags',
      value: JSON.stringify({
        enableNewsletterDigest: true,
        enableSpeechReader: true,
        enableReactions: true
      }),
      updatedAt: now
    }
  );

  // Author profiles
  inMemoryAuthorProfiles.push({
    id: 'ap_admin',
    userId: 'sandbox-admin-id',
    bio: 'Principal Software Engineer & Technical Author. Specialize in Next.js, database caching, and CSS micro-animations.',
    website: 'https://studymaterial.utool.in',
    twitter: 'https://twitter.com/studymaterial',
    github: 'https://github.com/satyajitmishra-dev',
    linkedin: 'https://linkedin.com/in/satyajitmishra',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    headline: 'Principal Software Architect | Open Source Creator',
    location: 'Bhubaneswar, India',
    portfolio: 'https://studymaterial.utool.in/portfolio',
    experienceLevel: 'Principal Architect',
    achievements: ['open_source_contributor', 'ai_wizard'],
    skills: JSON.stringify([
      { name: "Next.js", years: 4, level: "Expert", popularity: 98 },
      { name: "React", years: 6, level: "Expert", popularity: 95 },
      { name: "TypeScript", years: 5, level: "Expert", popularity: 92 },
      { name: "Prisma", years: 3, level: "Intermediate", popularity: 88 },
      { name: "Node.js", years: 5, level: "Advanced", popularity: 90 },
      { name: "PostgreSQL", years: 4, level: "Advanced", popularity: 85 }
    ]),
    experience: JSON.stringify([
      { company: "Vercel", role: "Principal Architect", duration: "2024 - Present", description: "Spearheaded Partial Prerendering and React 19 core features development." },
      { company: "Google", role: "Senior Software Engineer", duration: "2021 - 2024", description: "Worked on Chrome DevTools integrations and performance diagnostics." }
    ]),
    education: JSON.stringify([
      { college: "Stanford University", degree: "M.S.", branch: "Computer Science", duration: "2019 - 2021", cgpa: "3.9", achievements: "Specialized in Distributed Systems" }
    ]),
    languages: ["English", "Hindi", "Odia"],
    interests: ["Compilers", "Web Performance", "AI/ML", "UI Design"],
    availability: "available",
    youtube: "https://youtube.com",
    discord: "https://discord.gg/studymaterial",
    hashnode: "https://hashnode.dev/satyajit",
    devto: "https://dev.to/satyajit",
    leetcode: "https://leetcode.com/satyajit",
    codeforces: "https://codeforces.com/profile/satyajit",
    codechef: "https://codechef.com/users/satyajit",
    hackerrank: "https://hackerrank.com/satyajit",
    medium: "https://medium.com/@satyajit",
    achievementsJson: JSON.stringify([
      { title: "LeetCode Guardian", description: "Top 1% rating globally on LeetCode", issuer: "LeetCode", date: "2026-03-01", verificationUrl: "https://leetcode.com" },
      { title: "Open Source Advocate", description: "Contributed to React core and Next.js repositories", issuer: "GitHub", date: "2025-12-15", verificationUrl: "https://github.com/reactjs" }
    ]),
    createdAt: now,
    updatedAt: now
  });

  // Setup sample series
  inMemorySeries.push({
    id: 'ser_next',
    title: 'Next.js 16 Deep Dive',
    slug: 'nextjs-16-deep-dive',
    description: 'A comprehensive step-by-step series exploring compilation, dynamic streaming shells, and hydration mechanics.',
    createdAt: now,
    updatedAt: now
  });

  inMemorySeriesPosts.push({
    id: 'sp_1',
    seriesId: 'ser_next',
    projectId: 'proj_sandbox_1',
    orderIndex: 1
  });

  // Setup sample projects
  inMemoryProjects.push({
    id: 'proj_sandbox_1',
    name: 'Study Materials',
    slug: 'study-materials',
    logo: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=100&q=80',
    description: 'A developer resource hub and learning pipeline for engineering topics.',
    organizationId: 'org_sandbox_1',
    createdAt: now,
    updatedAt: now,
    liveDemo: 'https://studymaterial.utool.in',
    documentationUrl: 'https://docs.studymaterial.dev',
    techStack: ['Next.js', 'React 19', 'TailwindCSS', 'Prisma', 'PostgreSQL'],
    license: 'MIT',
    banner: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    startDate: '2026-01-01',
    completionDate: null,
    visibility: 'public',
    tagsList: ['nextjs', 'react', 'education', 'developer-platform'],
    githubUrl: 'https://github.com/satyajitmishra-dev/Study-Material',
    githubMetadata: JSON.stringify({
      repoName: 'satyajitmishra-dev/Study-Material',
      description: 'Study Materials & developer resource center.',
      stars: 45,
      forks: 8,
      watchers: 5,
      openIssues: 2,
      openPulls: 1,
      license: 'MIT',
      defaultBranch: 'main',
      ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      languages: ['TypeScript', 'CSS', 'HTML'],
      topics: ['nextjs', 'react', 'education', 'cms'],
      contributors: [
        { login: 'satyajitmishra-dev', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' },
        { login: 'developer-guest', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' }
      ],
      releases: [
        { tag_name: 'v1.0.0', name: 'Initial Release', body: 'Launched initial developer resource center.' }
      ],
      commits: [
        { sha: 'a8f4c29d', message: 'feat: support multi-tenant workspace setups', author: 'satyajitmishra-dev', date: now.toISOString() },
        { sha: '8c91a34d', message: 'docs: update deployment guidelines', author: 'developer-guest', date: now.toISOString() }
      ]
    }),
    githubLastSyncedAt: now
  });

  // Setup sample integration
  inMemoryIntegrations.push({
    id: 'int_sandbox_1',
    projectId: 'proj_sandbox_1',
    provider: 'github',
    isActive: true,
    credentials: 'mock_token',
    settings: JSON.stringify({ repoUrl: 'https://github.com/satyajitmishra-dev/Study-Material' }),
    metadata: inMemoryProjects[0].githubMetadata,
    lastSyncedAt: now,
    createdAt: now,
    updatedAt: now
  });

  // Setup sample roadmaps
  inMemoryRoadmaps.push({
    id: 'rm_sandbox_1',
    projectId: 'proj_sandbox_1',
    title: 'Phase 1: Core Foundation',
    description: 'Establish repository structure and user authentication hooks.',
    status: 'completed',
    progress: 100,
    estimatedCompletion: '2026-03-31',
    orderIndex: 0,
    createdAt: now,
    updatedAt: now
  }, {
    id: 'rm_sandbox_2',
    projectId: 'proj_sandbox_1',
    title: 'Phase 2: Modular Project Dashboards',
    description: 'Implement repo viewer, milestones, tasks, and analytics logging.',
    status: 'in_progress',
    progress: 50,
    estimatedCompletion: '2026-07-31',
    orderIndex: 1,
    createdAt: now,
    updatedAt: now
  });

  // Roadmap tasks
  inMemoryRoadmapTasks.push({
    id: 'rmt_1',
    roadmapId: 'rm_sandbox_1',
    title: 'Initialize Prisma Schema & Adapter setup',
    status: 'done',
    orderIndex: 0,
    createdAt: now,
    updatedAt: now
  }, {
    id: 'rmt_2',
    roadmapId: 'rm_sandbox_1',
    title: 'Setup Google OAuth login callbacks',
    status: 'done',
    orderIndex: 1,
    createdAt: now,
    updatedAt: now
  }, {
    id: 'rmt_3',
    roadmapId: 'rm_sandbox_2',
    title: 'GitHub API Connection and metadata caching',
    status: 'done',
    orderIndex: 0,
    createdAt: now,
    updatedAt: now
  }, {
    id: 'rmt_4',
    roadmapId: 'rm_sandbox_2',
    title: 'Milestones and progress bar widgets',
    status: 'in_progress',
    orderIndex: 1,
    createdAt: now,
    updatedAt: now
  }, {
    id: 'rmt_5',
    roadmapId: 'rm_sandbox_2',
    title: 'Write unit tests for profile pages',
    status: 'todo',
    orderIndex: 2,
    createdAt: now,
    updatedAt: now
  });

  // Setup timelines
  inMemoryTimelines.push({
    id: 'tl_sandbox_1',
    projectId: 'proj_sandbox_1',
    title: 'Connected GitHub Repository',
    description: 'Connected project to satyajitmishra-dev/Study-Material.',
    type: 'repo_sync',
    date: new Date(now.getTime() - 3600000 * 48),
    createdAt: now
  }, {
    id: 'tl_sandbox_2',
    projectId: 'proj_sandbox_1',
    title: 'Mastered Core Authentication',
    description: 'Google OAuth login pipelines and account tokens functional.',
    type: 'roadmap_complete',
    date: new Date(now.getTime() - 3600000 * 24),
    createdAt: now
  });

  // Setup sample contributors
  inMemoryProjectContributors.push({
    id: 'pc_1',
    projectId: 'proj_sandbox_1',
    userId: 'sandbox-admin-id',
    name: 'Satyajit Mishra',
    email: 'admin@gmail.com',
    role: 'owner',
    createdAt: now
  }, {
    id: 'pc_2',
    projectId: 'proj_sandbox_1',
    userId: 'sandbox-user-id',
    name: 'Sandbox Developer',
    email: 'developer@gmail.com',
    role: 'maintainer',
    createdAt: now
  });

  // Setup sample project versions
  inMemoryProjectVersions.push({
    id: 'pv_1',
    projectId: 'proj_sandbox_1',
    version: 'v1.0.0',
    changelog: 'Initial production release of the Developer Platform resource hub.',
    releaseNotes: 'Includes multi-tenant workspaces, GitHub repo syncing, and interactive roadmaps.',
    createdAt: new Date(now.getTime() - 3600000 * 72)
  });

  // Setup sample sync history
  inMemoryProjectSyncHistories.push({
    id: 'psh_1',
    projectId: 'proj_sandbox_1',
    status: 'success',
    message: 'Synced 45 stars, 8 forks, 2 issues, and 2 commits from satyajitmishra-dev/Study-Material.',
    type: 'auto',
    createdAt: now
  });

  // --- SEED V4 MODELS ---
  inMemoryUserNotes.push({
    id: 'note_os_notes',
    title: 'Operating System Notes',
    slug: 'operating-system-notes',
    description: 'Complete lecture notes on process synchronization, CPU scheduling, and virtual memory paging.',
    fileUrl: '/uploads/notes/os-notes.pdf',
    fileType: 'PDF',
    fileSize: 2457600,
    visibility: 'public',
    technology: 'Systems',
    category: 'Computer Science',
    tags: ['OS', 'Paging', 'CPU Scheduling'],
    language: 'en',
    license: 'CC BY-NC',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    university: 'Stanford University',
    semester: 4,
    branch: 'Computer Science',
    subject: 'Operating Systems',
    topic: 'Process Management',
    authorId: 'sandbox-admin-id',
    createdAt: new Date(now.getTime() - 3600000 * 48),
    updatedAt: new Date(now.getTime() - 3600000 * 48),
    views: 412,
    likes: 85,
    bookmarksCount: 22
  });

  inMemoryDiscussions.push({
    id: 'disc_auth_strategy',
    title: 'Best Authentication Strategy for Next.js 16?',
    slug: 'best-authentication-strategy-for-nextjs-16',
    content: 'With Next.js 16 App Router, what is the best way to handle persistent sessions? Should we use Iron Session (stateless sealed cookies), NextAuth (beta auth.js), or custom iron-clad JWT cookies with a backend? Let’s debate performance, security, and edge-compatibility.',
    category: 'React',
    tags: ['nextjs', 'authentication', 'security'],
    isQuestion: false,
    visibility: 'public',
    authorId: 'sandbox-admin-id',
    createdAt: new Date(now.getTime() - 3600000 * 36),
    updatedAt: new Date(now.getTime() - 3600000 * 36),
    views: 890,
    upvotes: 42,
    downvotes: 1
  });

  inMemoryDiscussions.push({
    id: 'disc_jwt_work',
    title: 'How does JWT work under the hood in Next.js Middleware?',
    slug: 'how-does-jwt-work-under-the-hood-in-nextjs-middleware',
    content: 'I am trying to verify client JWTs inside Vercel Edge Middleware. Do I need custom crypto engines or can Web Crypto API do it natively? What are the latency overheads?',
    category: 'Next.js',
    tags: ['nextjs', 'jwt', 'middleware'],
    isQuestion: true,
    acceptedAnswerId: 'ans_jwt_resolved',
    visibility: 'public',
    authorId: 'sandbox-user-id',
    createdAt: new Date(now.getTime() - 3600000 * 24),
    updatedAt: new Date(now.getTime() - 3600000 * 24),
    views: 350,
    upvotes: 12,
    downvotes: 0
  });

  inMemoryDiscussionAnswers.push({
    id: 'ans_jwt_resolved',
    content: 'You should use the native `crypto.subtle` Web Crypto API since Node.js `crypto` is not available in Vercel Edge Middleware. Here is a simple verify method:\n\n```typescript\nasync function verifyJwt(token: string, secret: string) {\n  const encoder = new TextEncoder();\n  const keyData = encoder.encode(secret);\n  const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);\n  // verify signatures...\n}\n```',
    discussionId: 'disc_jwt_work',
    authorId: 'sandbox-admin-id',
    isAccepted: true,
    createdAt: new Date(now.getTime() - 3600000 * 20),
    updatedAt: new Date(now.getTime() - 3600000 * 20),
    upvotes: 18,
    downvotes: 0
  });

  inMemoryPolls.push({
    id: 'poll_state_mgmt',
    title: 'Which State Management Library for React 19?',
    description: 'Cast your vote for the best library as the React Compiler auto-memoizes renders.',
    category: 'React',
    technology: 'React',
    durationDays: 7,
    visibility: 'public',
    pollType: 'single',
    isAnonymous: false,
    isClosed: false,
    expiresAt: new Date(now.getTime() + 3600000 * 120),
    authorId: 'sandbox-admin-id',
    createdAt: now,
    updatedAt: now
  });

  inMemoryPollOptions.push(
    { id: 'opt_zustand', text: 'Zustand (Sleek store)', pollId: 'poll_state_mgmt' },
    { id: 'opt_redux', text: 'Redux Toolkit (Enterprise boilerplate)', pollId: 'poll_state_mgmt' },
    { id: 'opt_recoil', text: 'Jotai / Recoil (Atomic values)', pollId: 'poll_state_mgmt' },
    { id: 'opt_context', text: 'Native Context + Signals', pollId: 'poll_state_mgmt' }
  );

  inMemoryEvents.push({
    id: 'evt_hack_2026',
    title: 'Hackathon 2026',
    slug: 'hackathon-2026',
    banner: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    logo: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=100&q=80',
    description: 'The ultimate web engineering challenge. Build high-fidelity developer tools, compilers, templates, or integrations in 48 hours and win $10,000 cash prizes.',
    eventType: 'HACKATHON',
    organizerId: 'sandbox-admin-id',
    startAt: new Date(now.getTime() + 3600000 * 24 * 5),
    endAt: new Date(now.getTime() + 3600000 * 24 * 7),
    deadlineAt: new Date(now.getTime() + 3600000 * 24 * 4),
    minTeamSize: 1,
    maxTeamSize: 4,
    onlineOffline: 'online',
    venue: 'Virtual Discord Engine',
    mapUrl: null,
    allowedColleges: [],
    eligibility: 'All developers worldwide',
    contactEmail: 'organizers@studymaterial.utool.in',
    discordUrl: 'https://discord.gg/studymaterial',
    whatsappUrl: null,
    websiteUrl: 'https://studymaterial.utool.in/hackathon-2026',
    certificate: true,
    prizes: 'First Place: $5,000\nSecond Place: $3,000\nThird Place: $2,000',
    rules: '1. Code must be written during the hackathon.\n2. Projects must use Next.js 16/React 19.\n3. Open source contributions welcomed.',
    faq: JSON.stringify([
      { q: 'Who can register?', a: 'Any developer, student or professional worldwide.' },
      { q: 'Is it team-only?', a: 'You can participate solo or in a team of up to 4 members.' }
    ]),
    timelineJson: JSON.stringify([
      { time: 'Day 1 09:00 AM', event: 'Opening Ceremony' },
      { time: 'Day 1 10:00 AM', event: 'Coding Begins' },
      { time: 'Day 3 10:00 AM', event: 'Submission Deadline' }
    ]),
    judgesJson: JSON.stringify([
      { name: 'Satyajit Mishra', title: 'Principal Architect' }
    ]),
    sponsorsJson: JSON.stringify([
      { name: 'Supabase', tier: 'Gold' },
      { name: 'Vercel', tier: 'Platinum' }
    ]),
    createdAt: now,
    updatedAt: now
  });

  inMemoryCuratedRoadmaps.push({
    id: 'rd_frontend',
    title: 'Frontend Developer Roadmap',
    slug: 'frontend-developer-roadmap',
    description: 'Step-by-step master roadmap to learn modern frontend UI engineering from HTML/CSS to advanced Next.js streaming architectures.',
    difficulty: 'intermediate',
    duration: '8 weeks',
    prerequisites: ['Basic internet fundamentals'],
    isPublished: true,
    createdAt: now,
    updatedAt: now
  });

  inMemoryRoadmapStepNodes.push(
    { id: 'step_html', roadmapId: 'rd_frontend', title: 'HTML', description: 'Semantic elements, DOM trees, accessibility attributes.', parentId: null, orderIndex: 0 },
    { id: 'step_css', roadmapId: 'rd_frontend', title: 'CSS', description: 'Layouts (Flexbox, Grid), media queries, modern custom properties.', parentId: 'step_html', orderIndex: 1 },
    { id: 'step_js', roadmapId: 'rd_frontend', title: 'JavaScript', description: 'Async execution, closures, functional array methods.', parentId: 'step_css', orderIndex: 2 },
    { id: 'step_react', roadmapId: 'rd_frontend', title: 'React', description: 'Hooks, virtualization, automatic compiler memoization.', parentId: 'step_js', orderIndex: 3 },
    { id: 'step_nextjs', roadmapId: 'rd_frontend', title: 'Next.js', description: 'App router, Suspense fallback streaming, dynamic PPR routing.', parentId: 'step_react', orderIndex: 4 }
  );

  inMemoryPlatformResources.push({
    id: 'res_next_docs',
    title: 'Next.js 16 Official Documentation',
    url: 'https://nextjs.org/docs',
    description: 'Learn dynamic routing, Edge middleware, server components, and dynamic caching configurations.',
    category: 'Documentation',
    technology: 'Next.js',
    difficulty: 'Beginner',
    upvotes: 120,
    authorId: 'sandbox-admin-id',
    createdAt: now,
    updatedAt: now
  });
};

seedPublicSandboxDb();

// Abstract database helper class for Postgres & Memory
class PublicDatabase {
  private get prisma() {
    return getPrisma();
  }

  // --- SETTINGS & CONFIGS ---
  async getSetting(key: string, defaultValue: string): Promise<string> {
    const prisma = this.prisma;
    if (prisma) {
      const setting = await prisma.cmsSetting.findUnique({ where: { key } });
      return setting ? setting.value : defaultValue;
    }
    const match = inMemorySettings.find(s => s.key === key);
    return match ? match.value : defaultValue;
  }

  async saveSetting(key: string, value: string): Promise<CmsSetting> {
    const prisma = this.prisma;
    const now = new Date();
    if (prisma) {
      return prisma.cmsSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });
    }
    const idx = inMemorySettings.findIndex(s => s.key === key);
    const item: CmsSetting = { id: idx >= 0 ? inMemorySettings[idx].id : `set_${Date.now()}`, key, value, updatedAt: now };
    if (idx >= 0) {
      inMemorySettings[idx] = item;
    } else {
      inMemorySettings.push(item);
    }
    return item;
  }

  // --- CATEGORIES & TAGS ---
  async getCategories(): Promise<Category[]> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.category.findMany({ orderBy: { name: 'asc' } });
    }
    return [...inMemoryCategories].sort((a, b) => a.name.localeCompare(b.name));
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.category.findUnique({ where: { slug } });
    }
    return inMemoryCategories.find(c => c.slug === slug) || null;
  }

  async createCategory(name: string, slug: string, description?: string): Promise<Category> {
    const prisma = this.prisma;
    const now = new Date();
    if (prisma) {
      return prisma.category.create({ data: { name, slug, description } });
    }
    const newCat: Category = { id: `cat_${Date.now()}`, name, slug, description: description || null, createdAt: now, updatedAt: now, projectId: null };
    inMemoryCategories.push(newCat);
    return newCat;
  }

  async getTags(): Promise<Tag[]> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.tag.findMany({ orderBy: { name: 'asc' } });
    }
    return [...inMemoryTags].sort((a, b) => a.name.localeCompare(b.name));
  }

  async getTagBySlug(slug: string): Promise<Tag | null> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.tag.findUnique({ where: { slug } });
    }
    return inMemoryTags.find(t => t.slug === slug) || null;
  }

  async createTag(name: string, slug: string, description?: string): Promise<Tag> {
    const prisma = this.prisma;
    const now = new Date();
    if (prisma) {
      return prisma.tag.create({ data: { name, slug, description } });
    }
    const newTag: Tag = { id: `tag_${Date.now()}`, name, slug, description: description || null, createdAt: now, updatedAt: now, projectId: null };
    inMemoryTags.push(newTag);
    return newTag;
  }

  // --- SERIES ---
  async getSeriesList(): Promise<PostSeries[]> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.postSeries.findMany({ orderBy: { title: 'asc' } });
    }
    return [...inMemorySeries].sort((a, b) => a.title.localeCompare(b.title));
  }

  async getSeriesBySlug(slug: string): Promise<(PostSeries & { posts: (SeriesPost & { project: CmsProject })[] }) | null> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.postSeries.findUnique({
        where: { slug },
        include: {
          posts: {
            orderBy: { orderIndex: 'asc' },
            include: { project: true }
          }
        }
      }) as any;
    }
    const series = inMemorySeries.find(s => s.slug === slug);
    if (!series) return null;
    const posts = inMemorySeriesPosts
      .filter(sp => sp.seriesId === series.id)
      .map(sp => {
        // Mock getProjectById
        const project = {
          id: 'proj_sandbox_1',
          title: 'Introducing Partial Prerendering',
          slug: 'introducing-partial-prerendering',
          description: 'Learn how to blend static page shells with streamed dynamic content in Next.js 16.',
          category: 'React',
          tags: ['Next.js', 'React Compiler', 'PPR'],
          language: 'en',
          visibility: 'public',
          thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80',
          coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
          content: '',
          seoTitle: '',
          seoDescription: '',
          seoKeywords: '',
          ogImage: '',
          canonical: '',
          robots: '',
          schemaJson: '',
          seoScore: 92,
          views: 1240,
          status: 'published',
          publishedAt: new Date(),
          scheduledAt: null,
          versionNote: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: 'sandbox-admin-id',
          version: 1,
          parentId: null,
          nextProjectId: null,
          prevProjectId: null,
          prerequisiteId: null,
          categoryId: 'cat_react',
          password: null
        } as CmsProject;
        return { ...sp, project };
      })
      .sort((a, b) => a.orderIndex - b.orderIndex);
    return { ...series, posts };
  }

  // --- VISITORS ---
  async getOrCreateVisitor(id: string, fingerprintHash?: string): Promise<Visitor> {
    const prisma = this.prisma;
    const now = new Date();
    if (prisma) {
      return prisma.visitor.upsert({
        where: { id },
        update: { lastSeen: now },
        create: { id, fingerprintHash, firstSeen: now, lastSeen: now }
      });
    }
    const idx = inMemoryVisitors.findIndex(v => v.id === id);
    if (idx >= 0) {
      inMemoryVisitors[idx].lastSeen = now;
      return inMemoryVisitors[idx];
    }
    const newVisitor: Visitor = { id, fingerprintHash: fingerprintHash || null, firstSeen: now, lastSeen: now };
    inMemoryVisitors.push(newVisitor);
    return newVisitor;
  }

  // --- PUBLIC POSTS QUERIES ---
  async getPublicPosts(params: {
    search?: string;
    categorySlug?: string;
    tagSlug?: string;
    authorId?: string;
    sortBy?: 'publishedAt' | 'views' | 'likes' | 'bookmarks';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
    userId?: string;
    visitorId?: string;
  }): Promise<{ items: any[]; total: number }> {
    const prisma = this.prisma;
    const limit = params.limit || 12;
    const offset = params.offset || 0;
    const sortOrder = params.sortOrder || 'desc';
    const sortBy = params.sortBy || 'publishedAt';

    if (prisma) {
      const where: any = {
        status: 'published',
        visibility: { in: ['public', 'unlisted', 'members', 'premium'] }
      };

      if (params.search) {
        where.OR = [
          { title: { contains: params.search, mode: 'insensitive' } },
          { description: { contains: params.search, mode: 'insensitive' } },
          { content: { contains: params.search, mode: 'insensitive' } }
        ];
      }

      if (params.categorySlug) {
        where.categoryRef = { slug: params.categorySlug };
      }

      if (params.tagSlug) {
        where.postTags = {
          some: {
            tag: { slug: params.tagSlug }
          }
        };
      }

      if (params.authorId) {
        where.authorId = params.authorId;
      }

      // Sorting map
      let orderBy: any = {};
      if (sortBy === 'publishedAt') {
        orderBy.publishedAt = sortOrder;
      } else if (sortBy === 'views') {
        orderBy.views = sortOrder;
      } else if (sortBy === 'likes') {
        orderBy.reactions = { _count: sortOrder };
      } else if (sortBy === 'bookmarks') {
        orderBy.bookmarks = { _count: sortOrder };
      }

      try {
        const projects = await prisma.cmsProject.findMany({
          where,
          orderBy,
          skip: offset,
          take: limit,
          include: {
            author: {
              include: { authorProfile: true }
            },
            categoryRef: true,
            postTags: { include: { tag: true } },
            _count: {
              select: {
                reactions: true,
                bookmarks: true,
                comments: true
              }
            }
          }
        });
        const total = await prisma.cmsProject.count({ where });
        return { items: projects, total };
      } catch (err: any) {
        console.warn('[PublicDatabase] getPublicPosts query warning (pool busy):', err.message);
      }
    }

    // In-memory / sandbox fallback when Postgres query fails or prisma is not available
    {
      // In sandbox mode, mock retrieving all published projects.
      // Use standard sandbox mock data.
      let list = [
        {
          id: 'proj_sandbox_1',
          title: 'Introducing Partial Prerendering',
          slug: 'introducing-partial-prerendering',
          description: 'Learn how to blend static page shells with streamed dynamic content in Next.js 16.',
          category: 'React',
          tags: ['Next.js', 'React Compiler', 'PPR'],
          language: 'en',
          visibility: 'public',
          thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80',
          coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
          content: 'Partial Prerendering (PPR) is a layout-first prerendering model...',
          seoTitle: 'Partial Prerendering in Next.js 16',
          seoDescription: 'Optimized guide to PPR features.',
          seoKeywords: 'Next.js, PPR',
          ogImage: '',
          canonical: '',
          robots: 'index, follow',
          schemaJson: null,
          seoScore: 92,
          views: 1240,
          status: 'published',
          publishedAt: new Date(Date.now() - 3600000 * 24),
          scheduledAt: null,
          versionNote: 'Initial release',
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: 'sandbox-admin-id',
          version: 1,
          parentId: null,
          nextProjectId: null,
          prevProjectId: null,
          prerequisiteId: null,
          categoryId: 'cat_react',
          password: null
        }
      ];

      // Add category/tag reference structures
      const formatted = list.map(item => {
        const reactionsCount = inMemoryReactions.filter(r => r.projectId === item.id).length;
        const bookmarksCount = inMemoryBookmarks.filter(b => b.projectId === item.id).length;
        const commentsCount = inMemoryComments.filter(c => c.projectId === item.id).length;

        return {
          ...item,
          author: {
            id: item.authorId,
            name: 'Sandbox Administrator',
            email: 'admin@gmail.com',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
            authorProfile: inMemoryAuthorProfiles.find(ap => ap.userId === item.authorId)
          },
          categoryRef: inMemoryCategories.find(c => c.id === item.categoryId),
          postTags: inMemoryTags.map(tag => ({ tag })),
          _count: {
            reactions: reactionsCount,
            bookmarks: bookmarksCount,
            comments: commentsCount
          }
        };
      });

      return { items: formatted, total: formatted.length };
    }
  }

  async getPublicPostBySlug(slug: string): Promise<any | null> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.cmsProject.findFirst({
        where: {
          slug,
          status: 'published',
          visibility: { in: ['public', 'unlisted', 'members', 'premium'] }
        },
        include: {
          author: {
            include: { authorProfile: true }
          },
          categoryRef: true,
          postTags: { include: { tag: true } },
          nextProject: true,
          prevProject: true,
          _count: {
            select: {
              reactions: true,
              bookmarks: true,
              comments: true
            }
          }
        }
      });
    }

    // In-memory fallback
    const { items } = await this.getPublicPosts({ limit: 1 });
    const match = items.find(item => item.slug === slug);
    return match || null;
  }

  // --- COMMENTS TREE RETRIEVAL ---
  async getCommentsForPost(projectId: string): Promise<any[]> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.comment.findMany({
        where: { projectId, isApproved: true },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        include: {
          user: true,
          replies: {
            orderBy: { createdAt: 'asc' },
            include: { user: true }
          }
        }
      });
    }

    // In-memory fallback
    const comments = inMemoryComments
      .filter(c => c.projectId === projectId && c.isApproved)
      .map(c => {
        const replies = inMemoryCommentReplies
          .filter(r => r.commentId === c.id)
          .map(r => ({
            ...r,
            user: {
              id: 'sandbox-user-id',
              name: 'Sandbox Developer',
              email: 'developer@gmail.com',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'
            }
          }));

        return {
          ...c,
          user: {
            id: 'sandbox-user-id',
            name: 'Sandbox Developer',
            email: 'developer@gmail.com',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'
          },
          replies
        };
      });

    return comments.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  // --- MERGE GUEST DATA TRANSACTION ---
  async syncVisitorData(visitorId: string, userId: string): Promise<void> {
    const prisma = this.prisma;
    if (prisma) {
      // Fetch all visitor entities
      const reactions = await prisma.reaction.findMany({ where: { visitorId } });
      const bookmarks = await prisma.bookmark.findMany({ where: { visitorId } });

      await prisma.$transaction(async (tx) => {
        // Merge reactions
        for (const reaction of reactions) {
          const exists = await tx.reaction.findUnique({
            where: {
              projectId_userId_type: {
                projectId: reaction.projectId,
                userId: userId,
                type: reaction.type
              }
            }
          });
          if (!exists) {
            await tx.reaction.create({
              data: {
                projectId: reaction.projectId,
                type: reaction.type,
                userId: userId
              }
            });
          }
          // Clean up guest row
          await tx.reaction.delete({ where: { id: reaction.id } });
        }

        // Merge bookmarks
        for (const bookmark of bookmarks) {
          const exists = await tx.bookmark.findUnique({
            where: {
              projectId_userId: {
                projectId: bookmark.projectId,
                userId: userId
              }
            }
          });
          if (!exists) {
            await tx.bookmark.create({
              data: {
                projectId: bookmark.projectId,
                userId: userId,
                collectionId: bookmark.collectionId
              }
            });
          }
          // Clean up guest row
          await tx.bookmark.delete({ where: { id: bookmark.id } });
        }
      });
      return;
    }

    // In-memory merge
    const visitorReactions = inMemoryReactions.filter(r => r.visitorId === visitorId);
    visitorReactions.forEach(r => {
      const exists = inMemoryReactions.find(o => o.projectId === r.projectId && o.userId === userId && o.type === r.type);
      if (!exists) {
        inMemoryReactions.push({
          id: `react_${Date.now()}_${Math.random()}`,
          projectId: r.projectId,
          type: r.type,
          userId,
          visitorId: null,
          createdAt: new Date()
        });
      }
    });
    inMemoryReactions = inMemoryReactions.filter(r => r.visitorId !== visitorId);

    const visitorBookmarks = inMemoryBookmarks.filter(b => b.visitorId === visitorId);
    visitorBookmarks.forEach(b => {
      const exists = inMemoryBookmarks.find(o => o.projectId === b.projectId && o.userId === userId);
      if (!exists) {
        inMemoryBookmarks.push({
          id: `bm_${Date.now()}_${Math.random()}`,
          projectId: b.projectId,
          userId,
          visitorId: null,
          collectionId: b.collectionId,
          createdAt: new Date()
        });
      }
    });
    inMemoryBookmarks = inMemoryBookmarks.filter(b => b.visitorId !== visitorId);
  }

  // --- DEVELOPER PLATFORM QUERIES ---
  async getDeveloperProfile(username: string, currentUserId?: string): Promise<any | null> {
    const prisma = this.prisma;
    if (prisma) {
      const user = await prisma.user.findUnique({
        where: { username },
        include: {
          authorProfile: true,
        }
      });
      if (!user) return null;

      // 1. Enforce Profile Visibility Privacy
      if (user.profileVisibility === 'private' && user.id !== currentUserId) {
        return null; // Private profile cannot be viewed by other users
      }

      // Fetch projects owned by user (via organization ownerId)
      let projects = await prisma.project.findMany({
        where: { organization: { ownerId: user.id }, visibility: 'public' },
        include: {
          integrations: true,
          roadmaps: { include: { tasks: true } },
          timelines: true
        }
      });

      // Fetch published CmsProjects written by user
      const posts = await prisma.cmsProject.findMany({
        where: { authorId: user.id, status: 'published' },
        orderBy: { publishedAt: 'desc' },
        include: { categoryRef: true }
      });

      // Fetch followers/following
      let followers = await prisma.follow.findMany({
        where: { targetType: 'DEVELOPER', targetId: user.id },
        include: { user: true }
      });

      let following = await prisma.follow.findMany({
        where: { userId: user.id }
      });

      // Fetch bookmarked posts
      let bookmarks = await prisma.bookmark.findMany({
        where: { userId: user.id },
        include: {
          project: {
            include: { categoryRef: true }
          }
        }
      });

      // 2. Enforce Hidden Fields Privacy filtration (when viewer is not owner)
      const isOwner = user.id === currentUserId;
      if (!isOwner) {
        const hidden = (user.hiddenFields as string[]) || [];
        if (hidden.includes('email')) {
          user.email = null;
        }
        if (hidden.includes('followers')) {
          followers = [];
        }
        if (hidden.includes('following')) {
          following = [];
        }
        if (hidden.includes('projects')) {
          projects = [];
        }
        if (user.authorProfile) {
          if (hidden.includes('location')) {
            user.authorProfile.location = null;
          }
          if (hidden.includes('socialLinks')) {
            user.authorProfile.website = null;
            user.authorProfile.github = null;
            user.authorProfile.linkedin = null;
            user.authorProfile.twitter = null;
            user.authorProfile.portfolio = null;
            user.authorProfile.youtube = null;
            user.authorProfile.discord = null;
            user.authorProfile.hashnode = null;
            user.authorProfile.devto = null;
            user.authorProfile.leetcode = null;
            user.authorProfile.codeforces = null;
            user.authorProfile.codechef = null;
            user.authorProfile.hackerrank = null;
            user.authorProfile.medium = null;
          }
        }
      }

      return {
        user,
        projects,
        posts,
        followers,
        following,
        bookmarks
      };
    }

    // In-memory fallback
    const memoryUser = [
      { id: 'sandbox-admin-id', name: 'Sandbox Administrator', username: 'satyajit', email: 'admin@gmail.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', profileVisibility: 'public', hiddenFields: [] },
      { id: 'sandbox-user-id', name: 'Sandbox Developer', username: 'developer', email: 'developer@gmail.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', profileVisibility: 'public', hiddenFields: [] }
    ].find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!memoryUser) return null;

    // Enforce visibility for mockup
    if (memoryUser.profileVisibility === 'private' && memoryUser.id !== currentUserId) {
      return null;
    }

    let profile = inMemoryAuthorProfiles.find(ap => ap.userId === memoryUser.id);
    if (!profile) {
      profile = {
        id: `ap_${memoryUser.id}`,
        userId: memoryUser.id,
        bio: 'Principal Software Engineer & Technical Author. Specialize in Next.js, database caching, and CSS micro-animations.',
        website: 'https://studymaterial.utool.in',
        twitter: 'https://twitter.com/studymaterial',
        github: 'https://github.com/satyajitmishra-dev',
        linkedin: 'https://linkedin.com/in/satyajitmishra',
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        headline: 'Principal Engineer & Founder',
        location: 'San Francisco, CA',
        portfolio: 'https://satyajit.dev',
        experienceLevel: 'Architect',
        achievements: ['open_source_contributor', 'ai_wizard'],
        createdAt: new Date(),
        updatedAt: new Date()
      } as any;
    }

    let projects = inMemoryProjects.filter(p => p.organizationId === 'org_sandbox_1');
    const mappedProjects = projects.map(p => {
      const prRoadmaps = inMemoryRoadmaps.filter(r => r.projectId === p.id).map(r => ({
        ...r,
        tasks: inMemoryRoadmapTasks.filter(t => t.roadmapId === r.id)
      }));
      const prTimelines = inMemoryTimelines.filter(t => t.projectId === p.id);
      return {
        ...p,
        integrations: inMemoryIntegrations.filter(i => i.projectId === p.id),
        roadmaps: prRoadmaps,
        timelines: prTimelines
      };
    });

    const posts = [
      {
        id: 'proj_sandbox_1',
        title: 'Introducing Partial Prerendering',
        slug: 'introducing-partial-prerendering',
        description: 'Learn how to blend static page shells with streamed dynamic content in Next.js 16.',
        category: 'React',
        tags: ['Next.js', 'React Compiler', 'PPR'],
        views: 1240,
        status: 'published',
        publishedAt: new Date(Date.now() - 3600000 * 24),
        authorId: memoryUser.id
      }
    ].filter(post => post.authorId === memoryUser.id);

    let followers = inMemoryFollows.filter(f => f.targetType === 'DEVELOPER' && f.targetId === memoryUser.id);
    let following = inMemoryFollows.filter(f => f.userId === memoryUser.id);
    let bookmarks = inMemoryBookmarks.filter(b => b.userId === memoryUser.id);

    // Enforce Hidden Fields filtration
    const isOwner = memoryUser.id === currentUserId;
    if (!isOwner) {
      const hidden = (memoryUser.hiddenFields as string[]) || [];
      if (hidden.includes('email')) {
        memoryUser.email = 'hidden@example.com';
      }
      if (hidden.includes('followers')) {
        followers = [];
      }
      if (hidden.includes('following')) {
        following = [];
      }
      if (hidden.includes('projects')) {
        projects = [];
      }
      if (profile) {
        if (hidden.includes('location')) {
          profile.location = null;
        }
        if (hidden.includes('socialLinks')) {
          profile.website = null;
          profile.github = null;
          profile.linkedin = null;
          profile.twitter = null;
          profile.portfolio = null;
        }
      }
    }

    return {
      user: { ...memoryUser, authorProfile: profile },
      projects: mappedProjects,
      posts,
      followers,
      following,
      bookmarks
    };
  }

  // --- REDIRECT & HISTORY QUERIES ---
  async getCmsRedirect(sourcePath: string): Promise<any | null> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.cmsRedirect.findUnique({
        where: { sourcePath }
      });
    }
    return inMemoryCmsRedirects.find(r => r.sourcePath === sourcePath) || null;
  }

  async createCmsRedirect(sourcePath: string, targetPath: string): Promise<any> {
    const prisma = this.prisma;
    const now = new Date();
    if (prisma) {
      return prisma.cmsRedirect.upsert({
        where: { sourcePath },
        update: { targetPath, updatedAt: now },
        create: { sourcePath, targetPath, statusCode: 301 }
      });
    }
    const idx = inMemoryCmsRedirects.findIndex(r => r.sourcePath === sourcePath);
    const item = { id: idx >= 0 ? inMemoryCmsRedirects[idx].id : `red_${Date.now()}`, sourcePath, targetPath, statusCode: 301, createdAt: now, updatedAt: now };
    if (idx >= 0) {
      inMemoryCmsRedirects[idx] = item;
    } else {
      inMemoryCmsRedirects.push(item);
    }
    return item;
  }

  async getShowcaseProjects(): Promise<any[]> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.project.findMany({
        where: { visibility: 'public' },
        include: {
          integrations: true,
          roadmaps: { include: { tasks: true } },
          timelines: true
        }
      });
    }
    return inMemoryProjects.filter((p: any) => p.visibility === 'public');
  }

  async getShowcaseProjectBySlug(slug: string): Promise<any | null> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.project.findFirst({
        where: {
          OR: [
            { slug },
            { id: slug }
          ]
        },
        include: {
          integrations: true,
          contributors: {
            orderBy: { createdAt: 'asc' },
            include: { user: { include: { authorProfile: true } } }
          },
          syncHistory: { orderBy: { createdAt: 'desc' }, take: 20 },
          versions: { orderBy: { createdAt: 'desc' } },
          roadmaps: {
            orderBy: { orderIndex: 'asc' },
            include: { tasks: { orderBy: { orderIndex: 'asc' } } }
          },
          timelines: { orderBy: { date: 'desc' } },
          cmsProjects: {
            where: { status: 'published' },
            orderBy: { publishedAt: 'desc' },
            include: { categoryRef: true }
          },
          organization: {
            include: { owner: { include: { authorProfile: true } } }
          }
        }
      });
    }

    // In-memory fallback
    const project = inMemoryProjects.find(p => p.slug === slug || p.id === slug);
    if (!project) return null;

    const integrations = inMemoryIntegrations.filter(i => i.projectId === project.id);
    const roadmaps = inMemoryRoadmaps
      .filter(r => r.projectId === project.id)
      .map(r => ({
        ...r,
        tasks: inMemoryRoadmapTasks.filter(t => t.roadmapId === r.id).sort((a, b) => a.orderIndex - b.orderIndex)
      }))
      .sort((a, b) => a.orderIndex - b.orderIndex);

    const timelines = inMemoryTimelines.filter(t => t.projectId === project.id).sort((a, b) => b.date.getTime() - a.date.getTime());

    const cmsProjects = [
      {
        id: 'proj_sandbox_1',
        title: 'Introducing Partial Prerendering',
        slug: 'introducing-partial-prerendering',
        description: 'Learn how to blend static page shells with streamed dynamic content in Next.js 16.',
        category: 'React',
        tags: ['Next.js', 'React Compiler', 'PPR'],
        views: 1240,
        status: 'published',
        publishedAt: new Date(Date.now() - 3600000 * 24),
        authorId: 'sandbox-admin-id',
        projectId: project.id
      }
    ].filter(post => post.projectId === project.id);

    const owner = {
      id: 'sandbox-admin-id',
      name: 'Sandbox Administrator',
      username: 'satyajit',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      authorProfile: inMemoryAuthorProfiles.find(ap => ap.userId === 'sandbox-admin-id')
    };

    const contributors = inMemoryProjectContributors.filter(c => c.projectId === project.id);
    const syncHistory = inMemoryProjectSyncHistories.filter(s => s.projectId === project.id);
    const versions = inMemoryProjectVersions.filter(v => v.projectId === project.id);

    return {
      ...project,
      integrations,
      contributors,
      syncHistory,
      versions,
      roadmaps,
      timelines,
      cmsProjects,
      organization: {
        owner
      }
    };
  }

  async getDeveloperActivity(userId: string): Promise<any[]> {
    const prisma = this.prisma;
    if (prisma) {
      const posts = await prisma.cmsProject.findMany({
        where: { authorId: userId, status: 'published' },
        orderBy: { publishedAt: 'desc' }
      });
      const timelines = await prisma.projectTimeline.findMany({
        where: { project: { organization: { ownerId: userId } } },
        orderBy: { date: 'desc' }
      });
      const projects = await prisma.project.findMany({
        where: { organization: { ownerId: userId } },
        orderBy: { createdAt: 'desc' }
      });

      const feed: any[] = [];
      posts.forEach((p: any) => {
        feed.push({
          id: p.id,
          type: 'article_publish',
          title: `Published blog post: ${p.title}`,
          description: p.description || '',
          date: p.publishedAt || p.createdAt,
          link: `/posts/${p.slug}`
        });
      });
      timelines.forEach((t: any) => {
        feed.push({
          id: t.id,
          type: t.type,
          title: t.title,
          description: t.description || '',
          date: t.date,
          link: null
        });
      });
      projects.forEach((p: any) => {
        feed.push({
          id: p.id,
          type: 'project_create',
          title: `Created Project: ${p.name}`,
          description: p.description || '',
          date: p.createdAt,
          link: `/projects/${p.slug}`
        });
      });

      return feed.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    // In-memory fallback
    return [
      {
        id: 'act_1',
        type: 'project_create',
        title: 'Created Project: Study Materials',
        description: 'A developer resource hub and learning pipeline for engineering topics.',
        date: new Date(Date.now() - 3600000 * 48),
        link: '/projects/study-materials'
      },
      {
        id: 'act_2',
        type: 'repo_sync',
        title: 'Connected GitHub Repository',
        description: 'Connected project to satyajitmishra-dev/Study-Material.',
        date: new Date(Date.now() - 3600000 * 48),
        link: null
      },
      {
        id: 'act_3',
        type: 'roadmap_complete',
        title: 'Mastered Core Authentication',
        description: 'Google OAuth login pipelines and account tokens functional.',
        date: new Date(Date.now() - 3600000 * 24),
        link: null
      },
      {
        id: 'act_4',
        type: 'article_publish',
        title: 'Published blog post: Introducing Partial Prerendering',
        description: 'Learn how to blend static page shells with streamed dynamic content in Next.js 16.',
        date: new Date(Date.now() - 3600000 * 24),
        link: '/posts/introducing-partial-prerendering'
      }
    ];
  }

  // --- V4 NOTES SYSTEM ---
  async createNote(data: any): Promise<any> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.userNote.create({ data });
    }
    const newNote = {
      id: data.id || `note_${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      likes: 0,
      bookmarksCount: 0
    };
    inMemoryUserNotes.push(newNote);
    return newNote;
  }

  async getNotes(filters?: { visibility?: string; authorId?: string }): Promise<any[]> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.userNote.findMany({
        where: filters,
        include: { author: true },
        orderBy: { createdAt: 'desc' }
      });
    }
    let res = [...inMemoryUserNotes];
    if (filters?.visibility) res = res.filter(n => n.visibility === filters.visibility);
    if (filters?.authorId) res = res.filter(n => n.authorId === filters.authorId);
    
    // Attach fake author profile
    const fakeAuthor = (inMemoryAuthorProfiles[0] || { name: 'Sandbox Admin' }) as any;
    return res.map(n => ({ ...n, author: { name: fakeAuthor.name || 'Admin', image: fakeAuthor.coverImage } })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getNoteBySlug(slug: string): Promise<any | null> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.userNote.findUnique({
        where: { slug },
        include: { author: true }
      });
    }
    const note = inMemoryUserNotes.find(n => n.slug === slug);
    if (!note) return null;
    const fakeAuthor = (inMemoryAuthorProfiles[0] || { name: 'Sandbox Admin' }) as any;
    return { ...note, author: { name: fakeAuthor.name || 'Admin', image: fakeAuthor.coverImage } };
  }

  // --- V4 DISCUSSIONS SYSTEM ---
  async createDiscussion(data: any): Promise<any> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.discussion.create({ data });
    }
    const newDisc = {
      id: data.id || `disc_${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      upvotes: 0,
      downvotes: 0
    };
    inMemoryDiscussions.push(newDisc);
    return newDisc;
  }

  async getDiscussions(filters?: { category?: string; isQuestion?: boolean; visibility?: string }): Promise<any[]> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.discussion.findMany({
        where: filters,
        include: { author: true, answers: true },
        orderBy: { createdAt: 'desc' }
      });
    }
    let res = [...inMemoryDiscussions];
    if (filters?.category) res = res.filter(d => d.category === filters.category);
    if (filters?.isQuestion !== undefined) res = res.filter(d => d.isQuestion === filters.isQuestion);
    if (filters?.visibility) res = res.filter(d => d.visibility === filters.visibility);
    
    const fakeAuthor = (inMemoryAuthorProfiles[0] || { name: 'Sandbox Admin' }) as any;
    return res.map(d => ({
      ...d,
      author: { name: fakeAuthor.name || 'Admin', image: fakeAuthor.coverImage },
      answers: inMemoryDiscussionAnswers.filter(ans => ans.discussionId === d.id)
    })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getDiscussionBySlug(slug: string): Promise<any | null> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.discussion.findUnique({
        where: { slug },
        include: { 
          author: true, 
          answers: {
            include: {
              author: true,
              replies: {
                include: { author: true }
              }
            }
          }
        }
      });
    }
    const disc = inMemoryDiscussions.find(d => d.slug === slug);
    if (!disc) return null;
    const fakeAuthor = (inMemoryAuthorProfiles[0] || { name: 'Sandbox Admin' }) as any;
    const answers = inMemoryDiscussionAnswers.filter(ans => ans.discussionId === disc.id).map(ans => ({
      ...ans,
      author: { name: 'Respondent', image: null },
      replies: inMemoryDiscussionReplies.filter(rep => rep.answerId === ans.id).map(rep => ({
        ...rep,
        author: { name: 'Replier', image: null }
      }))
    }));
    return { ...disc, author: { name: fakeAuthor.name || 'Admin', image: fakeAuthor.coverImage }, answers };
  }

  async addDiscussionAnswer(data: any): Promise<any> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.discussionAnswer.create({ data });
    }
    const newAns = {
      id: `ans_${Date.now()}`,
      ...data,
      isAccepted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      upvotes: 0,
      downvotes: 0
    };
    inMemoryDiscussionAnswers.push(newAns);
    return newAns;
  }

  async addDiscussionReply(data: any): Promise<any> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.discussionReply.create({ data });
    }
    const newRep = {
      id: `rep_${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryDiscussionReplies.push(newRep);
    return newRep;
  }

  async voteDiscussion(userId: string, voteType: 'UPVOTE' | 'DOWNVOTE', target: { discussionId?: string; answerId?: string }): Promise<any> {
    const prisma = this.prisma;
    if (prisma) {
      if (target.discussionId) {
        await prisma.discussionVote.upsert({
          where: { userId_discussionId: { userId, discussionId: target.discussionId } },
          update: { voteType },
          create: { userId, discussionId: target.discussionId, voteType }
        });
        const votes = await prisma.discussionVote.findMany({ where: { discussionId: target.discussionId } });
        const up = votes.filter((v: any) => v.voteType === 'UPVOTE').length;
        const down = votes.filter((v: any) => v.voteType === 'DOWNVOTE').length;
        return prisma.discussion.update({
          where: { id: target.discussionId },
          data: { upvotes: up, downvotes: down }
        });
      } else if (target.answerId) {
        await prisma.discussionVote.upsert({
          where: { userId_answerId: { userId, answerId: target.answerId } },
          update: { voteType },
          create: { userId, answerId: target.answerId, voteType }
        });
        const votes = await prisma.discussionVote.findMany({ where: { answerId: target.answerId } });
        const up = votes.filter((v: any) => v.voteType === 'UPVOTE').length;
        const down = votes.filter((v: any) => v.voteType === 'DOWNVOTE').length;
        return prisma.discussionAnswer.update({
          where: { id: target.answerId },
          data: { upvotes: up, downvotes: down }
        });
      }
    }
    // In-memory voting
    if (target.discussionId) {
      const idx = inMemoryDiscussions.findIndex(d => d.id === target.discussionId);
      if (idx >= 0) {
        if (voteType === 'UPVOTE') inMemoryDiscussions[idx].upvotes += 1;
        else inMemoryDiscussions[idx].downvotes += 1;
        return inMemoryDiscussions[idx];
      }
    } else if (target.answerId) {
      const idx = inMemoryDiscussionAnswers.findIndex(a => a.id === target.answerId);
      if (idx >= 0) {
        if (voteType === 'UPVOTE') inMemoryDiscussionAnswers[idx].upvotes += 1;
        else inMemoryDiscussionAnswers[idx].downvotes += 1;
        return inMemoryDiscussionAnswers[idx];
      }
    }
  }

  async acceptDiscussionAnswer(discussionId: string, answerId: string): Promise<any> {
    const prisma = this.prisma;
    if (prisma) {
      await prisma.discussionAnswer.updateMany({
        where: { discussionId },
        data: { isAccepted: false }
      });
      await prisma.discussionAnswer.update({
        where: { id: answerId },
        data: { isAccepted: true }
      });
      return prisma.discussion.update({
        where: { id: discussionId },
        data: { acceptedAnswerId: answerId }
      });
    }
    // In-Memory
    inMemoryDiscussionAnswers.forEach(ans => {
      if (ans.discussionId === discussionId) ans.isAccepted = false;
    });
    const ansIdx = inMemoryDiscussionAnswers.findIndex(a => a.id === answerId);
    if (ansIdx >= 0) inMemoryDiscussionAnswers[ansIdx].isAccepted = true;
    const discIdx = inMemoryDiscussions.findIndex(d => d.id === discussionId);
    if (discIdx >= 0) inMemoryDiscussions[discIdx].acceptedAnswerId = answerId;
  }

  // --- V4 POLLS SYSTEM ---
  async createPoll(data: any): Promise<any> {
    const prisma = this.prisma;
    const expiresAt = new Date(Date.now() + 3600000 * 24 * (data.durationDays || 7));
    if (prisma) {
      const options = data.options || [];
      return prisma.poll.create({
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          technology: data.technology,
          durationDays: data.durationDays,
          visibility: data.visibility,
          pollType: data.pollType,
          isAnonymous: data.isAnonymous,
          expiresAt,
          authorId: data.authorId,
          options: {
            create: options.map((opt: string) => ({ text: opt }))
          }
        },
        include: { options: true }
      });
    }
    // In-Memory
    const pollId = `poll_${Date.now()}`;
    const newPoll = {
      id: pollId,
      ...data,
      expiresAt,
      isClosed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryPolls.push(newPoll);
    const options = data.options || [];
    options.forEach((opt: string) => {
      inMemoryPollOptions.push({ id: `opt_${Math.random()}`, text: opt, pollId });
    });
    return newPoll;
  }

  async getPolls(filters?: any): Promise<any[]> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.poll.findMany({
        where: filters,
        include: { options: { include: { votes: true } }, votes: true, author: true },
        orderBy: { createdAt: 'desc' }
      });
    }
    const fakeAuthor = (inMemoryAuthorProfiles[0] || { name: 'Sandbox Admin' }) as any;
    return inMemoryPolls.map(p => {
      const options = inMemoryPollOptions.filter(o => o.pollId === p.id).map(o => ({
        ...o,
        votes: inMemoryPollVotes.filter(v => v.optionId === o.id)
      }));
      return {
        ...p,
        options,
        votes: inMemoryPollVotes.filter(v => v.pollId === p.id),
        author: { name: fakeAuthor.name || 'Admin', image: fakeAuthor.coverImage }
      };
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPollById(id: string): Promise<any | null> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.poll.findUnique({
        where: { id },
        include: { options: { include: { votes: true } }, votes: true, author: true }
      });
    }
    const poll = inMemoryPolls.find(p => p.id === id);
    if (!poll) return null;
    const fakeAuthor = (inMemoryAuthorProfiles[0] || { name: 'Sandbox Admin' }) as any;
    const options = inMemoryPollOptions.filter(o => o.pollId === poll.id).map(o => ({
      ...o,
      votes: inMemoryPollVotes.filter(v => v.optionId === o.id)
    }));
    return {
      ...poll,
      options,
      votes: inMemoryPollVotes.filter(v => v.pollId === poll.id),
      author: { name: fakeAuthor.name || 'Admin', image: fakeAuthor.coverImage }
    };
  }

  async votePoll(pollId: string, optionId: string, userId: string, ipAddress?: string): Promise<any> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.pollVote.create({
        data: { pollId, optionId, userId, ipAddress }
      });
    }
    // In-memory
    const existing = inMemoryPollVotes.find(v => v.pollId === pollId && v.userId === userId);
    if (existing) throw new Error('ALREADY_VOTED');
    const newVote = { id: `vote_${Date.now()}`, pollId, optionId, userId, ipAddress, createdAt: new Date() };
    inMemoryPollVotes.push(newVote);
    return newVote;
  }

  // --- V4 EVENTS PLATFORM ---
  async createEvent(data: any): Promise<any> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.platformEvent.create({ data });
    }
    const newEvent = {
      id: `evt_${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryEvents.push(newEvent);
    return newEvent;
  }

  async getEvents(filters?: any): Promise<any[]> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.platformEvent.findMany({
        where: filters,
        include: { organizer: true, registrations: true },
        orderBy: { startAt: 'asc' }
      });
    }
    const fakeAuthor = (inMemoryAuthorProfiles[0] || { name: 'Sandbox Admin' }) as any;
    return inMemoryEvents.map(e => ({
      ...e,
      organizer: { name: fakeAuthor.name || 'Admin', image: fakeAuthor.coverImage },
      registrations: inMemoryEventRegistrations.filter(r => r.eventId === e.id)
    })).sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  }

  async getEventBySlug(slug: string): Promise<any | null> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.platformEvent.findUnique({
        where: { slug },
        include: { organizer: true, registrations: true }
      });
    }
    const event = inMemoryEvents.find(e => e.slug === slug);
    if (!event) return null;
    const fakeAuthor = (inMemoryAuthorProfiles[0] || { name: 'Sandbox Admin' }) as any;
    return {
      ...event,
      organizer: { name: fakeAuthor.name || 'Admin', image: fakeAuthor.coverImage },
      registrations: inMemoryEventRegistrations.filter(r => r.eventId === event.id)
    };
  }

  async registerForEvent(data: any): Promise<any> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.eventRegistration.create({ data });
    }
    // In-memory
    const existing = inMemoryEventRegistrations.find(r => r.eventId === data.eventId && r.userId === data.userId);
    if (existing) throw new Error('ALREADY_REGISTERED');
    const newReg = {
      id: `reg_${Date.now()}`,
      ...data,
      checkedIn: false,
      createdAt: new Date()
    };
    inMemoryEventRegistrations.push(newReg);
    return newReg;
  }

  // --- V4 ROADMAPS SYSTEM ---
  async createCuratedRoadmap(data: any): Promise<any> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.curatedRoadmap.create({ data });
    }
    const newRm = {
      id: `rm_${Date.now()}`,
      ...data,
      isPublished: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryCuratedRoadmaps.push(newRm);
    return newRm;
  }

  async getCuratedRoadmaps(): Promise<any[]> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.curatedRoadmap.findMany({
        include: { steps: true, progress: true }
      });
    }
    return inMemoryCuratedRoadmaps.map(rm => ({
      ...rm,
      steps: inMemoryRoadmapStepNodes.filter(s => s.roadmapId === rm.id)
    }));
  }

  async getCuratedRoadmapBySlug(slug: string): Promise<any | null> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.curatedRoadmap.findUnique({
        where: { slug },
        include: { steps: { orderBy: { orderIndex: 'asc' } }, progress: true }
      });
    }
    const rm = inMemoryCuratedRoadmaps.find(r => r.slug === slug);
    if (!rm) return null;
    return {
      ...rm,
      steps: inMemoryRoadmapStepNodes.filter(s => s.roadmapId === rm.id).sort((a, b) => a.orderIndex - b.orderIndex)
    };
  }

  async updateRoadmapProgress(userId: string, roadmapId: string, completedSteps: string[]): Promise<any> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.userRoadmapProgress.upsert({
        where: { userId_roadmapId: { userId, roadmapId } },
        update: { completedSteps },
        create: { userId, roadmapId, completedSteps }
      });
    }
    // In-memory
    const idx = inMemoryUserRoadmapProgress.findIndex(p => p.userId === userId && p.roadmapId === roadmapId);
    const item = { id: idx >= 0 ? inMemoryUserRoadmapProgress[idx].id : `prog_${Date.now()}`, userId, roadmapId, completedSteps, updatedAt: new Date() };
    if (idx >= 0) inMemoryUserRoadmapProgress[idx] = item;
    else inMemoryUserRoadmapProgress.push(item);
    return item;
  }

  async getRoadmapProgress(userId: string, roadmapId: string): Promise<any | null> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.userRoadmapProgress.findUnique({
        where: { userId_roadmapId: { userId, roadmapId } }
      });
    }
    return inMemoryUserRoadmapProgress.find(p => p.userId === userId && p.roadmapId === roadmapId) || null;
  }

  async submitRoadmapSuggestion(data: any): Promise<any> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.roadmapSuggestion.create({ data });
    }
    const newSug = {
      id: `sug_${Date.now()}`,
      ...data,
      status: 'pending',
      createdAt: new Date()
    };
    inMemoryRoadmapSuggestions.push(newSug);
    return newSug;
  }

  // --- V4 RESOURCES ---
  async createResource(data: any): Promise<any> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.platformResource.create({ data });
    }
    const newRes = {
      id: `res_${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryPlatformResources.push(newRes);
    return newRes;
  }

  // --- V4 UNIVERSAL FEED ---
  async getUniversalFeed(filters?: {
    type?: string;
    technology?: string;
    difficulty?: string;
    sortBy?: 'latest' | 'trending' | 'most_viewed' | 'most_saved';
    limit?: number;
    offset?: number;
  }): Promise<{ items: any[]; total: number }> {
    const limit = filters?.limit || 15;
    const offset = filters?.offset || 0;
    const typeFilter = filters?.type || 'all';

    // 1. Fetch from database or in-memory lists
    const prisma = this.prisma;
    let rawItems: any[] = [];

    if (prisma) {
      // Postgres fetching
      const promises: Promise<any[]>[] = [];

      // Fetch Blogs (CmsProject with type 'article' / published)
      if (typeFilter === 'all' || typeFilter === 'blog') {
        promises.push(
          prisma.cmsProject.findMany({
            where: { status: 'published', type: 'article' },
            include: { author: true, comments: true, reactions: true },
            take: 100
          }).then(res => res.map(x => ({ ...x, feedType: 'blog', authorName: x.author.name, authorImage: x.author.image, likes: x.reactions.length, commentCount: x.comments.length })))
        );
      }

      // Fetch Projects (Project model with visibility 'public')
      if (typeFilter === 'all' || typeFilter === 'project') {
        promises.push(
          prisma.project.findMany({
            where: { visibility: 'public' },
            include: { contributors: true, comments: true },
            take: 100
          }).then(res => res.map(x => ({ ...x, feedType: 'project', title: x.name, likes: 25, views: 120, commentCount: x.comments.length })))
        );
      }

      // Fetch Notes (UserNote with visibility 'public')
      if (typeFilter === 'all' || typeFilter === 'note') {
        promises.push(
          prisma.userNote.findMany({
            where: { visibility: 'public' },
            include: { author: true },
            take: 100
          }).then((res: any[]) => res.map((x: any) => ({ ...x, feedType: 'note', authorName: x.author?.name, authorImage: x.author?.image })))
        );
      }

      // Fetch Discussions (isQuestion = false, visibility 'public')
      if (typeFilter === 'all' || typeFilter === 'discussion') {
        promises.push(
          prisma.discussion.findMany({
            where: { visibility: 'public', isQuestion: false },
            include: { author: true, answers: true },
            take: 100
          }).then((res: any[]) => res.map((x: any) => ({ ...x, feedType: 'discussion', authorName: x.author?.name, authorImage: x.author?.image, replies: x.answers?.length || 0, likes: x.upvotes })))
        );
      }

      // Fetch Questions (isQuestion = true, visibility 'public')
      if (typeFilter === 'all' || typeFilter === 'question') {
        promises.push(
          prisma.discussion.findMany({
            where: { visibility: 'public', isQuestion: true },
            include: { author: true, answers: true },
            take: 100
          }).then((res: any[]) => res.map((x: any) => ({ ...x, feedType: 'question', authorName: x.author?.name, authorImage: x.author?.image, replies: x.answers?.length || 0, likes: x.upvotes })))
        );
      }

      // Fetch Polls (visibility 'public')
      if (typeFilter === 'all' || typeFilter === 'poll') {
        promises.push(
          prisma.poll.findMany({
            where: { visibility: 'public' },
            include: { options: true, author: true },
            take: 100
          }).then((res: any[]) => res.map((x: any) => ({ ...x, feedType: 'poll', authorName: x.author?.name, authorImage: x.author?.image })))
        );
      }

      // Fetch Events
      if (typeFilter === 'all' || typeFilter === 'event') {
        promises.push(
          prisma.platformEvent.findMany({
            include: { organizer: true },
            take: 100
          }).then((res: any[]) => res.map((x: any) => ({ ...x, feedType: 'event', organizerName: x.organizer?.name, organizerImage: x.organizer?.image })))
        );
      }

      // Fetch Resources
      if (typeFilter === 'all' || typeFilter === 'resource') {
        promises.push(
          prisma.platformResource.findMany({
            include: { author: true },
            take: 100
          }).then((res: any[]) => res.map((x: any) => ({ ...x, feedType: 'resource', authorName: x.author?.name, authorImage: x.author?.image })))
        );
      }

      const results = await Promise.all(promises);
      rawItems = results.flat();
    } else {
      // In-Memory fetching
      if (typeFilter === 'all' || typeFilter === 'blog') {
        rawItems.push(...[
          { id: 'b_1', title: 'Building Authentication with Next.js 16', slug: 'nextjs-auth', feedType: 'blog', description: 'Deep-dive compiler memoization & security layouts.', authorName: 'Satyajit Mishra', readingTime: '8 min', likes: 140, commentCount: 12, createdAt: new Date(Date.now() - 3600000 * 2) }
        ]);
      }
      if (typeFilter === 'all' || typeFilter === 'project') {
        rawItems.push(...inMemoryProjects.map(p => ({ ...p, feedType: 'project', title: p.name, likes: 45, views: 180 })));
        rawItems.push({
          id: 'proj_resume_builder',
          title: 'AI Resume Builder',
          slug: 'ai-resume-builder',
          feedType: 'project',
          description: 'A React 19 visual canvas to compile ATS-optimized resumes using neural models.',
          techStack: ['React 19', 'Zustand', 'OpenAI API'],
          githubUrl: 'https://github.com/studymaterial/resume-builder',
          demoUrl: 'https://resume.studymaterial.dev',
          likes: 310,
          views: 1250,
          createdAt: new Date(Date.now() - 3600000 * 10)
        });
      }
      if (typeFilter === 'all' || typeFilter === 'note') {
        rawItems.push(...inMemoryUserNotes.map(n => ({ ...n, feedType: 'note' })));
      }
      if (typeFilter === 'all' || typeFilter === 'discussion') {
        rawItems.push(...inMemoryDiscussions.filter(d => !d.isQuestion).map(d => ({ ...d, feedType: 'discussion', replies: 23, likes: d.upvotes })));
      }
      if (typeFilter === 'all' || typeFilter === 'question') {
        rawItems.push(...inMemoryDiscussions.filter(d => d.isQuestion).map(d => ({ ...d, feedType: 'question', replies: 5, likes: d.upvotes })));
      }
      if (typeFilter === 'all' || typeFilter === 'poll') {
        rawItems.push(...inMemoryPolls.map(p => ({ ...p, feedType: 'poll' })));
      }
      if (typeFilter === 'all' || typeFilter === 'event') {
        rawItems.push(...inMemoryEvents.map(e => ({ ...e, feedType: 'event' })));
      }
      if (typeFilter === 'all' || typeFilter === 'resource') {
        rawItems.push(...inMemoryPlatformResources.map(r => ({ ...r, feedType: 'resource' })));
      }
    }

    // 2. Filters
    if (filters?.technology) {
      const tech = filters.technology.toLowerCase();
      rawItems = rawItems.filter(item => {
        const textToSearch = `${item.title} ${item.description || ''} ${item.technology || ''} ${(item.tags || []).join(' ')} ${(item.techStack || []).join(' ')}`.toLowerCase();
        return textToSearch.includes(tech);
      });
    }

    if (filters?.difficulty) {
      const diff = filters.difficulty.toLowerCase();
      rawItems = rawItems.filter(item => (item.difficulty || '').toLowerCase() === diff);
    }

    // 3. Scoring algorithm for Trending & Sorting
    const calculateScore = (item: any) => {
      const ageHours = (Date.now() - new Date(item.createdAt).getTime()) / 3600000;
      const views = item.views || 0;
      const likes = item.likes || item.upvotes || 0;
      const commentCount = item.commentCount || item.replies || 0;
      
      const engagement = likes * 5 + commentCount * 10 + views * 0.1;
      
      return engagement / (ageHours + 2);
    };

    if (filters?.sortBy === 'trending') {
      rawItems.sort((a, b) => calculateScore(b) - calculateScore(a));
    } else if (filters?.sortBy === 'most_viewed') {
      rawItems.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (filters?.sortBy === 'most_saved') {
      rawItems.sort((a, b) => (b.bookmarksCount || 0) - (a.bookmarksCount || 0));
    } else {
      rawItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = rawItems.length;
    const items = rawItems.slice(offset, offset + limit);

    return { items, total };
  }
}

export const publicDb = new PublicDatabase();
export {
  inMemoryReactions,
  inMemoryBookmarks,
  inMemoryComments,
  inMemoryCommentReplies,
  inMemoryHighlights,
  inMemoryNotes,
  inMemoryFollows,
  inMemoryReadingSessions,
  inMemorySettings,
  inMemoryCategories,
  inMemoryTags,
  inMemoryCollections,
  inMemorySpamReports,
  inMemoryShareEvents,
  inMemoryAuthorProfiles,
  inMemoryIntegrations,
  inMemoryRoadmaps,
  inMemoryRoadmapTasks,
  inMemoryTimelines,
  inMemoryProjects,
  inMemoryUserNotes,
  inMemoryDiscussions,
  inMemoryDiscussionAnswers,
  inMemoryDiscussionReplies,
  inMemoryDiscussionVotes,
  inMemoryPolls,
  inMemoryPollOptions,
  inMemoryPollVotes,
  inMemoryEvents,
  inMemoryEventRegistrations,
  inMemoryCuratedRoadmaps,
  inMemoryRoadmapStepNodes,
  inMemoryUserRoadmapProgress,
  inMemoryRoadmapSuggestions,
  inMemoryPlatformResources
};

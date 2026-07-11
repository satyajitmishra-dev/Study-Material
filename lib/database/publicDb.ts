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
  inMemoryProjects
};

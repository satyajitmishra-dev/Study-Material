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
  ShareEvent
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

// Seed initial records in Sandbox Mode
const seedPublicSandboxDb = () => {
  if (inMemoryCategories.length > 0) return;

  const now = new Date();

  // Categories
  inMemoryCategories.push(
    { id: 'cat_react', name: 'React', slug: 'react', description: 'Modern UI engineering, server components, and dynamic frameworks.', createdAt: now, updatedAt: now },
    { id: 'cat_css', name: 'CSS', slug: 'css', description: 'Modern layout engines, spring variables, and fluid transitions.', createdAt: now, updatedAt: now },
    { id: 'cat_ai', name: 'AI', slug: 'ai', description: 'Neural systems, prompt workflows, embeddings, and generative designs.', createdAt: now, updatedAt: now },
    { id: 'cat_backend', name: 'Backend', slug: 'backend', description: 'Server structures, caching variables, and secure routing APIs.', createdAt: now, updatedAt: now }
  );

  // Tags
  inMemoryTags.push(
    { id: 'tag_nextjs', name: 'Next.js', slug: 'nextjs', description: 'Full-stack application framework capabilities.', createdAt: now, updatedAt: now },
    { id: 'tag_ppr', name: 'PPR', slug: 'ppr', description: 'Partial Prerendering streaming holes.', createdAt: now, updatedAt: now },
    { id: 'tag_framer', name: 'Framer Motion', slug: 'framer', description: 'Interactive spring physics components.', createdAt: now, updatedAt: now },
    { id: 'tag_prisma', name: 'Prisma', slug: 'prisma', description: 'Structured schema and database client.', createdAt: now, updatedAt: now }
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
    website: 'https://studymaterial.dev',
    twitter: 'https://twitter.com/studymaterial',
    github: 'https://github.com/satyajitmishra-dev',
    linkedin: 'https://linkedin.com/in/satyajitmishra',
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
    const newCat: Category = { id: `cat_${Date.now()}`, name, slug, description: description || null, createdAt: now, updatedAt: now };
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
    const newTag: Tag = { id: `tag_${Date.now()}`, name, slug, description: description || null, createdAt: now, updatedAt: now };
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

      const [projects, total] = await Promise.all([
        prisma.cmsProject.findMany({
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
        }),
        prisma.cmsProject.count({ where })
      ]);

      return { items: projects, total };
    } else {
      // Memory queries fallback
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
  inMemoryShareEvents
};

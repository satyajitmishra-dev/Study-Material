import { getPrisma } from './dbClient';
import {
  CmsProject as PrismaProject,
  CmsVersion as PrismaVersion,
  CmsMedia as PrismaMedia,
  CmsAnalytics as PrismaAnalytics,
  CmsAuditLog as PrismaAuditLog,
  Integration,
  ProjectRoadmap,
  RoadmapTask,
  ProjectTimeline,
  Project
} from '@prisma/client';
import {
  inMemoryProjects as inMemoryProjectContainers,
  inMemoryIntegrations,
  inMemoryRoadmaps,
  inMemoryRoadmapTasks,
  inMemoryTimelines
} from './publicDb';

// Shared types
export type CmsProject = PrismaProject;
export type CmsVersion = PrismaVersion;
export type CmsMedia = PrismaMedia;
export type CmsAnalytics = PrismaAnalytics;
export type CmsAuditLog = PrismaAuditLog;

export interface ProjectSearchParams {
  search?: string;
  status?: string;
  category?: string;
  tag?: string;
  language?: string;
  authorId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  projectId?: string;
}

// In-Memory Database State for Sandbox Development
let inMemoryProjects: CmsProject[] = [];
let inMemoryVersions: CmsVersion[] = [];
let inMemoryMedia: CmsMedia[] = [];
let inMemoryAnalytics: CmsAnalytics[] = [];
let inMemoryAuditLogs: CmsAuditLog[] = [];

// Seed initial records in Sandbox Mode
const seedSandboxDb = () => {
  if (inMemoryProjects.length > 0) return;

  const adminId = 'sandbox-admin-id';
  const now = new Date();

  // Create initial projects
  const proj1: CmsProject = {
    type: 'article',
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
    content: JSON.stringify({
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Partial Prerendering in Action' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Partial Prerendering (PPR) is a layout-first prerendering model that allows streaming dynamic holes inside static route shells. Wrap dynamic components in <Suspense> and Next.js does the rest!' }] }
      ]
    }),
    seoTitle: 'Partial Prerendering (PPR) in Next.js 16',
    seoDescription: 'A complete developer overview of Next.js 16 Partial Prerendering, layouts, and streaming suspense holes.',
    seoKeywords: 'Next.js 16, PPR, React 19',
    ogImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    canonical: 'https://studymaterial.utool.in/introducing-partial-prerendering',
    robots: 'index, follow',
    schemaJson: JSON.stringify({ '@context': 'https://schema.org', '@type': 'TechArticle' }),
    seoScore: 92,
    views: 1240,
    status: 'published',
    publishedAt: now,
    scheduledAt: null,
    versionNote: 'Initial publication',
    createdAt: now,
    updatedAt: now,
    authorId: adminId,
    version: 1,
    parentId: null,
    nextProjectId: null,
    prevProjectId: null,
    prerequisiteId: null,
    categoryId: 'cat_react',
    password: null,
    projectId: 'proj_sandbox_1',
  };

  const proj2: CmsProject = {
    type: 'article',
    id: 'proj_sandbox_2',
    title: 'Mastering Framer Motion springs',
    slug: 'mastering-framer-motion-springs',
    description: 'Learn to design tactile physical interactions with spring-physics configs.',
    category: 'CSS',
    tags: ['Framer Motion', 'Physics', 'Web Design'],
    language: 'en',
    visibility: 'public',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    content: JSON.stringify({
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Tactile Interfaces with Springs' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Spring-based animation configurations (mass, stiffness, damping) avoid artificial cubic easings and mimic organic interactions.' }] }
      ]
    }),
    seoTitle: 'Design Tactile Motion with Framer Motion Springs',
    seoDescription: 'Learn custom physical motion setups to mimic weight and tension in UI designs.',
    seoKeywords: 'Framer Motion, CSS, UI design',
    ogImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    canonical: 'https://studymaterial.utool.in/mastering-framer-motion-springs',
    robots: 'index, follow',
    schemaJson: null,
    seoScore: 78,
    views: 450,
    status: 'draft',
    publishedAt: null,
    scheduledAt: null,
    versionNote: 'Draft notes',
    createdAt: now,
    updatedAt: now,
    authorId: adminId,
    version: 1,
    parentId: null,
    nextProjectId: null,
    prevProjectId: null,
    prerequisiteId: null,
    categoryId: 'cat_css',
    password: null,
    projectId: 'proj_sandbox_1',
  };

  inMemoryProjects.push(proj1, proj2);

  // Seed initial version history
  inMemoryVersions.push({
    id: 'ver_sandbox_1',
    projectId: 'proj_sandbox_1',
    content: proj1.content,
    seoTitle: proj1.seoTitle,
    seoDescription: proj1.seoDescription,
    thumbnail: proj1.thumbnail,
    coverImage: proj1.coverImage,
    versionNote: 'Initial revision',
    authorId: adminId,
    createdAt: now,
  });

  // Seed media files
  inMemoryMedia.push(
    {
      id: 'media_sandbox_1',
      filename: 'compiler_architecture.png',
      url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80',
      size: 245000,
      type: 'image/png',
      folder: '/diagrams',
      tags: ['compiler', 'architecture'],
      createdAt: now,
      projectId: 'proj_sandbox_1',
    },
    {
      id: 'media_sandbox_2',
      filename: 'springs_hero.jpg',
      url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80',
      size: 512000,
      type: 'image/jpeg',
      folder: '/assets',
      tags: ['motion', 'cover'],
      createdAt: now,
      projectId: 'proj_sandbox_1',
    }
  );

  // Seed analytics logs
  for (let i = 0; i < 7; i++) {
    const logDate = new Date();
    logDate.setDate(now.getDate() - i);
    inMemoryAnalytics.push({
      id: `an_sandbox_${i}`,
      projectId: 'proj_sandbox_1',
      visitorId: `visitor_${i}`,
      userId: null,
      userAgent: 'Mozilla/5.0',
      country: i % 2 === 0 ? 'US' : 'DE',
      referer: 'google.com',
      views: 120 + i * 40,
      ctr: 0.04 + i * 0.01,
      bounceRate: 0.35 - i * 0.02,
      timeOnPage: 180 + i * 20,
      scrollDepth: 75,
      createdAt: logDate,
      projectContainerId: 'proj_sandbox_1',
    });
  }

  // Seed audit logs
  inMemoryAuditLogs.push({
    id: 'aud_sandbox_1',
    userId: adminId,
    action: 'CREATE_PROJECT',
    targetType: 'CmsProject',
    targetId: 'proj_sandbox_1',
    details: 'Created sandbox initial project',
    createdAt: now,
    projectId: 'proj_sandbox_1',
  });
};

seedSandboxDb();

// Abstract database helper class for Postgres & Memory
class CmsDatabase {
  private get prisma() {
    return getPrisma();
  }

  // --- PROJECTS ---
  async getProjects(params: ProjectSearchParams): Promise<{ items: CmsProject[]; total: number }> {
    const prisma = this.prisma;

    if (prisma) {
      const {
        search, status, category, tag, language, authorId, projectId,
        sortBy = 'updatedAt', sortOrder = 'desc', limit = 20, offset = 0
      } = params;

      const where: any = {};
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (status) {
        where.status = status;
      }
      if (category) {
        where.category = category;
      }
      if (tag) {
        where.tags = { has: tag };
      }
      if (language) {
        where.language = language;
      }
      if (authorId) {
        where.authorId = authorId;
      }
      if (projectId) {
        where.projectId = projectId;
      }

      const [items, total] = await Promise.all([
        prisma.cmsProject.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          skip: offset,
          take: limit,
        }),
        prisma.cmsProject.count({ where }),
      ]);

      return { items, total };
    } else {
      // Memory implementation
      let items = [...inMemoryProjects];

      if (params.search) {
        const query = params.search.toLowerCase();
        items = items.filter(p =>
          p.title.toLowerCase().includes(query) ||
          p.slug.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query)
        );
      }
      if (params.status) {
        items = items.filter(p => p.status === params.status);
      }
      if (params.category) {
        items = items.filter(p => p.category === params.category);
      }
      if (params.tag) {
        items = items.filter(p => p.tags.includes(params.tag!));
      }
      if (params.language) {
        items = items.filter(p => p.language === params.language);
      }
      if (params.authorId) {
        items = items.filter(p => p.authorId === params.authorId);
      }
      if (params.projectId) {
        items = items.filter(p => (p as any).projectId === params.projectId);
      }

      // Sort
      const sortBy = params.sortBy || 'updatedAt';
      const order = params.sortOrder === 'asc' ? 1 : -1;
      items.sort((a: any, b: any) => {
        if (a[sortBy] < b[sortBy]) return -1 * order;
        if (a[sortBy] > b[sortBy]) return 1 * order;
        return 0;
      });

      const total = items.length;
      const offset = params.offset || 0;
      const limit = params.limit || 20;
      items = items.slice(offset, offset + limit);

      return { items, total };
    }
  }

  async getProjectById(id: string, projectId?: string): Promise<CmsProject | null> {
    const prisma = this.prisma;
    if (prisma) {
      const where: any = { id };
      if (projectId) where.projectId = projectId;
      return prisma.cmsProject.findFirst({ where });
    }
    const found = inMemoryProjects.find(p => p.id === id) || null;
    if (found && projectId && (found as any).projectId !== projectId) return null;
    return found;
  }

  async getProjectBySlug(slug: string, projectId?: string): Promise<CmsProject | null> {
    const prisma = this.prisma;
    if (prisma) {
      const where: any = { slug };
      if (projectId) where.projectId = projectId;
      return prisma.cmsProject.findFirst({ where });
    }
    const found = inMemoryProjects.find(p => p.slug === slug) || null;
    if (found && projectId && (found as any).projectId !== projectId) return null;
    return found;
  }

  async createProject(data: Partial<CmsProject> & Pick<CmsProject, 'title' | 'slug' | 'content' | 'authorId'> & { createdAt?: Date }): Promise<CmsProject> {
    const prisma = this.prisma;
    const now = new Date();
    const type = data.type || 'article';

    if (prisma) {
      return prisma.cmsProject.create({
        data: {
          ...data,
          type,
          views: 0,
          createdAt: data.createdAt || now,
          updatedAt: now,
        } as any
      });
    } else {
      const newProj: CmsProject = {
        id: `post_${Date.now()}`,
        description: null,
        category: null,
        tags: [],
        language: 'en',
        visibility: 'public',
        password: null,
        thumbnail: null,
        coverImage: null,
        seoTitle: null,
        seoDescription: null,
        seoKeywords: null,
        ogImage: null,
        canonical: null,
        robots: null,
        schemaJson: null,
        seoScore: 0,
        scheduledAt: null,
        publishedAt: null,
        versionNote: null,
        version: 1,
        parentId: null,
        nextProjectId: null,
        prevProjectId: null,
        prerequisiteId: null,
        categoryId: null,
        projectId: null,
        ...data,
        status: data.status || 'draft',
        type,
        views: 0,
        createdAt: data.createdAt || now,
        updatedAt: now,
      };
      inMemoryProjects.push(newProj);
      return newProj;
    }
  }

  async updateProject(id: string, data: Partial<Omit<CmsProject, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CmsProject> {
    const prisma = this.prisma;
    const now = new Date();

    if (prisma) {
      return prisma.cmsProject.update({
        where: { id },
        data: {
          ...data,
          updatedAt: now,
        }
      });
    } else {
      const idx = inMemoryProjects.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Project not found');
      const updated = {
        ...inMemoryProjects[idx],
        ...data,
        updatedAt: now,
      } as CmsProject;
      inMemoryProjects[idx] = updated;
      return updated;
    }
  }

  async deleteProject(id: string, softDelete: boolean = true): Promise<CmsProject> {
    const prisma = this.prisma;
    if (prisma) {
      if (softDelete) {
        return prisma.cmsProject.update({
          where: { id },
          data: { status: 'archived' }
        });
      } else {
        return prisma.cmsProject.delete({ where: { id } });
      }
    } else {
      const idx = inMemoryProjects.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Project not found');
      const target = inMemoryProjects[idx];
      if (softDelete) {
        target.status = 'archived';
        target.updatedAt = new Date();
      } else {
        inMemoryProjects.splice(idx, 1);
      }
      return target;
    }
  }

  async incrementProjectViews(id: string): Promise<CmsProject> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.cmsProject.update({
        where: { id },
        data: { views: { increment: 1 } }
      });
    } else {
      const target = inMemoryProjects.find(p => p.id === id);
      if (!target) throw new Error('Project not found');
      target.views += 1;
      return target;
    }
  }

  // --- VERSION HISTORY ---
  async getVersions(projectId: string): Promise<CmsVersion[]> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.cmsVersion.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' }
      });
    }
    return inMemoryVersions
      .filter(v => v.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createVersion(data: Omit<CmsVersion, 'id' | 'createdAt'>): Promise<CmsVersion> {
    const prisma = this.prisma;
    const now = new Date();
    const id = `ver_${Math.random().toString(36).substr(2, 9)}`;

    if (prisma) {
      return prisma.cmsVersion.create({
        data: {
          ...data,
          createdAt: now,
        }
      });
    } else {
      const newVersion: CmsVersion = {
        id,
        ...data,
        createdAt: now,
      };
      inMemoryVersions.push(newVersion);
      return newVersion;
    }
  }

  async getVersionById(id: string): Promise<CmsVersion | null> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.cmsVersion.findUnique({ where: { id } });
    }
    return inMemoryVersions.find(v => v.id === id) || null;
  }

  // --- MEDIA LIBRARY ---
  async getMedia(params: { folder?: string; search?: string; limit?: number; offset?: number; projectId?: string }): Promise<{ items: CmsMedia[]; total: number }> {
    const prisma = this.prisma;
    const limit = params.limit || 50;
    const offset = params.offset || 0;

    if (prisma) {
      const where: any = {};
      if (params.folder) {
        where.folder = params.folder;
      }
      if (params.projectId) {
        where.projectId = params.projectId;
      }
      if (params.search) {
        where.OR = [
          { filename: { contains: params.search, mode: 'insensitive' } },
          { tags: { has: params.search } }
        ];
      }

      const [items, total] = await Promise.all([
        prisma.cmsMedia.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
        prisma.cmsMedia.count({ where })
      ]);

      return { items, total };
    } else {
      let items = [...inMemoryMedia];
      if (params.folder) {
        items = items.filter(m => m.folder === params.folder);
      }
      if (params.projectId) {
        items = items.filter(m => (m as any).projectId === params.projectId);
      }
      if (params.search) {
        const query = params.search.toLowerCase();
        items = items.filter(m =>
          m.filename.toLowerCase().includes(query) ||
          m.tags.some(t => t.toLowerCase().includes(query))
        );
      }

      items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const total = items.length;
      items = items.slice(offset, offset + limit);

      return { items, total };
    }
  }

  async createMedia(data: Omit<CmsMedia, 'id' | 'createdAt'>): Promise<CmsMedia> {
    const prisma = this.prisma;
    const now = new Date();
    const id = `media_${Math.random().toString(36).substr(2, 9)}`;

    if (prisma) {
      return prisma.cmsMedia.create({
        data: {
          ...data,
          createdAt: now,
        }
      });
    } else {
      const newMedia: CmsMedia = {
        id,
        ...data,
        createdAt: now,
      };
      inMemoryMedia.push(newMedia);
      return newMedia;
    }
  }

  async deleteMedia(id: string): Promise<CmsMedia> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.cmsMedia.delete({ where: { id } });
    } else {
      const idx = inMemoryMedia.findIndex(m => m.id === id);
      if (idx === -1) throw new Error('Media not found');
      const target = inMemoryMedia[idx];
      inMemoryMedia.splice(idx, 1);
      return target;
    }
  }

  // --- ANALYTICS ---
  async getAnalytics(projectId?: string, startDate?: Date, endDate?: Date): Promise<CmsAnalytics[]> {
    const prisma = this.prisma;

    if (prisma) {
      const where: any = {};
      if (projectId) {
        where.projectId = projectId;
      }
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      return prisma.cmsAnalytics.findMany({
        where,
        orderBy: { createdAt: 'asc' }
      });
    } else {
      let logs = [...inMemoryAnalytics];
      if (projectId) {
        logs = logs.filter(l => l.projectId === projectId);
      }
      if (startDate) {
        logs = logs.filter(l => l.createdAt.getTime() >= startDate.getTime());
      }
      if (endDate) {
        logs = logs.filter(l => l.createdAt.getTime() <= endDate.getTime());
      }
      logs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      return logs;
    }
  }

  async logAnalytics(data: Omit<Omit<CmsAnalytics, 'id' | 'createdAt'>, 'projectContainerId'> & { projectContainerId?: string | null }): Promise<CmsAnalytics> {
    const prisma = this.prisma;
    const now = new Date();
    const id = `an_${Math.random().toString(36).substr(2, 9)}`;

    if (prisma) {
      return prisma.cmsAnalytics.create({
        data: {
          ...data,
          projectContainerId: data.projectContainerId || null,
          createdAt: now,
        }
      });
    } else {
      const log: CmsAnalytics = {
        id,
        ...data,
        projectContainerId: data.projectContainerId ?? null,
        createdAt: now,
      };
      inMemoryAnalytics.push(log);
      return log;
    }
  }

  // --- AUDIT LOGS ---
  async getAuditLogs(userId?: string, limit: number = 50, projectId?: string): Promise<CmsAuditLog[]> {
    const prisma = this.prisma;
    if (prisma) {
      const where: any = {};
      if (userId) where.userId = userId;
      if (projectId) where.projectId = projectId;
      return prisma.cmsAuditLog.findMany({
        where,
        take: limit,
        orderBy: { createdAt: 'desc' }
      });
    }
    let logs = [...inMemoryAuditLogs];
    if (userId) {
      logs = logs.filter(l => l.userId === userId);
    }
    if (projectId) {
      logs = logs.filter(l => (l as any).projectId === projectId);
    }
    logs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return logs.slice(0, limit);
  }

  async logAudit(data: Omit<Omit<CmsAuditLog, 'id' | 'createdAt'>, 'projectId'> & { projectId?: string | null }): Promise<CmsAuditLog> {
    const prisma = this.prisma;
    const now = new Date();
    const id = `aud_${Math.random().toString(36).substr(2, 9)}`;

    if (prisma) {
      return prisma.cmsAuditLog.create({
        data: {
          ...data,
          projectId: data.projectId || null,
          createdAt: now,
        }
      });
    } else {
      const log: CmsAuditLog = {
        id,
        ...data,
        createdAt: now,
      } as any;
      inMemoryAuditLogs.push(log);
      return log;
    }
  }

  // --- DEVELOPER PROJECTS (PRODUCT CONTAINERS) ---
  async getDeveloperProjects(userId: string): Promise<Project[]> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.project.findMany({
        where: { organization: { ownerId: userId } },
        include: { integrations: true }
      });
    }
    return inMemoryProjectContainers;
  }

  async getDeveloperProjectById(id: string): Promise<Project | null> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.project.findUnique({
        where: { id },
        include: { integrations: true }
      });
    }
    return inMemoryProjectContainers.find((p: any) => p.id === id) || null;
  }

  async getDeveloperProjectBySlug(slug: string): Promise<Project | null> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.project.findUnique({
        where: { slug },
        include: { integrations: true }
      });
    }
    return inMemoryProjectContainers.find((p: any) => p.slug === slug) || null;
  }

  async createDeveloperProject(data: any): Promise<Project> {
    const prisma = this.prisma;
    const now = new Date();
    const id = `proj_${Date.now()}`;
    if (prisma) {
      return prisma.project.create({
        data: {
          ...data,
          createdAt: now,
          updatedAt: now
        }
      });
    }
    const newProj = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now
    };
    inMemoryProjectContainers.push(newProj);
    return newProj as any;
  }

  async updateDeveloperProject(id: string, data: any): Promise<Project> {
    const prisma = this.prisma;
    const now = new Date();
    if (prisma) {
      return prisma.project.update({
        where: { id },
        data: {
          ...data,
          updatedAt: now
        }
      });
    }
    const idx = inMemoryProjectContainers.findIndex((p: any) => p.id === id);
    if (idx === -1) throw new Error('Project not found');
    const updated = {
      ...inMemoryProjectContainers[idx],
      ...data,
      updatedAt: now
    };
    inMemoryProjectContainers[idx] = updated;
    return updated;
  }

  // --- ROADMAP MILESTONES & TASKS ---
  async getProjectRoadmap(projectId: string): Promise<ProjectRoadmap[]> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.projectRoadmap.findMany({
        where: { projectId },
        orderBy: { orderIndex: 'asc' },
        include: { tasks: { orderBy: { orderIndex: 'asc' } } }
      });
    }
    return inMemoryRoadmaps.filter((r: any) => r.projectId === projectId).map((r: any) => ({
      ...r,
      tasks: inMemoryRoadmapTasks.filter((t: any) => t.roadmapId === r.id)
    })) as any;
  }

  async upsertRoadmapMilestone(data: any): Promise<ProjectRoadmap> {
    const prisma = this.prisma;
    const now = new Date();
    if (prisma) {
      if (data.id) {
        return prisma.projectRoadmap.update({
          where: { id: data.id },
          data: {
            title: data.title,
            description: data.description,
            status: data.status,
            progress: data.progress,
            estimatedCompletion: data.estimatedCompletion,
            orderIndex: data.orderIndex,
            updatedAt: now
          }
        });
      } else {
        return prisma.projectRoadmap.create({
          data: {
            projectId: data.projectId,
            title: data.title,
            description: data.description,
            status: data.status,
            progress: data.progress,
            estimatedCompletion: data.estimatedCompletion,
            orderIndex: data.orderIndex || 0,
            createdAt: now,
            updatedAt: now
          }
        });
      }
    }

    if (data.id) {
      const idx = inMemoryRoadmaps.findIndex((r: any) => r.id === data.id);
      if (idx === -1) throw new Error('Milestone not found');
      const updated = {
        ...inMemoryRoadmaps[idx],
        title: data.title,
        description: data.description || null,
        status: data.status,
        progress: data.progress,
        estimatedCompletion: data.estimatedCompletion || null,
        updatedAt: now
      };
      inMemoryRoadmaps[idx] = updated;
      return updated as any;
    } else {
      const newMilestone = {
        id: `rm_${Date.now()}`,
        projectId: data.projectId,
        title: data.title,
        description: data.description || null,
        status: data.status,
        progress: data.progress || 0,
        estimatedCompletion: data.estimatedCompletion || null,
        orderIndex: data.orderIndex || 0,
        createdAt: now,
        updatedAt: now
      };
      inMemoryRoadmaps.push(newMilestone as any);
      return newMilestone as any;
    }
  }

  async deleteRoadmapMilestone(id: string): Promise<void> {
    const prisma = this.prisma;
    if (prisma) {
      await prisma.projectRoadmap.delete({ where: { id } });
      return;
    }
    const idx = inMemoryRoadmaps.findIndex((r: any) => r.id === id);
    if (idx >= 0) inMemoryRoadmaps.splice(idx, 1);
    const rIdx = inMemoryRoadmapTasks.findIndex((t: any) => t.roadmapId === id);
    while (rIdx >= 0) {
      inMemoryRoadmapTasks.splice(rIdx, 1);
    }
  }

  async upsertRoadmapTask(data: any): Promise<RoadmapTask> {
    const prisma = this.prisma;
    const now = new Date();
    if (prisma) {
      if (data.id) {
        return prisma.roadmapTask.update({
          where: { id: data.id },
          data: {
            title: data.title,
            status: data.status,
            orderIndex: data.orderIndex,
            updatedAt: now
          }
        });
      } else {
        return prisma.roadmapTask.create({
          data: {
            roadmapId: data.roadmapId,
            title: data.title,
            status: data.status || 'todo',
            orderIndex: data.orderIndex || 0,
            createdAt: now,
            updatedAt: now
          }
        });
      }
    }

    if (data.id) {
      const idx = inMemoryRoadmapTasks.findIndex((t: any) => t.id === data.id);
      if (idx === -1) throw new Error('Task not found');
      const updated = {
        ...inMemoryRoadmapTasks[idx],
        title: data.title,
        status: data.status,
        updatedAt: now
      };
      inMemoryRoadmapTasks[idx] = updated;
      return updated as any;
    } else {
      const newTask = {
        id: `rmt_${Date.now()}`,
        roadmapId: data.roadmapId,
        title: data.title,
        status: data.status || 'todo',
        orderIndex: data.orderIndex || 0,
        createdAt: now,
        updatedAt: now
      };
      inMemoryRoadmapTasks.push(newTask as any);
      return newTask as any;
    }
  }

  async deleteRoadmapTask(id: string): Promise<void> {
    const prisma = this.prisma;
    if (prisma) {
      await prisma.roadmapTask.delete({ where: { id } });
      return;
    }
    const idx = inMemoryRoadmapTasks.findIndex((t: any) => t.id === id);
    if (idx >= 0) inMemoryRoadmapTasks.splice(idx, 1);
  }

  // --- PROJECT TIMELINE HUB ---
  async getProjectTimeline(projectId: string): Promise<ProjectTimeline[]> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.projectTimeline.findMany({
        where: { projectId },
        orderBy: { date: 'desc' }
      });
    }
    return inMemoryTimelines.filter((t: any) => t.projectId === projectId).sort((a: any, b: any) => b.date.getTime() - a.date.getTime()) as any;
  }

  async createTimelineEvent(data: any): Promise<ProjectTimeline> {
    const prisma = this.prisma;
    const now = new Date();
    if (prisma) {
      return prisma.projectTimeline.create({
        data: {
          projectId: data.projectId,
          title: data.title,
          description: data.description,
          type: data.type || 'manual',
          date: data.date ? new Date(data.date) : now,
          createdAt: now
        }
      });
    }
    const newEvent = {
      id: `tl_${Date.now()}`,
      projectId: data.projectId,
      title: data.title,
      description: data.description || null,
      type: data.type || 'manual',
      date: data.date ? new Date(data.date) : now,
      createdAt: now
    };
    inMemoryTimelines.push(newEvent);
    return newEvent as any;
  }

  async deleteTimelineEvent(id: string): Promise<void> {
    const prisma = this.prisma;
    if (prisma) {
      await prisma.projectTimeline.delete({ where: { id } });
      return;
    }
    const idx = inMemoryTimelines.findIndex((t: any) => t.id === id);
    if (idx >= 0) inMemoryTimelines.splice(idx, 1);
  }

  // --- GENERIC INTEGRATIONS LAYER ---
  async getIntegration(projectId: string, provider: string): Promise<Integration | null> {
    const prisma = this.prisma;
    if (prisma) {
      return prisma.integration.findUnique({
        where: { projectId_provider: { projectId, provider } }
      });
    }
    return inMemoryIntegrations.find((i: any) => i.projectId === projectId && i.provider === provider) || null;
  }

  async upsertIntegration(data: any): Promise<Integration> {
    const prisma = this.prisma;
    const now = new Date();
    if (prisma) {
      return prisma.integration.upsert({
        where: { projectId_provider: { projectId: data.projectId, provider: data.provider } },
        update: {
          isActive: data.isActive !== undefined ? data.isActive : true,
          credentials: data.credentials,
          settings: data.settings,
          metadata: data.metadata,
          lastSyncedAt: data.lastSyncedAt || now,
          updatedAt: now
        },
        create: {
          projectId: data.projectId,
          provider: data.provider,
          isActive: data.isActive !== undefined ? data.isActive : true,
          credentials: data.credentials,
          settings: data.settings,
          metadata: data.metadata,
          lastSyncedAt: data.lastSyncedAt || now,
          createdAt: now,
          updatedAt: now
        }
      });
    }

    const idx = inMemoryIntegrations.findIndex((i: any) => i.projectId === data.projectId && i.provider === data.provider);
    if (idx >= 0) {
      const updated = {
        ...inMemoryIntegrations[idx],
        isActive: data.isActive !== undefined ? data.isActive : true,
        credentials: data.credentials || inMemoryIntegrations[idx].credentials,
        settings: data.settings || inMemoryIntegrations[idx].settings,
        metadata: data.metadata || inMemoryIntegrations[idx].metadata,
        lastSyncedAt: data.lastSyncedAt || now,
        updatedAt: now
      };
      inMemoryIntegrations[idx] = updated;
      return updated as any;
    } else {
      const newIntegration = {
        id: `int_${Date.now()}`,
        projectId: data.projectId,
        provider: data.provider,
        isActive: data.isActive !== undefined ? data.isActive : true,
        credentials: data.credentials || null,
        settings: data.settings || null,
        metadata: data.metadata || null,
        lastSyncedAt: data.lastSyncedAt || now,
        createdAt: now,
        updatedAt: now
      };
      inMemoryIntegrations.push(newIntegration);
      return newIntegration as any;
    }
  }
}

export const cmsDb = new CmsDatabase();

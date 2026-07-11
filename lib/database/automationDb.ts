import { getPrisma } from './dbClient';
import { encryptToken, decryptToken } from '../security/encryption';

export function getActivePrisma(): any {
  const prisma = getPrisma();
  if (prisma && (prisma as any).workspace) {
    return prisma;
  }
  return null;
}

// Twin-Adapter Memory Storage for Sandbox Development
let inMemoryWorkspaces: any[] = [];
let inMemoryMembers: any[] = [];
let inMemoryUsages: any[] = [];
let inMemoryRepositories: any[] = [];
let inMemoryEvents: any[] = [];
let inMemoryDrafts: any[] = [];
let inMemoryVersions: any[] = [];
let inMemoryAiMemories: any[] = [];
let inMemoryScreenshots: any[] = [];
let inMemoryTemplates: any[] = [];
let inMemoryCredentials: any[] = [];

// Seed sandbox data if not already seeded
export function seedAutomationSandbox() {
  if (inMemoryWorkspaces.length > 0) return;

  const wsId = 'ws_sandbox_1';
  const adminId = 'sandbox-admin-id';
  const now = new Date();

  // 1. Workspace
  inMemoryWorkspaces.push({
    id: wsId,
    name: 'SaaS Workspace',
    slug: 'saas-workspace',
    billingTier: 'pro',
    createdAt: now,
    updatedAt: now,
  });

  // 2. Member
  inMemoryMembers.push({
    id: 'wsm_sandbox_1',
    workspaceId: wsId,
    userId: adminId,
    role: 'owner',
    createdAt: now,
  });

  // 3. Repository
  inMemoryRepositories.push({
    id: 'repo_sandbox_1',
    workspaceId: wsId,
    owner: 'satyajitmishra-dev',
    name: 'Study-Material',
    description: 'Enterprise Content Management System and developer study hub.',
    languages: ['TypeScript', 'CSS', 'HTML'],
    topics: ['nextjs', 'prisma', 'tailwindcss', 'saas'],
    branchFilters: ['main'],
    ignorePaths: ['node_modules', '.next'],
    ignoreCommits: ['docs:', 'chore:'],
    aiWritingStyle: 'technical, yet engaging and clear',
    aiModel: 'gpt-4o-mini',
    webhookSecret: 'shh-sandbox-secret',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  // 4. AI Memory
  inMemoryAiMemories.push({
    id: 'mem_sandbox_1',
    workspaceId: wsId,
    writingStyle: 'Direct, developer-focused, technical insights, and clean code references.',
    preferredHashtags: ['nextjs', 'typescript', 'saas', 'webdev', 'productivity'],
    preferredEmojis: ['🚀', '🛠️', '⚡', '📦'],
    ctaStyle: 'Star the repository and join the development discussion!',
    tone: 'technical',
    audience: 'developers',
    updatedAt: now,
  });

  // 5. Prompt Templates
  const platforms = [
    { name: 'LinkedIn Post', platform: 'linkedin', systemPrompt: 'You are a Developer Growth Advocate on LinkedIn.', userPrompt: 'Write a LinkedIn post (150-300 words) summarizing: {summary}. Tech stack: {tech}. Highlight key features, lessons learned, and add hashtags.' },
    { name: 'X Thread', platform: 'twitter', systemPrompt: 'You are a tech influencer on X.', userPrompt: 'Write a thread of 5-8 tweets for: {summary}. Hook in first tweet, followed by bullet details. Final tweet must include CTA.' },
    { name: 'Dev.to Article', platform: 'devto', systemPrompt: 'You are a Technical Writer.', userPrompt: '# {title}\n\n## Introduction\n{summary}\n\n## The Tech Stack\n{tech}\n\n## Features & Challenges\nWrite detailed Markdown.' },
    { name: 'GitHub Release Notes', platform: 'release_notes', systemPrompt: 'You are an Open Source Maintainer.', userPrompt: '## Release notes for {ref}\n\n### Summary\n{summary}\n\n### Changes\n- Bug fixes\n- Features' }
  ];

  platforms.forEach((p, idx) => {
    inMemoryTemplates.push({
      id: `tmpl_${p.platform}`,
      workspaceId: wsId,
      name: p.name,
      platform: p.platform,
      systemPrompt: p.systemPrompt,
      userPrompt: p.userPrompt,
      isCustom: false,
      createdAt: now,
      updatedAt: now,
    });
  });

  // 6. Credentials (seeded with sandbox webhook urls)
  inMemoryCredentials.push({
    id: 'cred_sandbox_slack',
    workspaceId: wsId,
    platform: 'slack',
    encryptedToken: 'encrypted-slack-url-value',
    encryptedSecret: null,
    settings: JSON.stringify({ webhookUrl: 'https://hooks.slack.com/services/sandbox-test' }),
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  // 7. Event Queue (history)
  inMemoryEvents.push({
    id: 'evt_sandbox_1',
    repositoryId: 'repo_sandbox_1',
    idempotencyKey: 'idemp_sandbox_1',
    eventType: 'push',
    action: null,
    ref: 'refs/heads/main',
    sha: '8f9a2b4c6e8',
    author: 'satyajitmishra-dev',
    message: 'feat: add database-backed event queue processing for SaaS',
    payload: JSON.stringify({ commits: [{ id: '8f9a2b4c6e8', message: 'feat: add database-backed event queue' }] }),
    status: 'completed',
    retryCount: 0,
    nextRunAt: now,
    errorMessage: null,
    processingLogs: JSON.stringify([
      { time: now.toISOString(), message: 'Webhook event received', step: 'receive' },
      { time: now.toISOString(), message: 'Idempotency validation passed', step: 'validate' },
      { time: now.toISOString(), message: 'Queue processing started', step: 'process' },
      { time: now.toISOString(), message: 'GitHub metadata fetched successfully', step: 'github' },
      { time: now.toISOString(), message: 'Smart path filters verified: meaningful change', step: 'filter' },
      { time: now.toISOString(), message: 'AI Change analysis finished', step: 'ai_analysis' },
      { time: now.toISOString(), message: 'Draft content created for LinkedIn and Slack', step: 'ai_draft' },
      { time: now.toISOString(), message: 'Quality checks passed: zero secrets found', step: 'quality_check' }
    ]),
    latencyMs: 1420,
    createdAt: now,
    updatedAt: now,
  });

  // 8. Content Draft
  inMemoryDrafts.push({
    id: 'drf_sandbox_1',
    repositoryId: 'repo_sandbox_1',
    eventId: 'evt_sandbox_1',
    title: 'Introducing SaaS Event Queue Processing',
    platform: 'linkedin',
    content: `🚀 Excited to share that I've just implemented an asynchronous database-backed Event Queue processing engine for our Content Automation platform!

💡 In modern cloud architectures, handling webhook events synchronously from third-party APIs (like GitHub) is a recipe for timeouts. By shifting to a stateless database queue triggered by external cron schedulers:
• We prevent webhook processing timeouts.
• We gain exponential backoff retries & Dead Letter Queue (DLQ) support.
• We ensure idempotency so duplicate requests are filtered.

🛠️ Tech Stack: Next.js 16, Prisma, Supabase, TailwindCSS v4, Framer Motion.

Let me know what you think about queue design in serverless apps!`,
    status: 'approved',
    scheduledAt: null,
    timezone: 'UTC',
    publishedAt: null,
    publishUrl: null,
    publishError: null,
    aiConfidence: 0.95,
    qualityScore: 92,
    readabilityScore: 85,
    estimatedEngagement: 4.8,
    readingTimeMin: 1,
    tokenCost: 0.0035,
    createdAt: now,
    updatedAt: now,
  });
}

// Auto-seed sandbox
seedAutomationSandbox();

export const automationDb = {
  // --- WORKSPACE & MEMBERS ---
  async getWorkspaces(userId: string): Promise<any[]> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.workspace.findMany({
        where: { members: { some: { userId } } },
        include: { members: true },
      });
    }
    const wsIds = inMemoryMembers.filter(m => m.userId === userId).map(m => m.workspaceId);
    return inMemoryWorkspaces.filter(ws => wsIds.includes(ws.id));
  },

  async getWorkspaceById(id: string): Promise<any | null> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.workspace.findUnique({
        where: { id },
        include: { members: true },
      });
    }
    return inMemoryWorkspaces.find(ws => ws.id === id) || null;
  },

  async getWorkspaceBySlug(slug: string): Promise<any | null> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.workspace.findUnique({ where: { slug } });
    }
    return inMemoryWorkspaces.find(ws => ws.slug === slug) || null;
  },

  async createWorkspace(userId: string, name: string, slug: string): Promise<any> {
    const prisma = getActivePrisma();
    const id = `ws_${Date.now()}`;
    if (prisma) {
      return prisma.workspace.create({
        data: {
          id,
          name,
          slug,
          members: {
            create: {
              userId,
              role: 'owner',
            }
          }
        }
      });
    }
    const newWs = { id, name, slug, billingTier: 'free', createdAt: new Date(), updatedAt: new Date() };
    inMemoryWorkspaces.push(newWs);
    inMemoryMembers.push({
      id: `wsm_${Date.now()}`,
      workspaceId: id,
      userId,
      role: 'owner',
      createdAt: new Date(),
    });
    return newWs;
  },

  async getWorkspaceMembers(workspaceId: string): Promise<any[]> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.workspaceMember.findMany({
        where: { workspaceId },
        include: { user: true },
      });
    }
    return inMemoryMembers.filter(m => m.workspaceId === workspaceId);
  },

  // --- REPOSITORIES ---
  async getRepositories(workspaceId: string): Promise<any[]> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.githubRepository.findMany({ where: { workspaceId } });
    }
    return inMemoryRepositories.filter(r => r.workspaceId === workspaceId);
  },

  async getRepositoryById(id: string): Promise<any | null> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.githubRepository.findUnique({ where: { id } });
    }
    return inMemoryRepositories.find(r => r.id === id) || null;
  },

  async getRepositoryByFullName(owner: string, name: string): Promise<any | null> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.githubRepository.findUnique({
        where: { owner_name: { owner, name } }
      });
    }
    return inMemoryRepositories.find(r => r.owner.toLowerCase() === owner.toLowerCase() && r.name.toLowerCase() === name.toLowerCase()) || null;
  },

  async createRepository(data: {
    workspaceId: string;
    owner: string;
    name: string;
    description?: string;
    languages?: string[];
    topics?: string[];
    branchFilters?: string[];
    ignorePaths?: string[];
    ignoreCommits?: string[];
    aiWritingStyle?: string;
    aiModel?: string;
    webhookSecret?: string;
  }): Promise<any> {
    const prisma = getActivePrisma();
    const id = `repo_${Date.now()}`;
    const formatted = {
      ...data,
      languages: data.languages || [],
      topics: data.topics || [],
      branchFilters: data.branchFilters || ['main'],
      ignorePaths: data.ignorePaths || [],
      ignoreCommits: data.ignoreCommits || [],
      aiWritingStyle: data.aiWritingStyle || 'professional',
      aiModel: data.aiModel || 'gpt-4o-mini',
      isActive: true,
    };
    
    if (prisma) {
      return prisma.githubRepository.create({
        data: {
          id,
          ...formatted
        }
      });
    }
    const newRepo = {
      id,
      ...formatted,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryRepositories.push(newRepo);
    return newRepo;
  },

  async updateRepository(id: string, data: any): Promise<any> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.githubRepository.update({
        where: { id },
        data,
      });
    }
    const idx = inMemoryRepositories.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Repository not found');
    inMemoryRepositories[idx] = { ...inMemoryRepositories[idx], ...data, updatedAt: new Date() };
    return inMemoryRepositories[idx];
  },

  async deleteRepository(id: string): Promise<void> {
    const prisma = getActivePrisma();
    if (prisma) {
      await prisma.githubRepository.delete({ where: { id } });
      return;
    }
    inMemoryRepositories = inMemoryRepositories.filter(r => r.id !== id);
  },

  // --- QUEUE EVENTS ---
  async getEvents(repositoryId: string, limit: number = 25): Promise<any[]> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.githubAutomationEvent.findMany({
        where: { repositoryId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    }
    return inMemoryEvents
      .filter(e => e.repositoryId === repositoryId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  },

  async getEventById(id: string): Promise<any | null> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.githubAutomationEvent.findUnique({ where: { id } });
    }
    return inMemoryEvents.find(e => e.id === id) || null;
  },

  async getEventByIdempotencyKey(idempotencyKey: string): Promise<any | null> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.githubAutomationEvent.findUnique({ where: { idempotencyKey } });
    }
    return inMemoryEvents.find(e => e.idempotencyKey === idempotencyKey) || null;
  },

  async createEvent(data: {
    repositoryId: string;
    idempotencyKey: string;
    eventType: string;
    action?: string | null;
    ref?: string | null;
    sha?: string | null;
    author?: string | null;
    message?: string | null;
    payload: string;
    status?: string;
    processingLogs?: string;
  }): Promise<any> {
    const prisma = getActivePrisma();
    const id = `evt_${Date.now()}`;
    const now = new Date();
    const formatted = {
      id,
      repositoryId: data.repositoryId,
      idempotencyKey: data.idempotencyKey,
      eventType: data.eventType,
      action: data.action || null,
      ref: data.ref || null,
      sha: data.sha || null,
      author: data.author || null,
      message: data.message || null,
      payload: data.payload,
      status: data.status || 'pending',
      retryCount: 0,
      nextRunAt: now,
      errorMessage: null,
      processingLogs: data.processingLogs || JSON.stringify([{ time: now.toISOString(), message: 'Event added to queue', step: 'enqueue' }]),
      latencyMs: 0,
      createdAt: now,
      updatedAt: now,
    };
    if (prisma) {
      return prisma.githubAutomationEvent.create({ data: formatted });
    }
    inMemoryEvents.push(formatted);
    return formatted;
  },

  async updateEvent(id: string, data: any): Promise<any> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.githubAutomationEvent.update({
        where: { id },
        data,
      });
    }
    const idx = inMemoryEvents.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Event not found');
    inMemoryEvents[idx] = { ...inMemoryEvents[idx], ...data, updatedAt: new Date() };
    return inMemoryEvents[idx];
  },

  async getPendingQueueEvents(limit: number = 5): Promise<any[]> {
    const prisma = getActivePrisma();
    const now = new Date();
    if (prisma) {
      return prisma.githubAutomationEvent.findMany({
        where: {
          status: { in: ['pending', 'failed'] },
          retryCount: { lt: 5 },
          nextRunAt: { lte: now },
        },
        orderBy: [{ retryCount: 'asc' }, { createdAt: 'asc' }],
        take: limit,
      });
    }
    return inMemoryEvents
      .filter(e => (e.status === 'pending' || e.status === 'failed') && e.retryCount < 5 && e.nextRunAt.getTime() <= now.getTime())
      .sort((a, b) => a.retryCount - b.retryCount || a.createdAt.getTime() - b.createdAt.getTime())
      .slice(0, limit);
  },

  // --- DRAFTS ---
  async getDrafts(workspaceId: string): Promise<any[]> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.contentDraft.findMany({
        where: { repository: { workspaceId } },
        orderBy: { createdAt: 'desc' },
      });
    }
    const repos = inMemoryRepositories.filter(r => r.workspaceId === workspaceId).map(r => r.id);
    return inMemoryDrafts.filter(d => repos.includes(d.repositoryId)).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async getDraftById(id: string): Promise<any | null> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.contentDraft.findUnique({
        where: { id },
        include: { versions: true, screenshots: true, repository: true },
      });
    }
    const draft = inMemoryDrafts.find(d => d.id === id);
    if (!draft) return null;
    const versions = inMemoryVersions.filter(v => v.draftId === id).sort((a, b) => a.versionIndex - b.versionIndex);
    const screenshots = inMemoryScreenshots.filter(s => s.draftId === id).sort((a, b) => a.orderIndex - b.orderIndex);
    const repository = inMemoryRepositories.find(r => r.id === draft.repositoryId);
    return { ...draft, versions, screenshots, repository };
  },

  async createDraft(data: {
    repositoryId: string;
    eventId?: string | null;
    title: string;
    platform: string;
    content: string;
    status?: string;
    scheduledAt?: Date | null;
    timezone?: string;
    aiConfidence?: number;
    qualityScore?: number;
    readabilityScore?: number;
    estimatedEngagement?: number;
    readingTimeMin?: number;
    tokenCost?: number;
  }): Promise<any> {
    const prisma = getActivePrisma();
    const id = `drf_${Date.now()}`;
    const now = new Date();
    const formatted = {
      id,
      repositoryId: data.repositoryId,
      eventId: data.eventId || null,
      title: data.title,
      platform: data.platform,
      content: data.content,
      status: data.status || 'draft',
      scheduledAt: data.scheduledAt || null,
      timezone: data.timezone || 'UTC',
      publishedAt: null,
      publishUrl: null,
      publishError: null,
      aiConfidence: data.aiConfidence || 0.0,
      qualityScore: data.qualityScore || 0,
      readabilityScore: data.readabilityScore || 0,
      estimatedEngagement: data.estimatedEngagement || 0.0,
      readingTimeMin: data.readingTimeMin || 0,
      tokenCost: data.tokenCost || 0.0,
      createdAt: now,
      updatedAt: now,
    };
    if (prisma) {
      return prisma.contentDraft.create({ data: formatted });
    }
    inMemoryDrafts.push(formatted);
    // Create initial version
    inMemoryVersions.push({
      id: `ver_${Date.now()}`,
      draftId: id,
      versionIndex: 1,
      content: data.content,
      title: data.title,
      changedBy: 'AI',
      createdAt: now,
    });
    return formatted;
  },

  async updateDraft(id: string, data: any): Promise<any> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.contentDraft.update({
        where: { id },
        data,
      });
    }
    const idx = inMemoryDrafts.findIndex(d => d.id === id);
    if (idx === -1) throw new Error('Draft not found');
    
    // Check if we should log a new version index
    if (data.content !== undefined && data.content !== inMemoryDrafts[idx].content) {
      const currentVersions = inMemoryVersions.filter(v => v.draftId === id);
      const nextIdx = currentVersions.length + 1;
      inMemoryVersions.push({
        id: `ver_${Date.now()}`,
        draftId: id,
        versionIndex: nextIdx,
        content: data.content,
        title: data.title || inMemoryDrafts[idx].title,
        changedBy: data.changedBy || 'User',
        createdAt: new Date(),
      });
    }

    inMemoryDrafts[idx] = { ...inMemoryDrafts[idx], ...data, updatedAt: new Date() };
    return inMemoryDrafts[idx];
  },

  async deleteDraft(id: string): Promise<void> {
    const prisma = getActivePrisma();
    if (prisma) {
      await prisma.contentDraft.delete({ where: { id } });
      return;
    }
    inMemoryDrafts = inMemoryDrafts.filter(d => d.id !== id);
    inMemoryVersions = inMemoryVersions.filter(v => v.draftId !== id);
    inMemoryScreenshots = inMemoryScreenshots.filter(s => s.draftId !== id);
  },

  async getDraftVersions(draftId: string): Promise<any[]> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.contentDraftVersion.findMany({
        where: { draftId },
        orderBy: { versionIndex: 'asc' },
      });
    }
    return inMemoryVersions.filter(v => v.draftId === draftId).sort((a, b) => a.versionIndex - b.versionIndex);
  },

  async restoreDraftVersion(draftId: string, versionId: string): Promise<any> {
    const prisma = getActivePrisma();
    if (prisma) {
      const ver = await prisma.contentDraftVersion.findUnique({ where: { id: versionId } });
      if (!ver) throw new Error('Version not found');
      return prisma.contentDraft.update({
        where: { id: draftId },
        data: {
          title: ver.title,
          content: ver.content,
          updatedAt: new Date()
        }
      });
    }
    const ver = inMemoryVersions.find(v => v.id === versionId);
    if (!ver) throw new Error('Version not found');
    const idx = inMemoryDrafts.findIndex(d => d.id === draftId);
    if (idx === -1) throw new Error('Draft not found');
    inMemoryDrafts[idx] = {
      ...inMemoryDrafts[idx],
      title: ver.title,
      content: ver.content,
      updatedAt: new Date()
    };
    return inMemoryDrafts[idx];
  },

  async getScheduledDrafts(): Promise<any[]> {
    const prisma = getActivePrisma();
    const now = new Date();
    if (prisma) {
      return prisma.contentDraft.findMany({
        where: {
          status: 'scheduled',
          scheduledAt: { lte: now }
        },
        include: { repository: true }
      });
    }
    return inMemoryDrafts.filter(d => d.status === 'scheduled' && d.scheduledAt && d.scheduledAt.getTime() <= now.getTime());
  },

  // --- AI MEMORY ---
  async getAiMemory(workspaceId: string): Promise<any | null> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.workspaceAiMemory.findUnique({ where: { workspaceId } });
    }
    return inMemoryAiMemories.find(m => m.workspaceId === workspaceId) || null;
  },

  async updateAiMemory(workspaceId: string, data: any): Promise<any> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.workspaceAiMemory.upsert({
        where: { workspaceId },
        update: data,
        create: { workspaceId, ...data }
      });
    }
    const idx = inMemoryAiMemories.findIndex(m => m.workspaceId === workspaceId);
    if (idx === -1) {
      const newMem = { id: `mem_${Date.now()}`, workspaceId, ...data, updatedAt: new Date() };
      inMemoryAiMemories.push(newMem);
      return newMem;
    }
    inMemoryAiMemories[idx] = { ...inMemoryAiMemories[idx], ...data, updatedAt: new Date() };
    return inMemoryAiMemories[idx];
  },

  // --- SCREENSHOTS ---
  async getScreenshots(draftId: string): Promise<any[]> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.automationScreenshot.findMany({
        where: { draftId },
        orderBy: { orderIndex: 'asc' },
      });
    }
    return inMemoryScreenshots.filter(s => s.draftId === draftId).sort((a, b) => a.orderIndex - b.orderIndex);
  },

  async createScreenshot(data: {
    draftId: string;
    imageUrl: string;
    caption?: string;
    orderIndex?: number;
    isFeatured?: boolean;
  }): Promise<any> {
    const prisma = getActivePrisma();
    const id = `scr_${Date.now()}`;
    const formatted = {
      id,
      draftId: data.draftId,
      imageUrl: data.imageUrl,
      caption: data.caption || null,
      orderIndex: data.orderIndex || 0,
      isFeatured: data.isFeatured || false,
      createdAt: new Date(),
    };
    if (prisma) {
      return prisma.automationScreenshot.create({ data: formatted });
    }
    inMemoryScreenshots.push(formatted);
    return formatted;
  },

  async deleteScreenshot(id: string): Promise<void> {
    const prisma = getActivePrisma();
    if (prisma) {
      await prisma.automationScreenshot.delete({ where: { id } });
      return;
    }
    inMemoryScreenshots = inMemoryScreenshots.filter(s => s.id !== id);
  },

  // --- PROMPT TEMPLATES ---
  async getTemplates(workspaceId: string): Promise<any[]> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.promptTemplate.findMany({ where: { workspaceId } });
    }
    return inMemoryTemplates.filter(t => t.workspaceId === workspaceId);
  },

  async getTemplateById(id: string): Promise<any | null> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.promptTemplate.findUnique({ where: { id } });
    }
    return inMemoryTemplates.find(t => t.id === id) || null;
  },

  async createTemplate(data: {
    workspaceId: string;
    name: string;
    platform: string;
    systemPrompt: string;
    userPrompt: string;
    isCustom?: boolean;
  }): Promise<any> {
    const prisma = getActivePrisma();
    const id = `tmpl_${Date.now()}`;
    const formatted = {
      id,
      workspaceId: data.workspaceId,
      name: data.name,
      platform: data.platform,
      systemPrompt: data.systemPrompt,
      userPrompt: data.userPrompt,
      isCustom: data.isCustom !== undefined ? data.isCustom : true,
    };
    if (prisma) {
      return prisma.promptTemplate.create({
        data: formatted
      });
    }
    const newTmpl = { ...formatted, createdAt: new Date(), updatedAt: new Date() };
    inMemoryTemplates.push(newTmpl);
    return newTmpl;
  },

  async updateTemplate(id: string, data: any): Promise<any> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.promptTemplate.update({
        where: { id },
        data,
      });
    }
    const idx = inMemoryTemplates.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Template not found');
    inMemoryTemplates[idx] = { ...inMemoryTemplates[idx], ...data, updatedAt: new Date() };
    return inMemoryTemplates[idx];
  },

  // --- CREDENTIALS ---
  async getCredentials(workspaceId: string): Promise<any[]> {
    const prisma = getActivePrisma();
    if (prisma) {
      const list = await prisma.publishingCredential.findMany({ where: { workspaceId } });
      return list.map((c: any) => ({
        ...c,
        token: decryptToken(c.encryptedToken),
        secret: c.encryptedSecret ? decryptToken(c.encryptedSecret) : null,
      }));
    }
    return inMemoryCredentials.filter((c: any) => c.workspaceId === workspaceId).map((c: any) => ({
      ...c,
      token: decryptToken(c.encryptedToken),
      secret: c.encryptedSecret ? decryptToken(c.encryptedSecret) : null,
    }));
  },

  async getCredentialByPlatform(workspaceId: string, platform: string): Promise<any | null> {
    const prisma = getActivePrisma();
    if (prisma) {
      const cred = await prisma.publishingCredential.findFirst({
        where: { workspaceId, platform, isActive: true }
      });
      if (!cred) return null;
      return {
        ...cred,
        token: decryptToken(cred.encryptedToken),
        secret: cred.encryptedSecret ? decryptToken(cred.encryptedSecret) : null,
      };
    }
    const cred = inMemoryCredentials.find(c => c.workspaceId === workspaceId && c.platform === platform && c.isActive);
    if (!cred) return null;
    return {
      ...cred,
      token: decryptToken(cred.encryptedToken),
      secret: cred.encryptedSecret ? decryptToken(cred.encryptedSecret) : null,
    };
  },

  async saveCredential(data: {
    workspaceId: string;
    platform: string;
    token: string;
    secret?: string | null;
    settings?: string;
  }): Promise<any> {
    const prisma = getActivePrisma();
    const encToken = encryptToken(data.token);
    const encSecret = data.secret ? encryptToken(data.secret) : null;
    const now = new Date();
    
    if (prisma) {
      const existing = await prisma.publishingCredential.findFirst({
        where: { workspaceId: data.workspaceId, platform: data.platform }
      });
      if (existing) {
        return prisma.publishingCredential.update({
          where: { id: existing.id },
          data: {
            encryptedToken: encToken,
            encryptedSecret: encSecret,
            settings: data.settings || existing.settings,
            isActive: true,
          }
        });
      }
      return prisma.publishingCredential.create({
        data: {
          workspaceId: data.workspaceId,
          platform: data.platform,
          encryptedToken: encToken,
          encryptedSecret: encSecret,
          settings: data.settings,
          isActive: true,
        }
      });
    }

    const existingIdx = inMemoryCredentials.findIndex(c => c.workspaceId === data.workspaceId && c.platform === data.platform);
    if (existingIdx !== -1) {
      inMemoryCredentials[existingIdx] = {
        ...inMemoryCredentials[existingIdx],
        encryptedToken: encToken,
        encryptedSecret: encSecret,
        settings: data.settings || inMemoryCredentials[existingIdx].settings,
        isActive: true,
        updatedAt: now,
      };
      return inMemoryCredentials[existingIdx];
    }

    const newCred = {
      id: `cred_${Date.now()}`,
      workspaceId: data.workspaceId,
      platform: data.platform,
      encryptedToken: encToken,
      encryptedSecret: encSecret,
      settings: data.settings,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    inMemoryCredentials.push(newCred);
    return newCred;
  },

  async deleteCredential(id: string): Promise<void> {
    const prisma = getActivePrisma();
    if (prisma) {
      await prisma.publishingCredential.delete({ where: { id } });
      return;
    }
    inMemoryCredentials = inMemoryCredentials.filter(c => c.id !== id);
  },

  // --- USAGE & LIMITS ---
  async getUsage(workspaceId: string, billingPeriod: string): Promise<any> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.workspaceUsage.findUnique({
        where: { workspaceId_billingPeriod: { workspaceId, billingPeriod } }
      });
    }
    return inMemoryUsages.find(u => u.workspaceId === workspaceId && u.billingPeriod === billingPeriod) || null;
  },

  async incrementUsage(
    workspaceId: string,
    billingPeriod: string,
    tokens: number,
    postsGenerated: number,
    postsPublished: number,
    estimatedCostUsd: number
  ): Promise<any> {
    const prisma = getActivePrisma();
    if (prisma) {
      return prisma.workspaceUsage.upsert({
        where: { workspaceId_billingPeriod: { workspaceId, billingPeriod } },
        update: {
          tokensUsed: { increment: tokens },
          postsGenerated: { increment: postsGenerated },
          postsPublished: { increment: postsPublished },
          estimatedCostUsd: { increment: estimatedCostUsd },
        },
        create: {
          workspaceId,
          billingPeriod,
          tokensUsed: tokens,
          postsGenerated,
          postsPublished,
          estimatedCostUsd,
        }
      });
    }

    let usage = inMemoryUsages.find(u => u.workspaceId === workspaceId && u.billingPeriod === billingPeriod);
    if (!usage) {
      usage = {
        id: `usg_${Date.now()}`,
        workspaceId,
        billingPeriod,
        tokensUsed: 0,
        postsGenerated: 0,
        postsPublished: 0,
        estimatedCostUsd: 0.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryUsages.push(usage);
    }
    usage.tokensUsed += tokens;
    usage.postsGenerated += postsGenerated;
    usage.postsPublished += postsPublished;
    usage.estimatedCostUsd += estimatedCostUsd;
    usage.updatedAt = new Date();
    return usage;
  }
};

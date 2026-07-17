'use server';

import { auth } from '@/auth';
import { cmsDb } from '@/lib/database/cmsDb';
import { publicDb } from '@/lib/database/publicDb';
import { revalidatePath } from 'next/cache';
import { syncProjectGithubRepository, validateGithubUrl } from '@/lib/automation/github';
import { generateBatchDrafts } from '@/lib/automation/contentGenerator';

// Helper to check user session
async function requireAuth() {
  const session = await auth();
  const userId = session?.user?.id || 'sandbox-admin-id';
  return userId;
}

// 1. Create a Project Container
export async function createDeveloperProjectAction(data: {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  visibility?: string;
}) {
  const userId = await requireAuth();
  
  // Find user's organization or create one
  const prisma = (cmsDb as any).prisma;
  let organizationId = 'org_sandbox_1';
  
  if (prisma) {
    let org = await prisma.organization.findFirst({
      where: { ownerId: userId }
    });
    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: `${userId.substring(0, 8)}'s Organization`,
          slug: `${userId.substring(0, 8).toLowerCase()}-${Date.now().toString().slice(-4)}-org`,
          ownerId: userId,
          plan: 'free',
          status: 'active'
        }
      });
    }
    organizationId = org.id;
  }

  try {
    const slug = data.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const project = await cmsDb.createDeveloperProject({
      name: data.name,
      slug,
      description: data.description,
      logo: data.logo || null,
      banner: data.banner || null,
      visibility: data.visibility || 'public',
      organizationId,
      ownerId: userId
    });

    // Create initial timeline event
    await cmsDb.createTimelineEvent({
      projectId: project.id,
      title: 'Created Project',
      description: `Project ${data.name} was successfully created on the platform.`,
      type: 'manual',
      date: new Date()
    });

    revalidatePath(`/u/satyajit`);
    revalidatePath(`/projects/${slug}`);
    return { success: true, project };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create project.' };
  }
}

// 2. Update Project Showcase details
export async function updateDeveloperProjectAction(projectId: string, data: {
  name?: string;
  description?: string;
  logo?: string;
  banner?: string;
  visibility?: string;
  liveDemo?: string;
  documentationUrl?: string;
  techStack?: string[];
  license?: string;
  status?: string;
  startDate?: string;
  tagsList?: string[];
  screenshots?: string[];
  category?: string;
  githubUrl?: string;
  gitlabUrl?: string;
  bitbucketUrl?: string;
  apiDocsUrl?: string;
  npmPackageUrl?: string;
}) {
  await requireAuth();
  try {
    const project = await cmsDb.updateDeveloperProject(projectId, data);
    revalidatePath(`/projects/${project.slug}`);
    revalidatePath(`/projects/${project.slug}/dashboard`);
    return { success: true, project };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update project.' };
  }
}

// 3. Connect GitHub Repository (Vercel-style)
export async function connectGithubRepositoryAction(projectId: string, repoUrl: string) {
  await requireAuth();
  
  const parsed = validateGithubUrl(repoUrl);
  if (!parsed) {
    return { success: false, error: 'INVALID_GITHUB_URL' };
  }

  try {
    // 1. Create or Update GitHub Integration record
    const integration = await cmsDb.upsertIntegration({
      projectId,
      provider: 'github',
      credentials: process.env.GITHUB_TOKEN || 'sandbox_mock_token',
      settings: JSON.stringify({ repoUrl, owner: parsed.owner, name: parsed.name }),
      isActive: true
    });

    // 2. Sync Repository Metadata immediately in the background
    const metadata = await syncProjectGithubRepository(projectId, integration.id, true);

    const project = await cmsDb.getDeveloperProjectById(projectId);
    revalidatePath(`/projects/${project?.slug}`);
    revalidatePath(`/projects/${project?.slug}/dashboard`);
    
    return { success: true, integration, metadata };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to connect repository.' };
  }
}

// 4. Force Sync integration cache
export async function syncIntegrationAction(projectId: string) {
  await requireAuth();
  try {
    const integration = await cmsDb.getIntegration(projectId, 'github');
    if (!integration) {
      return { success: false, error: 'No GitHub integration connected.' };
    }

    const metadata = await syncProjectGithubRepository(projectId, integration.id, true);
    const project = await cmsDb.getDeveloperProjectById(projectId);
    revalidatePath(`/projects/${project?.slug}`);
    revalidatePath(`/projects/${project?.slug}/dashboard`);

    return { success: true, metadata };
  } catch (err: any) {
    return { success: false, error: err.message || 'Sync failed.' };
  }
}

// 5. Manage Roadmaps (Milestones)
export async function saveRoadmapMilestoneAction(data: {
  id?: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'planned' | 'in_progress' | 'completed';
  progress: number;
  estimatedCompletion?: string;
  orderIndex?: number;
}) {
  await requireAuth();
  try {
    const milestone = await cmsDb.upsertRoadmapMilestone(data);
    const project = await cmsDb.getDeveloperProjectById(data.projectId);

    // Auto-timeline logic
    if (data.status === 'completed' && !data.id) {
      await cmsDb.createTimelineEvent({
        projectId: data.projectId,
        title: `Completed Roadmap Milestone`,
        description: `Successfully finished milestone: "${data.title}" (100% completed).`,
        type: 'roadmap_complete',
        date: new Date()
      });
    }

    revalidatePath(`/projects/${project?.slug}`);
    revalidatePath(`/projects/${project?.slug}/dashboard`);
    return { success: true, milestone };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save milestone.' };
  }
}

export async function deleteRoadmapMilestoneAction(id: string, projectId: string) {
  await requireAuth();
  try {
    await cmsDb.deleteRoadmapMilestone(id);
    const project = await cmsDb.getDeveloperProjectById(projectId);
    revalidatePath(`/projects/${project?.slug}`);
    revalidatePath(`/projects/${project?.slug}/dashboard`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete milestone.' };
  }
}

// 6. Manage Roadmap Tasks
export async function saveRoadmapTaskAction(projectId: string, data: {
  id?: string;
  roadmapId: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  orderIndex?: number;
}) {
  await requireAuth();
  try {
    const task = await cmsDb.upsertRoadmapTask(data);
    
    // Auto recalculate milestone progress
    const roadmap = await cmsDb.getProjectRoadmap(projectId);
    const milestone = roadmap.find(r => r.id === data.roadmapId) as any;
    if (milestone) {
      const milestoneTasks = milestone.tasks || [];
      const completed = milestoneTasks.filter((t: any) => t.status === 'done').length;
      const progressPercent = milestoneTasks.length > 0 
        ? Math.round((completed / milestoneTasks.length) * 100) 
        : 0;

      await cmsDb.upsertRoadmapMilestone({
        id: milestone.id,
        projectId,
        title: milestone.title,
        description: milestone.description,
        status: progressPercent === 100 ? 'completed' : progressPercent > 0 ? 'in_progress' : 'planned',
        progress: progressPercent,
        estimatedCompletion: milestone.estimatedCompletion,
        orderIndex: milestone.orderIndex
      });

      if (progressPercent === 100 && milestone.status !== 'completed') {
        await cmsDb.createTimelineEvent({
          projectId,
          title: `Completed Roadmap Milestone`,
          description: `All tasks for milestone "${milestone.title}" are finished!`,
          type: 'roadmap_complete',
          date: new Date()
        });
      }
    }

    const project = await cmsDb.getDeveloperProjectById(projectId);
    revalidatePath(`/projects/${project?.slug}`);
    revalidatePath(`/projects/${project?.slug}/dashboard`);
    return { success: true, task };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save task.' };
  }
}

export async function deleteRoadmapTaskAction(id: string, roadmapId: string, projectId: string) {
  await requireAuth();
  try {
    await cmsDb.deleteRoadmapTask(id);
    
    const roadmap = await cmsDb.getProjectRoadmap(projectId);
    const milestone = roadmap.find(r => r.id === roadmapId) as any;
    if (milestone) {
      const milestoneTasks = milestone.tasks || [];
      const completed = milestoneTasks.filter((t: any) => t.status === 'done').length;
      const progressPercent = milestoneTasks.length > 0 
        ? Math.round((completed / milestoneTasks.length) * 100) 
        : 0;

      await cmsDb.upsertRoadmapMilestone({
        id: milestone.id,
        projectId,
        title: milestone.title,
        description: milestone.description,
        status: progressPercent === 100 ? 'completed' : progressPercent > 0 ? 'in_progress' : 'planned',
        progress: progressPercent,
        estimatedCompletion: milestone.estimatedCompletion,
        orderIndex: milestone.orderIndex
      });
    }

    const project = await cmsDb.getDeveloperProjectById(projectId);
    revalidatePath(`/projects/${project?.slug}`);
    revalidatePath(`/projects/${project?.slug}/dashboard`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete task.' };
  }
}

// 7. Manage Timeline events (Learn in Public)
export async function saveTimelineEventAction(data: {
  projectId: string;
  title: string;
  description?: string;
  type?: string;
  date?: string;
}) {
  await requireAuth();
  try {
    const event = await cmsDb.createTimelineEvent(data);
    const project = await cmsDb.getDeveloperProjectById(data.projectId);
    revalidatePath(`/projects/${project?.slug}`);
    revalidatePath(`/projects/${project?.slug}/dashboard`);
    revalidatePath(`/u/satyajit`); 
    return { success: true, event };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create timeline event.' };
  }
}

export async function deleteTimelineEventAction(id: string, projectId: string) {
  await requireAuth();
  try {
    await cmsDb.deleteTimelineEvent(id);
    const project = await cmsDb.getDeveloperProjectById(projectId);
    revalidatePath(`/projects/${project?.slug}`);
    revalidatePath(`/projects/${project?.slug}/dashboard`);
    revalidatePath(`/u/satyajit`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete timeline event.' };
  }
}

// 8. Generate AI Draft from Commits (Reads Cached Summary to Save Cost)
export async function generateAiDraftFromCommitsAction(
  projectId: string,
  selectedCommits: string[],
  platform: 'linkedin' | 'twitter' | 'devto' | 'release_notes' | 'newsletter',
  customInstructions?: string
) {
  const userId = await requireAuth();

  try {
    const integration = await cmsDb.getIntegration(projectId, 'github');
    if (!integration) {
      throw new Error('No active GitHub integration connected to project.');
    }

    const settings = integration.settings ? JSON.parse(integration.settings) : {};
    const cachedSummary = settings.aiSummary || 'Project is an engineering pipeline repository.';
    const metadata = integration.metadata ? JSON.parse(integration.metadata) : {};

    const commitsList = metadata.commits || [];
    const matchedCommits = commitsList.filter((c: any) => selectedCommits.includes(c.sha));
    const changesText = matchedCommits.length > 0
      ? matchedCommits.map((c: any) => `- ${c.message}`).join('\n')
      : 'Manual draft trigger for engineering changes.';

    const summaryContext = {
      repoName: metadata.repoName || 'Showcase Project',
      description: metadata.description || 'Developer product container.',
      changeType: 'Engineering update',
      changeSummary: `AI Post generated from selected repository commits:\n${changesText}\n\nProject Context:\n${cachedSummary}\n\nUser instructions: ${customInstructions || 'Make it engaging and direct.'}`,
      technologies: metadata.languages || ['TypeScript'],
      previousPosts: []
    };

    const memory = {
      writingStyle: 'Direct and professional. Avoid buzzwords.',
      preferredHashtags: ['buildinpublic', 'developer', 'softwareengineering'],
      preferredEmojis: ['🚀', '💻', '🛠️'],
      ctaStyle: 'Check out the live demo and give us a star on GitHub!',
      tone: 'insightful',
      audience: 'developers'
    };

    const batchResult = await generateBatchDrafts(summaryContext, memory, 'gpt-4o-mini');
    const result = batchResult[platform] || batchResult.linkedin;

    const slug = `${platform}-update-${Date.now().toString().slice(-4)}`;
    
    const cmsDraft = await cmsDb.createProject({
      title: result.title,
      slug,
      description: `Draft update generated for ${platform}`,
      content: result.content,
      status: 'DRAFT',
      type: platform === 'release_notes' ? 'release_notes' : 'update',
      authorId: userId,
      projectId 
    });

    const project = await cmsDb.getDeveloperProjectById(projectId);
    revalidatePath(`/projects/${project?.slug}/dashboard`);

    return { success: true, draft: cmsDraft };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to generate AI draft.' };
  }
}

// 9. Manage Project Contributors
export async function saveProjectContributorAction(data: {
  id?: string;
  projectId: string;
  userId?: string | null;
  email?: string | null;
  name?: string | null;
  role?: string;
}) {
  await requireAuth();
  try {
    const contributor = await cmsDb.upsertProjectContributor(data);
    const project = await cmsDb.getDeveloperProjectById(data.projectId);
    if (project?.slug) {
      revalidatePath(`/projects/${project.slug}`);
      revalidatePath(`/projects/${project.slug}/dashboard`);
    }
    return { success: true, contributor };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save contributor.' };
  }
}

export async function deleteProjectContributorAction(id: string, projectId: string) {
  await requireAuth();
  try {
    await cmsDb.deleteProjectContributor(id);
    const project = await cmsDb.getDeveloperProjectById(projectId);
    if (project?.slug) {
      revalidatePath(`/projects/${project.slug}`);
      revalidatePath(`/projects/${project.slug}/dashboard`);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to remove contributor.' };
  }
}

// 10. Create Project Version Release
export async function createProjectVersionAction(data: {
  projectId: string;
  version: string;
  changelog: string;
  releaseNotes?: string;
}) {
  await requireAuth();
  try {
    const version = await cmsDb.createProjectVersion(data);
    
    // Auto timeline event
    await cmsDb.createTimelineEvent({
      projectId: data.projectId,
      title: `Released ${data.version}`,
      description: data.changelog,
      type: 'release',
      date: new Date()
    });

    const project = await cmsDb.getDeveloperProjectById(data.projectId);
    if (project?.slug) {
      revalidatePath(`/projects/${project.slug}`);
      revalidatePath(`/projects/${project.slug}/dashboard`);
    }
    return { success: true, version };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create version release.' };
  }
}

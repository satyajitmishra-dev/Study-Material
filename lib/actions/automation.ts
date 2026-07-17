'use server';

import { revalidatePath } from 'next/cache';
import { automationDb } from '@/lib/database/automationDb';
import { processQueue, processScheduledPublishing } from '@/lib/automation/eventQueue';
import { generateBatchDrafts } from '@/lib/automation/contentGenerator';
import { fetchRepoMetadata, fetchRepoReadme, fetchCommitDetails, fetchPullRequestDetails } from '@/lib/automation/github';
import { analyzeLocalChanges } from '@/lib/automation/localAnalyzer';
import { detectFeatures, classifyChangeCategory } from '@/lib/automation/featureDetector';
import { getFlatTechnologies } from '@/lib/automation/techParser';
import { getProvider } from '@/lib/automation/publisher';

/**
 * Creates or updates a connected repository configuration
 */
export async function saveRepositoryAction(data: {
  id?: string;
  workspaceId: string;
  owner: string;
  name: string;
  description?: string;
  branchFilters: string[];
  ignorePaths: string[];
  ignoreCommits: string[];
  aiWritingStyle: string;
  aiModel: string;
  webhookSecret?: string;
  isActive?: boolean;
}) {
  try {
    if (data.id) {
      const updated = await automationDb.updateRepository(data.id, {
        owner: data.owner,
        name: data.name,
        description: data.description,
        branchFilters: data.branchFilters,
        ignorePaths: data.ignorePaths,
        ignoreCommits: data.ignoreCommits,
        aiWritingStyle: data.aiWritingStyle,
        aiModel: data.aiModel,
        webhookSecret: data.webhookSecret,
        isActive: data.isActive !== undefined ? data.isActive : true,
      });
      revalidatePath('/admin/automation');
      return { success: true, repository: updated };
    } else {
      const created = await automationDb.createRepository(data);
      revalidatePath('/admin/automation');
      return { success: true, repository: created };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Removes a connected repository
 */
export async function deleteRepositoryAction(id: string) {
  try {
    await automationDb.deleteRepository(id);
    revalidatePath('/admin/automation');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Saves publishing credentials securely (encodes tokens in the action)
 */
export async function saveCredentialAction(data: {
  workspaceId: string;
  platform: string;
  token: string;
  secret?: string;
  settings?: string;
}) {
  try {
    const cred = await automationDb.saveCredential(data);
    revalidatePath('/admin/automation');
    return { success: true, credential: cred };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Deletes publishing credentials
 */
export async function deleteCredentialAction(id: string) {
  try {
    await automationDb.deleteCredential(id);
    revalidatePath('/admin/automation');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Updates content draft metadata (content, title, scheduled publication times)
 */
export async function updateDraftAction(id: string, data: {
  title?: string;
  content?: string;
  status?: string;
  scheduledAt?: Date | null;
  timezone?: string;
  changedBy?: string;
}) {
  try {
    const updated = await automationDb.updateDraft(id, data);
    revalidatePath('/admin/automation');
    return { success: true, draft: updated };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Deletes a draft
 */
export async function deleteDraftAction(id: string) {
  try {
    await automationDb.deleteDraft(id);
    revalidatePath('/admin/automation');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * AI-Regenerates content for a draft using updated prompt templates & style guides
 */
export async function regenerateDraftAction(draftId: string) {
  try {
    const draft = await automationDb.getDraftById(draftId);
    if (!draft) throw new Error('Draft not found.');

    const repo = await automationDb.getRepositoryById(draft.repositoryId);
    if (!repo) throw new Error('Repository configuration missing.');

    const templates = await automationDb.getTemplates(repo.workspaceId);
    const tmpl = templates.find(t => t.platform === draft.platform);
    if (!tmpl) throw new Error(`Prompt template for platform ${draft.platform} not found.`);

    const memory = await automationDb.getAiMemory(repo.workspaceId) || {
      writingStyle: 'Direct and professional.',
      preferredHashtags: [],
      preferredEmojis: [],
      ctaStyle: '',
      tone: 'professional',
      audience: 'developers',
    };

    let files: any[] = [];
    let commitMessage = 'Manual regeneration';
    let prTitle = '';
    let prBody = '';
    let prLabels: string[] = [];

    // Get event detail if linked
    if (draft.eventId) {
      const event = await automationDb.getEventById(draft.eventId);
      if (event) {
        commitMessage = event.message || '';
        if (event.eventType === 'push' && event.sha) {
          const commit = await fetchCommitDetails(repo.owner, repo.name, event.sha);
          files = commit.files;
        } else if (event.eventType === 'pull_request' && event.payload) {
          const payload = JSON.parse(event.payload);
          const prNumber = payload.pull_request?.number;
          if (prNumber) {
            const pr = await fetchPullRequestDetails(repo.owner, repo.name, prNumber);
            prTitle = pr.title;
            prBody = pr.body;
            prLabels = pr.labels;
          }
        }
      }
    }

    const metadata = await fetchRepoMetadata(repo.owner, repo.name);
    
    // Local analysis (no AI)
    const localAnalysis = analyzeLocalChanges(commitMessage, files, repo.ignorePaths, repo.ignoreCommits);
    const modules = detectFeatures(localAnalysis.meaningfulFiles);
    const category = classifyChangeCategory(localAnalysis.commitTitle, localAnalysis.meaningfulFiles);
    const techStack = getFlatTechnologies();
    
    const recentDrafts = await automationDb.getDrafts(repo.workspaceId);
    const previousPosts = recentDrafts.slice(0, 3).map(d => d.title);

    const summaryContext = {
      repoName: `${repo.owner}/${repo.name}`,
      description: repo.description || metadata.description || '',
      changeType: category,
      changeSummary: `Pushed an engineering update affecting ${localAnalysis.filesChanged} files in ${localAnalysis.foldersAffected.join(', ')} directories. insertions: +${localAnalysis.insertions}, deletions: -${localAnalysis.deletions}. Affected features: ${modules.join(', ')}.`,
      technologies: techStack,
      prTitle,
      prBody,
      prLabels,
      previousPosts,
    };

    // Trigger Generation (Single-request multi-output)
    const batchResult = await generateBatchDrafts(summaryContext, memory, repo.aiModel);
    
    // Pick the selected platform content
    const result = batchResult[draft.platform as 'linkedin' | 'twitter' | 'devto' | 'release_notes' | 'newsletter'] || batchResult.linkedin;

    // Save as next version
    const updated = await automationDb.updateDraft(draftId, {
      title: result.title,
      content: result.content,
      aiConfidence: result.aiConfidence,
      qualityScore: result.qualityScore,
      readabilityScore: result.readabilityScore,
      estimatedEngagement: result.estimatedEngagement,
      readingTimeMin: result.readingTimeMin,
      tokenCost: batchResult.tokenCost / 5, // Split token cost
      changedBy: 'AI',
    });

    revalidatePath('/admin/automation');
    return { success: true, draft: updated };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Generates multi-platform content drafts (LinkedIn, X, Dev.to, Release Notes, Newsletter)
 * and saves all outputs immediately as draft records (Draft-first creation).
 */
export async function generateMultiPlatformDraftsAction(repositoryId: string, customTopic?: string) {
  try {
    const repo = await automationDb.getRepositoryById(repositoryId);
    if (!repo) throw new Error('Repository configuration missing.');

    const memory = await automationDb.getAiMemory(repo.workspaceId) || {
      writingStyle: 'Direct and professional.',
      preferredHashtags: ['developer', 'opensource'],
      preferredEmojis: ['🚀', '💻'],
      ctaStyle: 'Check out the repository!',
      tone: 'technical',
      audience: 'developers',
    };

    const metadata = await fetchRepoMetadata(repo.owner, repo.name);
    const summaryContext = {
      repoName: `${repo.owner}/${repo.name}`,
      description: customTopic || repo.description || metadata.description || 'Developer platform feature update',
      changeType: 'feature',
      changeSummary: customTopic || `Generated comprehensive technical update for ${repo.name}`,
      technologies: repo.languages || ['TypeScript', 'Next.js'],
      previousPosts: [],
    };

    const batchResult = await generateBatchDrafts(summaryContext, memory, repo.aiModel);
    const platforms: Array<'linkedin' | 'twitter' | 'devto' | 'release_notes' | 'newsletter'> = [
      'linkedin',
      'twitter',
      'devto',
      'release_notes',
      'newsletter'
    ];

    const createdDrafts: any[] = [];
    for (const platform of platforms) {
      const output = batchResult[platform];
      if (!output) continue;

      const draft = await automationDb.createDraft({
        repositoryId,
        title: output.title || `${platform.toUpperCase()} Update`,
        platform,
        content: output.content,
        status: 'DRAFT',
        aiConfidence: output.aiConfidence,
        qualityScore: output.qualityScore,
        readabilityScore: output.readabilityScore,
        estimatedEngagement: output.estimatedEngagement,
        readingTimeMin: output.readingTimeMin,
        tokenCost: (batchResult.tokenCost || 0) / 5,
      });

      createdDrafts.push(draft);
    }

    revalidatePath('/admin/automation');
    return { success: true, drafts: createdDrafts };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Restores a draft to a selected previous version from its history
 */
export async function restoreDraftVersionAction(draftId: string, versionId: string) {
  try {
    const restored = await automationDb.restoreDraftVersion(draftId, versionId);
    revalidatePath('/admin/automation');
    return { success: true, draft: restored };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Publishes a draft instantly to target platform
 */
export async function publishDraftAction(draftId: string) {
  try {
    const draft = await automationDb.getDraftById(draftId);
    if (!draft) throw new Error('Draft not found.');

    const repo = await automationDb.getRepositoryById(draft.repositoryId);
    if (!repo) throw new Error('Repository not found.');

    const cred = await automationDb.getCredentialByPlatform(repo.workspaceId, draft.platform);
    if (!cred) throw new Error(`Publishing credential not set up for platform ${draft.platform}.`);

    const settings = cred.settings ? JSON.parse(cred.settings) : {};
    settings.token = cred.token;
    settings.secret = cred.secret;

    const publisher = getProvider(draft.platform);
    const res = await publisher.publish(draft.content, draft.title, settings);

    if (res.success) {
      await automationDb.updateDraft(draftId, {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        publishUrl: res.url,
        publishError: null,
      });

      // Update analytics
      const currentPeriod = new Date().toISOString().slice(0, 7);
      await automationDb.incrementUsage(repo.workspaceId, currentPeriod, 0, 0, 1, 0.0);

      revalidatePath('/admin/automation');
      return { success: true, url: res.url };
    } else {
      throw new Error(res.error || 'API Publishing failed.');
    }
  } catch (err: any) {
    await automationDb.updateDraft(draftId, {
      publishError: err.message,
    });
    revalidatePath('/admin/automation');
    return { success: false, error: err.message };
  }
}

/**
 * Saves Workspace AI memory (style profile) settings
 */
export async function saveAiMemoryAction(workspaceId: string, data: {
  writingStyle: string;
  preferredHashtags: string[];
  preferredEmojis: string[];
  ctaStyle: string;
  tone: string;
  audience: string;
}) {
  try {
    const updated = await automationDb.updateAiMemory(workspaceId, data);
    revalidatePath('/admin/automation');
    return { success: true, memory: updated };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Creates custom templates or updates default prompts
 */
export async function saveTemplateAction(data: {
  id?: string;
  workspaceId: string;
  name: string;
  platform: string;
  systemPrompt: string;
  userPrompt: string;
}) {
  try {
    if (data.id) {
      const updated = await automationDb.updateTemplate(data.id, {
        name: data.name,
        systemPrompt: data.systemPrompt,
        userPrompt: data.userPrompt,
      });
      revalidatePath('/admin/automation');
      return { success: true, template: updated };
    } else {
      const created = await automationDb.createTemplate(data);
      revalidatePath('/admin/automation');
      return { success: true, template: created };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Manually forces processing of pending background queue events
 */
export async function forceQueueProcessAction() {
  try {
    const queueRes = await processQueue();
    const pubRes = await processScheduledPublishing();
    revalidatePath('/admin/automation');
    return {
      success: true,
      processed: queueRes.processedCount,
      published: pubRes.publishedCount,
      logs: [...queueRes.logs, ...pubRes.logs],
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

import { automationDb } from '../database/automationDb';
import { fetchRepoReadme, fetchCommitDetails, fetchPullRequestDetails } from './github';
import { analyzeLocalChanges } from './localAnalyzer';
import { detectFeatures, classifyChangeCategory } from './featureDetector';
import { getFlatTechnologies } from './techParser';
import { generateBatchDrafts } from './contentGenerator';
import { validatePlatformConstraints } from './qualityChecker';
import { getProvider } from './publisher';

/**
 * Pushes a new GitHub webhook event into the DB-backed queue
 */
export async function pushToQueue(data: {
  owner: string;
  name: string;
  idempotencyKey: string;
  eventType: string;
  action?: string | null;
  ref?: string | null;
  sha?: string | null;
  author?: string | null;
  message?: string | null;
  payload: string;
}): Promise<{ status: string; eventId?: string; error?: string }> {
  const repo = await automationDb.getRepositoryByFullName(data.owner, data.name);
  if (!repo) {
    return { status: 'ignored', error: `Repository ${data.owner}/${data.name} is not connected.` };
  }
  if (!repo.isActive) {
    return { status: 'ignored', error: `Repository ${data.owner}/${data.name} automation is inactive.` };
  }

  const existing = await automationDb.getEventByIdempotencyKey(data.idempotencyKey);
  if (existing) {
    return { status: 'duplicate', eventId: existing.id };
  }

  const event = await automationDb.createEvent({
    repositoryId: repo.id,
    idempotencyKey: data.idempotencyKey,
    eventType: data.eventType,
    action: data.action,
    ref: data.ref,
    sha: data.sha,
    author: data.author,
    message: data.message,
    payload: data.payload,
    status: 'pending',
  });

  return { status: 'enqueued', eventId: event.id };
}

/**
 * Runs the Token-Optimized Queue processing pipeline.
 * Performs all parsing locally, then runs a single LLM request for all drafts.
 */
export async function processQueue(): Promise<{ processedCount: number; logs: string[] }> {
  const logs: string[] = [];
  const pendingEvents = await automationDb.getPendingQueueEvents(5);
  let processedCount = 0;

  for (const event of pendingEvents) {
    processedCount++;
    const startTime = Date.now();
    const stepLogs: { time: string; message: string; step: string }[] = [];

    const logStep = (message: string, step: string) => {
      const time = new Date().toISOString();
      stepLogs.push({ time, message, step });
      logs.push(`[Event ${event.id}] [${step}] ${message}`);
    };

    logStep('Starting queue event processing', 'start');

    try {
      await automationDb.updateEvent(event.id, {
        status: 'processing',
        processingLogs: JSON.stringify(stepLogs),
      });

      const repo = await automationDb.getRepositoryById(event.repositoryId);
      if (!repo) throw new Error('Repository not found.');

      // 1. Fetch raw details from GitHub API
      logStep('Fetching commit/PR details from GitHub API', 'github');
      let files: any[] = [];
      let commitMessage = event.message || '';
      let prTitle = '';
      let prBody = '';
      let prLabels: string[] = [];

      if (event.eventType === 'push' && event.sha) {
        const commit = await fetchCommitDetails(repo.owner, repo.name, event.sha);
        files = commit.files;
        commitMessage = commit.message;
      } else if (event.eventType === 'pull_request' && event.payload) {
        const payload = JSON.parse(event.payload);
        const prNumber = payload.pull_request?.number;
        if (prNumber) {
          const pr = await fetchPullRequestDetails(repo.owner, repo.name, prNumber);
          prTitle = pr.title;
          prBody = pr.body;
          prLabels = pr.labels;
          if (pr.mergeCommitSha) {
            const commit = await fetchCommitDetails(repo.owner, repo.name, pr.mergeCommitSha);
            files = commit.files;
          }
        }
      }

      // 2. Local Change Analyzer (No AI)
      logStep('Analyzing files and commit messages locally', 'local_analyzer');
      const analysis = analyzeLocalChanges(commitMessage, files, repo.ignorePaths, repo.ignoreCommits);

      if (!analysis.isMeaningful) {
        logStep(`Smart Filter: Ignored changes. Reason: ${analysis.reason}`, 'ignore');
        await automationDb.updateEvent(event.id, {
          status: 'completed',
          processingLogs: JSON.stringify(stepLogs),
          latencyMs: Date.now() - startTime,
        });
        continue;
      }

      // 3. Local Feature Detection Engine (No AI)
      logStep('Detecting software modules locally from folder paths', 'feature_detector');
      const modules = detectFeatures(analysis.meaningfulFiles);
      const category = classifyChangeCategory(analysis.commitTitle, analysis.meaningfulFiles);
      logStep(`Locally classified change as: "${category}" (Modules: ${modules.join(', ')})`, 'feature_detector_complete');

      // 4. Local Technology Detection Parser (No AI)
      logStep('Parsing local package dependency stack', 'tech_parser');
      const techStack = getFlatTechnologies();

      // 5. Assemble AI Context using local metadata (Token Optimized)
      logStep('Assembling token-optimized summary. No raw files sent to AI.', 'summary_builder');
      
      const templates = await automationDb.getTemplates(repo.workspaceId);
      const memory = await automationDb.getAiMemory(repo.workspaceId) || {
        writingStyle: 'Direct and professional.',
        preferredHashtags: [],
        preferredEmojis: [],
        ctaStyle: '',
        tone: 'professional',
        audience: 'developers',
      };

      const recentDrafts = await automationDb.getDrafts(repo.workspaceId);
      const previousPosts = recentDrafts.slice(0, 3).map(d => d.title);

      const summaryContext = {
        repoName: `${repo.owner}/${repo.name}`,
        description: repo.description || 'N/A',
        readme: '', // OMIT raw Readme to optimize tokens!
        commitMessage: analysis.commitMessage,
        changeType: category,
        changeSummary: `Pushed an engineering update affecting ${analysis.filesChanged} files in ${analysis.foldersAffected.join(', ')} directories. insertions: +${analysis.insertions}, deletions: -${analysis.deletions}. Affected features: ${modules.join(', ')}.`,
        technologies: techStack,
        prTitle,
        prBody,
        prLabels,
        previousPosts,
      };

      // 6. Single AI API call to generate all drafts
      logStep('Calling OpenAI for single-request multi-platform content generation', 'ai_generation');
      const batchResult = await generateBatchDrafts(summaryContext, memory, repo.aiModel);
      logStep('All drafts generated in single call. Executing safety scans...', 'ai_generation_complete');

      const platforms = ['linkedin', 'twitter', 'devto', 'release_notes', 'newsletter'] as const;
      let generatedDraftsCount = 0;

      for (const platform of platforms) {
        const draft = batchResult[platform];
        
        // 7. Local Quality & Safety Check
        const check = validatePlatformConstraints(platform, draft.content, draft.title);
        
        let draftStatus = 'draft';
        let publishError: string | null = null;
        if (!check.success) {
          draftStatus = 'needs_review';
          publishError = check.errors.join('; ');
          logStep(`Safety check warning on ${platform}: ${publishError}`, 'quality_check_warning');
        } else if (repo.aiWritingStyle === 'auto_publish') {
          draftStatus = 'approved';
        }

        // Save ContentDraft in database
        const createdDraft = await automationDb.createDraft({
          repositoryId: repo.id,
          eventId: event.id,
          title: draft.title,
          platform,
          content: draft.content,
          status: draftStatus,
          timezone: 'UTC',
          aiConfidence: draft.aiConfidence,
          qualityScore: draft.qualityScore,
          readabilityScore: draft.readabilityScore,
          estimatedEngagement: draft.estimatedEngagement,
          readingTimeMin: draft.readingTimeMin,
          tokenCost: batchResult.tokenCost / platforms.length, // Split token cost
        });

        if (publishError) {
          await automationDb.updateDraft(createdDraft.id, { publishError });
        }

        generatedDraftsCount++;
      }

      // 8. Update billing usage records
      const currentPeriod = new Date().toISOString().slice(0, 7);
      await automationDb.incrementUsage(
        repo.workspaceId,
        currentPeriod,
        Math.ceil(batchResult.tokenCost * 500000), // Estimate tokens
        generatedDraftsCount,
        0,
        batchResult.tokenCost
      );

      logStep(`Event completed successfully. Created ${generatedDraftsCount} drafts.`, 'complete');
      await automationDb.updateEvent(event.id, {
        status: 'completed',
        analysis: JSON.stringify({ changeType: category, modules, techStack }),
        processingLogs: JSON.stringify(stepLogs),
        latencyMs: Date.now() - startTime,
      });

    } catch (err: any) {
      logStep(`Critical queue execution error: ${err.message}`, 'error');
      
      const retryCount = event.retryCount + 1;
      const status = retryCount >= 5 ? 'failed' : 'failed'; // DLQ fallback
      const backoffSecs = Math.pow(2, retryCount) * 10;
      const nextRunAt = new Date(Date.now() + backoffSecs * 1000);

      await automationDb.updateEvent(event.id, {
        status,
        retryCount,
        nextRunAt,
        errorMessage: err.message,
        processingLogs: JSON.stringify(stepLogs),
        latencyMs: Date.now() - startTime,
      });
    }
  }

  return { processedCount, logs };
}

/**
 * Timezone-aware Cron scheduler for automated publication of Scheduled drafts
 */
export async function processScheduledPublishing(): Promise<{ publishedCount: number; logs: string[] }> {
  const logs: string[] = [];
  const scheduled = await automationDb.getScheduledDrafts();
  let publishedCount = 0;

  for (const draft of scheduled) {
    logs.push(`[Scheduler] Processing scheduled draft ${draft.id} for platform ${draft.platform}`);
    
    try {
      const cred = await automationDb.getCredentialByPlatform(draft.repository.workspaceId, draft.platform);
      if (!cred) {
        throw new Error(`Publishing credential not set up for platform: ${draft.platform}`);
      }

      const settings = cred.settings ? JSON.parse(cred.settings) : {};
      settings.token = cred.token;
      settings.secret = cred.secret;

      const publisher = getProvider(draft.platform);
      const res = await publisher.publish(draft.content, draft.title, settings);

      if (res.success) {
        publishedCount++;
        await automationDb.updateDraft(draft.id, {
          status: 'published',
          publishedAt: new Date(),
          publishUrl: res.url,
          publishError: null,
        });
        
        const currentPeriod = new Date().toISOString().slice(0, 7);
        await automationDb.incrementUsage(draft.repository.workspaceId, currentPeriod, 0, 0, 1, 0.0);
        
        logs.push(`[Scheduler] Published draft ${draft.id} successfully. URL: ${res.url}`);
      } else {
        throw new Error(res.error || 'Unknown publishing error');
      }
    } catch (err: any) {
      logs.push(`[Scheduler] Publishing failed for draft ${draft.id}: ${err.message}`);
      await automationDb.updateDraft(draft.id, {
        status: 'approved',
        publishError: err.message,
      });
    }
  }

  return { publishedCount, logs };
}

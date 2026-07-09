import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { automationDb, seedAutomationSandbox } from '@/lib/database/automationDb';
import AutomationClient from '@/components/admin/AutomationClient';

export const dynamic = 'force-dynamic';

export default async function AutomationPage() {
  const session = await auth();
  const userId = session?.user?.id || 'sandbox-admin-id';

  // Seed fallback data for sandbox mode if DB is blank
  seedAutomationSandbox();

  const workspaces = await automationDb.getWorkspaces(userId);
  let activeWorkspace = workspaces[0];
  if (!activeWorkspace) {
    activeWorkspace = await automationDb.createWorkspace(userId, 'Default Workspace', 'default');
  }

  const workspaceId = activeWorkspace.id;
  const repositories = await automationDb.getRepositories(workspaceId);
  const drafts = await automationDb.getDrafts(workspaceId);
  const templates = await automationDb.getTemplates(workspaceId);
  const credentials = await automationDb.getCredentials(workspaceId);
  const aiMemory = await automationDb.getAiMemory(workspaceId);

  let events: any[] = [];
  if (repositories.length > 0) {
    events = await automationDb.getEvents(repositories[0].id, 30);
  } else {
    // If no repos, check in-memory directly
    events = await automationDb.getEvents('repo_sandbox_1', 30);
  }

  const currentPeriod = new Date().toISOString().slice(0, 7);
  const usage = await automationDb.getUsage(workspaceId, currentPeriod) || {
    tokensUsed: 0,
    postsGenerated: 0,
    postsPublished: 0,
    estimatedCostUsd: 0.0,
  };

  const initialData = {
    workspaces: workspaces.map(w => ({ id: w.id, name: w.name, slug: w.slug, billingTier: w.billingTier })),
    activeWorkspace: { id: activeWorkspace.id, name: activeWorkspace.name, slug: activeWorkspace.slug, billingTier: activeWorkspace.billingTier },
    repositories: repositories.map(r => ({
      id: r.id,
      owner: r.owner,
      name: r.name,
      description: r.description,
      languages: r.languages,
      topics: r.topics,
      branchFilters: r.branchFilters,
      ignorePaths: r.ignorePaths,
      ignoreCommits: r.ignoreCommits,
      aiWritingStyle: r.aiWritingStyle,
      aiModel: r.aiModel,
      webhookSecret: r.webhookSecret,
      isActive: r.isActive,
    })),
    events: events.map(e => ({
      id: e.id,
      repositoryId: e.repositoryId,
      eventType: e.eventType,
      ref: e.ref,
      sha: e.sha,
      author: e.author,
      message: e.message,
      status: e.status,
      retryCount: e.retryCount,
      nextRunAt: e.nextRunAt.toISOString(),
      errorMessage: e.errorMessage,
      latencyMs: e.latencyMs,
      processingLogs: e.processingLogs,
      createdAt: e.createdAt.toISOString(),
    })),
    drafts: drafts.map(d => ({
      id: d.id,
      repositoryId: d.repositoryId,
      eventId: d.eventId,
      title: d.title,
      platform: d.platform,
      content: d.content,
      status: d.status,
      scheduledAt: d.scheduledAt ? d.scheduledAt.toISOString() : null,
      timezone: d.timezone,
      publishedAt: d.publishedAt ? d.publishedAt.toISOString() : null,
      publishUrl: d.publishUrl,
      publishError: d.publishError,
      aiConfidence: d.aiConfidence,
      qualityScore: d.qualityScore,
      readabilityScore: d.readabilityScore,
      estimatedEngagement: d.estimatedEngagement,
      readingTimeMin: d.readingTimeMin,
      tokenCost: d.tokenCost,
      createdAt: d.createdAt.toISOString(),
    })),
    templates: templates.map(t => ({
      id: t.id,
      name: t.name,
      platform: t.platform,
      systemPrompt: t.systemPrompt,
      userPrompt: t.userPrompt,
      isCustom: t.isCustom,
    })),
    credentials: credentials.map(c => ({
      id: c.id,
      platform: c.platform,
      settings: c.settings,
      isActive: c.isActive,
    })),
    aiMemory: aiMemory ? {
      writingStyle: aiMemory.writingStyle,
      preferredHashtags: aiMemory.preferredHashtags,
      preferredEmojis: aiMemory.preferredEmojis,
      ctaStyle: aiMemory.ctaStyle,
      tone: aiMemory.tone,
      audience: aiMemory.audience,
    } : {
      writingStyle: 'Direct and professional.',
      preferredHashtags: [],
      preferredEmojis: [],
      ctaStyle: '',
      tone: 'professional',
      audience: 'developers',
    },
    usage: {
      tokensUsed: usage.tokensUsed,
      postsGenerated: usage.postsGenerated,
      postsPublished: usage.postsPublished,
      estimatedCostUsd: usage.estimatedCostUsd,
    }
  };

  return <AutomationClient initialData={initialData} />;
}

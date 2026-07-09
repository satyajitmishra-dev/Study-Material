'use server';

import { auth } from '@/auth';
import { cmsDb, CmsProject, CmsVersion, CmsMedia, CmsAnalytics } from '@/lib/database/cmsDb';
import { CmsProjectSchema, CmsMediaSchema } from '@/lib/validation/cms';
import { rateLimit } from '@/lib/security/rateLimit';
import { revalidatePath } from 'next/cache';

// Helper to check user session, active status, and role permissions
async function checkAuth(requiredRoles: Array<'admin' | 'editor' | 'author' | 'viewer'> = ['admin', 'editor', 'author']) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('UNAUTHENTICATED');
  }

  const role = (session.user as any).role as 'admin' | 'editor' | 'author' | 'viewer' || 'viewer';
  const status = (session.user as any).status as 'active' | 'disabled' || 'disabled';

  if (status !== 'active') {
    throw new Error('USER_DISABLED');
  }

  if (!requiredRoles.includes(role)) {
    throw new Error('FORBIDDEN');
  }

  return {
    userId: session.user.id!,
    userEmail: session.user.email!,
    userName: session.user.name || session.user.email!.split('@')[0],
    role,
  };
}

// 1. Projects Action: Create or Update Project
export async function saveProjectAction(
  projectId: string | null,
  rawPayload: any
) {
  // Rate limiting (max 40 saves per minute per user)
  const sessionUser = await auth();
  const limitKey = sessionUser?.user?.id || 'anonymous';
  const limitCheck = rateLimit(`save_${limitKey}`, 40, 60000);
  if (!limitCheck.success) {
    return { success: false, error: 'RATE_LIMIT_EXCEEDED', reset: limitCheck.reset };
  }

  try {
    const actor = await checkAuth(['admin', 'editor', 'author']);

    // Input validation & Sanitization
    const parsed = CmsProjectSchema.safeParse(rawPayload);
    if (!parsed.success) {
      return { success: false, error: 'VALIDATION_FAILED', details: parsed.error.format() };
    }

    const inputData = parsed.data;

    // Check slug uniqueness
    const existing = await cmsDb.getProjectBySlug(inputData.slug);
    if (existing && existing.id !== projectId) {
      return { success: false, error: 'DUPLICATE_SLUG' };
    }

    let project: CmsProject;

    if (projectId) {
      // Edit mode permission check: authors can only edit their own work
      const original = await cmsDb.getProjectById(projectId);
      if (!original) {
        return { success: false, error: 'PROJECT_NOT_FOUND' };
      }
      
      if (actor.role === 'author' && original.authorId !== actor.userId) {
        return { success: false, error: 'FORBIDDEN' };
      }

      // Enforce status checks: only admins/editors can publish directly
      let targetStatus = inputData.status;
      let publishedAt = original.publishedAt;

      if (targetStatus === 'published' && original.status !== 'published') {
        if (actor.role === 'author') {
          // Authors can only schedule or request draft reviews
          targetStatus = 'draft';
        } else {
          publishedAt = new Date();
        }
      }

      project = await cmsDb.updateProject(projectId, {
        title: inputData.title,
        slug: inputData.slug,
        description: inputData.description,
        category: inputData.category,
        tags: inputData.tags,
        language: inputData.language,
        visibility: inputData.visibility,
        thumbnail: inputData.thumbnail,
        coverImage: inputData.coverImage,
        content: inputData.content,
        seoTitle: inputData.seoTitle,
        seoDescription: inputData.seoDescription,
        seoKeywords: inputData.seoKeywords,
        ogImage: inputData.ogImage,
        canonical: inputData.canonical,
        robots: inputData.robots,
        schemaJson: inputData.schemaJson,
        seoScore: inputData.seoScore,
        status: targetStatus,
        scheduledAt: inputData.scheduledAt ? new Date(inputData.scheduledAt) : null,
        publishedAt,
        versionNote: inputData.versionNote,
      });

      // Create snapshot version history
      await cmsDb.createVersion({
        projectId: project.id,
        content: JSON.stringify(project),
        seoTitle: project.seoTitle,
        seoDescription: project.seoDescription,
        thumbnail: project.thumbnail,
        coverImage: project.coverImage,
        versionNote: inputData.versionNote || `Updated by ${actor.userName}`,
        authorId: actor.userId,
      });

      // Log Audit Event
      await cmsDb.logAudit({
        userId: actor.userId,
        action: 'UPDATE_PROJECT',
        targetType: 'CmsProject',
        targetId: project.id,
        details: JSON.stringify({ title: project.title, status: project.status, revision: inputData.versionNote }),
      });

    } else {
      // Create mode
      const now = new Date();
      project = await cmsDb.createProject({
        id: `proj_${Math.random().toString(36).substr(2, 9)}`,
        title: inputData.title,
        slug: inputData.slug,
        description: inputData.description ?? null,
        category: inputData.category ?? null,
        tags: inputData.tags,
        language: inputData.language,
        visibility: inputData.visibility,
        thumbnail: inputData.thumbnail ?? null,
        coverImage: inputData.coverImage ?? null,
        content: inputData.content,
        seoTitle: inputData.seoTitle ?? null,
        seoDescription: inputData.seoDescription ?? null,
        seoKeywords: inputData.seoKeywords ?? null,
        ogImage: inputData.ogImage ?? null,
        canonical: inputData.canonical ?? null,
        robots: inputData.robots ?? null,
        schemaJson: inputData.schemaJson ?? null,
        seoScore: inputData.seoScore,
        status: actor.role === 'author' ? 'draft' : inputData.status,
        scheduledAt: inputData.scheduledAt ? new Date(inputData.scheduledAt) : null,
        publishedAt: inputData.status === 'published' && actor.role !== 'author' ? now : null,
        versionNote: inputData.versionNote ?? null,
        createdAt: now,
        authorId: actor.userId,
      });

      // Create initial snapshot
      await cmsDb.createVersion({
        projectId: project.id,
        content: JSON.stringify(project),
        seoTitle: project.seoTitle,
        seoDescription: project.seoDescription,
        thumbnail: project.thumbnail,
        coverImage: project.coverImage,
        versionNote: 'Initial revision',
        authorId: actor.userId,
      });

      // Log Audit Event
      await cmsDb.logAudit({
        userId: actor.userId,
        action: 'CREATE_PROJECT',
        targetType: 'CmsProject',
        targetId: project.id,
        details: JSON.stringify({ title: project.title }),
      });
    }

    revalidatePath('/admin/projects');
    revalidatePath('/admin');
    return { success: true, project };

  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

// 2. Delete Project
export async function deleteProjectAction(projectId: string, softDelete: boolean = true) {
  try {
    const actor = await checkAuth(['admin', 'editor']);

    const original = await cmsDb.getProjectById(projectId);
    if (!original) {
      return { success: false, error: 'PROJECT_NOT_FOUND' };
    }

    // Only Admin can perform permanent delete, Editors only soft delete (archive)
    const canDeletePerm = actor.role === 'admin';
    const isSoft = softDelete || !canDeletePerm;

    await cmsDb.deleteProject(projectId, isSoft);

    await cmsDb.logAudit({
      userId: actor.userId,
      action: isSoft ? 'ARCHIVE_PROJECT' : 'DELETE_PROJECT',
      targetType: 'CmsProject',
      targetId: projectId,
      details: JSON.stringify({ title: original.title, type: isSoft ? 'soft' : 'hard' }),
    });

    revalidatePath('/admin/projects');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

// 3. Rollback Project Version
export async function rollbackVersionAction(versionId: string) {
  try {
    const actor = await checkAuth(['admin', 'editor']);

    const versionSnapshot = await cmsDb.getVersionById(versionId);
    if (!versionSnapshot) {
      return { success: false, error: 'VERSION_NOT_FOUND' };
    }

    const project = await cmsDb.getProjectById(versionSnapshot.projectId);
    if (!project) {
      return { success: false, error: 'PROJECT_NOT_FOUND' };
    }

    // Perform rollback update
    const updated = await cmsDb.updateProject(project.id, {
      content: versionSnapshot.content,
      seoTitle: versionSnapshot.seoTitle,
      seoDescription: versionSnapshot.seoDescription,
      thumbnail: versionSnapshot.thumbnail,
      coverImage: versionSnapshot.coverImage,
      versionNote: `Rolled back to snapshot from ${versionSnapshot.createdAt.toLocaleDateString()}`,
    });

    // Create a new version snapshot recording the rollback event
    await cmsDb.createVersion({
      projectId: project.id,
      content: updated.content,
      seoTitle: updated.seoTitle,
      seoDescription: updated.seoDescription,
      thumbnail: updated.thumbnail,
      coverImage: updated.coverImage,
      versionNote: `Rolled back revision (Restored: ${versionId})`,
      authorId: actor.userId,
    });

    await cmsDb.logAudit({
      userId: actor.userId,
      action: 'ROLLBACK_PROJECT',
      targetType: 'CmsProject',
      targetId: project.id,
      details: JSON.stringify({ title: project.title, restoredVersionId: versionId }),
    });

    revalidatePath('/admin/projects');
    revalidatePath(`/admin/projects/edit/${project.id}`);
    return { success: true, project: updated };
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

// 4. Media Actions: Upload Media Asset Info
export async function uploadMediaAction(rawPayload: any) {
  try {
    const actor = await checkAuth(['admin', 'editor', 'author']);

    const parsed = CmsMediaSchema.safeParse(rawPayload);
    if (!parsed.success) {
      return { success: false, error: 'VALIDATION_FAILED', details: parsed.error.format() };
    }

    const media = await cmsDb.createMedia(parsed.data);

    await cmsDb.logAudit({
      userId: actor.userId,
      action: 'UPLOAD_MEDIA',
      targetType: 'CmsMedia',
      targetId: media.id,
      details: JSON.stringify({ filename: media.filename, folder: media.folder }),
    });

    revalidatePath('/admin/media');
    return { success: true, media };
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

// 5. Delete Media
export async function deleteMediaAction(mediaId: string) {
  try {
    const actor = await checkAuth(['admin', 'editor']);

    const media = await cmsDb.deleteMedia(mediaId);

    await cmsDb.logAudit({
      userId: actor.userId,
      action: 'DELETE_MEDIA',
      targetType: 'CmsMedia',
      targetId: mediaId,
      details: JSON.stringify({ filename: media.filename }),
    });

    revalidatePath('/admin/media');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

// 6. Log View/Impression Analytics (Unauthenticated allowed for view counts)
export async function logAnalyticsAction(projectId: string, visitorId: string, referer?: string, country?: string) {
  // Limit analytics requests to prevent spam (max 20 requests/min per client)
  const clientLimit = rateLimit(`analytics_${visitorId}`, 20, 60000);
  if (!clientLimit.success) {
    return { success: false, error: 'RATE_LIMIT_EXCEEDED' };
  }

  try {
    // Increment project view count in database
    await cmsDb.incrementProjectViews(projectId);

    // Save full analytics tracker row
    const log = await cmsDb.logAnalytics({
      projectId,
      visitorId,
      userAgent: 'web',
      country: country || 'US',
      referer: referer || 'direct',
      views: 1,
      ctr: 0.05,
      bounceRate: 0.20,
      timeOnPage: 45,
    });

    return { success: true, log };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 7. AI Assistant Content Generation
export async function generateAiContentAction(
  prompt: string,
  mode: 'summarize' | 'rewrite' | 'faq' | 'seo'
) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'mock' || apiKey.includes('your_openai_key')) {
    // Elegant fallback simulation
    if (mode === 'summarize') {
      return { success: true, text: `SUMMARY: This document covers key technical parameters regarding Next.js 16 layouts and modern CSS springs. It describes the integration of automatic memoization and spring physical configurations.` };
    }
    if (mode === 'rewrite') {
      return { success: true, text: `Refactored content:\n\nThe architectural model utilizes a highly decoupled, stateful synchronization layout. By leveraging declarative render cycles, developers can eliminate boilerplate memoization checks, yielding massive performance gains.` };
    }
    if (mode === 'faq') {
      return { success: true, text: `### Frequently Asked Questions\n\n**Q: What is the primary benefit of the compiler?**\nA: Automated memoization removes the need for manual react dependencies tracking.\n\n**Q: Is there support for offline synchronization?**\nA: Yes, mutations are buffered in a queue and processed on reconnect.` };
    }
    return { success: true, text: JSON.stringify({ title: "Optimized Title Guidelines", description: "Comprehensive step-by-step developer tutorial detailing layouts and configurations." }) };
  }

  let systemPrompt = "You are an AI assistant helping a writer draft technical articles.";
  if (mode === 'summarize') systemPrompt = "Summarize the following text in exactly 2 sentences.";
  if (mode === 'rewrite') systemPrompt = "Rewrite the following text to make it sound highly professional, technical, and elegant, maintaining markdown elements.";
  if (mode === 'faq') systemPrompt = "Generate 3 FAQ questions and answers in Markdown format from the text.";
  if (mode === 'seo') systemPrompt = "Generate an optimized SEO Meta Title (under 60 chars) and Meta Description (under 160 chars) for this content. Format as JSON with keys 'title' and 'description'.";

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    return { success: true, text };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 8. Execute Scheduled Publication Queue
export async function executeScheduledPublishAction() {
  try {
    const actor = await checkAuth(['admin', 'editor']);
    
    // Fetch all scheduled projects
    const allProjects = await cmsDb.getProjects({ limit: 1000 });
    const now = new Date();
    
    const scheduledToPublish = allProjects.items.filter(p => 
      p.status === 'scheduled' && 
      p.scheduledAt && 
      new Date(p.scheduledAt) <= now
    );

    const publishedIds: string[] = [];

    for (const project of scheduledToPublish) {
      await cmsDb.updateProject(project.id, {
        status: 'published',
        publishedAt: now,
        versionNote: 'System publication: scheduled release trigger executed.'
      });

      await cmsDb.logAudit({
        userId: actor.userId,
        action: 'PUBLISH_SCHEDULED',
        targetType: 'CmsProject',
        targetId: project.id,
        details: JSON.stringify({ title: project.title }),
      });

      publishedIds.push(project.id);
    }

    if (publishedIds.length > 0) {
      revalidatePath('/admin/projects');
      revalidatePath('/admin/calendar');
    }

    return { success: true, count: publishedIds.length, publishedIds };
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

// 9. Rollback Project to a Historical Version
export async function rollbackProjectVersionAction(projectId: string, versionId: string) {
  try {
    const actor = await checkAuth(['admin', 'editor']);

    // Fetch the version snapshot
    const version = await cmsDb.getVersionById(versionId);
    if (!version || version.projectId !== projectId) {
      return { success: false, error: 'VERSION_NOT_FOUND' };
    }

    let snapshot: any;
    try {
      snapshot = JSON.parse(version.content);
    } catch (e) {
      snapshot = {
        title: version.seoTitle || 'Untitled Version',
        content: version.content,
        seoTitle: version.seoTitle,
        seoDescription: version.seoDescription,
        thumbnail: version.thumbnail,
        coverImage: version.coverImage,
        slug: 'restored-version',
        tags: [],
        status: 'draft',
      };
    }

    // Save project with snapshot content
    const res = await cmsDb.updateProject(projectId, {
      title: snapshot.title || 'Untitled Version',
      slug: snapshot.slug || `rollback-${Date.now()}`,
      description: snapshot.description ?? null,
      category: snapshot.category ?? null,
      tags: snapshot.tags || [],
      language: snapshot.language || 'en',
      visibility: snapshot.visibility || 'public',
      thumbnail: snapshot.thumbnail ?? null,
      coverImage: snapshot.coverImage ?? null,
      content: snapshot.content || '',
      seoTitle: snapshot.seoTitle ?? null,
      seoDescription: snapshot.seoDescription ?? null,
      seoKeywords: snapshot.seoKeywords ?? null,
      ogImage: snapshot.ogImage ?? null,
      canonical: snapshot.canonical ?? null,
      robots: snapshot.robots ?? null,
      schemaJson: snapshot.schemaJson ?? null,
      seoScore: snapshot.seoScore || 0,
      status: snapshot.status || 'draft',
      scheduledAt: snapshot.scheduledAt ? new Date(snapshot.scheduledAt) : null,
      publishedAt: snapshot.publishedAt ? new Date(snapshot.publishedAt) : null,
      versionNote: `Rollback to Version (Author: ${version.authorId})`,
    });

    // Create a new version log for this rollback revision
    const now = new Date();
    await cmsDb.createVersion({
      projectId,
      content: JSON.stringify(res),
      versionNote: `System Rollback: Restored historical version`,
      seoTitle: res.seoTitle,
      seoDescription: res.seoDescription,
      thumbnail: res.thumbnail,
      coverImage: res.coverImage,
      authorId: actor.userId,
    });

    await cmsDb.logAudit({
      userId: actor.userId,
      action: 'ROLLBACK_PROJECT_VERSION',
      targetType: 'CmsProject',
      targetId: projectId,
      details: JSON.stringify({ versionId }),
    });

    revalidatePath('/admin/projects');
    revalidatePath(`/admin/projects/edit/${projectId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

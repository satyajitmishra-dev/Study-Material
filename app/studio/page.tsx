import React from 'react';
import { auth } from '@/auth';
import { cmsDb } from '@/lib/database/cmsDb';
import DashboardClient from '@/components/admin/DashboardClient';
import { getActiveProject } from '@/lib/actions/projectContext';
import { getPrisma } from '@/lib/database/dbClient';

export const dynamic = 'force-dynamic';

export default async function StudioDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const userId = session.user.id!;
  const role = (session.user as any).role || 'user';

  const { projectId } = await getActiveProject();

  // Query CMS metrics on the server scoped to project container
  const { items: allProjects } = await cmsDb.getProjects({ limit: 1000, projectId });
  const { total: mediaCount } = await cmsDb.getMedia({ limit: 1, projectId });
  const allAuditLogs = await cmsDb.getAuditLogs(undefined, 100, projectId);

  // Creators can only see their own posts and activity in the Studio dashboard
  const projects = allProjects.filter(p => p.authorId === userId);
  const auditLogs = allAuditLogs.filter(l => l.userId === userId);

  const publishedCount = projects.filter(p => p.status === 'PUBLISHED').length;
  const draftsCount = projects.filter(p => p.status === 'DRAFT').length;
  const totalViews = projects.reduce((sum, p) => sum + p.views, 0);

  const prisma = getPrisma();
  let likesCount = 0;
  let commentsCount = 0;
  let bookmarksCount = 0;
  let followersCount = 0;

  if (prisma) {
    likesCount = await prisma.reaction.count({
      where: { project: { authorId: userId } }
    });
    commentsCount = await prisma.comment.count({
      where: { project: { authorId: userId } }
    });
    bookmarksCount = await prisma.bookmark.count({
      where: { project: { authorId: userId } }
    });
    followersCount = await prisma.follow.count({
      where: { targetType: 'DEVELOPER', targetId: userId }
    });
  }

  const initialData = {
    totalProjects: projects.length,
    publishedCount,
    draftsCount,
    totalViews,
    mediaCount,
    likesCount,
    commentsCount,
    bookmarksCount,
    followersCount,
    recentProjects: projects.slice(0, 10).map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      status: p.status,
      views: p.views,
      updatedAt: p.updatedAt.toISOString(),
    })),
    auditLogs: auditLogs.slice(0, 10).map(l => ({
      id: l.id,
      action: l.action,
      targetType: l.targetType,
      targetId: l.targetId,
      createdAt: l.createdAt.toISOString(),
    })),
  };

  return (
    <DashboardClient 
      initialData={initialData} 
      role="creator" 
      userName={session.user.name || 'Developer'} 
    />
  );
}

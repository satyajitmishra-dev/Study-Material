import React from 'react';
import { auth } from '@/auth';
import { cmsDb } from '@/lib/database/cmsDb';
import DashboardClient from '@/components/admin/DashboardClient';
import { getActiveProject } from '@/lib/actions/projectContext';

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

  const publishedCount = projects.filter(p => p.status === 'published').length;
  const draftsCount = projects.filter(p => p.status === 'draft').length;
  const totalViews = projects.reduce((sum, p) => sum + p.views, 0);

  const initialData = {
    totalProjects: projects.length,
    publishedCount,
    draftsCount,
    totalViews,
    mediaCount,
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

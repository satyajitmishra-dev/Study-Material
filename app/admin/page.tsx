import React from 'react';
import { cmsDb } from '@/lib/database/cmsDb';
import DashboardClient from '@/components/admin/DashboardClient';
import { getActiveProject } from '@/lib/actions/projectContext';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const { projectId } = await getActiveProject();

  // Query initial CMS metrics on the server scoped to project container
  const { items: projects, total: totalProjects } = await cmsDb.getProjects({ limit: 1000, projectId });
  const { total: mediaCount } = await cmsDb.getMedia({ limit: 1, projectId });
  const auditLogs = await cmsDb.getAuditLogs(undefined, 25, projectId);

  const publishedCount = projects.filter(p => p.status === 'published').length;
  const draftsCount = projects.filter(p => p.status === 'draft').length;
  const totalViews = projects.reduce((sum, p) => sum + p.views, 0);

  const initialData = {
    totalProjects,
    publishedCount,
    draftsCount,
    totalViews,
    mediaCount,
    recentProjects: projects.slice(0, 10).map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      status: p.status,
      updatedAt: p.updatedAt.toISOString(),
    })),
    auditLogs: auditLogs.map(l => ({
      id: l.id,
      action: l.action,
      targetType: l.targetType,
      targetId: l.targetId,
      createdAt: l.createdAt.toISOString(),
    })),
  };

  return <DashboardClient initialData={initialData} />;
}

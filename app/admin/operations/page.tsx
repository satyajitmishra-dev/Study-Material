import React from 'react';
import { cmsDb } from '@/lib/database/cmsDb';
import { getActiveProject } from '@/lib/actions/projectContext';
import OperationsClient from '@/components/admin/OperationsClient';

export const dynamic = 'force-dynamic';

export default async function OperationsPage() {
  const { projectId, projectName, organizationName } = await getActiveProject();

  // Query audit logs scoped by active project
  const auditLogs = await cmsDb.getAuditLogs(undefined, 50, projectId);
  const { total: totalProjects } = await cmsDb.getProjects({ limit: 1, projectId });
  const { total: mediaCount } = await cmsDb.getMedia({ limit: 1, projectId });

  const initialData = {
    projectId,
    projectName,
    organizationName,
    totalProjects,
    mediaCount,
    auditLogs: auditLogs.map(l => ({
      id: l.id,
      action: l.action,
      targetType: l.targetType,
      targetId: l.targetId,
      details: l.details,
      createdAt: l.createdAt.toISOString(),
      userId: l.userId
    }))
  };

  return <OperationsClient initialData={initialData} />;
}

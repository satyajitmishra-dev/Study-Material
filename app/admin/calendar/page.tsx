import React from 'react';
import { cmsDb } from '@/lib/database/cmsDb';
import PublishingCalendar from '@/components/admin/PublishingCalendar';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  // Query all project files on the server
  const { items: projects } = await cmsDb.getProjects({ limit: 1000 });

  // Map and serialize project items to prevent Date object boundary transfer crashes
  const serializedProjects = projects.map(p => ({
    id: p.id,
    title: p.title,
    status: p.status as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED',
    scheduledAt: p.scheduledAt ? p.scheduledAt.toISOString() : null,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString()
  }));

  return <PublishingCalendar initialProjects={serializedProjects} />;
}

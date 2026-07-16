import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { cmsDb } from '@/lib/database/cmsDb';
import PublishingCalendar from '@/components/admin/PublishingCalendar';

export const dynamic = 'force-dynamic';

export default async function StudioCalendarPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id!;

  // Query creator's project files
  const { items: projects } = await cmsDb.getProjects({ limit: 1000, authorId: userId });

  // Map and serialize project items to prevent Date object boundary transfer crashes
  const serializedProjects = projects.map(p => ({
    id: p.id,
    title: p.title,
    status: p.status as 'draft' | 'published' | 'scheduled' | 'archived',
    scheduledAt: p.scheduledAt ? p.scheduledAt.toISOString() : null,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString()
  }));

  return <PublishingCalendar initialProjects={serializedProjects} />;
}

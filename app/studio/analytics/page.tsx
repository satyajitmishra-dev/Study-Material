import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { cmsDb } from '@/lib/database/cmsDb';
import AnalyticsClient from '@/components/admin/AnalyticsClient';

export const dynamic = 'force-dynamic';

export default async function StudioAnalyticsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id!;

  // Query all analytics rows on the server
  const analytics = await cmsDb.getAnalytics();

  // Query current creator's projects
  const { items: projects } = await cmsDb.getProjects({ authorId: userId, limit: 1000 });
  const projectIds = new Set(projects.map(p => p.id));

  // Map and serialize timestamp fields to transfer across React boundaries safely
  const serializedAnalytics = analytics
    .filter(row => row.projectId && projectIds.has(row.projectId)) // Filter by current creator's content only
    .map(row => ({
      id: row.id,
      projectId: row.projectId,
      views: row.views,
      ctr: row.ctr,
      bounceRate: row.bounceRate,
      timeOnPage: row.timeOnPage,
      country: row.country,
      referer: row.referer,
      createdAt: row.createdAt.toISOString()
    }));

  return <AnalyticsClient initialAnalytics={serializedAnalytics} />;
}

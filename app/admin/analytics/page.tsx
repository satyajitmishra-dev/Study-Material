import React from 'react';
import { cmsDb } from '@/lib/database/cmsDb';
import AnalyticsClient from '@/components/admin/AnalyticsClient';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  // Query all analytics rows on the server
  const analytics = await cmsDb.getAnalytics();

  // Map and serialize timestamp fields to transfer across React boundaries safely
  const serializedAnalytics = analytics.map(row => ({
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

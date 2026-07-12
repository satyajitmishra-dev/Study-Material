import React from 'react';
import { Metadata } from 'next';
import { getMetadata } from '@/lib/seo/MetadataEngine';
import { publicDb } from '@/lib/database/publicDb';
import { auth } from '@/auth';
import RoadmapsClient from './RoadmapsClient';

export async function generateMetadata(): Promise<Metadata> {
  return getMetadata({
    title: 'Curated Developer Roadmaps Library',
    description: 'Track interactive progress across frontend, backend, database and AI-native developer pathways.',
    path: '/roadmaps'
  });
}

export const dynamic = 'force-dynamic';

export default async function RoadmapsIndexPage() {
  const roadmaps = await publicDb.getCuratedRoadmaps();
  const session = await auth();
  const userId = session?.user?.id || null;

  // Fetch progress for each roadmap for the current user
  const roadmapsWithProgress = await Promise.all(
    roadmaps.map(async (rm) => {
      let completedSteps: string[] = [];
      if (userId) {
        const progress = await publicDb.getRoadmapProgress(userId, rm.id);
        completedSteps = progress?.completedSteps || [];
      }
      const totalSteps = rm.steps?.length || 1;
      const percent = Math.round((completedSteps.length / totalSteps) * 100);
      return {
        ...rm,
        completedSteps,
        percent
      };
    })
  );

  return (
    <RoadmapsClient 
      roadmaps={roadmapsWithProgress}
      userId={userId}
    />
  );
}

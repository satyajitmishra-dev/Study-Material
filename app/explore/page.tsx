import React from 'react';
import { Metadata } from 'next';
import { getMetadata } from '@/lib/seo/MetadataEngine';
import ExploreClient from '@/components/public/ExploreClient';

export async function generateMetadata(): Promise<Metadata> {
  return getMetadata({
    title: 'Explore Frameworks & Timelines',
    description: 'Explore trending blogs, interactive roadmaps, open-source projects, and verified developer milestones.',
    path: '/explore'
  });
}

export const dynamic = 'force-dynamic';

export default function ExplorePage() {
  return <ExploreClient />;
}

import React from 'react';
import { Metadata } from 'next';
import { getMetadata } from '@/lib/seo/MetadataEngine';
import { publicDb } from '@/lib/database/publicDb';
import CommunityClient from '@/components/public/CommunityClient';

export async function generateMetadata(): Promise<Metadata> {
  return getMetadata({
    title: 'Community Spaces & Coding Groups',
    description: 'Engage with developers, ask technical Q&As, vote in polls, join study rooms, and review engineering projects.',
    path: '/community'
  });
}

export const dynamic = 'force-dynamic';

export default async function CommunityPage() {
  const discussions = await publicDb.getDiscussions();
  const polls = await publicDb.getPolls();
  const events = await publicDb.getEvents();

  return (
    <CommunityClient 
      initialDiscussions={discussions}
      initialPolls={polls}
      initialEvents={events}
    />
  );
}

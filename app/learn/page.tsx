import React from 'react';
import { Metadata } from 'next';
import { getMetadata } from '@/lib/seo/MetadataEngine';
import LearnDashboardClient from '@/components/public/LearnDashboardClient';

export async function generateMetadata(): Promise<Metadata> {
  return getMetadata({
    title: 'Developer Learning Paths & Coding Roadmaps',
    description: 'Master Next.js 16 compiler features, CSS spring physics, and AI prompt engineering roadmaps.',
    path: '/learn'
  });
}

export const dynamic = 'force-dynamic';

export default function LearnPage() {
  return <LearnDashboardClient />;
}

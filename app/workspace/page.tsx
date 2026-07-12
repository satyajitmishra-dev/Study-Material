import React from 'react';
import { Metadata } from 'next';
import { getMetadata } from '@/lib/seo/MetadataEngine';
import WorkspaceClient from '@/components/public/WorkspaceClient';

export async function generateMetadata(): Promise<Metadata> {
  return getMetadata({
    title: 'Workspace Hub',
    description: 'Your personal second brain workspace. Organize note collections, track roadmap goals, and run AI revision flashcards.',
    path: '/workspace'
  });
}

export const dynamic = 'force-dynamic';

export default function WorkspacePage() {
  return <WorkspaceClient />;
}

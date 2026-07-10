import React from 'react';
import { Metadata } from 'next';
import { getMetadata } from '@/lib/seo/MetadataEngine';
import SearchClient from '@/components/public/SearchClient';

export async function generateMetadata(): Promise<Metadata> {
  return getMetadata({
    title: 'Search guides & courses',
    description: 'Use the interactive command palette search workspace to find articles, roadmap steps, categories, and tags.',
    path: '/search'
  });
}

export const dynamic = 'force-dynamic';

export default function SearchPage() {
  return <SearchClient />;
}

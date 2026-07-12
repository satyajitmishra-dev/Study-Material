import React from 'react';
import { publicDb } from '@/lib/database/publicDb';
import { auth } from '@/auth';
import HomeClient from '@/components/public/HomeClient';
import { Metadata } from 'next';
import { getMetadata } from '@/lib/seo/MetadataEngine';

export async function generateMetadata(): Promise<Metadata> {
  return getMetadata({
    title: 'Home',
    description: 'An immersive desktop-grade workspace engineered for developers to master modern frontend, backend, and AI stacks.',
    path: '/'
  });
}

export const dynamic = 'force-dynamic';

import { SchemaMarkup } from '@/lib/seo/SchemaMarkup';

export default async function PublishingHomePage() {
  const session = await auth();

  // Query Settings
  const rawLayout = await publicDb.getSetting('homepage_layout', JSON.stringify(['hero', 'trending', 'categories', 'series', 'latest', 'newsletter']));
  const layout: string[] = JSON.parse(rawLayout);

  // Fetch lists
  const categories = await publicDb.getCategories();
  const tags = await publicDb.getTags();
  
  // Fetch initial posts (published)
  const { items: initialFeed } = await publicDb.getUniversalFeed({ sortBy: 'trending', limit: 15 });

  const orgSchema = SchemaMarkup.organization();
  const webSchema = SchemaMarkup.website();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSchema) }}
      />
      <HomeClient 
        initialFeed={initialFeed}
        categories={categories}
        tags={tags}
        layout={layout}
        sessionUser={session?.user || null}
      />
    </>
  );
}

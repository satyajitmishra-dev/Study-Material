import React from 'react';
import { publicDb } from '@/lib/database/publicDb';
import { auth } from '@/auth';
import HomeClient from '@/components/public/HomeClient';

export const dynamic = 'force-dynamic';

export default async function PublishingHomePage() {
  const session = await auth();

  // Query Settings
  const rawLayout = await publicDb.getSetting('homepage_layout', JSON.stringify(['hero', 'trending', 'categories', 'latest', 'newsletter']));
  const layout: string[] = JSON.parse(rawLayout);

  // Fetch lists
  const categories = await publicDb.getCategories();
  const tags = await publicDb.getTags();
  
  // Fetch initial posts (published)
  const { items: initialPosts } = await publicDb.getPublicPosts({ limit: 10 });

  return (
    <HomeClient 
      initialPosts={initialPosts}
      categories={categories}
      tags={tags}
      layout={layout}
      sessionUser={session?.user || null}
    />
  );
}

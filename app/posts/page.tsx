import React from 'react';
import { publicDb } from '@/lib/database/publicDb';
import PostsClient from '@/components/public/PostsClient';
import { Metadata } from 'next';
import { getMetadata } from '@/lib/seo/MetadataEngine';

export async function generateMetadata(): Promise<Metadata> {
  return getMetadata({
    title: 'Articles & Guides',
    description: 'Technical deep-dives, developer blogs, cheat sheets, and documentation on modern software engineering.',
    path: '/posts',
    tags: ['Learning', 'Coding', 'Developer']
  });
}

export const dynamic = 'force-dynamic';

export default async function PublicPostsListPage() {
  // Query data on server
  const categories = await publicDb.getCategories();
  const tags = await publicDb.getTags();
  const { items: initialPosts } = await publicDb.getPublicPosts({ limit: 100 }); // Pre-fetch lists

  return (
    <PostsClient 
      initialPosts={initialPosts}
      categories={categories}
      tags={tags}
    />
  );
}

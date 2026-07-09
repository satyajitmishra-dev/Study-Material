import React from 'react';
import { publicDb } from '@/lib/database/publicDb';
import PostsClient from '@/components/public/PostsClient';

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

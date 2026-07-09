import React from 'react';
import { notFound } from 'next/navigation';
import { publicDb } from '@/lib/database/publicDb';
import { auth } from '@/auth';
import PostDetailClient from '@/components/public/PostDetailClient';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function PublicPostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await auth();

  // Fetch post details on server
  const post = await publicDb.getPublicPostBySlug(slug);
  if (!post) {
    notFound();
  }

  // Fetch comments for post
  const comments = await publicDb.getCommentsForPost(post.id);

  // Fetch series details if linked
  let series = null;
  if (post.id === 'proj_sandbox_1') {
    series = await publicDb.getSeriesBySlug('nextjs-16-deep-dive');
  }

  // Fetch related posts (mock suggestions for sandbox)
  const { items: allPosts } = await publicDb.getPublicPosts({ limit: 5 });
  const relatedPosts = allPosts
    .filter(p => p.id !== post.id)
    .map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: p.categoryRef?.name || 'React'
    }));

  return (
    <PostDetailClient 
      post={post}
      comments={comments}
      sessionUser={session?.user || null}
      series={series}
      relatedPosts={relatedPosts}
    />
  );
}

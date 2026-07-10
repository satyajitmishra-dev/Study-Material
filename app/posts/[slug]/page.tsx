import React from 'react';
import { notFound } from 'next/navigation';
import { publicDb } from '@/lib/database/publicDb';
import { auth } from '@/auth';
import PostDetailClient from '@/components/public/PostDetailClient';
import { Metadata } from 'next';
import { getMetadata } from '@/lib/seo/MetadataEngine';
import { SchemaMarkup } from '@/lib/seo/SchemaMarkup';
import { InternalLinkEngine } from '@/lib/seo/InternalLinkEngine';
import { SeoEngine } from '@/lib/seo/SeoEngine';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await publicDb.getPublicPostBySlug(slug);
  if (!post) {
    return getMetadata({ title: 'Article Not Found', path: `/posts/${slug}` });
  }

  return getMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.description || '',
    path: `/posts/${slug}`,
    image: post.ogImage || post.coverImage || undefined,
    type: 'article',
    robots: post.robots || 'index, follow',
    author: post.author?.name || undefined,
    publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
    tags: post.postTags?.map((pt: any) => pt.tag?.name).filter(Boolean) || []
  });
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

  // Compile internal links to prevent orphan pages
  const categoriesList = await publicDb.getCategories();
  const tagsList = await publicDb.getTags();
  const linkTargets = [
    ...categoriesList.map(c => ({ name: c.name, slug: c.slug, type: 'category' as const })),
    ...tagsList.map(t => ({ name: t.name, slug: t.slug, type: 'tag' as const }))
  ];
  if (post.content) {
    post.content = SeoEngine.injectHeadingIds(post.content);
    post.content = InternalLinkEngine.injectContextualLinks(post.content, linkTargets);
    (post as any).toc = SeoEngine.extractTableOfContents(post.content);
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://studymaterial.utool.in';

  const articleSchema = SchemaMarkup.article({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.description || '',
    url: `${baseUrl}/posts/${slug}`,
    coverImage: post.coverImage || undefined,
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    dateModified: new Date(post.updatedAt).toISOString(),
    authorName: post.author?.name || 'Sandbox Admin',
    category: post.categoryRef?.name || undefined
  });

  const breadcrumbSchema = SchemaMarkup.breadcrumb([
    { name: 'Home', url: baseUrl },
    { name: 'Articles', url: `${baseUrl}/posts` },
    { name: post.title, url: `${baseUrl}/posts/${slug}` }
  ]);

  let faqSchema = null;
  if (post.faq && Array.isArray(post.faq)) {
    faqSchema = SchemaMarkup.faq(post.faq);
  } else if (slug === 'introducing-partial-prerendering') {
    const mockFaq = [
      { question: 'What is Partial Prerendering?', answer: 'PPR is a layouts-first compilation model that serves static shells instantly and streams dynamic holes.' },
      { question: 'Does PPR require React 19?', answer: 'Yes, PPR is built on React 19 Suspense architecture and Next.js 16.' }
    ];
    (post as any).faq = mockFaq;
    faqSchema = SchemaMarkup.faq(mockFaq);
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <PostDetailClient
        post={post}
        comments={comments}
        sessionUser={session?.user || null}
        series={series}
        relatedPosts={relatedPosts}
      />
    </>
  );
}

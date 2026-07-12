import React from 'react';
import { Metadata } from 'next';
import { getMetadata } from '@/lib/seo/MetadataEngine';
import { publicDb } from '@/lib/database/publicDb';
import { SchemaMarkup } from '@/lib/seo/SchemaMarkup';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, Button } from '@/components/ui/core';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { auth } from '@/auth';
import { 
  ArrowLeft, 
  ThumbsUp, 
  CheckCircle2, 
  User, 
  ShieldCheck, 
  MessageSquare,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import DiscussionClient from './DiscussionClient';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const discussion = await publicDb.getDiscussionBySlug(slug);
  if (!discussion) {
    return getMetadata({ title: 'Discussion Not Found', path: `/discussions/${slug}` });
  }

  return getMetadata({
    title: discussion.title,
    description: discussion.content.substring(0, 150),
    path: `/discussions/${slug}`,
    tags: discussion.tags
  });
}

export const dynamic = 'force-dynamic';

export default async function DiscussionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const discussion = await publicDb.getDiscussionBySlug(slug);
  if (!discussion) {
    notFound();
  }

  const session = await auth();
  const userId = session?.user?.id || null;

  // Q&A Schema Markup for search engine optimization
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://studymaterial.utool.in';
  
  const answersList = (discussion.answers || []).map((a: any) => ({
    text: a.content,
    upvoteCount: a.upvotes,
    url: `${baseUrl}/discussions/${discussion.slug}#answer-${a.id}`
  }));

  const qaSchema = discussion.isQuestion ? SchemaMarkup.qa({
    title: discussion.title,
    text: discussion.content,
    upvoteCount: discussion.upvotes,
    answers: answersList,
    acceptedAnswerIndex: discussion.acceptedAnswerId 
      ? (discussion.answers || []).findIndex((a: any) => a.id === discussion.acceptedAnswerId)
      : undefined
  }) : null;

  return (
    <>
      {qaSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(qaSchema) }}
        />
      )}

      <DiscussionClient 
        discussion={discussion}
        userId={userId}
      />
    </>
  );
}

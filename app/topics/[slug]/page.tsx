import React from 'react';
import { Metadata } from 'next';
import { getMetadata } from '@/lib/seo/MetadataEngine';
import TopicClient from '@/components/public/TopicClient';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const topicName = params.slug.toUpperCase();
  return getMetadata({
    title: `${topicName} Learning Hub & Tutorials`,
    description: `Master ${topicName} development. Access AI summaries, complete interactive roadmaps, browse projects, and join community study groups.`,
    path: `/topics/${params.slug}`
  });
}

export const dynamic = 'force-dynamic';

export default function TopicPage({ params }: Props) {
  return <TopicClient topicSlug={params.slug} />;
}

import React from 'react';
import { Metadata } from 'next';
import { getMetadata } from '@/lib/seo/MetadataEngine';
import { publicDb } from '@/lib/database/publicDb';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { ArrowLeft, Map, CheckCircle2, Circle } from 'lucide-react';
import RoadmapDetailClient from './RoadmapDetailClient';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const roadmap = await publicDb.getCuratedRoadmapBySlug(slug);
  if (!roadmap) {
    return getMetadata({ title: 'Roadmap Not Found', path: `/roadmaps/${slug}` });
  }

  return getMetadata({
    title: `${roadmap.title} Path`,
    description: roadmap.description,
    path: `/roadmaps/${slug}`
  });
}

export const dynamic = 'force-dynamic';

export default async function CuratedRoadmapDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const roadmap = await publicDb.getCuratedRoadmapBySlug(slug);
  if (!roadmap) {
    notFound();
  }

  const session = await auth();
  const userId = session?.user?.id || null;

  let completedSteps: string[] = [];
  if (userId) {
    const progress = await publicDb.getRoadmapProgress(userId, roadmap.id);
    completedSteps = progress?.completedSteps || [];
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-12 pb-16 font-sans">
      
      {/* Back button */}
      <div className="mb-6">
        <Link href="/roadmaps" className="inline-flex items-center gap-1.5 text-[12px] text-stone hover:text-warm-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to roadmaps library
        </Link>
      </div>

      <RoadmapDetailClient 
        roadmap={roadmap}
        initialCompleted={completedSteps}
        userId={userId}
      />
    </div>
  );
}

import React from 'react';
import { Metadata } from 'next';
import { getMetadata } from '@/lib/seo/MetadataEngine';
import { publicDb } from '@/lib/database/publicDb';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, Button } from '@/components/ui/core';
import { auth } from '@/auth';
import { 
  ArrowLeft, 
  Vote, 
  User, 
  Calendar, 
  Clock, 
  ThumbsUp, 
  MessageSquare,
  Globe
} from 'lucide-react';
import PollDetailClient from './PollDetailClient';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const poll = await publicDb.getPollById(id);
  if (!poll) {
    return getMetadata({ title: 'Poll Not Found', path: `/polls/${id}` });
  }

  return getMetadata({
    title: `Poll: ${poll.title}`,
    description: poll.description || `Vote in this opinion poll: ${poll.title}`,
    path: `/polls/${id}`
  });
}

export const dynamic = 'force-dynamic';

export default async function PollDetailPage({ params }: PageProps) {
  const { id } = await params;
  const poll = await publicDb.getPollById(id);
  if (!poll) {
    notFound();
  }

  const session = await auth();
  const userId = session?.user?.id || null;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pt-12 pb-16 font-sans">
      <div className="mb-6">
        <Link href="/community" className="inline-flex items-center gap-1.5 text-[12px] text-stone hover:text-warm-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Community Board
        </Link>
      </div>

      <PollDetailClient 
        poll={poll}
        userId={userId}
      />
    </div>
  );
}

import React from 'react';
import { Metadata } from 'next';
import { getMetadata } from '@/lib/seo/MetadataEngine';
import { publicDb } from '@/lib/database/publicDb';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Mail, 
  Clock, 
  Users, 
  Trophy, 
  FileText, 
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import EventDetailClient from './EventDetailClient';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await publicDb.getEventBySlug(slug);
  if (!event) {
    return getMetadata({ title: 'Event Not Found', path: `/events/${slug}` });
  }

  return getMetadata({
    title: `Event: ${event.title}`,
    description: event.description,
    path: `/events/${slug}`,
    tags: [event.eventType]
  });
}

export const dynamic = 'force-dynamic';

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await publicDb.getEventBySlug(slug);
  if (!event) {
    notFound();
  }

  const session = await auth();
  const userId = session?.user?.id || null;
  const isOrganizer = userId === event.organizerId;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-12 pb-16 font-sans">
      
      {/* Back button */}
      <div className="mb-6">
        <Link href="/community" className="inline-flex items-center gap-1.5 text-[12px] text-stone hover:text-warm-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Community Board
        </Link>
      </div>

      <EventDetailClient 
        event={event}
        userId={userId}
        isOrganizer={isOrganizer}
      />
    </div>
  );
}

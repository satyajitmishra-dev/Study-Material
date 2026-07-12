import React from 'react';
import { Metadata } from 'next';
import { getMetadata } from '@/lib/seo/MetadataEngine';
import ModerationClient from '@/components/admin/ModerationClient';

export async function generateMetadata(): Promise<Metadata> {
  return getMetadata({
    title: 'Content Moderation & Report Hub',
    description: 'Admin moderator panel to review content reports, manage tag taxonomy, and configure hierarchical categories.',
    path: '/admin/moderation'
  });
}

export const dynamic = 'force-dynamic';

export default function AdminModerationPage() {
  return <ModerationClient />;
}

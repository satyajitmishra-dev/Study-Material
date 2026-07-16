import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { cmsDb } from '@/lib/database/cmsDb';
import MediaLibraryClient from '@/components/admin/MediaLibraryClient';
import { getActiveProject } from '@/lib/actions/projectContext';

export const dynamic = 'force-dynamic';

export default async function StudioMediaLibraryPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const { projectId } = await getActiveProject();

  // Query media files scoped to project container
  const { items: media } = await cmsDb.getMedia({ limit: 1000, projectId });

  // Extract unique folders dynamically
  const folders = Array.from(new Set(media.map(m => m.folder)));

  return (
    <MediaLibraryClient
      initialMedia={media}
      folders={folders}
    />
  );
}

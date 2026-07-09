import React from 'react';
import { cmsDb } from '@/lib/database/cmsDb';
import MediaLibraryClient from '@/components/admin/MediaLibraryClient';

export const dynamic = 'force-dynamic';

export default async function MediaLibraryPage() {
  // Query all media files on the server
  const { items: media } = await cmsDb.getMedia({ limit: 1000 });

  // Extract unique folders dynamically
  const folders = Array.from(new Set(media.map(m => m.folder)));

  return (
    <MediaLibraryClient
      initialMedia={media}
      folders={folders}
    />
  );
}

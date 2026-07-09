import React from 'react';
import { publicDb } from '@/lib/database/publicDb';
import EngagementClient from '@/components/admin/EngagementClient';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function EngagementHubPage() {
  // Query homepage layout from settings
  const rawLayout = await publicDb.getSetting('homepage_layout', JSON.stringify(['hero', 'trending', 'categories', 'latest', 'newsletter']));
  const layout: string[] = JSON.parse(rawLayout);

  // Server Action inline definition to pass as prop
  async function saveLayoutAction(newLayout: string[]) {
    'use server';
    const stringified = JSON.stringify(newLayout);
    await publicDb.saveSetting('homepage_layout', stringified);
    revalidatePath('/');
    return { success: true };
  }

  return (
    <EngagementClient 
      initialLayout={layout}
      onSaveLayout={saveLayoutAction}
    />
  );
}

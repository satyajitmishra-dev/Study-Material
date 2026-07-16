import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { cmsDb } from '@/lib/database/cmsDb';
import ProjectsClient from '@/components/admin/ProjectsClient';
import { getActiveProject } from '@/lib/actions/projectContext';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    category?: string;
    tag?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }>;
}

export const dynamic = 'force-dynamic';

export default async function StudioProjectsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id!;
  const params = await searchParams;
  const { projectId } = await getActiveProject();

  // Query database scoped to the active project AND the logged-in creator
  const { items: projects, total } = await cmsDb.getProjects({
    search: params.search,
    status: params.status,
    category: params.category,
    tag: params.tag,
    sortBy: params.sortBy || 'updatedAt',
    sortOrder: params.sortOrder || 'desc',
    limit: 1000, 
    offset: 0,
    projectId,
    authorId: userId, // Filter by current creator only
  });

  // Extract unique categories and tags dynamically from this user's projects
  const { items: allProjects } = await cmsDb.getProjects({ 
    limit: 5000, 
    projectId,
    authorId: userId
  });
  
  const uniqueCategories = Array.from(
    new Set(allProjects.map(p => p.category).filter((c): c is string => Boolean(c)))
  );
  const uniqueTags = Array.from(
    new Set(allProjects.flatMap(p => p.tags).filter(Boolean))
  );

  return (
    <ProjectsClient
      initialProjects={projects}
      initialTotal={total}
      categories={uniqueCategories}
      tags={uniqueTags}
    />
  );
}

import React from 'react';
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

export default async function ProjectsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { projectId } = await getActiveProject();

  // Query database with search filters scoped to project container
  const { items: projects, total } = await cmsDb.getProjects({
    search: params.search,
    status: params.status,
    category: params.category,
    tag: params.tag,
    sortBy: params.sortBy || 'updatedAt',
    sortOrder: params.sortOrder || 'desc',
    limit: 1000, // Upper limit for client side high density rendering & virtualizer
    offset: 0,
    projectId,
  });

  // Extract unique categories and tags dynamically from all records in this project
  const { items: allProjects } = await cmsDb.getProjects({ limit: 5000, projectId });
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

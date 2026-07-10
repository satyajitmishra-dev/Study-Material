import React from 'react';
import { notFound } from 'next/navigation';
import { cmsDb } from '@/lib/database/cmsDb';
import { publicDb } from '@/lib/database/publicDb';
import ProjectEditorWizard from '@/components/admin/ProjectEditorWizard';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch project from database
  const project = await cmsDb.getProjectById(id);
  if (!project) {
    notFound();
  }

  // Convert Date objects to strings/ISO format to transfer safely across boundaries
  const serializedProject = {
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    publishedAt: project.publishedAt ? project.publishedAt.toISOString() : null,
    scheduledAt: project.scheduledAt ? project.scheduledAt.toISOString() : null,
  };

  const categories = await publicDb.getCategories();

  return <ProjectEditorWizard project={serializedProject} categories={categories} />;
}


import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { cmsDb } from '@/lib/database/cmsDb';
import { publicDb } from '@/lib/database/publicDb';
import ProjectEditorWizard from '@/components/admin/ProjectEditorWizard';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function StudioEditProjectPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const { id } = await params;

  // Fetch project from database
  const project = await cmsDb.getProjectById(id);
  if (!project) {
    notFound();
  }

  // Creator security guard: Ensure they own the content to edit it
  const isOwner = project.authorId === session.user.id;
  const isAdminOrMod = (session.user as any).role === 'admin' || (session.user as any).role === 'moderator';
  if (!isOwner && !isAdminOrMod) {
    redirect('/unauthorized?reason=not-content-owner');
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

import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { cmsDb } from '@/lib/database/cmsDb';
import { fetchUserRepositories } from '@/lib/automation/github';
import ProjectDashboardClient from '@/components/admin/ProjectDashboardClient';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function ProjectDashboardPage({ params }: PageProps) {
  const session = await auth();
  const userId = session?.user?.id || 'sandbox-admin-id';
  const { slug } = await params;

  // Fetch the project container details
  const project = await cmsDb.getDeveloperProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  // Validate Ownership: only the creator (via organization ownerId) can manage the dashboard
  const prisma = (cmsDb as any).prisma;
  if (prisma) {
    const org = await prisma.organization.findUnique({
      where: { id: project.organizationId }
    });
    if (org && org.ownerId !== userId) {
      // Not the owner of this project container
      redirect('/unauthorized');
    }
  }

  // Fetch connected integrations
  const integration = await cmsDb.getIntegration(project.id, 'github');
  
  // Fetch roadmaps & timelines
  const roadmap = await cmsDb.getProjectRoadmap(project.id);
  const timeline = await cmsDb.getProjectTimeline(project.id);

  // Fetch all user repos for the Vercel-style connector dropdown (fallback to mock in sandbox mode)
  const githubToken = process.env.GITHUB_TOKEN || '';
  const repos = await fetchUserRepositories(githubToken);

  return (
    <ProjectDashboardClient
      project={project}
      integration={integration}
      roadmap={roadmap}
      timeline={timeline}
      repositories={repos}
    />
  );
}

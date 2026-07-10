import React from 'react';
import { Metadata } from 'next';
import { publicDb } from '@/lib/database/publicDb';
import ProjectsIndexClient from '@/components/public/ProjectsIndexClient';
import { getMetadata } from '@/lib/seo/MetadataEngine';

export async function generateMetadata(): Promise<Metadata> {
  return getMetadata({
    title: 'Showcase Explorer',
    description: 'Explore community projects, connect with repositories, track roadmaps, and follow developer updates.',
    path: '/projects'
  });
}

export default async function ProjectsIndexPage() {
  const projects = await publicDb.getShowcaseProjects();
  return (
    <main className="min-h-screen bg-black text-warm-white">
      <ProjectsIndexClient projects={projects} />
    </main>
  );
}

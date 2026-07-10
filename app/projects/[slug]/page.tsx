import React from 'react';
import { notFound } from 'next/navigation';
import { publicDb } from '@/lib/database/publicDb';
import ProjectShowcaseClient from '@/components/public/ProjectShowcaseClient';
import { Metadata } from 'next';
import { getMetadata } from '@/lib/seo/MetadataEngine';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate project SEO metadata dynamically
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await publicDb.getShowcaseProjectBySlug(slug);

  if (!project) {
    return getMetadata({
      title: 'Project Not Found',
      description: 'The requested showcase project could not be found.',
      path: `/projects/${slug}`
    });
  }

  const name = project.name;
  const desc = project.description || `Explore ${name} on the Developer Platform.`;
  const logo = project.logo || '';
  const banner = project.banner || '';

  return getMetadata({
    title: `${name} — Project Showcase & Repo Dashboard`,
    description: desc,
    path: `/projects/${slug}`,
    image: banner || logo || undefined,
    type: 'website',
    tags: project.tagsList || []
  });
}

import { SchemaMarkup } from '@/lib/seo/SchemaMarkup';

export const dynamic = 'force-dynamic';

export default async function ProjectShowcasePage({ params }: PageProps) {
  const { slug } = await params;
  const project = await publicDb.getShowcaseProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://studymaterial.utool.in';

  const softwareSchema = SchemaMarkup.software({
    name: project.name,
    description: project.description || '',
    url: `${baseUrl}/projects/${slug}`,
    logo: project.logo || undefined,
    authorName: project.organization?.owner?.name || 'Developer',
    downloadUrl: project.githubUrl || undefined
  });

  const breadcrumbSchema = SchemaMarkup.breadcrumb([
    { name: 'Home', url: baseUrl },
    { name: 'Projects', url: `${baseUrl}/projects` },
    { name: project.name, url: `${baseUrl}/projects/${slug}` }
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <ProjectShowcaseClient
        project={project}
        slug={slug}
      />
    </>
  );
}

import React from 'react';
import { notFound } from 'next/navigation';
import { cmsDb } from '@/lib/database/cmsDb';
import VersionHistoryClient from '@/components/admin/VersionHistoryClient';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function ProjectHistoryPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch parent project
  const project = await cmsDb.getProjectById(id);
  if (!project) {
    notFound();
  }

  // Fetch all versions sorted by version number descending
  const versions = await cmsDb.getVersions(id);

  // Map and serialize versions to transfer safely across boundaries
  const serializedVersions = versions.map((v, index) => {
    let title = project.title;
    let content = v.content;
    try {
      const snapshot = JSON.parse(v.content);
      title = snapshot.title || project.title;
      content = snapshot.content || v.content;
    } catch (e) {}

    return {
      id: v.id,
      version: versions.length - index,
      title,
      content,
      versionNote: v.versionNote,
      createdAt: v.createdAt.toISOString(),
      authorId: v.authorId
    };
  });

  return (
    <VersionHistoryClient
      projectId={id}
      projectTitle={project.title}
      currentContent={project.content}
      versions={serializedVersions}
    />
  );
}

import React from 'react';
import { getActiveProject } from '@/lib/actions/projectContext';
import SettingsClient from '@/components/admin/SettingsClient';

export const dynamic = 'force-dynamic';

export default async function StudioSettingsPage() {
  const activeProject = await getActiveProject();

  const initialData = {
    projectId: activeProject.projectId,
    projectName: activeProject.projectName,
    projectSlug: activeProject.projectSlug,
    organizationId: activeProject.organizationId,
    organizationName: activeProject.organizationName,
    envStatus: {
      openaiKeyPresent: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'mock',
      databaseUrlPresent: !!process.env.DATABASE_URL,
      githubTokenPresent: !!process.env.GITHUB_TOKEN || !!process.env.GITHUB_PAT,
      nextauthUrlPresent: !!process.env.NEXTAUTH_URL || !!process.env.NEXT_PUBLIC_APP_URL,
      nextauthSecretPresent: !!process.env.NEXTAUTH_SECRET || !!process.env.AUTH_SECRET
    }
  };

  return <SettingsClient initialData={initialData} />;
}

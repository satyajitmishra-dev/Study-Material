import React from 'react';
import { publicDb } from '@/lib/database/publicDb';
import ProjectEditorWizard from '@/components/admin/ProjectEditorWizard';

export const dynamic = 'force-dynamic';

export default async function CreateProjectPage() {
  const categories = await publicDb.getCategories();
  return <ProjectEditorWizard project={null} categories={categories} />;
}


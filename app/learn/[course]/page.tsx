import React from 'react';
import { Metadata } from 'next';
import { getMetadata } from '@/lib/seo/MetadataEngine';
import { MOCK_COURSES } from '@/lib/mockData';
import LearningWorkspaceClient from '@/components/public/LearningWorkspaceClient';

interface PageProps {
  params: Promise<{
    course: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { course: courseId } = await params;
  const course = MOCK_COURSES.find(c => c.id === courseId);
  if (!course) {
    return getMetadata({ title: 'Course Not Found', path: `/learn/${courseId}` });
  }

  return getMetadata({
    title: `${course.title} Workshop`,
    description: course.tagline || `Learn and master ${course.title} with interactive coding steps.`,
    path: `/learn/${courseId}`,
    tags: [course.category]
  });
}

export const dynamic = 'force-dynamic';

import { SchemaMarkup } from '@/lib/seo/SchemaMarkup';

export default async function CourseLearningPage({ params }: PageProps) {
  const { course: courseId } = await params;
  const course = MOCK_COURSES.find(c => c.id === courseId);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://studymaterial.utool.in';

  const courseSchema = course ? SchemaMarkup.course({
    title: course.title,
    description: course.tagline,
    url: `${baseUrl}/learn/${courseId}`,
    providerName: 'StudyMaterial'
  }) : null;

  const breadcrumbSchema = SchemaMarkup.breadcrumb([
    { name: 'Home', url: baseUrl },
    { name: 'Learn', url: `${baseUrl}/learn` },
    { name: course?.title || 'Course', url: `${baseUrl}/learn/${courseId}` }
  ]);

  return (
    <>
      {courseSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <LearningWorkspaceClient />
    </>
  );
}

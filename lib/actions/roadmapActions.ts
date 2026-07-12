'use server';

import { auth } from '@/auth';
import { publicDb } from '@/lib/database/publicDb';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const suggestionSchema = z.object({
  roadmapId: z.string().optional(),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['new_roadmap', 'edit_step', 'outdated_step']),
});

export async function submitRoadmapSuggestionAction(raw: any) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'UNAUTHENTICATED' };
  }

  const result = suggestionSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: 'VALIDATION_FAILED', details: result.error.flatten() };
  }

  try {
    const suggestion = await publicDb.submitRoadmapSuggestion({
      ...result.data,
      userId: session.user.id,
      status: 'pending',
    });

    return { success: true, suggestion };
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

export async function updateRoadmapProgressAction(roadmapId: string, completedSteps: string[]) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'UNAUTHENTICATED' };
  }

  try {
    const progress = await publicDb.updateRoadmapProgress(session.user.id, roadmapId, completedSteps);
    revalidatePath('/roadmaps');
    revalidatePath(`/roadmaps/${roadmapId}`);
    revalidatePath('/learn');
    return { success: true, progress };
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

export async function createCuratedRoadmapAction(raw: any) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== 'admin') {
    return { success: false, error: 'UNAUTHORIZED_ADMIN_ONLY' };
  }

  const slug = raw.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7);

  try {
    const roadmap = await publicDb.createCuratedRoadmap({
      ...raw,
      slug,
      isPublished: true,
    });

    revalidatePath('/roadmaps');
    return { success: true, roadmap };
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

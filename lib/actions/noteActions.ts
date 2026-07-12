'use server';

import { auth } from '@/auth';
import { publicDb } from '@/lib/database/publicDb';
import { getPrisma } from '@/lib/database/dbClient';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const noteSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  fileUrl: z.string().url('Invalid file URL'),
  fileType: z.string(),
  fileSize: z.number().max(20 * 1024 * 1024, 'Maximum size is 20MB'),
  visibility: z.enum(['public', 'private', 'unlisted']),
  technology: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  language: z.string().default('en'),
  license: z.string().default('MIT'),
  coverImage: z.string().optional(),
  university: z.string().optional(),
  semester: z.number().optional(),
  branch: z.string().optional(),
  subject: z.string().optional(),
  topic: z.string().optional(),
});

export async function createNoteAction(raw: any) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'UNAUTHENTICATED' };
  }

  const result = noteSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: 'VALIDATION_FAILED', details: result.error.flatten() };
  }

  const data = result.data;
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7);

  try {
    const note = await publicDb.createNote({
      ...data,
      slug,
      authorId: session.user.id,
      seoTitle: `${data.title} - StudyMaterial Notes`,
      seoDescription: data.description || `Study notes about ${data.title} on StudyMaterial.`,
    });

    revalidatePath('/');
    return { success: true, note };
  } catch (err: any) {
    if (err.code === 'P2002') {
      return { success: false, error: 'SLUG_DUPLICATED' };
    }
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

export async function incrementNoteViewAction(slug: string) {
  const prisma = getPrisma();
  try {
    if (prisma) {
      await prisma.userNote.update({
        where: { slug },
        data: { views: { increment: 1 } },
      });
    } else {
      const note = await publicDb.getNoteBySlug(slug);
      if (note) note.views += 1;
    }
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function likeNoteAction(slug: string) {
  const prisma = getPrisma();
  try {
    if (prisma) {
      await prisma.userNote.update({
        where: { slug },
        data: { likes: { increment: 1 } },
      });
    } else {
      const note = await publicDb.getNoteBySlug(slug);
      if (note) note.likes += 1;
    }
    revalidatePath(`/notes/${slug}`);
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

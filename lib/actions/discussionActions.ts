'use server';

import { auth } from '@/auth';
import { publicDb } from '@/lib/database/publicDb';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const discussionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  isQuestion: z.boolean().default(false),
  visibility: z.enum(['public', 'private', 'unlisted']),
});

export async function createDiscussionAction(raw: any) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'UNAUTHENTICATED' };
  }

  const result = discussionSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: 'VALIDATION_FAILED', details: result.error.flatten() };
  }

  const data = result.data;
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7);

  try {
    const discussion = await publicDb.createDiscussion({
      ...data,
      slug,
      authorId: session.user.id,
    });

    revalidatePath('/');
    revalidatePath('/community');
    return { success: true, discussion };
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

export async function addDiscussionAnswerAction(discussionId: string, content: string, slug: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'UNAUTHENTICATED' };
  }

  if (!content.trim()) {
    return { success: false, error: 'EMPTY_ANSWER' };
  }

  try {
    const answer = await publicDb.addDiscussionAnswer({
      content,
      discussionId,
      authorId: session.user.id,
    });

    revalidatePath(`/discussions/${slug}`);
    return { success: true, answer };
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

export async function addDiscussionReplyAction(answerId: string, content: string, slug: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'UNAUTHENTICATED' };
  }

  if (!content.trim()) {
    return { success: false, error: 'EMPTY_REPLY' };
  }

  try {
    const reply = await publicDb.addDiscussionReply({
      content,
      answerId,
      authorId: session.user.id,
    });

    revalidatePath(`/discussions/${slug}`);
    return { success: true, reply };
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

export async function voteDiscussionAction(voteType: 'UPVOTE' | 'DOWNVOTE', target: { discussionId?: string; answerId?: string }, slug: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'UNAUTHENTICATED' };
  }

  try {
    await publicDb.voteDiscussion(session.user.id, voteType, target);
    revalidatePath(`/discussions/${slug}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

export async function acceptAnswerAction(discussionId: string, answerId: string, slug: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'UNAUTHENTICATED' };
  }

  try {
    // Ideally check if user is author of the discussion
    const discussion = await publicDb.getDiscussionBySlug(slug);
    if (!discussion || discussion.authorId !== session.user.id) {
      return { success: false, error: 'UNAUTHORIZED_CREATOR_ONLY' };
    }

    await publicDb.acceptDiscussionAnswer(discussionId, answerId);
    revalidatePath(`/discussions/${slug}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

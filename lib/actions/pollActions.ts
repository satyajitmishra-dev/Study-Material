'use server';

import { auth } from '@/auth';
import { publicDb } from '@/lib/database/publicDb';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const pollSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().optional(),
  category: z.string(),
  technology: z.string().optional(),
  durationDays: z.number().min(1).max(30).default(7),
  visibility: z.enum(['public', 'private']),
  pollType: z.enum(['single', 'multiple', 'yes_no', 'ranking']),
  isAnonymous: z.boolean().default(false),
  options: z.array(z.string()).min(2, 'At least 2 options are required').max(10, 'Maximum 10 options'),
});

export async function createPollAction(raw: any) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'UNAUTHENTICATED' };
  }

  const result = pollSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: 'VALIDATION_FAILED', details: result.error.flatten() };
  }

  try {
    const poll = await publicDb.createPoll({
      ...result.data,
      authorId: session.user.id,
    });

    revalidatePath('/');
    revalidatePath('/community');
    return { success: true, poll };
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

export async function votePollAction(pollId: string, optionId: string, clientIp?: string) {
  const session = await auth();
  const userId = session?.user?.id;
  const ipAddress = clientIp || '127.0.0.1';

  // If poll is anonymous, we track by IP or userId if logged in
  const identifier = userId || ipAddress;
  if (!identifier) {
    return { success: false, error: 'MISSING_IDENTIFIER' };
  }

  try {
    // Check if poll is closed
    const poll = await publicDb.getPollById(pollId);
    if (!poll) {
      return { success: false, error: 'POLL_NOT_FOUND' };
    }

    if (poll.isClosed || new Date(poll.expiresAt).getTime() < Date.now()) {
      return { success: false, error: 'POLL_EXPIRED' };
    }

    await publicDb.votePoll(pollId, optionId, identifier, ipAddress);

    revalidatePath(`/polls/${pollId}`);
    revalidatePath('/community');
    return { success: true };
  } catch (err: any) {
    if (err.message === 'ALREADY_VOTED') {
      return { success: false, error: 'ALREADY_VOTED' };
    }
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

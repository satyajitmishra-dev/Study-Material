'use server';

import { auth } from '@/auth';
import { getPrisma } from '@/lib/database/dbClient';
import { EventBus } from '../events/EventBus';
import { revalidatePath } from 'next/cache';

export interface ContentReport {
  id: string;
  contentId: string;
  contentType: string;
  reason: 'spam' | 'copyright' | 'abuse' | 'wrong_info' | 'nsfw' | 'harassment' | 'other';
  details: string;
  reporterId: string;
  createdAt: Date;
  status: 'pending' | 'reviewed' | 'dismissed';
}

// In-Memory store for Content Reports in development sandbox
const globalForReports = globalThis as unknown as {
  reportsStore: ContentReport[] | undefined;
};

export const reportsStore = globalForReports.reportsStore ?? [
  {
    id: 'rep_1',
    contentId: '1', // React 19 Compiler Spec
    contentType: 'note',
    reason: 'wrong_info',
    details: 'The compiler specifications state incorrect automatic memoization hook parameters.',
    reporterId: 'usr_reporter_1',
    createdAt: new Date(Date.now() - 3600000 * 2), // 2 hrs ago
    status: 'pending'
  },
  {
    id: 'rep_2',
    contentId: 'doc-proj-1', // StudyMaterial
    contentType: 'project',
    reason: 'spam',
    details: 'Duplicate repository registrations with empty details description.',
    reporterId: 'usr_reporter_2',
    createdAt: new Date(Date.now() - 3600000 * 5), // 5 hrs ago
    status: 'pending'
  }
];

if (process.env.NODE_ENV !== 'production') {
  globalForReports.reportsStore = reportsStore;
}

/**
 * Authentication and permission role guard check.
 */
async function checkAuth(requiredRoles: Array<'admin' | 'editor' | 'author' | 'viewer'> = ['admin', 'editor']) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('UNAUTHENTICATED');
  }

  const role = (session.user as any).role as 'admin' | 'editor' | 'author' | 'viewer' || 'viewer';
  const status = (session.user as any).status as 'active' | 'disabled' || 'disabled';

  if (status !== 'active') {
    throw new Error('USER_DISABLED');
  }

  if (!requiredRoles.includes(role)) {
    throw new Error('FORBIDDEN');
  }

  return {
    userId: session.user.id!,
    userEmail: session.user.email!,
    userName: session.user.name || session.user.email!.split('@')[0],
    role,
  };
}

/**
 * Public User Action: Submit a report for spam, copyright violation, abuse, etc.
 */
export async function reportContentAction(
  contentId: string,
  contentType: string,
  reason: ContentReport['reason'],
  details: string
) {
  try {
    const actor = await checkAuth(['admin', 'editor', 'author', 'viewer']);
    
    const newReport: ContentReport = {
      id: `rep_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`,
      contentId,
      contentType,
      reason,
      details,
      reporterId: actor.userId,
      createdAt: new Date(),
      status: 'pending'
    };

    reportsStore.unshift(newReport);

    // Emit event asynchronously
    await EventBus.emit('content:reported', {
      reportId: newReport.id,
      contentId,
      contentType,
      reason,
      actorId: actor.userId
    });

    return { success: true, report: newReport };
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

/**
 * Admin/Moderator Action: Moderate reported content or modify verification/feature settings.
 */
export async function moderateContentAction(
  contentId: string,
  contentType: string,
  actionType: 'hide' | 'restore' | 'verify' | 'feature' | 'lock_comments' | 'suspend_author',
  auditNotes: string = ''
) {
  try {
    const actor = await checkAuth(['admin', 'editor']);

    // Log the moderator action event
    await EventBus.emit('content:moderated', {
      contentId,
      contentType,
      actionType,
      moderatorId: actor.userId,
      auditNotes
    });

    // Update status of related reports
    reportsStore.forEach(rep => {
      if (rep.contentId === contentId && rep.contentType === contentType) {
        rep.status = 'reviewed';
      }
    });

    revalidatePath('/admin/moderation');
    revalidatePath('/');
    
    return { 
      success: true, 
      actionApplied: actionType, 
      contentId, 
      moderatorName: actor.userName 
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

/**
 * Server-Side Ownership Guard: Validates that the current user is indeed the author of target resource.
 */
export async function verifyOwnershipAction(contentId: string, authorId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  
  const role = (session.user as any).role;
  if (role === 'admin') return true; // Admins bypass ownership checks for moderation purposes

  return session.user.id === authorId;
}

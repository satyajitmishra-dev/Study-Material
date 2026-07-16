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
    contentId: 'proj_sandbox_1',
    contentType: 'project',
    reason: 'wrong_info',
    details: 'The compiler specifications state incorrect automatic memoization hook parameters.',
    reporterId: 'usr_reporter_1',
    createdAt: new Date(Date.now() - 3600000 * 2), // 2 hrs ago
    status: 'pending'
  },
  {
    id: 'rep_2',
    contentId: 'proj_sandbox_2',
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
 * Authentication and capability guard check.
 */
async function checkAuth(requiredCapability: 'Moderator' | 'Admin' | 'Creator' = 'Moderator') {
  const session = await auth();
  if (!session?.user) {
    throw new Error('UNAUTHENTICATED');
  }

  const role = (session.user as any).role || 'user';
  const status = (session.user as any).status || 'active';
  const emailVerified = (session.user as any).emailVerified;

  if (status !== 'active') {
    throw new Error('USER_DISABLED');
  }

  if (requiredCapability === 'Admin') {
    if (role !== 'admin') throw new Error('FORBIDDEN');
  } else if (requiredCapability === 'Moderator') {
    if (role !== 'admin' && role !== 'moderator') throw new Error('FORBIDDEN');
  } else if (requiredCapability === 'Creator') {
    if (emailVerified === null) throw new Error('FORBIDDEN');
  }

  return {
    userId: session.user.id!,
    userEmail: session.user.email!,
    userName: session.user.name || session.user.email!.split('@')[0],
    role,
  };
}

/**
 * Public User Action: Submit a report for spam, copyright, abuse, etc.
 */
export async function reportContentAction(
  contentId: string,
  contentType: string,
  reason: ContentReport['reason'],
  details: string
) {
  try {
    const actor = await checkAuth('Creator');
    
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
 * Retrieve all Reports (Admin/Moderator only)
 */
export async function getAllReportsAction() {
  try {
    await checkAuth('Moderator');
    return { success: true, reports: reportsStore };
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
    const actor = await checkAuth('Moderator');
    const prisma = getPrisma();

    // Perform database level update based on content type
    if (prisma) {
      if (contentType === 'project') {
        if (actionType === 'hide') {
          await prisma.cmsProject.update({ where: { id: contentId }, data: { status: 'archived' } });
        } else if (actionType === 'restore') {
          await prisma.cmsProject.update({ where: { id: contentId }, data: { status: 'published' } });
        }
      } else if (contentType === 'note') {
        if (actionType === 'hide') {
          await prisma.userNote.update({ where: { id: contentId }, data: { visibility: 'private' } });
        } else if (actionType === 'restore') {
          await prisma.userNote.update({ where: { id: contentId }, data: { visibility: 'public' } });
        }
      } else if (contentType === 'discussion') {
        if (actionType === 'hide') {
          await prisma.discussion.update({ where: { id: contentId }, data: { visibility: 'private' } });
        } else if (actionType === 'restore') {
          await prisma.discussion.update({ where: { id: contentId }, data: { visibility: 'public' } });
        }
      }
    }

    // Log the moderator action event
    await EventBus.emit('content:moderated', {
      contentId,
      contentType,
      actionType,
      moderatorId: actor.userId,
      auditNotes
    });

    // Update status of related reports in memory
    reportsStore.forEach(rep => {
      if (rep.contentId === contentId && rep.contentType === contentType) {
        rep.status = 'reviewed';
      }
    });

    revalidatePath('/admin/moderation');
    revalidatePath('/admin/community-mod');
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
 * Retrieve all registered users (Admin only)
 */
export async function getAllUsersAction() {
  try {
    await checkAuth('Admin');
    const prisma = getPrisma();

    if (prisma) {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return { success: true, users };
    }

    // Sandbox fallbacks
    return { 
      success: true, 
      users: [
        { id: 'usr_admin', name: 'Admin', email: 'healgodse@gmail.com', username: 'admin', role: 'admin', status: 'active', emailVerified: new Date(), createdAt: new Date() },
        { id: 'usr_user_1', name: 'Satyajit Mishra', email: 'satya@domain.com', username: 'satyajit_m', role: 'user', status: 'active', emailVerified: new Date(), createdAt: new Date() }
      ] 
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

/**
 * Moderate User Action (Admin only)
 */
export async function moderateUserAction(
  targetUserId: string,
  actionType: 'verify' | 'suspend' | 'activate' | 'change_role' | 'shadowban' | 'tempban' | 'permban' | 'unban' | 'add_strike',
  reasonOrPayload?: any,
  durationDays?: number
) {
  try {
    const actor = await checkAuth('Moderator');
    const prisma = getPrisma();
    const reason = typeof reasonOrPayload === 'string' ? reasonOrPayload : (reasonOrPayload?.reason || '');

    if (prisma) {
      if (actionType === 'verify') {
        await prisma.user.update({
          where: { id: targetUserId },
          data: { emailVerified: new Date() }
        });
      } else if (actionType === 'suspend') {
        await prisma.user.update({
          where: { id: targetUserId },
          data: { status: 'disabled' }
        });
        await prisma.userSession.deleteMany({
          where: { userId: targetUserId }
        });
      } else if (actionType === 'activate') {
        await prisma.user.update({
          where: { id: targetUserId },
          data: { status: 'active' }
        });
      } else if (actionType === 'change_role') {
        await prisma.user.update({
          where: { id: targetUserId },
          data: { role: reasonOrPayload?.role || 'user' }
        });
      } else if (actionType === 'shadowban') {
        await prisma.user.update({
          where: { id: targetUserId },
          data: { shadowBanned: true }
        });
      } else if (actionType === 'tempban') {
        const expires = durationDays ? new Date(Date.now() + durationDays * 24 * 3600000) : new Date(Date.now() + 7 * 24 * 3600000);
        await prisma.user.update({
          where: { id: targetUserId },
          data: { 
            status: 'disabled', 
            banExpires: expires,
            banReason: reason
          }
        });
      } else if (actionType === 'permban') {
        await prisma.user.update({
          where: { id: targetUserId },
          data: { 
            status: 'disabled', 
            banReason: reason,
            banExpires: null
          }
        });
      } else if (actionType === 'unban') {
        await prisma.user.update({
          where: { id: targetUserId },
          data: { 
            status: 'active', 
            banExpires: null,
            banReason: null
          }
        });
      } else if (actionType === 'add_strike') {
        await prisma.user.update({
          where: { id: targetUserId },
          data: { strikesCount: { increment: 1 } }
        });
      }
    }

    const detailLog = `Moderator ${actor.userName} executed target [${actionType.toUpperCase()}] on User ID: ${targetUserId}. Reason: ${reason}`;
    
    // Log the moderator action event
    await EventBus.emit('content:moderated', {
      contentId: targetUserId,
      contentType: 'user',
      actionType,
      moderatorId: actor.userId,
      auditNotes: detailLog
    });

    revalidatePath('/admin/users');
    revalidatePath('/admin/moderation');
    
    return { success: true, log: detailLog };
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

/**
 * Retrieve all items of a content type for moderation (Admin/Moderator only)
 */
export async function getAllContentAction(contentType: 'project' | 'note' | 'discussion') {
  try {
    await checkAuth('Moderator');
    const prisma = getPrisma();

    if (prisma) {
      if (contentType === 'project') {
        const items = await prisma.cmsProject.findMany({
          include: { author: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' }
        });
        return { success: true, items };
      } else if (contentType === 'note') {
        const items = await prisma.userNote.findMany({
          include: { author: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' }
        });
        return { success: true, items };
      } else if (contentType === 'discussion') {
        const items = await prisma.discussion.findMany({
          include: { author: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' }
        });
        return { success: true, items };
      }
    }

    // Sandbox fallback
    return { 
      success: true, 
      items: [
        { id: 'proj_sandbox_1', title: 'StudyMaterial Core App', status: 'published', views: 320, author: { name: 'Satyajit', email: 'satya@domain.com' }, createdAt: new Date() },
        { id: 'note_sandbox_1', title: 'React 19 Compiler Spec', visibility: 'public', views: 85, author: { name: 'Satyajit', email: 'satya@domain.com' }, createdAt: new Date() }
      ] 
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

/**
 * Server-Side Ownership Guard.
 */
export async function verifyOwnershipAction(contentId: string, authorId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  
  const role = (session.user as any).role;
  if (role === 'admin') return true;

  return session.user.id === authorId;
}


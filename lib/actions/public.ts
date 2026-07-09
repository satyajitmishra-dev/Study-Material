'use server';

import { auth } from '@/auth';
import { getPrisma } from '@/lib/database/dbClient';
import { rateLimit } from '@/lib/security/rateLimit';
import { revalidatePath } from 'next/cache';
import { 
  publicDb,
  inMemoryReactions, 
  inMemoryBookmarks, 
  inMemoryComments, 
  inMemoryCommentReplies, 
  inMemoryHighlights, 
  inMemoryNotes, 
  inMemoryFollows, 
  inMemoryReadingSessions,
  inMemorySettings,
  inMemoryCollections,
  inMemorySpamReports,
  inMemoryShareEvents
} from '@/lib/database/publicDb';

// Helper to get active user or anonymous session
async function getSessionContext(visitorId?: string) {
  const session = await auth();
  const userId = session?.user?.id;
  const userRole = (session?.user as any)?.role || 'user';
  
  return {
    userId,
    userRole,
    visitorId: userId ? undefined : visitorId,
  };
}

// 1. Sync Guest Visitor Data on Login
export async function syncVisitorDataAction(visitorId: string) {
  if (!visitorId) return { success: false, error: 'MISSING_VISITOR_ID' };
  
  const ctx = await getSessionContext();
  if (!ctx.userId) return { success: false, error: 'UNAUTHENTICATED' };

  try {
    await publicDb.syncVisitorData(visitorId, ctx.userId);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

// 2. React to Post (Toggle Reaction like LOVE, HELPFUL, etc.)
export async function reactToPostAction(projectId: string, type: string, visitorId?: string) {
  const ctx = await getSessionContext(visitorId);
  const identifier = ctx.userId || ctx.visitorId || 'anonymous';
  
  const limitCheck = rateLimit(`react_${identifier}`, 60, 60000); // 60 claps per minute
  if (!limitCheck.success) {
    return { success: false, error: 'RATE_LIMIT_EXCEEDED' };
  }

  const prisma = getPrisma();
  
  try {
    if (prisma) {
      const where = ctx.userId
        ? { projectId_userId_type: { projectId, userId: ctx.userId, type } }
        : { projectId_visitorId_type: { projectId, visitorId: ctx.visitorId!, type } };

      const existing = await prisma.reaction.findFirst({
        where: {
          projectId,
          type,
          userId: ctx.userId || null,
          visitorId: ctx.userId ? null : ctx.visitorId || null
        }
      });

      if (existing) {
        await prisma.reaction.delete({ where: { id: existing.id } });
        revalidatePath(`/posts/${projectId}`);
        return { success: true, reacted: false };
      } else {
        await prisma.reaction.create({
          data: {
            projectId,
            type,
            userId: ctx.userId || null,
            visitorId: ctx.userId ? null : ctx.visitorId || null
          }
        });
        revalidatePath(`/posts/${projectId}`);
        return { success: true, reacted: true };
      }
    } else {
      // In-Memory
      const existingIdx = inMemoryReactions.findIndex(r => 
        r.projectId === projectId && 
        r.type === type && 
        ((ctx.userId && r.userId === ctx.userId) || (!ctx.userId && r.visitorId === ctx.visitorId))
      );

      if (existingIdx >= 0) {
        inMemoryReactions.splice(existingIdx, 1);
        return { success: true, reacted: false };
      } else {
        inMemoryReactions.push({
          id: `react_${Date.now()}_${Math.random()}`,
          projectId,
          type,
          userId: ctx.userId || null,
          visitorId: ctx.userId ? null : ctx.visitorId || null,
          createdAt: new Date()
        } as any);
        return { success: true, reacted: true };
      }
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

// 3. Bookmark Post (Toggle Bookmark with optional Collection folder)
export async function bookmarkPostAction(projectId: string, collectionId?: string, visitorId?: string) {
  const ctx = await getSessionContext(visitorId);
  const identifier = ctx.userId || ctx.visitorId;
  if (!identifier) return { success: false, error: 'MISSING_IDENTIFIER' };

  const prisma = getPrisma();

  try {
    if (prisma) {
      const existing = await prisma.bookmark.findFirst({
        where: {
          projectId,
          userId: ctx.userId || null,
          visitorId: ctx.userId ? null : ctx.visitorId || null
        }
      });

      if (existing) {
        await prisma.bookmark.delete({ where: { id: existing.id } });
        return { success: true, bookmarked: false };
      } else {
        await prisma.bookmark.create({
          data: {
            projectId,
            userId: ctx.userId || null,
            visitorId: ctx.userId ? null : ctx.visitorId || null,
            collectionId: collectionId || null
          }
        });
        return { success: true, bookmarked: true };
      }
    } else {
      // In-Memory
      const existingIdx = inMemoryBookmarks.findIndex(b => 
        b.projectId === projectId && 
        ((ctx.userId && b.userId === ctx.userId) || (!ctx.userId && b.visitorId === ctx.visitorId))
      );

      if (existingIdx >= 0) {
        inMemoryBookmarks.splice(existingIdx, 1);
        return { success: true, bookmarked: false };
      } else {
        inMemoryBookmarks.push({
          id: `bm_${Date.now()}`,
          projectId,
          userId: ctx.userId || null,
          visitorId: ctx.userId ? null : ctx.visitorId || null,
          collectionId: collectionId || null,
          createdAt: new Date()
        } as any);
        return { success: true, bookmarked: true };
      }
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

// 4. Create/Manage Bookmark Collections
export async function manageCollectionAction(name: string, description?: string, visitorId?: string) {
  const ctx = await getSessionContext(visitorId);
  const identifier = ctx.userId || ctx.visitorId;
  if (!identifier) return { success: false, error: 'UNAUTHENTICATED' };

  const prisma = getPrisma();

  try {
    if (prisma) {
      const collection = await prisma.collection.create({
        data: {
          name,
          description,
          userId: ctx.userId || null,
          visitorId: ctx.userId ? null : ctx.visitorId || null
        }
      });
      return { success: true, collection };
    } else {
      const newCol = {
        id: `col_${Date.now()}`,
        name,
        description: description || null,
        userId: ctx.userId || null,
        visitorId: ctx.userId ? null : ctx.visitorId || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryCollections.push(newCol as any);
      return { success: true, collection: newCol };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

// 5. Create Comments & Nested Replies
export async function submitCommentAction(projectId: string, content: string, parentId?: string, visitorId?: string) {
  const ctx = await getSessionContext(visitorId);
  if (!ctx.userId) return { success: false, error: 'LOGGED_IN_USERS_ONLY' };

  const limitCheck = rateLimit(`comment_${ctx.userId}`, 5, 60000); // Max 5 comments per minute
  if (!limitCheck.success) {
    return { success: false, error: 'RATE_LIMIT_EXCEEDED' };
  }

  // Basic sanitization
  const sanitizedContent = content.trim().replace(/<[^>]*>/g, '');
  if (!sanitizedContent) return { success: false, error: 'EMPTY_COMMENT' };

  const prisma = getPrisma();

  try {
    if (prisma) {
      if (parentId) {
        // Nested Reply
        const reply = await prisma.commentReply.create({
          data: {
            commentId: parentId,
            userId: ctx.userId,
            content: sanitizedContent
          }
        });
        revalidatePath(`/posts/${projectId}`);
        return { success: true, reply };
      } else {
        // Top-level Comment
        const comment = await prisma.comment.create({
          data: {
            projectId,
            userId: ctx.userId,
            content: sanitizedContent
          }
        });
        revalidatePath(`/posts/${projectId}`);
        return { success: true, comment };
      }
    } else {
      // In-Memory
      if (parentId) {
        const reply = {
          id: `rep_${Date.now()}`,
          commentId: parentId,
          userId: ctx.userId,
          content: sanitizedContent,
          isEdited: false,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        inMemoryCommentReplies.push(reply as any);
        return { success: true, reply };
      } else {
        const comment = {
          id: `comm_${Date.now()}`,
          projectId,
          userId: ctx.userId,
          content: sanitizedContent,
          isEdited: false,
          isDeleted: false,
          isPinned: false,
          isApproved: true,
          likesCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        inMemoryComments.push(comment as any);
        return { success: true, comment };
      }
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

// 6. Kindle-Style Highlight Creator
export async function saveHighlightAction(projectId: string, text: string, color: string, visitorId?: string) {
  const ctx = await getSessionContext(visitorId);
  const identifier = ctx.userId || ctx.visitorId;
  if (!identifier) return { success: false, error: 'UNAUTHENTICATED' };

  const prisma = getPrisma();

  try {
    if (prisma) {
      const highlight = await prisma.highlight.create({
        data: {
          projectId,
          userId: ctx.userId || null,
          visitorId: ctx.userId ? null : ctx.visitorId || null,
          text,
          color
        }
      });
      return { success: true, highlight };
    } else {
      const highlight = {
        id: `hl_${Date.now()}`,
        projectId,
        userId: ctx.userId || null,
        visitorId: ctx.userId ? null : ctx.visitorId || null,
        text,
        color,
        createdAt: new Date()
      };
      inMemoryHighlights.push(highlight as any);
      return { success: true, highlight };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

// 7. Kindle-Style Highlight Note Anchor
export async function saveNoteAction(projectId: string, highlightId: string | null, content: string, isPrivate: boolean, visitorId?: string) {
  const ctx = await getSessionContext(visitorId);
  const identifier = ctx.userId || ctx.visitorId;
  if (!identifier) return { success: false, error: 'UNAUTHENTICATED' };

  const prisma = getPrisma();

  try {
    if (prisma) {
      const note = await prisma.note.create({
        data: {
          projectId,
          highlightId: highlightId || null,
          userId: ctx.userId || null,
          visitorId: ctx.userId ? null : ctx.visitorId || null,
          content,
          isPrivate
        }
      });
      return { success: true, note };
    } else {
      const note = {
        id: `note_${Date.now()}`,
        projectId,
        highlightId: highlightId || null,
        userId: ctx.userId || null,
        visitorId: ctx.userId ? null : ctx.visitorId || null,
        content,
        isPrivate,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryNotes.push(note as any);
      return { success: true, note };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

// 8. Track Reading Streak & Goal Sessions
export async function trackReadingSessionAction(timeSpentSeconds: number, postCompleted: boolean, visitorId?: string) {
  const ctx = await getSessionContext(visitorId);
  const identifier = ctx.userId || ctx.visitorId;
  if (!identifier) return { success: false, error: 'UNAUTHENTICATED' };

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const prisma = getPrisma();

  try {
    if (prisma) {
      const existing = await prisma.readingSession.findFirst({
        where: {
          date: today,
          userId: ctx.userId || null,
          visitorId: ctx.userId ? null : ctx.visitorId || null
        }
      });

      if (existing) {
        const updated = await prisma.readingSession.update({
          where: { id: existing.id },
          data: {
            timeSpent: { increment: timeSpentSeconds },
            postsCompleted: { increment: postCompleted ? 1 : 0 }
          }
        });
        return { success: true, session: updated };
      } else {
        // Calculate streak
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];
        
        const yesterdaySession = await prisma.readingSession.findFirst({
          where: {
            date: yesterday,
            userId: ctx.userId || null,
            visitorId: ctx.userId ? null : ctx.visitorId || null
          }
        });

        const streak = yesterdaySession ? yesterdaySession.streakCount + 1 : 1;

        const session = await prisma.readingSession.create({
          data: {
            date: today,
            userId: ctx.userId || null,
            visitorId: ctx.userId ? null : ctx.visitorId || null,
            timeSpent: timeSpentSeconds,
            postsCompleted: postCompleted ? 1 : 0,
            streakCount: streak
          }
        });
        return { success: true, session };
      }
    } else {
      // In-Memory
      const existing = inMemoryReadingSessions.find(s => 
        s.date === today && 
        ((ctx.userId && s.userId === ctx.userId) || (!ctx.userId && s.visitorId === ctx.visitorId))
      );

      if (existing) {
        existing.timeSpent += timeSpentSeconds;
        if (postCompleted) existing.postsCompleted += 1;
        return { success: true, session: existing };
      } else {
        const yesterdaySession = inMemoryReadingSessions.find(s => {
          const yesterdayDate = new Date();
          yesterdayDate.setDate(yesterdayDate.getDate() - 1);
          const yesterday = yesterdayDate.toISOString().split('T')[0];
          return s.date === yesterday && ((ctx.userId && s.userId === ctx.userId) || (!ctx.userId && s.visitorId === ctx.visitorId));
        });

        const streak = yesterdaySession ? yesterdaySession.streakCount + 1 : 1;
        const newSession = {
          id: `session_${Date.now()}`,
          userId: ctx.userId || null,
          visitorId: ctx.userId ? null : ctx.visitorId || null,
          date: today,
          timeSpent: timeSpentSeconds,
          postsCompleted: postCompleted ? 1 : 0,
          streakCount: streak,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        inMemoryReadingSessions.push(newSession as any);
        return { success: true, session: newSession };
      }
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

// 9. Spam & Moderation Queue Submissions
export async function submitSpamReportAction(commentId: string | null, projectId: string | null, reason: string, visitorId?: string) {
  const ctx = await getSessionContext(visitorId);
  const prisma = getPrisma();

  try {
    if (prisma) {
      const report = await prisma.spamReport.create({
        data: {
          commentId: commentId || null,
          projectId: projectId || null,
          userId: ctx.userId || null,
          visitorId: ctx.userId ? null : ctx.visitorId || null,
          reason,
          status: 'pending'
        }
      });
      return { success: true, report };
    } else {
      const report = {
        id: `spam_${Date.now()}`,
        commentId: commentId || null,
        projectId: projectId || null,
        userId: ctx.userId || null,
        visitorId: ctx.userId ? null : ctx.visitorId || null,
        reason,
        status: 'pending',
        createdAt: new Date()
      };
      inMemorySpamReports.push(report as any);
      return { success: true, report };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

// 10. Newsletter Subscriber Digest Signup
export async function subscribeNewsletterDigestAction(email: string, frequency: 'daily' | 'weekly' | 'categories' | 'authors') {
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return { success: false, error: 'INVALID_EMAIL' };
  }

  // Simulate success
  return { success: true, frequency };
}

// 11. Follow Author, Category, or Tag
export async function toggleFollowAction(targetType: 'AUTHOR' | 'CATEGORY' | 'TAG', targetId: string) {
  const ctx = await getSessionContext();
  if (!ctx.userId) return { success: false, error: 'LOGGED_IN_USERS_ONLY' };

  const prisma = getPrisma();

  try {
    if (prisma) {
      const existing = await prisma.follow.findFirst({
        where: {
          userId: ctx.userId,
          targetType,
          targetId
        }
      });

      if (existing) {
        await prisma.follow.delete({ where: { id: existing.id } });
        return { success: true, followed: false };
      } else {
        await prisma.follow.create({
          data: {
            userId: ctx.userId,
            targetType,
            targetId
          }
        });
        return { success: true, followed: true };
      }
    } else {
      // In-Memory
      const idx = inMemoryFollows.findIndex(f => f.userId === ctx.userId && f.targetType === targetType && f.targetId === targetId);
      if (idx >= 0) {
        inMemoryFollows.splice(idx, 1);
        return { success: true, followed: false };
      } else {
        inMemoryFollows.push({
          id: `fol_${Date.now()}`,
          userId: ctx.userId,
          targetType,
          targetId,
          createdAt: new Date()
        });
        return { success: true, followed: true };
      }
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

// 12. Log Share Action
export async function logShareEventAction(projectId: string, platform: string, visitorId?: string) {
  const ctx = await getSessionContext(visitorId);
  const prisma = getPrisma();

  try {
    if (prisma) {
      await prisma.shareEvent.create({
        data: {
          projectId,
          userId: ctx.userId || null,
          visitorId: ctx.userId ? 'authenticated' : ctx.visitorId || 'anonymous',
          platform
        }
      });
    } else {
      inMemoryShareEvents.push({
        id: `share_${Date.now()}`,
        projectId,
        userId: ctx.userId || null,
        visitorId: ctx.userId ? 'authenticated' : ctx.visitorId || 'anonymous',
        platform,
        createdAt: new Date()
      });
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

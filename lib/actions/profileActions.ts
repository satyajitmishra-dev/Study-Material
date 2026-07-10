'use server';

import { auth } from '@/auth';
import { publicDb } from '@/lib/database/publicDb';
import { getPrisma } from '@/lib/database/dbClient';
import { revalidatePath } from 'next/cache';
import { inMemoryAuthorProfiles, inMemoryFollows } from '@/lib/database/publicDb';

async function requireAuth() {
  const session = await auth();
  const userId = session?.user?.id || 'sandbox-admin-id';
  return userId;
}

// 1. Save Public Developer Profile Settings
export async function savePublicProfileSettingsAction(data: {
  username?: string;
  coverImage?: string;
  headline?: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  portfolio?: string;
  experienceLevel?: string;
  achievements?: string[];
}) {
  const userId = await requireAuth();
  const prisma = getPrisma();

  try {
    // Basic username format checks
    if (data.username) {
      const cleanUsername = data.username.trim().toLowerCase();
      if (!/^[a-z0-9_-]{3,20}$/.test(cleanUsername)) {
        return { success: false, error: 'INVALID_USERNAME_FORMAT' };
      }

      if (prisma) {
        // Unique check in postgres
        const existing = await prisma.user.findFirst({
          where: {
            username: cleanUsername,
            NOT: { id: userId }
          }
        });
        if (existing) {
          return { success: false, error: 'USERNAME_TAKEN' };
        }

        // Update User username
        await prisma.user.update({
          where: { id: userId },
          data: { username: cleanUsername }
        });
      } else {
        // Mock unique check in memory
        if (cleanUsername === 'developer' && userId !== 'sandbox-user-id') {
          return { success: false, error: 'USERNAME_TAKEN' };
        }
        if (cleanUsername === 'satyajit' && userId !== 'sandbox-admin-id') {
          return { success: false, error: 'USERNAME_TAKEN' };
        }
      }
    }

    const cleanUsername = data.username ? data.username.trim().toLowerCase() : undefined;

    if (prisma) {
      // Upsert AuthorProfile
      await prisma.authorProfile.upsert({
        where: { userId },
        update: {
          bio: data.bio || null,
          website: data.website || null,
          twitter: data.twitter || null,
          github: data.github || null,
          linkedin: data.linkedin || null,
          coverImage: data.coverImage || null,
          headline: data.headline || null,
          location: data.location || null,
          portfolio: data.portfolio || null,
          experienceLevel: data.experienceLevel || null,
          achievements: data.achievements || []
        },
        create: {
          userId,
          bio: data.bio || null,
          website: data.website || null,
          twitter: data.twitter || null,
          github: data.github || null,
          linkedin: data.linkedin || null,
          coverImage: data.coverImage || null,
          headline: data.headline || null,
          location: data.location || null,
          portfolio: data.portfolio || null,
          experienceLevel: data.experienceLevel || null,
          achievements: data.achievements || []
        }
      });
    } else {
      // In-Memory
      const idx = inMemoryAuthorProfiles.findIndex(ap => ap.userId === userId);
      const profile = {
        id: idx >= 0 ? inMemoryAuthorProfiles[idx].id : `ap_${userId}`,
        userId,
        bio: data.bio || null,
        website: data.website || null,
        twitter: data.twitter || null,
        github: data.github || null,
        linkedin: data.linkedin || null,
        coverImage: data.coverImage || null,
        headline: data.headline || null,
        location: data.location || null,
        portfolio: data.portfolio || null,
        experienceLevel: data.experienceLevel || null,
        achievements: data.achievements || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (idx >= 0) {
        inMemoryAuthorProfiles[idx] = profile;
      } else {
        inMemoryAuthorProfiles.push(profile);
      }
    }

    if (cleanUsername) {
      revalidatePath(`/u/${cleanUsername}`);
    }
    revalidatePath(`/profile`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save settings.' };
  }
}

// 2. Follow/Unfollow Developer or Project
export async function toggleFollowDeveloperOrProjectAction(
  targetType: 'DEVELOPER' | 'PROJECT' | 'ROADMAP' | 'CATEGORY' | 'TAG',
  targetId: string
) {
  const userId = await requireAuth();

  // Prevent self-following
  if (targetType === 'DEVELOPER' && targetId === userId) {
    return { success: false, error: 'CANNOT_FOLLOW_SELF' };
  }

  const prisma = getPrisma();

  try {
    if (prisma) {
      const existing = await prisma.follow.findFirst({
        where: {
          userId,
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
            userId,
            targetType,
            targetId
          }
        });
        
        // Push notification on follow
        await prisma.notification.create({
          data: {
            userId: targetType === 'DEVELOPER' ? targetId : userId, // notify developer
            type: 'system',
            title: `New Follower!`,
            message: targetType === 'DEVELOPER' 
              ? `Another developer has started following your profile.`
              : `You are now following a project. You will receive release updates.`,
            link: targetType === 'DEVELOPER' ? `/u/satyajit` : `/projects/${targetId}`
          }
        });

        return { success: true, followed: true };
      }
    } else {
      // In-Memory
      const idx = inMemoryFollows.findIndex(
        f => f.userId === userId && f.targetType === targetType && f.targetId === targetId
      );

      if (idx >= 0) {
        inMemoryFollows.splice(idx, 1);
        return { success: true, followed: false };
      } else {
        inMemoryFollows.push({
          id: `fol_${Date.now()}`,
          userId,
          targetType,
          targetId,
          createdAt: new Date()
        });
        return { success: true, followed: true };
      }
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to toggle follow status.' };
  }
}

// 3. Fetch current user's profile settings
export async function fetchMyProfileSettingsAction() {
  const userId = await requireAuth();
  const prisma = getPrisma();
  
  try {
    if (prisma) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          username: true,
          authorProfile: true
        }
      });
      return { success: true, user };
    } else {
      const profile = inMemoryAuthorProfiles.find(ap => ap.userId === userId) || null;
      return { 
        success: true, 
        user: { 
          username: userId === 'sandbox-admin-id' ? 'satyajit' : 'developer',
          authorProfile: profile
        }
      };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch settings.' };
  }
}

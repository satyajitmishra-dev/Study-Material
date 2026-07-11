'use server';

import { auth } from '@/auth';
import { publicDb, inMemoryAuthorProfiles, inMemoryFollows, inMemoryUsernameHistories, inMemoryDraftBackups } from '@/lib/database/publicDb';
import { getPrisma } from '@/lib/database/dbClient';
import { revalidatePath } from 'next/cache';
import { validateUsernameFormat, sanitizeProfileText, RESERVED_WORDS } from '@/lib/validation/profile';

async function requireAuth() {
  const session = await auth();
  const userId = session?.user?.id || 'sandbox-admin-id';
  return userId;
}

// 1. Save Public Developer Profile Settings
export async function savePublicProfileSettingsAction(data: {
  username?: string;
  name?: string;
  avatar?: string;
  coverImage?: string;
  headline?: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  portfolio?: string;
  youtube?: string;
  discord?: string;
  hashnode?: string;
  devto?: string;
  leetcode?: string;
  codeforces?: string;
  codechef?: string;
  hackerrank?: string;
  medium?: string;
  experienceLevel?: string;
  availability?: string;
  skills?: string; // JSON string
  experience?: string; // JSON string
  education?: string; // JSON string
  achievementsJson?: string; // JSON string
  languages?: string[];
  interests?: string[];
}) {
  const userId = await requireAuth();
  const prisma = getPrisma();

  try {
    let cleanUsername = data.username ? data.username.trim().toLowerCase() : undefined;

    if (cleanUsername) {
      const formatCheck = validateUsernameFormat(cleanUsername);
      if (!formatCheck.valid) {
        return { success: false, error: formatCheck.error || 'INVALID_USERNAME_FORMAT' };
      }

      // Check username change policy (limit to once every 30 days)
      if (prisma) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { username: true, lastUsernameChangedAt: true }
        });

        if (user && user.username !== cleanUsername) {
          if (user.lastUsernameChangedAt) {
            const diffTime = Math.abs(Date.now() - new Date(user.lastUsernameChangedAt).getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < 30) {
              return {
                success: false,
                error: 'USERNAME_CHANGE_RESTRICTED',
                remainingDays: 30 - diffDays
              };
            }
          }

          // Uniqueness check
          const existing = await prisma.user.findFirst({
            where: { username: cleanUsername, NOT: { id: userId } }
          });
          if (existing) {
            return { success: false, error: 'USERNAME_TAKEN' };
          }

          // Store in history
          if (user.username) {
            await prisma.usernameHistory.create({
              data: {
                userId,
                oldUsername: user.username,
                newUsername: cleanUsername
              }
            });

            // Create CmsRedirect for SEO (301 redirect)
            await prisma.cmsRedirect.upsert({
              where: { sourcePath: `/u/${user.username}` },
              update: { targetPath: `/u/${cleanUsername}`, updatedAt: new Date() },
              create: { sourcePath: `/u/${user.username}`, targetPath: `/u/${cleanUsername}`, statusCode: 301 }
            });
          }

          // Update User username & last changed date
          await prisma.user.update({
            where: { id: userId },
            data: {
              username: cleanUsername,
              lastUsernameChangedAt: new Date(),
              name: data.name || undefined,
              avatar: data.avatar || undefined
            }
          });
        } else {
          // Just update name/avatar if username is the same
          await prisma.user.update({
            where: { id: userId },
            data: {
              name: data.name || undefined,
              avatar: data.avatar || undefined
            }
          });
        }
      } else {
        // In-Memory Username policy fallback
        const mockUsers = [
          { id: 'sandbox-admin-id', username: 'satyajit', lastUsernameChangedAt: null },
          { id: 'sandbox-user-id', username: 'developer', lastUsernameChangedAt: null }
        ];
        const user = mockUsers.find(u => u.id === userId);
        if (user && user.username !== cleanUsername) {
          // Check if taken in memory
          if (cleanUsername === 'developer' && userId !== 'sandbox-user-id') {
            return { success: false, error: 'USERNAME_TAKEN' };
          }
          if (cleanUsername === 'satyajit' && userId !== 'sandbox-admin-id') {
            return { success: false, error: 'USERNAME_TAKEN' };
          }

          // Store redirect in memory
          inMemoryUsernameHistories.push({
            id: `uh_${Date.now()}`,
            userId,
            oldUsername: user.username,
            newUsername: cleanUsername,
            createdAt: new Date()
          });

          publicDb.createCmsRedirect(`/u/${user.username}`, `/u/${cleanUsername}`);
          user.username = cleanUsername;
        }
      }
    }

    // Sanitize bio & headline
    const cleanBio = data.bio ? sanitizeProfileText(data.bio) : null;
    const cleanHeadline = data.headline ? sanitizeProfileText(data.headline) : null;

    if (prisma) {
      // Upsert AuthorProfile
      await prisma.authorProfile.upsert({
        where: { userId },
        update: {
          bio: cleanBio,
          website: data.website || null,
          twitter: data.twitter || null,
          github: data.github || null,
          linkedin: data.linkedin || null,
          coverImage: data.coverImage || null,
          headline: cleanHeadline,
          location: data.location || null,
          portfolio: data.portfolio || null,
          experienceLevel: data.experienceLevel || null,
          availability: data.availability || 'available',
          youtube: data.youtube || null,
          discord: data.discord || null,
          hashnode: data.hashnode || null,
          devto: data.devto || null,
          leetcode: data.leetcode || null,
          codeforces: data.codeforces || null,
          codechef: data.codechef || null,
          hackerrank: data.hackerrank || null,
          medium: data.medium || null,
          skills: data.skills || null,
          experience: data.experience || null,
          education: data.education || null,
          achievementsJson: data.achievementsJson || null
        },
        create: {
          userId,
          bio: cleanBio,
          website: data.website || null,
          twitter: data.twitter || null,
          github: data.github || null,
          linkedin: data.linkedin || null,
          coverImage: data.coverImage || null,
          headline: cleanHeadline,
          location: data.location || null,
          portfolio: data.portfolio || null,
          experienceLevel: data.experienceLevel || null,
          availability: data.availability || 'available',
          youtube: data.youtube || null,
          discord: data.discord || null,
          hashnode: data.hashnode || null,
          devto: data.devto || null,
          leetcode: data.leetcode || null,
          codeforces: data.codeforces || null,
          codechef: data.codechef || null,
          hackerrank: data.hackerrank || null,
          medium: data.medium || null,
          skills: data.skills || null,
          experience: data.experience || null,
          education: data.education || null,
          achievementsJson: data.achievementsJson || null
        }
      });
    } else {
      // In-Memory upsert
      const idx = inMemoryAuthorProfiles.findIndex(ap => ap.userId === userId);
      const profile = {
        id: idx >= 0 ? inMemoryAuthorProfiles[idx].id : `ap_${userId}`,
        userId,
        bio: cleanBio,
        website: data.website || null,
        twitter: data.twitter || null,
        github: data.github || null,
        linkedin: data.linkedin || null,
        coverImage: data.coverImage || null,
        headline: cleanHeadline,
        location: data.location || null,
        portfolio: data.portfolio || null,
        experienceLevel: data.experienceLevel || null,
        achievements: idx >= 0 ? inMemoryAuthorProfiles[idx].achievements : ['open_source_contributor', 'ai_wizard'],
        skills: data.skills || null,
        experience: data.experience || null,
        education: data.education || null,
        languages: data.languages || [],
        interests: data.interests || [],
        availability: data.availability || 'available',
        youtube: data.youtube || null,
        discord: data.discord || null,
        hashnode: data.hashnode || null,
        devto: data.devto || null,
        leetcode: data.leetcode || null,
        codeforces: data.codeforces || null,
        codechef: data.codechef || null,
        hackerrank: data.hackerrank || null,
        medium: data.medium || null,
        achievementsJson: data.achievementsJson || null,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any;

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

// 2. Check Username Availability (with suggestions generation)
export async function checkUsernameAvailabilityAction(username: string) {
  const userId = await requireAuth();
  const clean = username.trim().toLowerCase();

  const formatCheck = validateUsernameFormat(clean);
  if (!formatCheck.valid) {
    return { status: 'invalid', message: formatCheck.error };
  }

  const prisma = getPrisma();
  let isTaken = false;

  if (prisma) {
    const existing = await prisma.user.findFirst({
      where: { username: clean, NOT: { id: userId } }
    });
    isTaken = !!existing;
  } else {
    // Memory
    if (clean === 'developer' && userId !== 'sandbox-user-id') isTaken = true;
    if (clean === 'satyajit' && userId !== 'sandbox-admin-id') isTaken = true;
  }

  if (isTaken) {
    // Generate suggestions
    const suffixes = ['dev', 'tech', 'code', 'git', 'hub', 'pro', 'engineer', 'real', 'its', 'the'];
    const candidates: string[] = [];
    
    suffixes.forEach(s => {
      candidates.push(`${clean}-${s}`);
      candidates.push(`${s}-${clean}`);
    });

    for (let i = 1; i <= 5; i++) {
      candidates.push(`${clean}-${i}`);
      candidates.push(`${clean}${i}`);
    }

    // Filter available ones
    const availableSuggestions: string[] = [];
    for (const cand of candidates) {
      if (availableSuggestions.length >= 10) break;
      let candTaken = false;
      if (prisma) {
        const exist = await prisma.user.findUnique({ where: { username: cand } });
        candTaken = !!exist;
      } else {
        if (cand === 'developer' || cand === 'satyajit') candTaken = true;
      }
      if (!candTaken && !RESERVED_WORDS.includes(cand) && cand.length >= 3 && cand.length <= 30) {
        availableSuggestions.push(cand);
      }
    }

    return { status: 'taken', suggestions: availableSuggestions };
  }

  return { status: 'available' };
}

// 3. Follow/Unfollow Developer or Project
export async function toggleFollowDeveloperOrProjectAction(
  targetType: 'DEVELOPER' | 'PROJECT' | 'ROADMAP' | 'CATEGORY' | 'TAG',
  targetId: string
) {
  const userId = await requireAuth();

  if (targetType === 'DEVELOPER' && targetId === userId) {
    return { success: false, error: 'CANNOT_FOLLOW_SELF' };
  }

  const prisma = getPrisma();

  try {
    if (prisma) {
      const existing = await prisma.follow.findFirst({
        where: { userId, targetType, targetId }
      });

      if (existing) {
        await prisma.follow.delete({ where: { id: existing.id } });
        return { success: true, followed: false };
      } else {
        await prisma.follow.create({
          data: { userId, targetType, targetId }
        });
        
        await prisma.notification.create({
          data: {
            userId: targetType === 'DEVELOPER' ? targetId : userId,
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
    return { success: false, error: err.message || 'Failed to toggle follow.' };
  }
}

// 4. Fetch current user's profile settings
export async function fetchMyProfileSettingsAction() {
  const userId = await requireAuth();
  const prisma = getPrisma();
  
  try {
    if (prisma) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          username: true,
          name: true,
          avatar: true,
          profileVisibility: true,
          hiddenFields: true,
          lastUsernameChangedAt: true,
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
          name: userId === 'sandbox-admin-id' ? 'Sandbox Administrator' : 'Sandbox Developer',
          avatar: userId === 'sandbox-admin-id' 
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
          profileVisibility: 'public',
          hiddenFields: [],
          lastUsernameChangedAt: null,
          authorProfile: profile
        }
      };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch settings.' };
  }
}

// 5. Save Draft Backup (Autosave history)
export async function saveDraftBackupAction(key: string, content: string) {
  const userId = await requireAuth();
  const prisma = getPrisma();

  try {
    if (prisma) {
      // Limit autosave backups history: keep maximum 10 previous versions of draft
      const count = await prisma.draftBackup.count({
        where: { userId, key }
      });
      if (count >= 10) {
        const oldest = await prisma.draftBackup.findFirst({
          where: { userId, key },
          orderBy: { createdAt: 'asc' }
        });
        if (oldest) {
          await prisma.draftBackup.delete({ where: { id: oldest.id } });
        }
      }

      const backup = await prisma.draftBackup.create({
        data: { userId, key, content }
      });
      return { success: true, backup };
    } else {
      // In-Memory
      const matchIndex = inMemoryDraftBackups.filter((d: any) => d.userId === userId && d.key === key);
      if (matchIndex.length >= 10) {
        const oldest = inMemoryDraftBackups.find((d: any) => d.userId === userId && d.key === key);
        if (oldest) {
          const idx = inMemoryDraftBackups.indexOf(oldest);
          inMemoryDraftBackups.splice(idx, 1);
        }
      }
      const newItem = {
        id: `dbk_${Date.now()}`,
        userId,
        key,
        content,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryDraftBackups.push(newItem);
      return { success: true, backup: newItem };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 6. Fetch Draft Version History
export async function getDraftVersionHistoryAction(key: string) {
  const userId = await requireAuth();
  const prisma = getPrisma();

  try {
    if (prisma) {
      const history = await prisma.draftBackup.findMany({
        where: { userId, key },
        orderBy: { createdAt: 'desc' }
      });
      return { success: true, history };
    } else {
      const history = inMemoryDraftBackups
        .filter((d: any) => d.userId === userId && d.key === key)
        .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
      return { success: true, history };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 7. Update Profile Privacy Settings
export async function updateProfilePrivacySettingsAction(data: {
  profileVisibility: 'public' | 'private' | 'unlisted';
  hiddenFields: string[];
}) {
  const userId = await requireAuth();
  const prisma = getPrisma();

  try {
    if (prisma) {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          profileVisibility: data.profileVisibility,
          hiddenFields: data.hiddenFields
        }
      });
      return { success: true, user };
    } else {
      // Mock update
      return { success: true };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

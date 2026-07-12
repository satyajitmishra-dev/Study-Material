'use server';

import { auth } from '@/auth';
import { getPrisma } from '@/lib/database/dbClient';
import { revalidatePath } from 'next/cache';

export async function saveProfileFieldsAction(data: { name?: string; avatar?: string; preferences?: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('UNAUTHENTICATED');
  }
  
  const prisma = getPrisma();
  if (prisma) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        avatar: data.avatar,
        image: data.avatar, // keep in sync
        preferences: data.preferences
      }
    });
  }
  revalidatePath('/profile');
  return { success: true };
}

export async function deleteUserAccountAction() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('UNAUTHENTICATED');
  }
  
  const prisma = getPrisma();
  if (prisma) {
    // Delete user, cascading will handle accounts & sessions
    await prisma.user.delete({
      where: { id: session.user.id }
    });
  }
  return { success: true };
}

export async function registerUserAction(raw: { fullName: string; username: string; email: string }) {
  const prisma = getPrisma();
  const normalizedEmail = raw.email.toLowerCase().trim();
  const normalizedUsername = raw.username.toLowerCase().trim();

  if (prisma) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    if (existingEmail) {
      return { success: false, error: 'EMAIL_TAKEN' };
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: normalizedUsername }
    });
    if (existingUsername) {
      return { success: false, error: 'USERNAME_TAKEN' };
    }

    const user = await prisma.user.create({
      data: {
        name: raw.fullName,
        username: normalizedUsername,
        email: normalizedEmail,
        status: 'active',
        role: 'user',
      }
    });

    return { success: true, user };
  } else {
    // In-memory fallback
    const { db } = require('@/lib/database/dbClient');
    const existingEmail = await db.getUserByEmail(normalizedEmail);
    if (existingEmail) {
      return { success: false, error: 'EMAIL_TAKEN' };
    }

    // Since in-memory does not enforce username unique constraint out-of-the-box,
    // we search active adapter users if memory adapter
    const usersMap = (db as any).users;
    if (usersMap) {
      for (const u of usersMap.values()) {
        if (u.username?.toLowerCase() === normalizedUsername) {
          return { success: false, error: 'USERNAME_TAKEN' };
        }
      }
    }

    const user = await db.createUser({
      id: `u_${Date.now()}`,
      name: raw.fullName,
      username: normalizedUsername,
      email: normalizedEmail,
      role: 'user',
      status: 'active'
    });

    return { success: true, user };
  }
}

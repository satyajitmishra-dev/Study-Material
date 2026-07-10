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

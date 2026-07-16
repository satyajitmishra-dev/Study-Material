import { getPrisma } from '@/lib/database/dbClient';

/**
 * Log or update an active session tracking record in the database
 */
export async function registerSession(data: {
  userId: string;
  sessionToken: string;
  userAgent: string;
  ipAddress: string;
  browser: string;
  os: string;
}) {
  const prisma = getPrisma();
  if (!prisma) return;

  try {
    const inferredLocation = data.ipAddress === '127.0.0.1' || data.ipAddress.startsWith('192.168.') || data.ipAddress.startsWith('10.') 
      ? 'Localhost' 
      : 'Remote Device';

    await prisma.userSession.upsert({
      where: { sessionToken: data.sessionToken },
      update: { lastActiveAt: new Date() },
      create: {
        userId: data.userId,
        sessionToken: data.sessionToken,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        browser: data.browser,
        os: data.os,
        deviceType: data.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
        location: inferredLocation
      }
    });
  } catch (err) {
    console.error('Failed to record user session in database:', err);
  }
}

/**
 * Retrieve active sessions for a user
 */
export async function getActiveSessions(userId: string) {
  const prisma = getPrisma();
  if (!prisma) return [];
  return await prisma.userSession.findMany({
    where: { userId },
    orderBy: { lastActiveAt: 'desc' }
  });
}

/**
 * Revokes a session record by its unique database ID
 */
export async function revokeSession(sessionId: string, userId: string) {
  const prisma = getPrisma();
  if (!prisma) return { success: true };

  await prisma.userSession.deleteMany({
    where: { id: sessionId, userId }
  });

  return { success: true };
}

/**
 * Revokes all sessions for a user except the current active session
 */
export async function revokeAllOtherSessions(currentSessionToken: string, userId: string) {
  const prisma = getPrisma();
  if (!prisma) return { success: true };

  await prisma.userSession.deleteMany({
    where: {
      userId,
      NOT: { sessionToken: currentSessionToken }
    }
  });

  return { success: true };
}

/**
 * Revokes all sessions for a user (forces full logout across all devices)
 */
export async function revokeAllSessions(userId: string) {
  const prisma = getPrisma();
  if (!prisma) return { success: true };

  await prisma.userSession.deleteMany({
    where: { userId }
  });

  return { success: true };
}

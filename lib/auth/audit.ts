import { getPrisma } from '@/lib/database/dbClient';

/**
 * Creates a record in the AuthAuditLog table
 */
export async function logAuditEvent(data: {
  userId?: string | null;
  email: string;
  event: string; // e.g., 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'VERIFICATION_SUCCESS'
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const prisma = getPrisma();
  if (!prisma) {
    console.log(`[AUDIT LOG SIMULATION] Email: ${data.email}, Event: ${data.event}, IP: ${data.ipAddress}`);
    return;
  }

  try {
    await prisma.authAuditLog.create({
      data: {
        userId: data.userId || null,
        email: data.email,
        event: data.event,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      }
    });
  } catch (err) {
    console.error('Failed to create auth audit log entry:', err);
  }
}

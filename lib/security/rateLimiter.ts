import { getPrisma } from '@/lib/database/dbClient';

// Transient memory fallback store for sandbox mode
const memoryRateLimits = new Map<string, { count: number; expiresAt: number }>();

/**
 * Perform rate limit checks against a unique key.
 * Returns success boolean and time left in seconds until limit is reset.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ success: boolean; timeLeft: number }> {
  const prisma = getPrisma();
  const now = new Date();

  if (prisma) {
    try {
      const record = await prisma.rateLimit.findUnique({
        where: { key }
      });

      if (!record) {
        await prisma.rateLimit.create({
          data: {
            key,
            count: 1,
            expiresAt: new Date(now.getTime() + windowSeconds * 1000)
          }
        });
        return { success: true, timeLeft: 0 };
      }

      if (now.getTime() > record.expiresAt.getTime()) {
        await prisma.rateLimit.update({
          where: { key },
          data: {
            count: 1,
            expiresAt: new Date(now.getTime() + windowSeconds * 1000)
          }
        });
        return { success: true, timeLeft: 0 };
      }

      if (record.count < limit) {
        await prisma.rateLimit.update({
          where: { key },
          data: {
            count: record.count + 1
          }
        });
        return { success: true, timeLeft: 0 };
      }

      const timeLeft = Math.max(0, Math.ceil((record.expiresAt.getTime() - now.getTime()) / 1000));
      return { success: false, timeLeft };
    } catch (e) {
      console.error('Rate limiter database operation failed, falling back to memory:', e);
    }
  }

  // Memory fallback rate limiter
  const record = memoryRateLimits.get(key);
  if (!record || now.getTime() > record.expiresAt) {
    memoryRateLimits.set(key, {
      count: 1,
      expiresAt: now.getTime() + windowSeconds * 1000
    });
    return { success: true, timeLeft: 0 };
  }

  if (record.count < limit) {
    record.count += 1;
    return { success: true, timeLeft: 0 };
  }

  const timeLeft = Math.max(0, Math.ceil((record.expiresAt - now.getTime()) / 1000));
  return { success: false, timeLeft };
}

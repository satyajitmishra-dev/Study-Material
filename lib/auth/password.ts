import crypto from 'crypto';
import { getPrisma } from '@/lib/database/dbClient';

/**
 * Hash a password using PBKDF2 with 600,000 iterations
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 600000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored hash, supporting backward compatibility
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;

  // Try verifying with modern 600,000 iterations first
  let verifyHash = crypto.pbkdf2Sync(password, salt, 600000, 64, 'sha512').toString('hex');
  let isValid = false;
  try {
    isValid = crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
  } catch (e) {}

  // Fallback check for older legacy 10,000 iterations hashes
  if (!isValid) {
    try {
      const legacyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      isValid = crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(legacyHash, 'hex'));
    } catch (e) {}
  }

  return isValid;
}

/**
 * Check if the new password matches any of the last 5 passwords used
 */
export async function checkPasswordHistory(userId: string, newPassword: string): Promise<boolean> {
  const prisma = getPrisma();
  if (!prisma) return true; // Dev sandbox default

  const histories = await prisma.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  for (const hist of histories) {
    if (verifyPassword(newPassword, hist.hash)) {
      return false; // Found match in history
    }
  }
  return true;
}

/**
 * Add a password hash to the history log, capping the size at 5
 */
export async function recordPasswordHistory(userId: string, passwordHash: string): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;

  await prisma.passwordHistory.create({
    data: {
      userId,
      hash: passwordHash
    }
  });

  // Fetch all history to trim
  const histories = await prisma.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  if (histories.length > 5) {
    const toDelete = histories.slice(5).map(h => h.id);
    await prisma.passwordHistory.deleteMany({
      where: { id: { in: toDelete } }
    });
  }
}

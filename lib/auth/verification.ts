import crypto from 'crypto';
import { getPrisma } from '@/lib/database/dbClient';
import { enqueueEmail } from './emailQueue';
import { getVerifyNewEmailHtml, getEmailChangedHtml } from './mailer';

export type TokenVerificationType = 'VERIFY_EMAIL' | 'PASSWORD_RESET' | 'CHANGE_EMAIL';

/**
 * Generates a cryptographically secure random token, hashes it, and stores it in the database
 */
export async function generateVerificationToken(
  email: string,
  type: TokenVerificationType,
  expiresMs: number
): Promise<string> {
  const prisma = getPrisma();
  if (!prisma) return 'mock-token';

  // Invalidate and delete any older pending tokens for this email and type
  await prisma.accountVerification.deleteMany({
    where: { email, type }
  });

  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + expiresMs);

  await prisma.accountVerification.create({
    data: {
      email,
      code: hashedToken,
      type,
      expiresAt
    }
  });

  return token;
}

/**
 * Validates a verification token against its hashed database entry
 */
export async function verifyVerificationToken(
  token: string,
  type: TokenVerificationType
): Promise<{ success: boolean; email?: string; error?: string; recordId?: string }> {
  const prisma = getPrisma();
  if (!prisma) return { success: true, email: 'mock@domain.com' };

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const record = await prisma.accountVerification.findFirst({
    where: { code: hashedToken, type }
  });

  if (!record) {
    return { success: false, error: 'INVALID_TOKEN' };
  }

  // Check expiration time
  if (new Date().getTime() > record.expiresAt.getTime()) {
    await prisma.accountVerification.delete({ where: { id: record.id } });
    return { success: false, error: 'EXPIRED' };
  }

  return { success: true, email: record.email, recordId: record.id };
}

/**
 * Deletes a token to prevent reuse (Single-Use enforcement)
 */
export async function deleteVerificationToken(recordId: string) {
  const prisma = getPrisma();
  if (!prisma) return;
  try {
    await prisma.accountVerification.delete({ where: { id: recordId } });
  } catch (err) {}
}

/**
 * Starts the email change validation flow by sending a link to the new address
 */
export async function requestEmailChange(userId: string, newEmail: string, currentHost: string) {
  const prisma = getPrisma();
  if (!prisma) return { success: true };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, error: 'USER_NOT_FOUND' };

  // Create verification token for new email (expires in 24 hours)
  const token = await generateVerificationToken(newEmail, 'CHANGE_EMAIL', 24 * 60 * 60 * 1000);
  const verifyUrl = `${currentHost}/auth/verify-email-change?token=${token}&userId=${userId}`;

  // Queue confirmation link to new email address
  await enqueueEmail(
    newEmail,
    'Confirm your email address change - StudyMaterial',
    getVerifyNewEmailHtml(user.name || 'Developer', verifyUrl),
    `Verify your new email address by visiting: ${verifyUrl}`
  );

  return { success: true };
}

/**
 * Finalizes an email address change, updating the profile and notifying the old email
 */
export async function confirmEmailChange(token: string, userId: string) {
  const prisma = getPrisma();
  if (!prisma) return { success: true };

  const verifyRes = await verifyVerificationToken(token, 'CHANGE_EMAIL');
  if (!verifyRes.success) {
    return { success: false, error: verifyRes.error };
  }

  const newEmail = verifyRes.email!;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, error: 'USER_NOT_FOUND' };

  const oldEmail = user.email || '';

  // Update user email
  await prisma.user.update({
    where: { id: userId },
    data: { email: newEmail }
  });

  // Burn the single-use token
  if (verifyRes.recordId) {
    await deleteVerificationToken(verifyRes.recordId);
  }

  // Dispatch notification to old email for security audit transparency
  await enqueueEmail(
    oldEmail,
    'Security Alert: Email address changed - StudyMaterial',
    getEmailChangedHtml(user.name || 'Developer', oldEmail, newEmail),
    `Your email address has been updated to: ${newEmail}. If you did not request this, please contact support immediately.`
  );

  return { success: true, newEmail };
}

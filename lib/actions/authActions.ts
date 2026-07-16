'use server';

import { signupSchema, resetPasswordSchema } from '@/lib/auth/validation';
import { hashPassword, recordPasswordHistory, checkPasswordHistory } from '@/lib/auth/password';
import { checkRoleRateLimit } from '@/lib/auth/rateLimiter';
import { enqueueEmail } from '@/lib/auth/emailQueue';
import { getVerifyEmailHtml, getPasswordResetHtml, getWelcomeEmailHtml, getPasswordChangedHtml } from '@/lib/auth/mailer';
import { generateVerificationToken, verifyVerificationToken, deleteVerificationToken, requestEmailChange, confirmEmailChange } from '@/lib/auth/verification';
import { logAuditEvent } from '@/lib/auth/audit';
import { getActiveSessions, revokeSession, revokeAllOtherSessions } from '@/lib/auth/session';
import { isDisposableEmail } from '@/lib/auth/security';
import { revalidatePath } from 'next/cache';
import { getPrisma } from '@/lib/database/dbClient';
import { auth } from '@/auth';

const reservedUsernames = [
  'admin', 'api', 'support', 'login', 'root', 'studymaterial', 'moderator',
  'system', 'help', 'billing', 'security', 'auth', 'oauth', 'register', 'signup'
];

/**
 * Sign Up Action
 */
export async function signUpAction(raw: any, clientIp = '127.0.0.1') {
  // Rate limit: Max 5 signups per hour per IP & Email
  const rawEmail = (raw?.email || '').toLowerCase().trim();
  const rlIp = await checkRoleRateLimit(`signup-ip:${clientIp}`, 'signup');
  const rlEmail = await checkRoleRateLimit(`signup-email:${rawEmail}`, 'signup');
  if (!rlIp.success || !rlEmail.success) {
    return { success: false, error: 'RATE_LIMIT_EXCEEDED', timeLeft: rlIp.timeLeft || rlEmail.timeLeft };
  }

  const result = signupSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: 'VALIDATION_FAILED', details: result.error.flatten() };
  }

  const { fullName, username, email, password } = result.data;

  // Disposable email check
  if (isDisposableEmail(email)) {
    return { success: false, error: 'DISPOSABLE_EMAIL_BLOCKED' };
  }

  const prisma = getPrisma();

  try {
    if (prisma) {
      // Check duplicate email
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return { success: false, error: 'EMAIL_TAKEN' };
      }

      // Check duplicate username
      const existingUsername = await prisma.user.findUnique({ where: { username: username.toLowerCase() } });
      const inHistory = await prisma.usernameHistory.findUnique({ where: { oldUsername: username.toLowerCase() } });
      if (existingUsername || inHistory) {
        return { success: false, error: 'USERNAME_TAKEN' };
      }

      const passwordHash = hashPassword(password);
      const user = await prisma.user.create({
        data: {
          name: fullName,
          username: username.toLowerCase(),
          email,
          passwordHash,
          emailVerified: null, // Force verification
          role: 'user',
          status: 'active'
        }
      });

      // Add to password history log
      await recordPasswordHistory(user.id, passwordHash);

      // Generate verification token (expires in 24 hours)
      const token = await generateVerificationToken(email, 'VERIFY_EMAIL', 24 * 60 * 60 * 1000);

      // Create Audit Log
      await logAuditEvent({
        userId: user.id,
        email,
        event: 'SIGNUP',
        ipAddress: clientIp
      });

      // Dispatch Verification Email through Queue
      const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify?token=${token}`;
      await enqueueEmail(
        email,
        'Verify your email address - StudyMaterial',
        getVerifyEmailHtml(fullName, verifyUrl),
        `Please verify your email address by visiting: ${verifyUrl}`
      );

      return { success: true, email };
    } else {
      // Sandbox Mode Fallback
      return { success: true, email };
    }
  } catch (err: any) {
    console.error(err);
    return { success: false, error: 'SERVER_ERROR' };
  }
}

/**
 * Verify Email Token Action
 */
export async function verifyEmailTokenAction(token: string, clientIp = '127.0.0.1') {
  // Rate limit
  const rl = await checkRoleRateLimit(`verify-token-ip:${clientIp}`, 'verify');
  if (!rl.success) {
    return { success: false, error: 'RATE_LIMIT_EXCEEDED', timeLeft: rl.timeLeft };
  }

  const prisma = getPrisma();

  if (prisma) {
    const verifyRes = await verifyVerificationToken(token, 'VERIFY_EMAIL');
    if (!verifyRes.success) {
      return { success: false, error: verifyRes.error };
    }

    const email = verifyRes.email!;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, error: 'USER_NOT_FOUND' };

    // Update email verified status
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() }
    });

    // Invalidate/delete token immediately to prevent reuse
    if (verifyRes.recordId) {
      await deleteVerificationToken(verifyRes.recordId);
    }

    // Send Welcome Email via Queue
    await enqueueEmail(
      email,
      'Welcome to StudyMaterial!',
      getWelcomeEmailHtml(user.name || ''),
      `Welcome to StudyMaterial, ${user.name || 'Developer'}!`
    );

    // Audit Log
    await logAuditEvent({
      userId: user.id,
      email,
      event: 'VERIFICATION_SUCCESS',
      ipAddress: clientIp
    });

    return { success: true };
  } else {
    return { success: true };
  }
}

/**
 * Resend Verification Action
 */
export async function resendVerificationAction(email: string, clientIp = '127.0.0.1') {
  // Rate limit check on both IP and email
  const rlIp = await checkRoleRateLimit(`resend-verify-ip:${clientIp}`, 'verify');
  const rlEmail = await checkRoleRateLimit(`resend-verify-email:${email}`, 'verify');
  if (!rlIp.success || !rlEmail.success) {
    return { success: false, error: 'COOLDOWN_ACTIVE', timeLeft: rlIp.timeLeft || rlEmail.timeLeft };
  }

  const prisma = getPrisma();

  if (prisma) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Account enumeration protection: return generic success
      return { success: true };
    }

    if (user.emailVerified) {
      return { success: false, error: 'ALREADY_VERIFIED' };
    }

    // Generate token (valid for 24 hours)
    const token = await generateVerificationToken(email, 'VERIFY_EMAIL', 24 * 60 * 60 * 1000);

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify?token=${token}`;
    await enqueueEmail(
      email,
      'Verify your email address - StudyMaterial',
      getVerifyEmailHtml(user.name || '', verifyUrl),
      `Please verify your email address by visiting: ${verifyUrl}`
    );

    return { success: true };
  } else {
    return { success: true };
  }
}

/**
 * Forgot Password Action (Enumeration Protected)
 */
export async function forgotPasswordAction(email: string, clientIp = '127.0.0.1') {
  // Rate limit check
  const rlIp = await checkRoleRateLimit(`forgot-ip:${clientIp}`, 'forgot');
  const rlEmail = await checkRoleRateLimit(`forgot-email:${email}`, 'forgot');
  if (!rlIp.success || !rlEmail.success) {
    return { success: false, error: 'RATE_LIMIT_EXCEEDED', timeLeft: rlIp.timeLeft || rlEmail.timeLeft };
  }

  const prisma = getPrisma();

  if (prisma) {
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Always log forgot request audit event
    await logAuditEvent({
      userId: user?.id || null,
      email,
      event: 'PASSWORD_RESET_REQ',
      ipAddress: clientIp
    });

    if (user) {
      // Generate password reset token (strictly 30 minutes expiration)
      const token = await generateVerificationToken(email, 'PASSWORD_RESET', 30 * 60 * 1000);

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
      await enqueueEmail(
        email,
        'Reset your password - StudyMaterial',
        getPasswordResetHtml(user.name || '', resetUrl),
        `Please reset your password by visiting: ${resetUrl}`
      );
    }
    
    // Generic message to prevent account enumeration
    return { success: true, message: 'If the information provided is valid, we\'ll send you an email.' };
  } else {
    return { success: true, message: 'If the information provided is valid, we\'ll send you an email.' };
  }
}

/**
 * Reset Password Action
 */
export async function resetPasswordAction(raw: any, clientIp = '127.0.0.1') {
  const result = resetPasswordSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: 'VALIDATION_FAILED', details: result.error.flatten() };
  }

  const { token, password } = result.data;

  // Rate limit
  const rl = await checkRoleRateLimit(`reset-act-ip:${clientIp}`, 'reset');
  if (!rl.success) {
    return { success: false, error: 'RATE_LIMIT_EXCEEDED', timeLeft: rl.timeLeft };
  }

  const prisma = getPrisma();

  if (prisma) {
    const verifyRes = await verifyVerificationToken(token, 'PASSWORD_RESET');
    if (!verifyRes.success) {
      return { success: false, error: verifyRes.error };
    }

    const email = verifyRes.email!;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, error: 'USER_NOT_FOUND' };

    // Password History Check
    const allowed = await checkPasswordHistory(user.id, password);
    if (!allowed) {
      return { success: false, error: 'PASSWORD_USED_RECENTLY' };
    }

    const newHash = hashPassword(password);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash }
    });

    // Record password in history log
    await recordPasswordHistory(user.id, newHash);

    // Invalidate/delete reset token
    if (verifyRes.recordId) {
      await deleteVerificationToken(verifyRes.recordId);
    }

    // Revoke all other active sessions (force logout other devices)
    await revokeAllOtherSessions('', user.id);

    // Audit log
    await logAuditEvent({
      userId: user.id,
      email,
      event: 'PASSWORD_RESET_SUCCESS',
      ipAddress: clientIp
    });

    // Send confirmation email
    await enqueueEmail(
      email,
      'Security Notification: Password Changed - StudyMaterial',
      getPasswordChangedHtml(user.name || ''),
      'Your password has been changed successfully. If you did not make this change, please contact support immediately.'
    );

    return { success: true };
  } else {
    return { success: true };
  }
}

/**
 * Username Availability Check Action
 */
export async function checkUsernameAvailabilityAction(username: string) {
  const cleanUsername = username.trim().toLowerCase();
  
  if (cleanUsername.length < 3) {
    return { available: false, error: 'Username must be at least 3 characters.' };
  }
  if (!/^[a-zA-Z0-9_\.]+$/.test(cleanUsername)) {
    return { available: false, error: 'Username can only contain letters, numbers, underscores, and periods.' };
  }
  if (reservedUsernames.includes(cleanUsername)) {
    const suggestions = generateUsernameSuggestions(cleanUsername);
    return { available: false, error: 'Username is reserved.', suggestions };
  }

  const prisma = getPrisma();
  if (prisma) {
    const existing = await prisma.user.findUnique({ where: { username: cleanUsername } });
    const inHistory = await prisma.usernameHistory.findUnique({ where: { oldUsername: cleanUsername } });

    if (existing || inHistory) {
      const suggestions = await getAvailableSuggestions(cleanUsername);
      return { available: false, error: 'Username is already taken.', suggestions };
    }

    return { available: true };
  } else {
    // Sandbox memory check
    const { db } = require('@/lib/database/dbClient');
    const usersMap = (db as any).users;
    let taken = false;
    if (usersMap) {
      for (const u of usersMap.values()) {
        if (u.username?.toLowerCase() === cleanUsername) taken = true;
      }
    }
    if (taken) {
      const suggestions = generateUsernameSuggestions(cleanUsername);
      return { available: false, error: 'Username is already taken.', suggestions };
    }
    return { available: true };
  }
}

// Helpers for username suggestions
function generateUsernameSuggestions(base: string): string[] {
  const list: string[] = [];
  const suffixes = ['_dev', '_code', '_git', 'builds', 'hq', 'stack'];
  for (const s of suffixes) {
    list.push(`${base}${s}`);
  }
  for (let i = 0; i < 4; i++) {
    list.push(`${base}${Math.floor(Math.random() * 89) + 10}`);
  }
  return list;
}

async function getAvailableSuggestions(base: string): Promise<string[]> {
  const prisma = getPrisma();
  if (!prisma) return generateUsernameSuggestions(base);

  const list: string[] = [];
  const candidates = generateUsernameSuggestions(base);
  for (const c of candidates) {
    const existing = await prisma.user.findUnique({ where: { username: c } });
    const inHistory = await prisma.usernameHistory.findUnique({ where: { oldUsername: c } });
    if (!existing && !inHistory) {
      list.push(c);
    }
    if (list.length >= 5) break;
  }
  return list;
}

/**
 * Change Username Action
 */
export async function changeUsernameAction(newUsername: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'UNAUTHENTICATED' };
  }

  const cleanUsername = newUsername.trim().toLowerCase();
  const availability = await checkUsernameAvailabilityAction(cleanUsername);
  if (!availability.available) {
    return { success: false, error: availability.error };
  }

  const prisma = getPrisma();
  if (prisma) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return { success: false, error: 'USER_NOT_FOUND' };

    // Enforce 30-day limit unless admin
    if (user.role !== 'admin' && user.lastUsernameChangedAt) {
      const diffMs = Date.now() - user.lastUsernameChangedAt.getTime();
      const limitMs = 30 * 24 * 60 * 60 * 1000;
      if (diffMs < limitMs) {
        const daysLeft = Math.ceil((limitMs - diffMs) / (24 * 60 * 60 * 1000));
        return { success: false, error: `You can change your username again in ${daysLeft} days.` };
      }
    }

    const oldUsername = user.username;

    await prisma.$transaction(async (tx) => {
      if (oldUsername) {
        await tx.usernameHistory.upsert({
          where: { oldUsername },
          update: { newUsername: cleanUsername, userId: user.id },
          create: { oldUsername, newUsername: cleanUsername, userId: user.id }
        });
      }

      await tx.user.update({
        where: { id: user.id },
        data: {
          username: cleanUsername,
          lastUsernameChangedAt: new Date()
        }
      });
    });

    return { success: true };
  } else {
    const { db } = require('@/lib/database/dbClient');
    const usersMap = (db as any).users;
    if (usersMap && usersMap.has(session.user.id)) {
      const u = usersMap.get(session.user.id);
      u.username = cleanUsername;
      u.lastUsernameChangedAt = new Date();
      usersMap.set(session.user.id, u);
    }
    return { success: true };
  }
}

/**
 * Session Management: Retrieve active sessions
 */
export async function getActiveSessionsAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'UNAUTHENTICATED' };
  }

  try {
    const sessions = await getActiveSessions(session.user.id);
    return { success: true, sessions };
  } catch (e) {
    return { success: false, error: 'SERVER_ERROR' };
  }
}

export async function revokeSessionAction(sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'UNAUTHENTICATED' };
  }

  try {
    await revokeSession(sessionId, session.user.id);
    revalidatePath('/profile');
    return { success: true };
  } catch (e) {
    return { success: false, error: 'SERVER_ERROR' };
  }
}

export async function revokeAllSessionsAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'UNAUTHENTICATED' };
  }

  try {
    const currentToken = (session as any).sessionToken || '';
    await revokeAllOtherSessions(currentToken, session.user.id);
    revalidatePath('/profile');
    return { success: true };
  } catch (e) {
    return { success: false, error: 'SERVER_ERROR' };
  }
}

export async function requestEmailChangeAction(newEmail: string, currentHost: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'UNAUTHENTICATED' };
  }

  const cleanEmail = newEmail.toLowerCase().trim();
  if (isDisposableEmail(cleanEmail)) {
    return { success: false, error: 'DISPOSABLE_EMAIL_BLOCKED' };
  }

  try {
    const res = await requestEmailChange(session.user.id, cleanEmail, currentHost);
    return res;
  } catch (e) {
    return { success: false, error: 'SERVER_ERROR' };
  }
}

export async function confirmEmailChangeAction(token: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'UNAUTHENTICATED' };
  }

  try {
    const res = await confirmEmailChange(token, session.user.id);
    return res;
  } catch (e) {
    return { success: false, error: 'SERVER_ERROR' };
  }
}

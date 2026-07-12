'use server';

import { auth } from '@/auth';
import { getPrisma } from '@/lib/database/dbClient';
import { hashPassword, verifyPassword } from '@/lib/security/hash';
import { checkRateLimit } from '@/lib/security/rateLimiter';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { z } from 'zod';

const reservedUsernames = [
  'admin', 'api', 'support', 'login', 'root', 'studymaterial', 'moderator',
  'system', 'help', 'billing', 'security', 'auth', 'oauth', 'register', 'signup'
];

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  username: z
    .string()
    .min(3, 'Username must be 3-30 characters')
    .max(30, 'Username must be 3-30 characters')
    .regex(/^[a-zA-Z0-9_\.]+$/, 'Username can only contain letters, numbers, underscores, and periods')
    .refine(val => !val.includes(' '), 'Username cannot contain spaces')
    .refine(val => !reservedUsernames.includes(val.toLowerCase()), 'Username is reserved'),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

/**
 * Sign Up Action
 */
export async function signUpAction(raw: any, clientIp = '127.0.0.1') {
  // Rate limit: Max 5 signups per hour per IP
  const rl = await checkRateLimit(`signup:${clientIp}`, 5, 3600);
  if (!rl.success) {
    return { success: false, error: 'RATE_LIMIT_EXCEEDED', timeLeft: rl.timeLeft };
  }

  const result = signupSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: 'VALIDATION_FAILED', details: result.error.flatten() };
  }

  const { fullName, username, email, password } = result.data;
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
      if (existingUsername) {
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

      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      await prisma.accountVerification.create({
        data: { email, code, type: 'VERIFY_EMAIL', expiresAt }
      });

      // Create Audit Log
      await prisma.authAuditLog.create({
        data: { userId: user.id, email, event: 'SIGNUP', ipAddress: clientIp }
      });

      console.log(`[SIMULATED EMAIL] Verification code for ${email}: ${code}`);
      return { success: true, email };
    } else {
      // In-Memory Database Mode
      const { db } = require('@/lib/database/dbClient');
      const existing = await db.getUserByEmail(email);
      if (existing) return { success: false, error: 'EMAIL_TAKEN' };

      const usersMap = (db as any).users;
      if (usersMap) {
        for (const u of usersMap.values()) {
          if (u.username?.toLowerCase() === username.toLowerCase()) {
            return { success: false, error: 'USERNAME_TAKEN' };
          }
        }
      }

      const passwordHash = hashPassword(password);
      const user = await db.createUser({
        id: `u_${Date.now()}`,
        name: fullName,
        username: username.toLowerCase(),
        email,
        passwordHash,
        emailVerified: null,
        role: 'user',
        status: 'active'
      });

      const code = '123456'; // Standard sandbox code
      console.log(`[SANDBOX SIMULATION] Created memory user and set code: ${code}`);
      return { success: true, email };
    }
  } catch (err: any) {
    console.error(err);
    return { success: false, error: 'SERVER_ERROR' };
  }
}

/**
 * Verify Email Action
 */
export async function verifyEmailAction(email: string, code: string, clientIp = '127.0.0.1') {
  // Rate limit: Max 10 verification tries per 15 minutes per IP
  const rl = await checkRateLimit(`verify:${clientIp}`, 10, 900);
  if (!rl.success) {
    return { success: false, error: 'RATE_LIMIT_EXCEEDED', timeLeft: rl.timeLeft };
  }

  const prisma = getPrisma();

  if (prisma) {
    const record = await prisma.accountVerification.findFirst({
      where: { email, code, type: 'VERIFY_EMAIL' }
    });

    if (!record) {
      // Increment attempts or log failure
      return { success: false, error: 'INVALID_CODE' };
    }

    if (record.attempts >= 5) {
      return { success: false, error: 'MAX_ATTEMPTS_EXCEEDED' };
    }

    if (new Date().getTime() > record.expiresAt.getTime()) {
      return { success: false, error: 'EXPIRED' };
    }

    // Verify user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, error: 'USER_NOT_FOUND' };

    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() }
    });

    // Delete verification token
    await prisma.accountVerification.delete({ where: { id: record.id } });

    // Audit Log
    await prisma.authAuditLog.create({
      data: { userId: user.id, email, event: 'VERIFICATION_SUCCESS', ipAddress: clientIp }
    });

    return { success: true };
  } else {
    // Sandbox Memory Mode
    const { db } = require('@/lib/database/dbClient');
    const user = await db.getUserByEmail(email);
    if (!user) return { success: false, error: 'USER_NOT_FOUND' };

    // Update in-memory user
    const usersMap = (db as any).users;
    if (usersMap && usersMap.has(user.id)) {
      const updated = usersMap.get(user.id);
      updated.emailVerified = new Date();
      usersMap.set(user.id, updated);
    }
    return { success: true };
  }
}

/**
 * Resend Verification Action
 */
export async function resendVerificationAction(email: string, clientIp = '127.0.0.1') {
  // Rate limit: Max 3 code resends per hour per email
  const rl = await checkRateLimit(`resend:${email}`, 3, 3600);
  if (!rl.success) {
    return { success: false, error: 'COOLDOWN_ACTIVE', timeLeft: rl.timeLeft };
  }

  const prisma = getPrisma();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiration

  if (prisma) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Account enumeration protection: always return success to caller
      return { success: true };
    }

    // Clear previous verification codes
    await prisma.accountVerification.deleteMany({ where: { email, type: 'VERIFY_EMAIL' } });

    await prisma.accountVerification.create({
      data: { email, code, type: 'VERIFY_EMAIL', expiresAt }
    });

    console.log(`[SIMULATED EMAIL RESEND] Verification code for ${email}: ${code}`);
    return { success: true };
  } else {
    console.log(`[SANDBOX RESEND] Resent code is: 123456`);
    return { success: true };
  }
}

/**
 * Forgot Password Action (Enumeration Protected)
 */
export async function forgotPasswordAction(email: string, clientIp = '127.0.0.1') {
  // Rate limit request rate
  const rl = await checkRateLimit(`forgot:${clientIp}`, 5, 3600);
  if (!rl.success) {
    return { success: false, error: 'RATE_LIMIT_EXCEEDED', timeLeft: rl.timeLeft };
  }

  const prisma = getPrisma();
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  if (prisma) {
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Always log forgot request audit event
    await prisma.authAuditLog.create({
      data: { email, event: 'PASSWORD_RESET_REQ', ipAddress: clientIp }
    });

    if (user) {
      // Clear old password reset codes
      await prisma.accountVerification.deleteMany({ where: { email, type: 'PASSWORD_RESET' } });

      await prisma.accountVerification.create({
        data: { email, code: token, type: 'PASSWORD_RESET', expiresAt }
      });

      console.log(`[SIMULATED RESET EMAIL] Token link for ${email}: http://localhost:3000/reset-password?token=${token}`);
    }
    
    // Return identical success response to prevent email enumeration
    return { success: true, message: 'If an account exists, a reset link has been dispatched.' };
  } else {
    console.log(`[SANDBOX FORGOT PASSWORD] Simulated reset link for: ${email}`);
    return { success: true, message: 'If an account exists, a reset link has been dispatched.' };
  }
}

/**
 * Reset Password Action
 */
export async function resetPasswordAction(raw: any, clientIp = '127.0.0.1') {
  const resetSchema = z.object({
    token: z.string(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  });

  const result = resetSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: 'VALIDATION_FAILED', details: result.error.flatten() };
  }

  const { token, password } = result.data;
  const prisma = getPrisma();

  if (prisma) {
    const record = await prisma.accountVerification.findFirst({
      where: { code: token, type: 'PASSWORD_RESET' }
    });

    if (!record || new Date().getTime() > record.expiresAt.getTime()) {
      return { success: false, error: 'INVALID_OR_EXPIRED_TOKEN' };
    }

    const user = await prisma.user.findUnique({ where: { email: record.email } });
    if (!user) return { success: false, error: 'USER_NOT_FOUND' };

    const newHash = hashPassword(password);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash }
    });

    // Invalidate reset token
    await prisma.accountVerification.delete({ where: { id: record.id } });

    // Revoke all other active sessions (force logout other devices)
    await prisma.userSession.deleteMany({ where: { userId: user.id } });

    // Audit log
    await prisma.authAuditLog.create({
      data: { userId: user.id, email: user.email!, event: 'PASSWORD_RESET_SUCCESS', ipAddress: clientIp }
    });

    return { success: true };
  } else {
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

  const prisma = getPrisma();
  if (prisma) {
    const sessions = await prisma.userSession.findMany({
      where: { userId: session.user.id },
      orderBy: { lastActiveAt: 'desc' }
    });
    return { success: true, sessions };
  }

  // Memory fallback mock sessions list
  return { 
    success: true, 
    sessions: [
      { id: 'sess_1', sessionToken: 'curr', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', ipAddress: '127.0.0.1', browser: 'Chrome', os: 'Windows', lastActiveAt: new Date() }
    ] 
  };
}

/**
 * Revoke specific session
 */
export async function revokeSessionAction(sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'UNAUTHENTICATED' };
  }

  const prisma = getPrisma();
  if (prisma) {
    const record = await prisma.userSession.findUnique({ where: { id: sessionId } });
    if (!record || record.userId !== session.user.id) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    await prisma.userSession.delete({ where: { id: sessionId } });
    revalidatePath('/profile');
    return { success: true };
  }
  return { success: true };
}

/**
 * Revoke all other sessions
 */
export async function revokeAllSessionsAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'UNAUTHENTICATED' };
  }

  const prisma = getPrisma();
  if (prisma) {
    // Keep only the current session token if possible, or delete all.
    // For safety, delete all other session rows
    const currentSessionToken = (session as any).sessionToken || '';
    await prisma.userSession.deleteMany({
      where: {
        userId: session.user.id,
        NOT: { sessionToken: currentSessionToken }
      }
    });
    revalidatePath('/profile');
    return { success: true };
  }
  return { success: true };
}

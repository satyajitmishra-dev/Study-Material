import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { db, getPrisma } from './lib/database/dbClient';
import { verifyPassword } from './lib/security/hash';
import { headers } from 'next/headers';
import crypto from 'crypto';

const providers: any[] = [];

// Helper to parse browser from User Agent
function parseBrowser(ua: string): string {
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edge')) return 'Edge';
  return 'Browser';
}

// Helper to parse OS from User Agent
function parseOS(ua: string): string {
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Macintosh') || ua.includes('Mac OS X')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Android')) return 'Android';
  return 'OS';
}

// 1. Google OAuth Provider
providers.push(
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID || 'mock',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock',
  })
);

// 2. Production Credentials Provider
providers.push(
  Credentials({
    id: 'credentials',
    name: 'Secure Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      
      const email = (credentials.email as string).toLowerCase().trim();
      const password = credentials.password as string;

      const prisma = getPrisma();
      let user: any = null;

      if (prisma) {
        user = await prisma.user.findUnique({
          where: { email }
        });
      } else {
        user = await db.getUserByEmail(email);
      }

      if (!user || !user.passwordHash) return null;

      // Verify Password hash
      const isValid = verifyPassword(password, user.passwordHash);
      if (!isValid) return null;

      // Email Verification Check
      if (user.emailVerified === null) {
        throw new Error('VERIFICATION_REQUIRED');
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      };
    }
  })
);

// 3. Dev Sandbox Credentials Provider
const isSandboxEnabled = 
  process.env.NODE_ENV === 'development' || 
  process.env.NEXT_PUBLIC_ENABLE_SANDBOX === 'true';

if (isSandboxEnabled) {
  providers.push(
    Credentials({
      id: 'sandbox',
      name: 'Developer Sandbox',
      credentials: {
        email: { label: 'Email', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const email = credentials.email as string;

        let user = await db.getUserByEmail(email);
        if (!user) {
          const adminEmails = (process.env.ADMIN_EMAILS || '')
            .split(',')
            .map(e => e.trim().toLowerCase());
          const isDefaultAdmin = adminEmails.includes(email.toLowerCase());

          user = await db.createUser({
            id: `sb_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
            name: email.split('@')[0],
            email: email,
            emailVerified: new Date(),
            image: email.includes('admin') 
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
              : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
            avatar: email.includes('admin')
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
              : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
            role: isDefaultAdmin ? 'admin' : 'user',
            status: 'active',
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      }
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days session
  },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (!user.email) return false;

      const adminEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map(e => e.trim().toLowerCase());
      const isDefaultAdmin = adminEmails.includes(user.email.toLowerCase());

      const existingUser = await db.getUserByEmail(user.email);
      if (!existingUser) {
        await db.createUser({
          id: user.id || `u_${Date.now()}`,
          name: user.name || '',
          email: user.email,
          emailVerified: new Date(),
          image: user.image || null,
          avatar: user.image || null,
          role: isDefaultAdmin ? 'admin' : 'user',
          status: 'active',
        });
      } else {
        if (existingUser.status === 'disabled') {
          return false;
        }
        if (isDefaultAdmin && existingUser.role !== 'admin') {
          await db.updateUserRole(existingUser.id, 'admin');
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      const prisma = getPrisma();
      
      if (user && user.email) {
        const dbUser = await db.getUserByEmail(user.email);
        if (dbUser) {
          token.uid = dbUser.id;
          token.role = dbUser.role;
          token.status = dbUser.status;
          token.avatar = dbUser.avatar;

          // Track UserSession in database
          if (prisma) {
            try {
              const reqHeaders = await headers();
              const ua = reqHeaders.get('user-agent') || '';
              const ip = reqHeaders.get('x-forwarded-for')?.split(',')[0] || reqHeaders.get('x-real-ip') || '127.0.0.1';
              
              const browser = parseBrowser(ua);
              const os = parseOS(ua);
              const sessionToken = token.jti || crypto.randomBytes(32).toString('hex');

              // Check if session token already logged
              const exists = await prisma.userSession.findUnique({
                where: { sessionToken }
              });

              if (!exists) {
                await prisma.userSession.create({
                  data: {
                    userId: dbUser.id,
                    sessionToken,
                    userAgent: ua,
                    ipAddress: ip,
                    browser,
                    os,
                    deviceType: ua.includes('Mobile') ? 'Mobile' : 'Desktop'
                  }
                });

                // Audit Log Login
                await prisma.authAuditLog.create({
                  data: {
                    userId: dbUser.id,
                    email: dbUser.email!,
                    event: 'LOGIN_SUCCESS',
                    ipAddress: ip,
                    userAgent: ua
                  }
                });
              } else {
                await prisma.userSession.update({
                  where: { sessionToken },
                  data: { lastActiveAt: new Date() }
                });
              }
            } catch (err) {
              console.error('Failed to log user session:', err);
            }
          }
        }
      } else if (token.uid) {
        const dbUser = await db.getUserById(token.uid as string);
        if (dbUser) {
          token.role = dbUser.role;
          token.status = dbUser.status;
          token.avatar = dbUser.avatar;

          // Update last active
          if (prisma && token.jti) {
            try {
              await prisma.userSession.updateMany({
                where: { sessionToken: token.jti as string },
                data: { lastActiveAt: new Date() }
              });
            } catch (err) {}
          }
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token.uid) {
        session.user.id = token.uid;
        session.user.role = token.role || 'user';
        session.user.status = token.status || 'active';
        session.user.avatar = token.avatar || null;
        session.sessionToken = token.jti || null; // Pass JWT jti as sessionToken reference
      }
      return session;
    }
  }
});

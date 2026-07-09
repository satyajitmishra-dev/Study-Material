import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { db } from './lib/database/dbClient';

const providers: any[] = [];

// 1. Google OAuth Provider
providers.push(
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID || 'mock',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock',
  })
);

// 2. Dev Sandbox Credentials Provider (Strictly limited to development)
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
        // Self-healing role upgrade: dynamically upgrade to admin if listed in ADMIN_EMAILS
        if (isDefaultAdmin && existingUser.role !== 'admin') {
          await db.updateUserRole(existingUser.id, 'admin');
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user && user.email) {
        const dbUser = await db.getUserByEmail(user.email);
        if (dbUser) {
          token.uid = dbUser.id;
          token.role = dbUser.role;
          token.status = dbUser.status;
          token.avatar = dbUser.avatar;
        }
      } else if (token.uid) {
        const dbUser = await db.getUserById(token.uid as string);
        if (dbUser) {
          token.role = dbUser.role;
          token.status = dbUser.status;
          token.avatar = dbUser.avatar;
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
      }
      return session;
    }
  }
});

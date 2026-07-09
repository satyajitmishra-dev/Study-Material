import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  providers: [], // Defined in auth.ts
  pages: {
    signIn: '/login',
    error: '/unauthorized',
  },
  callbacks: {
    // Edge-compatible session validation check (checks only login status)
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      
      if (isOnAdmin) {
        if (!isLoggedIn) return false; // Redirects to /login
      }
      return true;
    },
  },
} satisfies NextAuthConfig;

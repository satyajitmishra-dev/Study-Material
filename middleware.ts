import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * Match all admin paths and admin API endpoints.
     * Excludes static assets, public pages, auth callbacks.
     */
    '/admin/:path*',
    '/api/admin/:path*'
  ],
};

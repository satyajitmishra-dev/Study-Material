import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/database/dbClient';

export default NextAuth(authConfig).auth(async (req) => {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Ignore static assets, Next.js internals, favicon, and API routes (except admin API checks)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    (pathname.startsWith('/api') && !pathname.startsWith('/api/admin'))
  ) {
    return NextResponse.next();
  }

  // 1. URL Normalization: Lowercase check
  const lowercasePathname = pathname.toLowerCase();
  if (pathname !== lowercasePathname) {
    url.pathname = lowercasePathname;
    return NextResponse.redirect(url, 301);
  }

  // 2. Trailing Slash Policy: Strip trailing slash (except for home page /)
  if (pathname !== '/' && pathname.endsWith('/')) {
    url.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(url, 301);
  }

  // 3. Dynamic Database-defined Redirects
  const prisma = getPrisma();
  if (prisma) {
    try {
      const redirectRule = await prisma.cmsRedirect.findUnique({
        where: { sourcePath: pathname }
      });

      if (redirectRule) {
        const status = redirectRule.statusCode;
        if (status === 410) {
          // 410 Gone handler
          return new Response('410 Gone - This resource is permanently removed.', {
            status: 410,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
        
        // Resolve target URL
        const target = redirectRule.targetPath;
        const targetUrl = target.startsWith('http') ? new URL(target) : new URL(target, req.url);
        return NextResponse.redirect(targetUrl, status === 301 ? 301 : 302);
      }
    } catch (error) {
      console.error('[Proxy Redirect Error]:', error);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api/public (Public API routes)
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/public|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};

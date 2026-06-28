import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

/**
 * المسارات العامة التي يمكن للزوار (غير المسجلين) الوصول إليها
 */
const PUBLIC_ROUTES = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/error',
  '/chat',
  '/pricing',
  '/privacy',
  '/terms',
  '/api/auth',
  '/api/health',
  '/api/chat',
  '/api/agent',
];

// Canonical host for NextAuth URL generation. The app is reachable from several
// domains (rashid-wep.vercel.app/king2 rewrite, the direct Vercel URL, …) and
// NextAuth derives the OAuth redirect_uri from the request host — so it would
// send an unregistered redirect_uri when opened from a non-canonical domain
// (→ Google "redirect_uri_mismatch"). Pinning the host on /api/auth requests
// makes the redirect_uri stable and matching the one registered in Google.
const CANONICAL_HOST = 'alking-ai-king2-f4rr.vercel.app';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    if (pathname.startsWith('/api/auth')) {
      const headers = new Headers(req.headers);
      headers.set('host', CANONICAL_HOST);
      headers.set('x-forwarded-host', CANONICAL_HOST);
      headers.set('x-forwarded-proto', 'https');
      return NextResponse.next({ request: { headers } });
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        const isPublic = PUBLIC_ROUTES.some((route) =>
          pathname.startsWith(route)
        );
        const isStatic =
          pathname.startsWith('/_next') ||
          pathname.startsWith('/favicon') ||
          pathname.startsWith('/fonts') ||
          pathname.startsWith('/images');

        return isPublic || isStatic || !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|favicon.png).*)'],
};

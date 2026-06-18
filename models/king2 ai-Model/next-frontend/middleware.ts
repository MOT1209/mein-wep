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

export default withAuth(
  function middleware() {
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

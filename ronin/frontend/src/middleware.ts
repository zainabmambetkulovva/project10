import { createAuthClient } from 'react-auth-kit';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Create auth client
export const authClient = createAuthClient({
  refreshTokenUri: '/api/auth/refresh',
  loginUri: '/api/auth/login',
  registerUri: '/api/auth/register',
  tokenStorePrefix: 'auth_',
  tokenIsExpires: true,
  tokenExpireName: 'expires_in',
});

// Middleware for route protection
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes
  const protectedRoutes = ['/app', '/app/booking', '/app/receipts', '/app/profile'];
  const managerRoutes = ['/manager', '/manager/bookings', '/manager/computers', '/manager/payments', '/manager/receipts', '/manager/sessions'];
  const adminRoutes = ['/admin', '/admin/dashboard', '/admin/users', '/admin/settings'];

  // Check if user is authenticated
  const authState = authClient.getAuth();

  // Redirect logic
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!authState) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  if (managerRoutes.some(route => pathname.startsWith(route))) {
    if (!authState || (authState as any).role !== 'MANAGER' && (authState as any).role !== 'ADMIN') {
      const url = new URL('/app', request.url);
      return NextResponse.redirect(url);
    }
  }

  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!authState || (authState as any).role !== 'ADMIN') {
      const url = new URL('/manager', request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|static|favicon.ico).*)'],
};

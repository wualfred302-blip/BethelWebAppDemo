import { NextRequest, NextResponse } from 'next/server';
import { AUTH_SESSION_COOKIE, parseAuthSession } from '@/lib/auth/otp';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(AUTH_SESSION_COOKIE)?.value;
  const session = await parseAuthSession(sessionToken);
  const isAuthed = Boolean(session);
  const isLoginRoute = pathname === '/login' || pathname.startsWith('/login/');
  const isApplyRoute = pathname === '/apply' || pathname.startsWith('/apply/');

  if (isLoginRoute && isAuthed) {
    return NextResponse.redirect(new URL('/apply', request.url));
  }

  if (isApplyRoute && !isAuthed) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('next', '/apply');
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/apply', '/apply/:path*', '/login', '/login/:path*'],
};

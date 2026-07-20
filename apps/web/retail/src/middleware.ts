import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Exclude system assets, API, and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isDashboard = pathname.startsWith('/dashboard');
  const refreshToken = req.cookies.get('refresh_token');
  const mainUrl = process.env.NEXT_PUBLIC_MAIN_URL || 'http://localhost:3001';

  // Nếu chưa đăng nhập mà vào dashboard → redirect về login (main app)
  if (!refreshToken && isDashboard) {
    return NextResponse.redirect(`${mainUrl}/auth/login`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

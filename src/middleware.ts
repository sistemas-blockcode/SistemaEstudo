import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/materiais', '/simulados', '/agenda', '/configuracoes', '/home'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/materiais/:path*',
    '/simulados/:path*',
    '/agenda/:path*',
    '/configuracoes/:path*',
    '/home/:path*',
    '/qa/:path*',
    '/instrucoes/:path*'
  ],
};

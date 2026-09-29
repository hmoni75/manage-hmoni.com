import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('auth_token')?.value;

    const user = token ? await verifyToken(token) : null;
    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'admin';

    const isAuthPage = pathname.startsWith('/auth') || pathname.startsWith('/landing') || pathname.startsWith('/documentation');
    const isPublicStatic =
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/demo') ||
        pathname.startsWith('/layout') ||
        pathname.includes('.') ||
        pathname.startsWith('/api/auth/login') ||
        pathname.startsWith('/api/auth/register');

    // Skip static assets
    if (isPublicStatic) {
        return NextResponse.next();
    }

    // 1. If user is not authenticated and trying to access protected page
    if (!isAuthenticated && !isAuthPage) {
        const loginUrl = new URL('/auth/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // 2. If user IS authenticated and trying to visit login/register
    if (isAuthenticated && isAuthPage) {
        const homeUrl = new URL('/', request.url);
        return NextResponse.redirect(homeUrl);
    }

    // 3. Strict Admin Role Protection: Non-admin users cannot access /members, /expenses, or /reports
    const isAdminOnlyPage =
        pathname.startsWith('/members') ||
        pathname.startsWith('/expenses') ||
        pathname.startsWith('/reports');

    if (isAuthenticated && !isAdmin && isAdminOnlyPage) {
        const homeUrl = new URL('/', request.url);
        return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};

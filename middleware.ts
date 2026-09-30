import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('auth_token')?.value;

    const user = token ? await verifyToken(token) : null;
    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

    const isAuthPage = pathname.startsWith('/auth') || pathname.startsWith('/landing') || pathname.startsWith('/documentation');
    
    // Always public static assets and files
    const isPublicStatic =
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/demo') ||
        pathname.startsWith('/layout') ||
        pathname.includes('.');

    if (isPublicStatic) {
        return NextResponse.next();
    }

    // Public API endpoints that require no authentication
    const isPublicApi =
        pathname.startsWith('/api/auth/login') ||
        pathname.startsWith('/api/auth/register') ||
        pathname.startsWith('/api/cv/download') ||
        (pathname.startsWith('/api/contact') && request.method === 'POST') ||
        // Public CMS read routes (GET only) so portfolio website (hmoni.com) can consume CMS data
        (request.method === 'GET' && (
            pathname === '/api/cv' ||
            pathname.startsWith('/api/hero') ||
            pathname.startsWith('/api/projects') ||
            pathname.startsWith('/api/services') ||
            pathname.startsWith('/api/pricing') ||
            pathname.startsWith('/api/process') ||
            pathname.startsWith('/api/testimonials') ||
            pathname.startsWith('/api/faqs') ||
            pathname.startsWith('/api/experiences') ||
            pathname.startsWith('/api/techstack') ||
            pathname.startsWith('/api/blogs') ||
            pathname.startsWith('/api/socials') ||
            pathname.startsWith('/api/stats') ||
            pathname.startsWith('/api/settings')
        ));

    if (isPublicApi) {
        return NextResponse.next();
    }

    // Handle unauthenticated requests
    if (!isAuthenticated) {
        // Return 401 JSON for API requests instead of HTML redirect
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Redirect HTML page requests to login
        if (!isAuthPage) {
            const loginUrl = new URL('/auth/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    // If user IS authenticated and trying to visit login/register
    if (isAuthenticated && isAuthPage) {
        const homeUrl = new URL('/', request.url);
        return NextResponse.redirect(homeUrl);
    }

    // Strict Admin Role Protection: Non-admin users cannot access /members, /expenses, or /reports
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

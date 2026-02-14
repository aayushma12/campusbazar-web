import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get auth state from cookie or header
    const authCookie = request.cookies.get('auth-storage');

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/register', '/'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // Admin routes
    const isAdminRoute = pathname.startsWith('/dashboard/admin');

    // Dashboard routes (requires authentication)
    const isDashboardRoute = pathname.startsWith('/dashboard');

    // If accessing dashboard without auth, redirect to login
    if (isDashboardRoute) {
        if (!authCookie) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            const decodedCookie = decodeURIComponent(authCookie.value);
            const authData = JSON.parse(decodedCookie);
            if (!authData?.state?.isAuthenticated || !authData?.state?.user) {
                return NextResponse.redirect(new URL('/login', request.url));
            }
        } catch (error) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // If accessing admin route, check if user is admin
    if (isAdminRoute && authCookie) {
        try {
            const decodedCookie = decodeURIComponent(authCookie.value);
            const authData = JSON.parse(decodedCookie);
            const userRole = authData?.state?.user?.role;

            if (userRole !== 'admin') {
                // Not admin, redirect to user dashboard
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        } catch (error) {
            // Invalid auth data, redirect to login
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // If authenticated and trying to access login/register, redirect to dashboard
    if (authCookie && (pathname === '/login' || pathname === '/register')) {
        try {
            const decodedCookie = decodeURIComponent(authCookie.value);
            const authData = JSON.parse(decodedCookie);
            const userRole = authData?.state?.user?.role;

            if (userRole === 'admin') {
                return NextResponse.redirect(new URL('/dashboard/admin', request.url));
            } else {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        } catch (error) {
            // Invalid auth data, continue to login
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

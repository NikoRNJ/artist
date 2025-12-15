import { type NextRequest, NextResponse } from 'next/server';
import { createSupabaseMiddlewareClient } from '@/services/supabase/middleware';

// Routes that require authentication
const protectedRoutes = ['/artist', '/dashboard', '/profile', '/bookings'];

// Routes that should redirect to home if already authenticated
const authRoutes = ['/login', '/signup', '/register'];

// Routes to skip middleware entirely
const publicRoutes = ['/', '/api', '/_next', '/favicon.ico', '/images'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for static files and public API routes
    if (publicRoutes.some((route) => pathname.startsWith(route) && route !== '/')) {
        return NextResponse.next();
    }

    // Special handling for root path
    if (pathname === '/') {
        return NextResponse.next();
    }

    const { supabase, response } = await createSupabaseMiddlewareClient(request);

    // If Supabase client couldn't be created, continue without auth checks
    if (!supabase) {
        return response;
    }

    // Get the current user session
    const { data: { user }, error } = await supabase.auth.getUser();

    const isAuthenticated = !error && !!user;
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
    const isOnboardingRoute = pathname.startsWith('/onboarding');

    // If user is not authenticated and trying to access protected route -> redirect to login
    if (!isAuthenticated && isProtectedRoute) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If user is authenticated and trying to access auth routes -> redirect appropriately
    if (isAuthenticated && isAuthRoute) {
        // Check if user has completed onboarding (has a role)
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile?.role) {
            // User hasn't selected a role yet -> redirect to onboarding
            return NextResponse.redirect(new URL('/onboarding', request.url));
        }

        // Redirect based on role
        if (profile.role === 'artist') {
            return NextResponse.redirect(new URL('/artist/dashboard', request.url));
        } else {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Optional challenge: Check if authenticated user needs to complete onboarding
    if (isAuthenticated && isProtectedRoute && !isOnboardingRoute) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        // If user hasn't selected a role yet -> redirect to onboarding
        if (!profile?.role) {
            return NextResponse.redirect(new URL('/onboarding', request.url));
        }

        // Optional: Restrict artist routes to artists only
        if (pathname.startsWith('/artist') && profile.role !== 'artist') {
            // Non-artists trying to access artist routes -> redirect to home
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

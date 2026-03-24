import { NextRequest, NextResponse } from "next/server";

type UserRole = "SUPER_ADMIN" | "ADMIN" | "COURIER" | "MERCHANT" | "USER";

// Simple JWT decoder for Edge runtime (no Buffer, use atob)
function decodeJWT(token: string) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = parts[1];
        // Use atob instead of Buffer (Edge-compatible)
        const decoded = JSON.parse(atob(payload));
        return decoded;
    } catch {
        return null;
    }
}

// Auth routes
const authRoutes = ["/login", "/register", "/register-courier", "/forgot-password", "/reset-password"];
const publicRoutes = ["/", "/verify-email"];

const isAuthRoute = (pathname: string) => authRoutes.includes(pathname);
const isPublicRoute = (pathname: string) => publicRoutes.includes(pathname);

// Route matching
const isRouteMatches = (pathname: string, exact: string[], patterns: RegExp[]) => {
    if (exact.includes(pathname)) return true;
    return patterns.some((pattern) => pattern.test(pathname));
};

const getRouteOwner = (pathname: string): "ADMIN" | "COURIER" | "MERCHANT" | "USER" | "COMMON" | null => {
    if (isRouteMatches(pathname, [], [/^\/courier\/dashboard/])) return "COURIER";
    if (isRouteMatches(pathname, [], [/^\/admin\/dashboard/])) return "ADMIN";
    if (isRouteMatches(pathname, [], [/^\/merchant\/dashboard/])) return "MERCHANT";
    if (isRouteMatches(pathname, [], [/^\/dashboard/])) return "USER";
    if (isRouteMatches(pathname, ["/my-profile", "/change-password"], [])) return "COMMON";
    return null;
};

const getDefaultDashboardRoute = (role: UserRole) => {
    if (role === "ADMIN" || role === "SUPER_ADMIN") return "/admin/dashboard";
    if (role === "COURIER") return "/courier/dashboard";
    if (role === "MERCHANT") return "/merchant/dashboard";
    if (role === "USER") return "/dashboard";
    return "/";
};

export async function middleware(request: NextRequest) {
    try {
        const { pathname } = request.nextUrl;
        const accessToken = request.cookies.get("accessToken")?.value;

        // Debug logging
        console.log('[Middleware]', pathname, 'hasToken:', !!accessToken);

        // Decode token
        const decoded = accessToken ? decodeJWT(accessToken) : null;
        const isValidAccessToken = !!decoded && decoded.exp && decoded.exp * 1000 > Date.now();

        console.log('[Middleware] isValidAccessToken:', isValidAccessToken, 'role:', decoded?.role);

        let userRole: UserRole | null = null;
        if (decoded) {
            userRole = decoded.role as UserRole;
        }

        // Unify SUPER_ADMIN → ADMIN
        if (userRole === "SUPER_ADMIN") userRole = "ADMIN";

        const routeOwner = getRouteOwner(pathname);
        const isAuth = isAuthRoute(pathname);

        // Public route → allow
        if (isPublicRoute(pathname)) {
            return NextResponse.next();
        }

        // Logged in user hitting auth route → redirect to dashboard
        if (isAuth && isValidAccessToken) {
            const dashboardRoute = getDefaultDashboardRoute(userRole as UserRole);
            console.log('[Middleware] Redirecting to dashboard:', dashboardRoute);
            return NextResponse.redirect(new URL(dashboardRoute, request.url));
        }

        // Other public routes (no route owner) → allow
        if (routeOwner === null) {
            return NextResponse.next();
        }

        // Not logged in but hitting protected route → redirect to login
        if (!accessToken || !isValidAccessToken) {
            console.log('[Middleware] No valid token, redirecting to login');
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Common protected route → allow
        if (routeOwner === "COMMON") {
            return NextResponse.next();
        }

        // Role-based route — wrong role → redirect to own dashboard
        if (routeOwner !== userRole) {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.error("Middleware error:", error);
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
    ],
};

import { NextRequest, NextResponse } from "next/server";
import { getDefaultDashboardRoute, getRouteOwner, isAuthRoute, isPublicRoute, UserRole } from "./lib/authUtils";
import { jwtUtils } from "./lib/jwtUtils";
import { isTokenExpiringSoon } from "./lib/tokenUtils";
import { getNewTokensWithRefreshToken } from "./services/auth.services";

async function refreshTokenMiddleware(refreshToken: string): Promise<boolean> {
    try {
        return await getNewTokensWithRefreshToken(refreshToken);
    } catch {
        return false;
    }
}

export async function proxy(request: NextRequest) {
    try {
        const { pathname } = request.nextUrl;
        const accessToken = request.cookies.get("accessToken")?.value;
        const refreshToken = request.cookies.get("refreshToken")?.value;

        // Decode token without verification (middleware doesn't have access to secret)
        // Token is httpOnly and can only be set by server actions, so it's safe
        const decoded = accessToken ? jwtUtils.decodedToken(accessToken) : null;
        const isValidAccessToken = !!decoded && decoded.exp && decoded.exp * 1000 > Date.now();

        let userRole: UserRole | null = null;
        if (decoded) {
            userRole = decoded.role as UserRole;
        }

        // Unify SUPER_ADMIN → ADMIN for route matching
        if (userRole === "SUPER_ADMIN") userRole = "ADMIN";

        const routeOwner = getRouteOwner(pathname);
        const isAuth = isAuthRoute(pathname);

        // Rule 0: Public route → always allow, no auth needed
        if (isPublicRoute(pathname)) {
            return NextResponse.next();
        }

        // Proactively refresh token if expiring soon
        if (isValidAccessToken && accessToken && refreshToken && (await isTokenExpiringSoon(accessToken))) {
            const requestHeaders = new Headers(request.headers);
            try {
                const refreshed = await refreshTokenMiddleware(refreshToken);
                if (refreshed) requestHeaders.set("x-token-refreshed", "1");
            } catch {
                // continue
            }
            return NextResponse.next({ request: { headers: requestHeaders } });
        }

        // Rule 1: Logged in user hitting auth route → redirect to dashboard
        if (isAuth && isValidAccessToken) {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url));
        }

        // Rule 2: Other public routes (no route owner) → allow
        if (routeOwner === null) {
            return NextResponse.next();
        }

        // Rule 4: Not logged in but hitting protected route → redirect to login
        if (!accessToken || !isValidAccessToken) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Rule 5: Common protected route (my-profile, change-password) → allow
        if (routeOwner === "COMMON") {
            return NextResponse.next();
        }

        // Rule 6: Role-based route — wrong role → redirect to own dashboard
        if (routeOwner !== userRole) {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.error("Error in proxy middleware:", error);
        return NextResponse.next();
    }
}

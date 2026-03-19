import { NextRequest, NextResponse } from "next/server";
import { getDefaultDashboardRoute, getRouteOwner, isAuthRoute, UserRole } from "./lib/authUtils";
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

        const decoded = accessToken && jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string).data;
        const isValidAccessToken = accessToken && jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string).success;

        let userRole: UserRole | null = null;
        if (decoded) {
            userRole = decoded.role as UserRole;
        }

        // Unify SUPER_ADMIN → ADMIN for route matching
        if (userRole === "SUPER_ADMIN") userRole = "ADMIN";

        const routeOwner = getRouteOwner(pathname);
        const isAuth = isAuthRoute(pathname);

        // Proactively refresh token if expiring soon
        if (isValidAccessToken && refreshToken && (await isTokenExpiringSoon(accessToken))) {
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

        // Rule 2: Public route → allow
        if (routeOwner === null) {
            return NextResponse.next();
        }

        // Rule 3: Not logged in but hitting protected route → redirect to login
        if (!accessToken || !isValidAccessToken) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Rule 4: Common protected route (my-profile, change-password) → allow
        if (routeOwner === "COMMON") {
            return NextResponse.next();
        }

        // Rule 5: Role-based route — wrong role → redirect to own dashboard
        if (routeOwner !== userRole) {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.error("Error in proxy middleware:", error);
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
};

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "COURIER" | "MERCHANT" | "USER";

export const authRoutes = ["/login", "/register", "/register-courier", "/forgot-password", "/reset-password"];
export const publicRoutes = ["/", "/verify-email", "/about", "/contact", "/privacy", "/terms"];

export const isAuthRoute = (pathname: string) => {
    return authRoutes.some((route: string) => route === pathname);
};

export const isPublicRoute = (pathname: string) => {
    return publicRoutes.some((route: string) => route === pathname);
};

export type RouteConfig = {
    exact: string[];
    pattern: RegExp[];
};

export const commonProtectedRoutes: RouteConfig = {
    exact: ["/my-profile", "/change-password"],
    pattern: [],
};

export const courierProtectedRoutes: RouteConfig = {
    pattern: [/^\/courier\/dashboard/],
    exact: [],
};

export const adminProtectedRoutes: RouteConfig = {
    pattern: [/^\/admin\/dashboard/],
    exact: [],
};

export const merchantProtectedRoutes: RouteConfig = {
    pattern: [/^\/merchant\/dashboard/],
    exact: [],
};

export const userProtectedRoutes: RouteConfig = {
    pattern: [/^\/dashboard/],
    exact: [],
};

export const isRouteMatches = (pathname: string, routes: RouteConfig) => {
    if (routes.exact.includes(pathname)) return true;
    return routes.pattern.some((pattern: RegExp) => pattern.test(pathname));
};

export const getRouteOwner = (
    pathname: string
): "SUPER_ADMIN" | "ADMIN" | "COURIER" | "MERCHANT" | "USER" | "COMMON" | null => {
    if (isRouteMatches(pathname, courierProtectedRoutes)) return "COURIER";
    if (isRouteMatches(pathname, adminProtectedRoutes)) return "ADMIN";
    if (isRouteMatches(pathname, merchantProtectedRoutes)) return "MERCHANT";
    if (isRouteMatches(pathname, userProtectedRoutes)) return "USER";
    if (isRouteMatches(pathname, commonProtectedRoutes)) return "COMMON";
    return null;
};

export const getDefaultDashboardRoute = (role: UserRole) => {
    if (role === "ADMIN" || role === "SUPER_ADMIN") return "/admin/dashboard";
    if (role === "COURIER") return "/courier/dashboard";
    if (role === "MERCHANT") return "/merchant/dashboard";
    if (role === "USER") return "/dashboard";
    return "/";
};

export const isValidRedirectForRole = (redirectPath: string, role: UserRole) => {
    const unifiedRole = role === "SUPER_ADMIN" ? "ADMIN" : role;
    const routeOwner = getRouteOwner(redirectPath);
    if (routeOwner === null || routeOwner === "COMMON") return true;
    if (routeOwner === unifiedRole) return true;
    return false;
};

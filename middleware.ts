import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  canAccessRoute,
  getDefaultRoute,
  getPermissions,
} from "@/const/permissions";

const PROTECTED_PREFIXES = ["/admin", "/dashboard", "/order"];
const AUTH_PREFIX = "/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("jwt")?.value;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/asset") ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  const isAuthRoute = pathname.startsWith(AUTH_PREFIX);
  const isProtectedRoute = PROTECTED_PREFIXES.some((path) =>
    pathname.startsWith(path)
  );
  const redirectTo = (path: string) =>
    NextResponse.redirect(new URL(path, request.url));

  if (!token) {
    if (pathname === "/" || isProtectedRoute) {
      return redirectTo("/auth/login");
    }
    return NextResponse.next();
  }

  if (pathname === "/" || isAuthRoute) {
    const userPosition = request.cookies.get("user_position")?.value?.toLowerCase();
    const userDepartment = request.cookies.get("user_department")?.value?.toLowerCase();
    return redirectTo(getDefaultRoute(userPosition, userDepartment));
  }

  if (isProtectedRoute) {
    try {
      const userPosition = request.cookies.get("user_position")?.value?.toLowerCase();
      const userDepartment = request.cookies.get("user_department")?.value?.toLowerCase();
      const permissions = getPermissions(userPosition, userDepartment);
      const hasAccess = canAccessRoute(pathname, userPosition, userDepartment);

      if (!hasAccess) {
        return redirectTo(getDefaultRoute(userPosition, userDepartment));
      }

      if (pathname.startsWith("/admin/order/add") && !permissions.orders.canAdd) {
        return redirectTo(getDefaultRoute(userPosition, userDepartment));
      }

      if (
        pathname.startsWith("/admin/order/") &&
        pathname.includes("/edit") &&
        !permissions.orders.canEdit
      ) {
        return redirectTo(getDefaultRoute(userPosition, userDepartment));
      }

      if (pathname.startsWith("/admin/menu/add") && !permissions.canManageMenu) {
        return redirectTo(getDefaultRoute(userPosition, userDepartment));
      }

      if (
        (pathname.startsWith("/admin/dish/add") || pathname.includes("/admin/dish/")) &&
        !permissions.canManageMenu
      ) {
        return redirectTo(getDefaultRoute(userPosition, userDepartment));
      }

      if (
        (pathname.startsWith("/admin/customer/add") ||
          pathname.includes("/admin/customer/")) &&
        !permissions.canManageCustomers
      ) {
        return redirectTo(getDefaultRoute(userPosition, userDepartment));
      }

      if (pathname.startsWith("/admin/user") && !permissions.canManageUsers) {
        return redirectTo(getDefaultRoute(userPosition, userDepartment));
      }

      if (pathname.startsWith("/admin/graph") && !permissions.canViewGraph) {
        return redirectTo(getDefaultRoute(userPosition, userDepartment));
      }
    } catch (error) {
      console.error("Error checking user role:", error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/admin", "/dashboard"];
const AUTH_PREFIX = "/auth";

const ROUTE_ACCESS = {
  sales: ["/admin/order", "/admin/calendar", "/admin/menu"],
  driver: ["/admin/order", "/admin/calendar", "/admin/menu"],
  manager: [
    "/admin/user",
    "/admin/order",
    "/admin/calendar",
    "/admin/customer",
    "/admin/dish",
    "/admin/menu",
  ],
};

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
    return redirectTo("/admin/order");
  }

  if (isProtectedRoute) {
    try {
      const userPosition = request.cookies.get("user_position")?.value;

      if (userPosition && userPosition !== "manager") {
        const allowedRoutes =
          ROUTE_ACCESS[userPosition as keyof typeof ROUTE_ACCESS];

        if (allowedRoutes) {
          const hasAccess = allowedRoutes.some((route) =>
            pathname.startsWith(route)
          );

          if (!hasAccess) {
            return redirectTo("/admin/order");
          }
        }
      }
    } catch (error) {
      console.error("Error checking user position:", error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
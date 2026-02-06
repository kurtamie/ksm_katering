import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/admin", "/dashboard"];
const AUTH_PREFIX = "/auth";

const BASE_ROUTES = ["/admin/order", "/admin/calendar", "/admin/dish", "/admin/menu", "/admin/account"];
const DEFAULT_ALLOWED_ROUTES = ["/admin/order", "/admin/account"];
const ROLE_ROUTE_ACCESS = [
  {
    position: "admin_finance",
    department: "finance",
    routes: BASE_ROUTES,
  },
  {
    position: "admin_operational",
    department: "operational",
    routes: [...BASE_ROUTES, "/admin/customer"],
  },
  {
    position: "supervisor",
    department: "operational",
    routes: BASE_ROUTES,
  },
  {
    position: "prasmanan",
    department: "operational",
    routes: BASE_ROUTES,
  },
  {
    position: "kitchen",
    department: "operational",
    routes: BASE_ROUTES,
  },
  {
    position: "sales",
    department: "marketing",
    routes: [...BASE_ROUTES, "/admin/customer"],
  },
  {
    position: "driver",
    department: "delivery",
    routes: BASE_ROUTES,
  },
  {
    position: "manager",
    department: "manager",
    routes: [...BASE_ROUTES, "/admin/customer", "/admin/graph", "/admin/user"],
  },
  {
    position: "developer",
    department: "developer",
    routes: [...BASE_ROUTES, "/admin/customer", "/admin/graph", "/admin/user"],
  },
];

const ORDER_ADD_ALLOWED = [
  { position: "admin_operational", department: "operational" },
  { position: "sales", department: "marketing" },
  { position: "manager", department: "manager" },
  { position: "developer", department: "developer" },
];

const MENU_ADD_ALLOWED = [
  { position: "admin_operational", department: "operational" },
  { position: "sales", department: "marketing" },
  { position: "manager", department: "manager" },
  { position: "developer", department: "developer" },
]

const getAllowedRoutes = (position?: string, department?: string) => {
  if (!position || !department) return DEFAULT_ALLOWED_ROUTES;

  const match = ROLE_ROUTE_ACCESS.find(
    (rule) => rule.position === position && rule.department === department
  );

  return match?.routes ?? DEFAULT_ALLOWED_ROUTES;
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
      const userDepartment = request.cookies.get("user_department")?.value;
      const normalizedPosition = userPosition?.toLowerCase();
      const normalizedDepartment = userDepartment?.toLowerCase();
      const allowedRoutes = getAllowedRoutes(
        normalizedPosition,
        normalizedDepartment
      );
      const hasAccess = allowedRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (!hasAccess) {
        return redirectTo("/admin/order");
      }

      if (pathname.startsWith("/admin/order/add")) {
        const canAdd = ORDER_ADD_ALLOWED.some(
          (rule) =>
            rule.position === normalizedPosition &&
            rule.department === normalizedDepartment
        );

        if (!canAdd) {
          return redirectTo("/admin/order");
        }
      }

      if (pathname.startsWith("/admin/menu/add")) {
        const canAdd = MENU_ADD_ALLOWED.some(
          (rule) =>
            rule.position === normalizedPosition &&
            rule.department === normalizedDepartment
        );

        if (!canAdd) {
          return redirectTo("/admin/order");
        }
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

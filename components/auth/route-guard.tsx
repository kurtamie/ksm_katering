"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

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

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = () => {
      // Get user position from cookie
      const cookies = document.cookie.split("; ");
      const positionCookie = cookies.find((c) => c.startsWith("user_position="));
      
      if (!positionCookie) {
        // If no position cookie, redirect to login
        router.push("/auth/login");
        return;
      }

      const position = positionCookie.split("=")[1].toLowerCase();

      // Manager has access to all routes
      if (position === "manager") {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      // Check if user has access to current route
      const allowedRoutes = ROUTE_ACCESS[position as keyof typeof ROUTE_ACCESS];
      
      if (allowedRoutes) {
        const hasAccess = allowedRoutes.some((route) =>
          pathname.startsWith(route)
        );

        if (hasAccess) {
          setIsAuthorized(true);
          setIsLoading(false);
        } else {
          // Redirect to first allowed route
          router.push(allowedRoutes[0] || "/admin/order");
        }
      } else {
        // Unknown position, redirect to order page
        router.push("/admin/order");
      }
    };

    checkAccess();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
"use client";

import { usePathname } from "next/navigation";
import { Calendar, Inbox, Soup, SquareMenu } from "lucide-react";
import { VscGraph } from "react-icons/vsc";
import { useEffect, useMemo, useState } from "react";

const NAV_ITEMS = [
  {
    title: "Pesanan",
    url: "/admin/order",
    icon: Inbox,
  },
  {
    title: "Kalender",
    url: "/admin/calendar",
    icon: Calendar,
  },
  {
    title: "Manajemen Lauk",
    url: "/admin/dish",
    icon: Soup,
  },
  {
    title: "Manajemen Menu",
    url: "/admin/menu",
    icon: SquareMenu,
  },
];

const BASE_ROUTES = ["/admin/order", "/admin/calendar", "/admin/dish", "/admin/menu"];
const DEFAULT_ALLOWED_ROUTES = ["/admin/order"];
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

function getAllowedRoutes(position: string | null, department: string | null) {
  if (!position || !department) {
    return DEFAULT_ALLOWED_ROUTES;
  }

  const match = ROLE_ROUTE_ACCESS.find(
    (rule) => rule.position === position && rule.department === department
  );

  return match?.routes ?? DEFAULT_ALLOWED_ROUTES;
}

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export default function MobileNavbar() {
  const pathname = usePathname();
  const [userPosition, setUserPosition] = useState<string | null>(null);
  const [userDepartment, setUserDepartment] = useState<string | null>(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const position =
          localStorage.getItem("user_position") ??
          getCookie("user_position");
        const department =
          localStorage.getItem("user_department") ??
          getCookie("user_department");

        setUserPosition(position?.toLowerCase() ?? null);
        setUserDepartment(department?.toLowerCase() ?? null);
      } catch (error) {
        console.error("Error getting user data:", error);
        setUserPosition(null);
        setUserDepartment(null);
      }
    };

    getUserData();
  }, []);

  const filteredItems = useMemo(() => {
    const allowedRoutes = getAllowedRoutes(userPosition, userDepartment);
    return NAV_ITEMS.filter((item) => allowedRoutes.includes(item.url));
  }, [userPosition, userDepartment]);

  // Only show on mobile devices
  return (
    <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-[#8D0000] rounded-full shadow-lg px-6 py-3">
        <div className="flex items-center gap-8">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.url;
            
            return (
              <a
                key={item.url}
                href={item.url}
                className={`flex flex-col items-center justify-center transition-all duration-200 ${
                  isActive ? "scale-110" : "hover:scale-105"
                }`}
                aria-label={item.title}
              >
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-white/20"
                      : "hover:bg-white/10"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      isActive ? "text-white" : "text-white/80"
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
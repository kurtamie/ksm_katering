"use client";

import {
  Calendar,
  Inbox,
  Soup,
  SquareMenu,
  User,
  UsersRound,
} from "lucide-react";
import { VscGraph } from "react-icons/vsc";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logo from "@/app/asset/logo.png";
import Profile from "@/app/asset/profile.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useEffect, useMemo, useState } from "react";

const NAV_ITEMS = [
  {
    title: "Manajemen Akun",
    url: "/admin/user",
    icon: User,
  },
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
    title: "Customer",
    url: "/admin/customer",
    icon: UsersRound,
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
  {
    title: "Grafik",
    url: "/admin/graph",
    icon: VscGraph,
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

export function AppSidebar() {
  const pathname = usePathname();
  const [userPosition, setUserPosition] = useState<string | null>(null);
  const [userDepartment, setUserDepartment] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

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

        // Fetch user data from API
        const response = await fetch("/api/users/me");
        if (response.ok) {
          const data = await response.json();
          setUserName(data.username || "User");
          setUserEmail(data.email || "");
        }
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

  return (
    <Sidebar collapsible="icon">
      {/* Desktop: Show Logo */}
      <SidebarHeader className="hidden md:flex items-center justify-center px-4 py-4">
        <Image
          src={logo}
          alt="KSM Katering"
          className="h-12 w-auto shrink-0 group-data-[collapsible=icon]:h-0"
          priority
        />
      </SidebarHeader>

      <SidebarContent>
        {/* User Profile Section - Only visible on mobile */}
            <div className='bg-[#8D0000] dark:bg-[#8D0000]'>
        <SidebarGroup className="md:hidden">
          <SidebarGroupContent>
              <div className="flex items-center gap-3 px-4 py-3">
                <Image
                  className="!cursor-pointer !rounded-full border-gray-200 border-2 !w-10 !h-10 shrink-0"
                  src={Profile}
                  alt="User avatar"
                  width={40}
                  height={40}
                />
                <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                  <span className="text-sm  text-white font-semibold">{userName}</span>
                  <span className="text-xs text-white">{userEmail}</span>
                </div>
              </div>
          </SidebarGroupContent>
        </SidebarGroup>
            </div>

        {/* Navigation Menu */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

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
import { useEffect, useState } from "react";

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
    routes: BASE_ROUTES,
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
    routes: [...BASE_ROUTES, "/admin/graph", "/admin/user"],
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
  const [filteredItems, setFilteredItems] = useState(NAV_ITEMS);

  useEffect(() => {
    const getUserRole = async () => {
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
        console.error("Error getting user role:", error);
        setUserPosition(null);
        setUserDepartment(null);
      }
    };

    getUserRole();
  }, []);

  useEffect(() => {
    const allowedRoutes = getAllowedRoutes(userPosition, userDepartment);
    const filtered = NAV_ITEMS.filter((item) =>
      allowedRoutes.includes(item.url)
    );
    setFilteredItems(filtered);
  }, [userPosition, userDepartment]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-center px-4 py-4">
        <Image
          src={logo}
          alt="KSM Katering"
          className="h-12 w-auto shrink-0 group-data-[collapsible=icon]:h-0"
          priority
        />
      </SidebarHeader>
      <SidebarContent>
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

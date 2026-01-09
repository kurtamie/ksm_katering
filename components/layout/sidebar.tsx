"use client";

import {
  Calendar,
  Inbox,
  Soup,
  SquareMenu,
  User,
  UsersRound,
} from "lucide-react";
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

const allItems = [
  {
    title: "Manajemen Akun",
    url: "/admin/user",
    icon: User,
    allowedRoles: ["manager"],
  },
  {
    title: "Pesanan",
    url: "/admin/order",
    icon: Inbox,
    allowedRoles: ["manager", "sales", "driver"],
  },
  {
    title: "Kalender",
    url: "/admin/calendar",
    icon: Calendar,
    allowedRoles: ["manager", "sales", "driver"],
  },
  {
    title: "Customer",
    url: "/admin/customer",
    icon: UsersRound,
    allowedRoles: ["manager"],
  },
  {
    title: "Manajemen Lauk",
    url: "/admin/dish",
    icon: Soup,
    allowedRoles: ["manager"],
  },
  {
    title: "Manajemen Menu",
    url: "/admin/menu",
    icon: SquareMenu,
    allowedRoles: ["manager", "sales", "driver"],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [userPosition, setUserPosition] = useState<string | null>(null);
  const [filteredItems, setFilteredItems] = useState(allItems);

  useEffect(() => {
    const getUserPosition = async () => {
      try {
        const position = localStorage.getItem("user_position");

        setUserPosition(position?.toLowerCase() || "manager");
      } catch (error) {
        console.error("Error getting user position:", error);
        setUserPosition("manager"); 
      }
    };

    getUserPosition();
  }, []);

  useEffect(() => {
    if (userPosition) {
      const filtered = allItems.filter((item) =>
        item.allowedRoles.includes(userPosition)
      );
      setFilteredItems(filtered);
    }
  }, [userPosition]);

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
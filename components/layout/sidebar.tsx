"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import logo from "@/app/asset/logo.png";
import Profile from "@/app/asset/profile.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useMemo } from "react";
import { getAllowedRoutes, NAV_ITEMS } from "@/components/layout/nav-config";
import { useUser } from "@/components/providers/user-provider";

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const userPosition = user?.position ?? null;
  const userDepartment = user?.department ?? null;
  const userName = user?.name ?? "User";
  const userEmail = user?.email ?? "";

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
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
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

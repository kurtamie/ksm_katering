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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useMemo } from "react";
import { getAllowedRoutes, NAV_ITEMS } from "@/components/layout/nav-config";
import { useUser } from "@/components/providers/user-provider";
import { logoutAction } from "@/app/data/actions/auth-actions";
import { MdLogout } from "react-icons/md";

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const userPosition = user?.position ?? null;
  const userDepartment = user?.department ?? null;
  const userName = user?.name ?? "Pengguna";
  const userEmail = user?.email ?? "";

  const filteredItems = useMemo(() => {
    const allowedRoutes = getAllowedRoutes(userPosition, userDepartment);
    return NAV_ITEMS.filter((item) => allowedRoutes.includes(item.url));
  }, [userPosition, userDepartment]);

  const isNavLoading = Boolean(user?.id) && !userPosition && !userDepartment;

  const onCheckAppUpdate = () => {
    setTimeout(() => {
      const updateService = (window as unknown as { updateService?: { fetchUpdate?: () => void } })
        ?.updateService;
      updateService?.fetchUpdate?.();
      window.location.reload();
    }, 2000);
  };

  return (
    <Sidebar collapsible="icon">
      {/* Desktop: Show Logo */}
      <SidebarHeader className="hidden md:flex items-center justify-center px-4 py-4 overflow-hidden">
        <Image
          src={logo}
          alt="KSM Katering"
          className="h-12 w-auto shrink-0 transition-all duration-200 ease-linear group-data-[collapsible=icon]:h-0 group-data-[collapsible=icon]:opacity-0"
          priority
        />
      </SidebarHeader>

      <SidebarContent>
        {/* User Profile Section - Only visible on mobile */}
            <div className='bg-[#8D0000] dark:bg-[#8D0000]'>
        <SidebarGroup className="md:hidden">
          <SidebarGroupContent>
              <Link href="/admin/account" className="flex items-center gap-3 px-4 py-3">
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
              </Link>
          </SidebarGroupContent>
        </SidebarGroup>
            </div>

        {/* Navigation Menu */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {isNavLoading ? (
                <SidebarMenuItem>
                  <span className="px-3 py-2 text-sm text-muted-foreground">Memuat menu...</span>
                </SidebarMenuItem>
              ) : (
              filteredItems.map((item) => (
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
              ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="md:hidden">
        <button
          type="button"
          onClick={onCheckAppUpdate}
          className="flex w-full flex-col items-start gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <span>Perbarui aplikasi</span>
          <span className="text-xs text-gray-500">( Versi V.0.0.1 )</span>
        </button>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <MdLogout className="text-lg" />
            Keluar 
          </button>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}

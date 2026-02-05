"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";
import { getAllowedRoutes, NAV_ITEMS } from "@/components/layout/nav-config";
import { useUser } from "@/components/providers/user-provider";

export default function MobileNavbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const userPosition = user?.position ?? null;
  const userDepartment = user?.department ?? null;

  const filteredItems = useMemo(() => {
    const allowedRoutes = getAllowedRoutes(userPosition, userDepartment);
    return NAV_ITEMS.filter((item) => allowedRoutes.includes(item.url));
  }, [userPosition, userDepartment]);

  return (
    <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[95vw]">
      <div className="bg-[#8D0000] rounded-full shadow-lg px-4 py-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex items-center gap-3 sm:gap-6 min-w-max">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.url;
            
            return (
              <Link
                key={item.url}
                href={item.url}
                className={`flex flex-col items-center justify-center transition-[transform] duration-200 ease-out ${
                  isActive ? "scale-110" : "hover:scale-105"
                }`}
                aria-label={item.title}
              >
                <div
                  className={`p-2 rounded-lg transition-[background-color,transform] duration-200 ease-out ${
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
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

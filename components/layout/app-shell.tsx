"use client"

import React from "react"
import { usePathname } from "next/navigation"

import Header from "@/components/layout/header"
import { AppSidebar } from "@/components/layout/sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

const AUTH_PREFIX = "/auth"

type AppShellProps = {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const isAuthRoute = pathname?.startsWith(AUTH_PREFIX)
  const isHomePage = pathname === "/"
  const isStatusPage = pathname ? /^\/order\/[^/]+\/status$/.test(pathname) : false
  const [open, setOpen] = React.useState(true)

  if (isAuthRoute || isHomePage || isStatusPage) {
    return <>{children}</>
  } 

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <AppSidebar />
      <SidebarInset className="bg-gray-50 min-h-svh">
        <Header />
        <div className="w-full overflow-x-hidden">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

"use client"

import React from "react"
import { usePathname } from "next/navigation"

import Header from "@/components/layout/header"
import { AppSidebar } from "@/components/layout/sidebar"
import MobileNavbar from "@/components/layout/navbar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import PwaPrompt from "@/components/custom/pwa-prompt"

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
    return (
      <>
        <PwaPrompt />
        {children}
      </>
    )
  } 

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <AppSidebar />
      <SidebarInset className="bg-gray-50 min-h-svh overflow-x-hidden">
        <Header />
        <div className="w-full pb-24 md:pb-0">
          <PwaPrompt />
          {children}
        </div>
      <MobileNavbar />
      </SidebarInset>
    </SidebarProvider>
  )
}
import { Calendar, Home, Inbox, Menu, Search, Settings, User } from "lucide-react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import logo from "@/app/asset/logo.png"
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
} from "@/components/ui/sidebar"

const items = [
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
    title: "Manajemen Menu",
    url: "/admin/menu",
    icon: Menu,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

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
              {items.map((item) => (
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
  )
}

import type { ComponentType, SVGProps } from "react"
import { Calendar, Inbox, Soup, User, UsersRound } from "lucide-react"
import { VscGraph } from "react-icons/vsc"
import { getAllowedRoutes as getRoutesFromPermissions } from "@/const/permissions"

export type NavItem = {
  title: string
  url: string
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>
}

export const NAV_ITEMS: NavItem[] = [
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
    title: "Pelanggan",
    url: "/admin/customer",
    icon: UsersRound,
  },
  {
    title: "Manajemen Menu",
    url: "/admin/dish",
    icon: Soup,
  },
  {
    title: "Grafik",
    url: "/admin/graph",
    icon: VscGraph,
  },
]

export function getAllowedRoutes(position: string | null, department: string | null) {
  return getRoutesFromPermissions(position, department)
}

import type { ComponentType, SVGProps } from "react"
import { Calendar, Inbox, Soup, SquareMenu, User, UsersRound } from "lucide-react"
import { VscGraph } from "react-icons/vsc"

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
]

const BASE_ROUTES = ["/admin/order", "/admin/calendar", "/admin/dish", "/admin/menu"]
const DEFAULT_ALLOWED_ROUTES = ["/admin/order"]

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
]

export function getAllowedRoutes(position: string | null, department: string | null) {
  if (!position || !department) {
    return DEFAULT_ALLOWED_ROUTES
  }

  const match = ROLE_ROUTE_ACCESS.find(
    (rule) => rule.position === position && rule.department === department
  )

  return match?.routes ?? DEFAULT_ALLOWED_ROUTES
}

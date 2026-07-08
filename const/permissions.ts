import { normalizeRoleValue } from "@/const/misc"

export const DEPARTMENTS = {
  OPERATIONAL: "operational",
  DELIVERY: "delivery",
} as const

export const POSITIONS = {
  MANAGER: "manager",
  SALES: "sales",
  DRIVER: "driver",
} as const

export type RoleKey =
  | "operational:manager"
  | "operational:sales"
  | "delivery:driver"

const ACCOUNT_ROUTE = "/admin/account"

export type OrderPermissions = {
  canViewOrders: boolean
  canAdd: boolean
  canEdit: boolean
  canDelete: boolean
  canExport: boolean
  canPrint: boolean
  canInvoice: boolean
  canDeliveryOrder: boolean
  canUpdateOrderStatus: boolean
}

export type StaffPermissions = {
  roleKey: RoleKey | null
  routes: string[]
  canManageUsers: boolean
  canManageMenu: boolean
  canManageCustomers: boolean
  canViewGraph: boolean
  canViewCalendar: boolean
  orders: OrderPermissions
}

const MANAGER_PERMISSIONS: StaffPermissions = {
  roleKey: "operational:manager",
  routes: [
    "/admin/user",
    "/admin/order",
    "/admin/calendar",
    "/admin/dish",
    "/admin/menu",
    "/admin/graph",
    ACCOUNT_ROUTE,
  ],
  canManageUsers: true,
  canManageMenu: true,
  canManageCustomers: false,
  canViewGraph: true,
  canViewCalendar: true,
  orders: {
    canViewOrders: true,
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canExport: true,
    canPrint: false,
    canInvoice: false,
    canDeliveryOrder: false,
    canUpdateOrderStatus: false,
  },
}

const SALES_PERMISSIONS: StaffPermissions = {
  roleKey: "operational:sales",
  routes: ["/admin/order", "/admin/calendar", "/admin/customer", ACCOUNT_ROUTE],
  canManageUsers: false,
  canManageMenu: false,
  canManageCustomers: true,
  canViewGraph: false,
  canViewCalendar: true,
  orders: {
    canViewOrders: true,
    canAdd: true,
    canEdit: true,
    canDelete: true,
    canExport: true,
    canPrint: true,
    canInvoice: false,
    canDeliveryOrder: false,
    canUpdateOrderStatus: true,
  },
}

const DRIVER_PERMISSIONS: StaffPermissions = {
  roleKey: "delivery:driver",
  routes: ["/admin/order", "/admin/calendar", ACCOUNT_ROUTE],
  canManageUsers: false,
  canManageMenu: false,
  canManageCustomers: false,
  canViewGraph: false,
  canViewCalendar: true,
  orders: {
    canViewOrders: true,
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canExport: false,
    canPrint: true,
    canInvoice: false,
    canDeliveryOrder: false,
    canUpdateOrderStatus: true,
  },
}

const DEFAULT_PERMISSIONS: StaffPermissions = {
  roleKey: null,
  routes: [ACCOUNT_ROUTE],
  canManageUsers: false,
  canManageMenu: false,
  canManageCustomers: false,
  canViewGraph: false,
  canViewCalendar: false,
  orders: {
    canViewOrders: false,
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canExport: false,
    canPrint: false,
    canInvoice: false,
    canDeliveryOrder: false,
    canUpdateOrderStatus: false,
  },
}

const PERMISSION_MAP: Record<RoleKey, StaffPermissions> = {
  "operational:manager": MANAGER_PERMISSIONS,
  "operational:sales": SALES_PERMISSIONS,
  "delivery:driver": DRIVER_PERMISSIONS,
}

export function getRoleKey(
  position: string | null | undefined,
  department: string | null | undefined
): RoleKey | null {
  const pos = normalizeRoleValue(position)
  const dept = normalizeRoleValue(department)

  if (!pos) return null

  // Model baru: department operational / delivery
  if (dept === DEPARTMENTS.OPERATIONAL) {
    if (pos === POSITIONS.MANAGER || pos === POSITIONS.SALES) {
      return `${dept}:${pos}` as RoleKey
    }
  }

  if (dept === DEPARTMENTS.DELIVERY && pos === POSITIONS.DRIVER) {
    return `${dept}:${pos}` as RoleKey
  }

  // Legacy & fallback berdasarkan posisi (data lama di DB/cookie)
  if (pos === POSITIONS.MANAGER) {
    return "operational:manager"
  }

  if (pos === POSITIONS.SALES) {
    return "operational:sales"
  }

  if (pos === POSITIONS.DRIVER) {
    return "delivery:driver"
  }

  return null
}

export function normalizeStaffCookies(
  position: string | null | undefined,
  department: string | null | undefined
): { position: string | null; department: string | null } {
  const roleKey = getRoleKey(position, department)
  if (!roleKey) {
    return {
      position: normalizeRoleValue(position) || null,
      department: normalizeRoleValue(department) || null,
    }
  }

  const [dept, pos] = roleKey.split(":") as [string, string]
  return { position: pos, department: dept }
}

export function getPermissions(
  position: string | null | undefined,
  department: string | null | undefined
): StaffPermissions {
  const roleKey = getRoleKey(position, department)
  if (!roleKey) return DEFAULT_PERMISSIONS
  return PERMISSION_MAP[roleKey]
}

export function getAllowedRoutes(
  position: string | null | undefined,
  department: string | null | undefined
): string[] {
  return getPermissions(position, department).routes
}

export function getDefaultRoute(
  position: string | null | undefined,
  department: string | null | undefined
): string {
  const routes = getAllowedRoutes(position, department).filter(
    (route) => route !== ACCOUNT_ROUTE
  )
  return routes[0] ?? ACCOUNT_ROUTE
}

export function canAccessRoute(
  pathname: string,
  position: string | null | undefined,
  department: string | null | undefined
): boolean {
  const permissions = getPermissions(position, department)

  if (pathname.startsWith("/order/") && pathname.endsWith("/status")) {
    return permissions.orders.canUpdateOrderStatus
  }

  return permissions.routes.some((route) => pathname.startsWith(route))
}

export function getOrderPermissions(
  position: string | null | undefined,
  department: string | null | undefined
): OrderPermissions {
  return getPermissions(position, department).orders
}

export function isSalesStaff(
  position: string | null | undefined,
  department: string | null | undefined
): boolean {
  return getRoleKey(position, department) === "operational:sales"
}

export function isDriverStaff(
  position: string | null | undefined,
  department: string | null | undefined
): boolean {
  return getRoleKey(position, department) === "delivery:driver"
}

export function isManagerStaff(
  position: string | null | undefined,
  department: string | null | undefined
): boolean {
  return getRoleKey(position, department) === "operational:manager"
}

export const DEPARTMENT_LABELS: Record<string, string> = {
  operational: "Operasional",
  delivery: "Pengiriman",
}

export const POSITION_LABELS: Record<string, string> = {
  manager: "Manager",
  sales: "Sales",
  driver: "Kurir",
}

export function getDepartmentLabel(value: string | null | undefined): string {
  const normalized = normalizeRoleValue(value)
  return DEPARTMENT_LABELS[normalized] ?? value ?? "-"
}

export function getPositionLabel(value: string | null | undefined): string {
  const normalized = normalizeRoleValue(value)
  return POSITION_LABELS[normalized] ?? value ?? "-"
}

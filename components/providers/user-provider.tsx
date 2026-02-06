"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"

export type UserSession = {
  id?: number | null
  name?: string
  email?: string
  position?: string | null
  department?: string | null
  staffId?: number | null
  staffDocumentId?: string | null
}

type UserContextValue = {
  user: UserSession | null
  setUser: (next: UserSession | null) => void
}

const UserContext = createContext<UserContextValue | null>(null)

const parseNumber = (value: string | null): number | null => {
  if (!value) return null
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

const normalizeRole = (value: string | null): string | null => {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed.toLowerCase() : null
}

const readCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

const readUserFromCookies = (): UserSession | null => {
  const userId = parseNumber(readCookie("userId"))
  if (!userId) return null

  const name = readCookie("user_name") ?? "User"
  const email = readCookie("user_email") ?? ""
  const position = normalizeRole(readCookie("user_position"))
  const department = normalizeRole(readCookie("user_department"))
  const staffId = parseNumber(readCookie("user_staff_id"))
  const staffDocumentId = readCookie("user_staff_document_id")

  return {
    id: userId,
    name,
    email,
    position,
    department,
    staffId,
    staffDocumentId,
  }
}

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7

const setClientCookie = (name: string, value: string) => {
  if (typeof document === "undefined") return
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}`
}

const normalizeUserFromMe = (payload: any): UserSession | null => {
  if (!payload) return null

  const user = payload?.data ?? payload
  const staff = user?.staff?.data ?? user?.staff ?? null
  const staffAttributes = staff?.attributes ?? staff ?? null

  const staffIdRaw = staff?.id ?? staffAttributes?.id ?? user?.staff?.id ?? user?.staff?.data?.id
  const staffDocumentIdRaw =
    staffAttributes?.documentId ??
    staffAttributes?.document_id ??
    staff?.documentId ??
    staff?.document_id ??
    user?.staff?.documentId ??
    user?.staff?.document_id

  const position = staffAttributes?.position ?? user?.position ?? null
  const department = staffAttributes?.department ?? user?.department ?? null

  const normalizedPosition = normalizeRole(position)
  const normalizedDepartment = normalizeRole(department)

  const staffId =
    typeof staffIdRaw === "string" || typeof staffIdRaw === "number" ? Number(staffIdRaw) : null
  const normalizedStaffId = Number.isFinite(staffId) ? staffId : null
  const staffDocumentId =
    typeof staffDocumentIdRaw === "string" && staffDocumentIdRaw.trim().length > 0
      ? staffDocumentIdRaw
      : null

  const id =
    typeof user?.id === "number" || typeof user?.id === "string" ? Number(user.id) : null
  const name = user?.username ?? user?.name ?? "User"
  const email = user?.email ?? ""

  if (!id) return null

  return {
    id,
    name,
    email,
    position: normalizedPosition,
    department: normalizedDepartment,
    staffId: normalizedStaffId,
    staffDocumentId,
  }
}

type UserProviderProps = {
  children: React.ReactNode
  initialUser?: UserSession | null
}

export function UserProvider({ children, initialUser = null }: UserProviderProps) {
  const [user, setUserState] = useState<UserSession | null>(initialUser)
  const lastFetchedKeyRef = useRef<number | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const cookieUser = readUserFromCookies()
    if (!cookieUser) {
      if (user) {
        setUserState(null)
      }
      lastFetchedKeyRef.current = null
      return
    }

    const hasChanged =
      !user ||
      user.id !== cookieUser.id ||
      user.name !== cookieUser.name ||
      user.email !== cookieUser.email ||
      user.position !== cookieUser.position ||
      user.department !== cookieUser.department ||
      user.staffId !== cookieUser.staffId ||
      user.staffDocumentId !== cookieUser.staffDocumentId

    if (hasChanged) {
      setUserState(cookieUser)
      lastFetchedKeyRef.current = null
    }
  }, [user, pathname])

  useEffect(() => {
    if (user?.position && user?.department) return

    const fetchKey = user?.id ?? -1
    if (lastFetchedKeyRef.current === fetchKey) return
    lastFetchedKeyRef.current = fetchKey

    const fetchUser = async () => {
      try {
        const response = await fetch("/api/users/me?populate=staff", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })
        if (!response.ok) return
        const data = await response.json()
        const normalized = normalizeUserFromMe(data)
        if (!normalized) return

        setUserState(normalized)

        if (normalized.id) setClientCookie("userId", String(normalized.id))
        if (normalized.name) setClientCookie("user_name", String(normalized.name))
        if (normalized.email) setClientCookie("user_email", String(normalized.email))
        if (normalized.position) setClientCookie("user_position", normalized.position)
        if (normalized.department) setClientCookie("user_department", normalized.department)
        if (typeof normalized.staffId === "number") {
          setClientCookie("user_staff_id", String(normalized.staffId))
        }
        if (normalized.staffDocumentId) {
          setClientCookie("user_staff_document_id", normalized.staffDocumentId)
        }
      } catch (error) {
        console.error("Failed to fetch user session:", error)
      }
    }

    void fetchUser()
  }, [user])

  const setUser = useCallback((next: UserSession | null) => {
    if (!next) {
      setUserState(null)
      return
    }
    setUserState({
      ...next,
      position: normalizeRole(next.position ?? null),
      department: normalizeRole(next.department ?? null),
    })
  }, [])

  const value = useMemo(() => ({ user, setUser }), [user, setUser])

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within UserProvider")
  }
  return context
}

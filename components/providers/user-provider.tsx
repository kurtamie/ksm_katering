"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

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
  const position = readCookie("user_position")?.toLowerCase() ?? null
  const department = readCookie("user_department")?.toLowerCase() ?? null
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

type UserProviderProps = {
  children: React.ReactNode
  initialUser?: UserSession | null
}

export function UserProvider({ children, initialUser = null }: UserProviderProps) {
  const [user, setUserState] = useState<UserSession | null>(initialUser)

  useEffect(() => {
    if (user) return
    const cookieUser = readUserFromCookies()
    if (cookieUser) {
      setUserState(cookieUser)
    }
  }, [user])

  const setUser = useCallback((next: UserSession | null) => {
    setUserState(next)
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

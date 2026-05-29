"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SubmitButton } from "@/components/custom/submit-button"
import { ZodErrors } from "@/components/custom/zod-errors"
import { updateAccountAction, updatePasswordAction, INITIAL_STATE } from "@/features/admin/update-accound"

export default function AccountPage() {
  const [accountState, accountAction] = useActionState(updateAccountAction, INITIAL_STATE)
  const [passwordState, passwordAction] = useActionState(updatePasswordAction, INITIAL_STATE)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [values, setValues] = useState({
    username: "",
    email: "",
    phone_no: "",
    ktp_no: "",
    department: "",
    position: "",
  })
  const hasStaff = useMemo(
    () => values.department !== "" || values.position !== "" || values.ktp_no !== "",
    [values]
  )
  const extractUserData = (payload: any) => {
    const user = payload?.data ?? payload
    const staff = user?.staff?.data ?? user?.staff ?? null
    const staffAttrs = staff?.attributes ?? staff ?? null
      return {
        username: user?.username ?? user?.name ?? "",
        email: user?.email ?? "",
        phone_no: user?.phone_no ?? user?.phone ?? "",
        staff: staffAttrs
          ? {
              ktp_no: staffAttrs?.ktp_no ?? staffAttrs?.ktpNo ?? "",
              department: staffAttrs?.department ?? "",
              position: staffAttrs?.position ?? "",
            }
          : null,
      }
  }

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const response = await fetch("/api/users/me?populate=staff", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })
        if (!response.ok) {
          throw new Error("Gagal memuat data akun")
        }
        const data = await response.json()
        if (!isMounted) return

        const normalized = extractUserData(data)
        setValues({
          username: normalized.username ?? "",
          email: normalized.email ?? "",
          phone_no: normalized.phone_no ?? "",
          ktp_no: normalized.staff?.ktp_no ?? "",
          department: normalized.staff?.department ?? "",
          position: normalized.staff?.position ?? "",
        })
      } catch (error) {
        if (isMounted) {
          setLoadError(error instanceof Error ? error.message : "Gagal memuat data akun")
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadUser()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="bg-white w-full mx-auto relative">
      <div className="border-b border-black w-full">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4">
          <h1 className="text-xl font-bold">Akun Saya</h1>
          <p className="text-sm text-gray-600">
            Kelola informasi akun dan data staff yang terkait.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {loadError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Informasi Akun</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={accountAction} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={values.username}
                    onChange={(event) =>
                      setValues((prev) => ({ ...prev, username: event.target.value }))
                    }
                    disabled={loading}
                  />
                  <ZodErrors error={accountState?.zodErrors?.username} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={(event) =>
                      setValues((prev) => ({ ...prev, email: event.target.value }))
                    }
                    disabled={loading}
                  />
                  <ZodErrors error={accountState?.zodErrors?.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_no">Nomor Telepon</Label>
                  <Input
                    id="phone_no"
                    name="phone_no"
                    value={values.phone_no}
                    onChange={(event) =>
                      setValues((prev) => ({ ...prev, phone_no: event.target.value }))
                    }
                    disabled={loading}
                  />
                  <ZodErrors error={accountState?.zodErrors?.phone_no} />
                </div>
              </div>

              {hasStaff && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ktp_no">Nomor KTP</Label>
                    <Input
                      id="ktp_no"
                      name="ktp_no"
                      value={values.ktp_no}
                      onChange={(event) =>
                        setValues((prev) => ({ ...prev, ktp_no: event.target.value }))
                      }
                      disabled={loading}
                    />
                    <ZodErrors error={accountState?.zodErrors?.ktp_no} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" value={values.department} disabled readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input id="position" value={values.position} disabled readOnly />
                  </div>
                </div>
              )}

              {accountState?.error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                  {accountState.error}
                </div>
              )}
              {accountState?.message && (
                <div className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
                  {accountState.message}
                </div>
              )}

              <SubmitButton
                text="Simpan Perubahan"
                loadingText="Menyimpan"
                className="bg-[#8D0000] text-white hover:bg-red-700"
                loading={loading}
              />
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ganti Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={passwordAction} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password Baru</Label>
                  <Input id="password" name="password" type="password" />
                  <ZodErrors error={passwordState?.zodErrors?.password} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Konfirmasi Password</Label>
                  <Input id="confirm_password" name="confirm_password" type="password" />
                  <ZodErrors error={passwordState?.zodErrors?.confirm_password} />
                </div>
              </div>

              {passwordState?.error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                  {passwordState.error}
                </div>
              )}
              {passwordState?.message && (
                <div className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
                  {passwordState.message}
                </div>
              )}

              <SubmitButton
                text="Ganti Password"
                loadingText="Menyimpan"
                className="bg-[#8D0000] text-white hover:bg-red-700"
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

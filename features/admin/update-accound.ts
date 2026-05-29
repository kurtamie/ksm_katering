"use server"

import { z } from "zod"
import { cookies } from "next/headers"
import { getStrapiURL } from "@/lib/utils"

const apiBaseUrl = getStrapiURL()

const parseNumber = (value: string | null | undefined): number | null => {
  if (!value) return null
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

const cleanValue = (value: FormDataEntryValue | null): string => {
  if (typeof value !== "string") return ""
  return value.trim()
}

const updateAccountSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter").optional().or(z.literal("")),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  phone_no: z.string().min(6, "Nomor telepon minimal 6 digit").optional().or(z.literal("")),
  ktp_no: z.string().min(8, "Nomor KTP minimal 8 digit").optional().or(z.literal("")),
})

const updatePasswordSchema = z.object({
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirm_password: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
}).refine((data) => data.password === data.confirm_password, {
  message: "Password dan konfirmasi tidak sama",
  path: ["confirm_password"],
})

const mapZodErrors = (errors: z.ZodIssue[]) => {
  const result: Record<string, string[]> = {}
  for (const issue of errors) {
    const key = issue.path[0] ? String(issue.path[0]) : "form"
    if (!result[key]) result[key] = []
    result[key].push(issue.message)
  }
  return result
}

type ActionState = {
  zodErrors: Record<string, string[]> | null
  message: string | null
  error: string | null
}

const INITIAL_STATE: ActionState = {
  zodErrors: null,
  message: null,
  error: null,
}

export async function updateAccountAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const raw = {
    username: cleanValue(formData.get("username")),
    email: cleanValue(formData.get("email")),
    phone_no: cleanValue(formData.get("phone_no")),
    ktp_no: cleanValue(formData.get("ktp_no")),
  }

  const validated = updateAccountSchema.safeParse(raw)
  if (!validated.success) {
    return {
      ...INITIAL_STATE,
      zodErrors: mapZodErrors(validated.error.issues),
    }
  }

  const cookieStore = await cookies()
  const token = cookieStore.get("jwt")?.value
  const userId = parseNumber(cookieStore.get("userId")?.value)
  const staffId = parseNumber(cookieStore.get("user_staff_id")?.value)
  const staffDocumentId = cookieStore.get("user_staff_document_id")?.value?.trim() || null

  if (!token || !userId) {
    return {
      ...INITIAL_STATE,
      error: "Sesi login tidak ditemukan. Silakan login ulang.",
    }
  }

  const userPayload: Record<string, string> = {}
  if (validated.data.username) userPayload.username = validated.data.username
  if (validated.data.email) userPayload.email = validated.data.email
  if (validated.data.phone_no) userPayload.phone_no = validated.data.phone_no

  const staffPayload: Record<string, string> = {}
  if (validated.data.ktp_no) staffPayload.ktp_no = validated.data.ktp_no

  if (Object.keys(userPayload).length === 0 && Object.keys(staffPayload).length === 0) {
    return {
      ...INITIAL_STATE,
      message: "Tidak ada perubahan untuk disimpan.",
    }
  }

  try {
    if (Object.keys(userPayload).length > 0) {
      const userUrl = new URL(`/api/users/${userId}`, apiBaseUrl)
      const userResponse = await fetch(userUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userPayload),
      })

      const userResult = await userResponse.json().catch(() => null)

      if (!userResponse.ok) {
        const message =
          userResult?.error?.message ??
          userResult?.message ??
          "Gagal memperbarui data user"
        return {
          ...INITIAL_STATE,
          error: message,
        }
      }

      if (userPayload.username) {
        cookieStore.set("user_name", userPayload.username, { path: "/" })
      }
      if (userPayload.email) {
        cookieStore.set("user_email", userPayload.email, { path: "/" })
      }
    }

    if (Object.keys(staffPayload).length > 0) {
      const staffIdentifier = staffDocumentId || (staffId ? String(staffId) : null)
      if (!staffIdentifier) {
        return {
          ...INITIAL_STATE,
          error: "Data staff tidak ditemukan.",
        }
      }

      const staffUrl = new URL(`/api/staffs/${staffIdentifier}`, apiBaseUrl)
      const staffResponse = await fetch(staffUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: staffPayload }),
      })

      const staffResult = await staffResponse.json().catch(() => null)

      if (!staffResponse.ok) {
        const message =
          staffResult?.error?.message ??
          staffResult?.message ??
          "Gagal memperbarui data staff"
        return {
          ...INITIAL_STATE,
          error: message,
        }
      }
    }

    return {
      ...INITIAL_STATE,
      message: "Data akun berhasil diperbarui.",
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan"
    return {
      ...INITIAL_STATE,
      error: message,
    }
  }
}

export async function updatePasswordAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const raw = {
    password: cleanValue(formData.get("password")),
    confirm_password: cleanValue(formData.get("confirm_password")),
  }

  const validated = updatePasswordSchema.safeParse(raw)
  if (!validated.success) {
    return {
      ...INITIAL_STATE,
      zodErrors: mapZodErrors(validated.error.issues),
    }
  }

  const cookieStore = await cookies()
  const token = cookieStore.get("jwt")?.value
  const userId = parseNumber(cookieStore.get("userId")?.value)

  if (!token || !userId) {
    return {
      ...INITIAL_STATE,
      error: "Sesi login tidak ditemukan. Silakan login ulang.",
    }
  }

  try {
    const url = new URL(`/api/users/${userId}`, apiBaseUrl)
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password: validated.data.password }),
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const message =
        result?.error?.message ??
        result?.message ??
        "Gagal memperbarui password"
      return {
        ...INITIAL_STATE,
        error: message,
      }
    }

    return {
      ...INITIAL_STATE,
      message: "Password berhasil diperbarui.",
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan"
    return {
      ...INITIAL_STATE,
      error: message,
    }
  }
}

export { INITIAL_STATE }

import { getStrapiURL } from "@/lib/utils"

export type StaffFormPayload = {
  username: string
  password?: string
  name: string
  department: string
  position: string
  ktp_no: string
  staff_status: string
  phone_no: string
}

type StaffMutationResult = {
  success: boolean
  error?: string
}

const apiBaseUrl = getStrapiURL()

const toEmail = (username: string) => {
  const normalized = username.trim()
  return normalized.includes("@") ? normalized : `${normalized}@ksm.local`
}

export async function createStaffWithUser(payload: StaffFormPayload): Promise<StaffMutationResult> {
  try {
    if (!payload.password) {
      return { success: false, error: "Password wajib diisi" }
    }

    const registerResponse = await fetch(new URL("/api/auth/local/register", apiBaseUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: payload.username,
        email: toEmail(payload.username),
        password: payload.password,
      }),
    })
    const registerResult = await registerResponse.json().catch(() => null)

    if (!registerResponse.ok || registerResult?.error) {
      return {
        success: false,
        error: registerResult?.error?.message ?? "Gagal membuat user",
      }
    }

    const userId = registerResult?.user?.id
    const staffResponse = await fetch(new URL("/api/staffs", apiBaseUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          name: payload.name,
          department: payload.department,
          position: payload.position,
          ktp_no: payload.ktp_no,
          staff_status: payload.staff_status,
          phone_no: payload.phone_no,
          user_id: userId,
        },
      }),
    })
    const staffResult = await staffResponse.json().catch(() => null)

    if (!staffResponse.ok || staffResult?.error) {
      return {
        success: false,
        error: staffResult?.error?.message ?? "User dibuat, tetapi gagal membuat staff",
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan",
    }
  }
}

export async function updateStaffWithUser(
  documentId: string,
  userId: number | null,
  payload: StaffFormPayload
): Promise<StaffMutationResult> {
  try {
    if (userId && (payload.username || payload.password)) {
      const userPayload: Record<string, string> = {}
      if (payload.username) {
        userPayload.username = payload.username
        userPayload.email = toEmail(payload.username)
      }
      if (payload.password) {
        userPayload.password = payload.password
      }

      const userResponse = await fetch(new URL(`/api/users/${userId}`, apiBaseUrl), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userPayload),
      })
      const userResult = await userResponse.json().catch(() => null)
      if (!userResponse.ok || userResult?.error) {
        return {
          success: false,
          error: userResult?.error?.message ?? "Gagal memperbarui user",
        }
      }
    }

    const staffResponse = await fetch(new URL(`/api/staffs/${documentId}`, apiBaseUrl), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          name: payload.name,
          department: payload.department,
          position: payload.position,
          ktp_no: payload.ktp_no,
          staff_status: payload.staff_status,
          phone_no: payload.phone_no,
        },
      }),
    })
    const staffResult = await staffResponse.json().catch(() => null)

    if (!staffResponse.ok || staffResult?.error) {
      return {
        success: false,
        error: staffResult?.error?.message ?? "Gagal memperbarui staff",
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan",
    }
  }
}

export async function deleteStaffWithUser(
  documentId: string,
  userId: number | null
): Promise<StaffMutationResult> {
  try {
    const staffResponse = await fetch(new URL(`/api/staffs/${documentId}`, apiBaseUrl), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
    const staffResult = await staffResponse.json().catch(() => null)

    if (!staffResponse.ok || staffResult?.error) {
      return {
        success: false,
        error: staffResult?.error?.message ?? "Gagal menghapus staf",
      }
    }

    if (userId) {
      const userResponse = await fetch(new URL(`/api/users/${userId}`, apiBaseUrl), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })
      const userResult = await userResponse.json().catch(() => null)
      if (!userResponse.ok || userResult?.error) {
        return {
          success: false,
          error: userResult?.error?.message ?? "Staf dihapus, tetapi user gagal dihapus",
        }
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan",
    }
  }
}

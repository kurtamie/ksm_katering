import { getStrapiURL } from "@/lib/utils"

export type StaffFormPayload = {
  username: string
  password?: string
  email?: string
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

// Strapi API Token (create one in Strapi Admin > Settings > API Tokens, with at
// least read access to User and Staff). Without this, GET requests used for
// duplicate checks can silently fail (401/403) if the Public role isn't allowed
// to query /api/users or /api/staffs, which would let duplicates slip through
// undetected. Set STRAPI_API_TOKEN in your Next.js server environment (.env).
const strapiApiToken = process.env.STRAPI_API_TOKEN

const authHeaders = (): Record<string, string> => ({
  "Content-Type": "application/json",
  ...(strapiApiToken ? { Authorization: `Bearer ${strapiApiToken}` } : {}),
})

const toEmail = (username: string, phone_no: string) => {
  const normalized = `${username.trim() || phone_no.trim()}`.toLowerCase()
  return normalized.includes("@") ? normalized : `${normalized}@gmail.com`
}

const getStrapiErrorMessage = (result: any, fallback: string) => {
  if (!result) return fallback
  if (typeof result.error?.message === "string") return translateStrapiMessage(result.error.message)
  if (Array.isArray(result.error?.details?.errors) && result.error.details.errors.length > 0) {
    const first = result.error.details.errors[0]
    if (typeof first?.message === "string") return translateStrapiMessage(first.message)
  }
  if (typeof result.message === "string") return translateStrapiMessage(result.message)
  return fallback
}

const isDigitsOnly = (value: string) => /^\d+$/.test(value.trim())

const isPhoneLengthValid = (value: string) => {
  const length = value.trim().length
  return length >= 10 && length <= 15
}

const isKtpLengthValid = (value: string) => value.trim().length === 16

const isUsernameLengthValid = (value: string) => value.trim().length >= 3

const isPasswordStrong = (value: string) => {
  if (value.length < 8) return false
  if (!/[A-Z]/.test(value)) return false
  if (!/[a-z]/.test(value)) return false
  if (!/[0-9]/.test(value)) return false
  if (!/[^A-Za-z0-9]/.test(value)) return false
  return true
}

// Strapi's users-permissions plugin returns its own English messages (e.g. from
// /api/auth/local/register). This only surfaces if a request slips past our own
// duplicate pre-checks below (e.g. a race condition), so translate the known ones
// as a safety net rather than leaking English text to the user.
const translateStrapiMessage = (message: string): string => {
  const normalized = message.trim().toLowerCase()

  if (normalized.includes("email or username") && normalized.includes("taken")) {
    return "Nama pengguna atau email sudah terdaftar, gunakan yang lain."
  }
  if (normalized.includes("username") && normalized.includes("taken")) {
    return "Nama pengguna sudah terdaftar."
  }
  if (normalized.includes("email") && normalized.includes("taken")) {
    return "Email sudah terdaftar."
  }
  if (normalized.includes("email") && normalized.includes("already") && normalized.includes("register")) {
    return "Email sudah terdaftar."
  }

  return message
}

const findDuplicateUserByField = async (
  field: "username" | "email" | "phone_no",
  value: string,
  excludeUserId?: number | null
): Promise<boolean> => {
  const url = new URL("/api/users", apiBaseUrl)
  url.searchParams.set(`filters[${field}][$eq]`, value)
  if (excludeUserId) {
    url.searchParams.set("filters[id][$ne]", String(excludeUserId))
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: authHeaders(),
  })
  const result = await response.json().catch(() => null)

  if (!response.ok) {
    // Fail closed: if we can't verify uniqueness (e.g. missing/invalid
    // STRAPI_API_TOKEN, or the role lacks "find" permission on User), don't
    // silently let it through as "not a duplicate" — surface it instead.
    throw new Error(
      `Gagal memeriksa duplikat ${field} (status ${response.status}). Periksa STRAPI_API_TOKEN dan permission "find" pada User.`
    )
  }

  // NOTE: the users-permissions plugin's /api/users endpoint returns a plain
  // array directly (unlike normal content-type endpoints such as /api/staffs,
  // which wrap results in { data: [...] }). Support both shapes here, otherwise
  // this check silently always reports "no duplicate found" for /api/users.
  const users = Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : null

  if (users === null) {
    throw new Error(`Gagal memeriksa duplikat ${field}: format respons tidak dikenali.`)
  }

  return users.length > 0
}

const findDuplicateStaffByKtp = async (
  ktp_no: string,
  excludeDocumentId?: string | null
): Promise<boolean> => {
  const url = new URL("/api/staffs", apiBaseUrl)
  url.searchParams.set("filters[ktp_no][$eq]", ktp_no)
  if (excludeDocumentId) {
    url.searchParams.set("filters[documentId][$ne]", excludeDocumentId)
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: authHeaders(),
  })
  const result = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      `Gagal memeriksa duplikat No. KTP (status ${response.status}). Periksa STRAPI_API_TOKEN dan permission "find" pada Staff.`
    )
  }

  return Array.isArray(result?.data) && result.data.length > 0
}

export async function createStaffWithUser(payload: StaffFormPayload): Promise<StaffMutationResult> {
  try {
    const username = payload.username?.trim() ?? ""
    const password = payload.password?.trim() ?? ""
    const phone_no = payload.phone_no?.trim() ?? ""
    const ktp_no = payload.ktp_no?.trim() ?? ""

    if (!username) {
      return { success: false, error: "Username wajib diisi" }
    }

    if (!isUsernameLengthValid(username)) {
      return { success: false, error: "Nama pengguna minimal 3 karakter" }
    }

    if (!password) {
      return { success: false, error: "Password wajib diisi" }
    }

    if (!isPasswordStrong(password)) {
      return {
        success: false,
        error: "Kata sandi minimal 8 karakter dan harus mengandung huruf besar, huruf kecil, angka, serta karakter spesial",
      }
    }

    if (phone_no && !isDigitsOnly(phone_no)) {
      return { success: false, error: "Nomor HP hanya boleh berisi angka" }
    }

    if (phone_no && !isPhoneLengthValid(phone_no)) {
      return { success: false, error: "Nomor HP minimal 10 digit dan maksimal 15 digit" }
    }

    if (ktp_no && !isDigitsOnly(ktp_no)) {
      return { success: false, error: "Nomor KTP hanya boleh berisi angka" }
    }

    if (ktp_no && !isKtpLengthValid(ktp_no)) {
      return { success: false, error: "Nomor KTP harus tepat 16 digit" }
    }

    const email = payload.email?.trim() || toEmail(username, phone_no)

    if (await findDuplicateUserByField("username", username)) {
      return {
        success: false,
        error: "Nama pengguna sudah terdaftar",
      }
    }

    if (await findDuplicateUserByField("email", email)) {
      return {
        success: false,
        error: "Email sudah terdaftar",
      }
    }

    if (phone_no && (await findDuplicateUserByField("phone_no", phone_no))) {
      return {
        success: false,
        error: "Nomor HP sudah terdaftar, gunakan nomor lain",
      }
    }

    if (ktp_no && (await findDuplicateStaffByKtp(ktp_no))) {
      return {
        success: false,
        error: "Nomor KTP sudah terdaftar, gunakan nomor lain",
      }
    }

    const registerBody: Record<string, string> = {
      username,
      email,
      password,
    }

    const registerResponse = await fetch(new URL("/api/auth/local/register", apiBaseUrl), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(registerBody),
    })
    const registerResult = await registerResponse.json().catch(() => null)

    if (!registerResponse.ok || registerResult?.error) {
      return {
        success: false,
        error: getStrapiErrorMessage(registerResult, "Gagal membuat user"),
      }
    }

    const userId = registerResult?.user?.id

    if (userId && (phone_no || payload.email)) {
      const userUpdateBody: Record<string, string> = {}
      if (phone_no) {
        userUpdateBody.phone_no = phone_no
      }
      if (payload.email?.trim()) {
        userUpdateBody.email = email
      }

      const userUpdateResponse = await fetch(new URL(`/api/users/${userId}`, apiBaseUrl), {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(userUpdateBody),
      })
      const userUpdateResult = await userUpdateResponse.json().catch(() => null)
      if (!userUpdateResponse.ok || userUpdateResult?.error) {
        if (userId) {
          await fetch(new URL(`/api/users/${userId}`, apiBaseUrl), {
            method: "DELETE",
            headers: authHeaders(),
          }).catch(() => null)
        }
        return {
          success: false,
          error: getStrapiErrorMessage(userUpdateResult, "Gagal memperbarui user setelah registrasi"),
        }
      }
    }

    const staffResponse = await fetch(new URL("/api/staffs", apiBaseUrl), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        data: {
          name: payload.name,
          department: payload.department,
          position: payload.position,
          ktp_no: payload.ktp_no,
          staff_status: payload.staff_status,
          user_id: userId,
        },
      }),
    })
    const staffResult = await staffResponse.json().catch(() => null)

    if (!staffResponse.ok || staffResult?.error) {
      if (userId) {
        await fetch(new URL(`/api/users/${userId}`, apiBaseUrl), {
          method: "DELETE",
          headers: authHeaders(),
        }).catch(() => null)
      }
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
    const phone_no = payload.phone_no?.trim() ?? ""
    const ktp_no = payload.ktp_no?.trim() ?? ""
    const password = payload.password?.trim() ?? ""

    if (password && !isPasswordStrong(password)) {
      return {
        success: false,
        error: "Kata sandi minimal 8 karakter dan harus mengandung huruf besar, huruf kecil, angka, serta karakter spesial",
      }
    }

    if (phone_no && !isDigitsOnly(phone_no)) {
      return { success: false, error: "Nomor HP hanya boleh berisi angka" }
    }

    if (phone_no && !isPhoneLengthValid(phone_no)) {
      return { success: false, error: "Nomor HP minimal 10 digit dan maksimal 15 digit" }
    }

    if (ktp_no && !isDigitsOnly(ktp_no)) {
      return { success: false, error: "Nomor KTP hanya boleh berisi angka" }
    }

    if (ktp_no && !isKtpLengthValid(ktp_no)) {
      return { success: false, error: "Nomor KTP harus tepat 16 digit" }
    }

    const updatedEmail = payload.email?.trim() || (payload.username ? toEmail(payload.username, payload.phone_no) : undefined)
    const shouldUpdateUser = payload.username || payload.password || payload.email || payload.phone_no

    if (userId && shouldUpdateUser) {
      if (payload.username && !isUsernameLengthValid(payload.username)) {
        return { success: false, error: "Nama pengguna minimal 3 karakter" }
      }

      if (payload.username) {
        if (await findDuplicateUserByField("username", payload.username, userId)) {
          return {
            success: false,
            error: "Nama pengguna sudah terdaftar",
          }
        }
      }

      if (updatedEmail) {
        if (await findDuplicateUserByField("email", updatedEmail, userId)) {
          return {
            success: false,
            error: "Email sudah terdaftar",
          }
        }
      }

      if (phone_no && (await findDuplicateUserByField("phone_no", phone_no, userId))) {
        return {
          success: false,
          error: "Nomor HP sudah terdaftar, gunakan nomor lain",
        }
      }
    }

    if (ktp_no && (await findDuplicateStaffByKtp(ktp_no, documentId))) {
      return {
        success: false,
        error: "Nomor KTP sudah terdaftar, gunakan nomor lain",
      }
    }

    if (userId && shouldUpdateUser) {
      const userPayload: Record<string, string> = {}
      if (payload.username) {
        userPayload.username = payload.username
      }
      if (updatedEmail) {
        userPayload.email = updatedEmail
      }
      if (payload.password) {
        userPayload.password = payload.password
      }
      if (payload.phone_no) {
        userPayload.phone_no = payload.phone_no
      }

      const userResponse = await fetch(new URL(`/api/users/${userId}`, apiBaseUrl), {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(userPayload),
      })
      const userResult = await userResponse.json().catch(() => null)
      if (!userResponse.ok || userResult?.error) {
        return {
          success: false,
          error: getStrapiErrorMessage(userResult, "Gagal memperbarui user"),
        }
      }
    }

    const staffResponse = await fetch(new URL(`/api/staffs/${documentId}`, apiBaseUrl), {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({
        data: {
          name: payload.name,
          department: payload.department,
          position: payload.position,
          ktp_no: payload.ktp_no,
          staff_status: payload.staff_status,
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
      headers: authHeaders(),
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
        headers: authHeaders(),
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
"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { FaEye } from "react-icons/fa"
import { FaEyeSlash } from "react-icons/fa6"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Toaster } from "@/components/ui/sonner"
import type { Staff } from "@/features/admin/get-staff"
import { createStaffWithUser, updateStaffWithUser, type StaffFormPayload } from "@/features/admin/manage-staff"

type StaffFormProps = {
  mode: "add" | "edit"
  initialStaff?: Staff | null
}

const emptyValues: StaffFormPayload = {
  username: "",
  password: "",
  email: "",
  name: "",
  department: "",
  position: "",
  ktp_no: "",
  staff_status: "Active",
  phone_no: "",
}

const normalizeStaffStatus = (value: string | null | undefined) => {
  const normalized = String(value ?? "").trim().toLowerCase()

  if (normalized === "active" || normalized === "aktif") return "Active"
  if (normalized === "inactive" || normalized === "non_active" || normalized === "non-active" || normalized === "non active" || normalized === "tidak aktif") return "Non_active"
  if (normalized === "blocked" || normalized === "diblokir") return "Blocked"

  return "Active"
}

type OptionItem = { value: string; label: string }

// Hanya 2 departemen yang boleh dipilih untuk staf baru.
const departmentOptions: OptionItem[] = [
  { value: "operational", label: "Operasional" },
  { value: "delivery", label: "Pengiriman" },
]

const deliveryPositionOptions: OptionItem[] = [{ value: "driver", label: "Kurir" }]
const operationalPositionOptions: OptionItem[] = [
  { value: "sales", label: "Sales" },
  { value: "manager", label: "Manager" },
]

const getPositionOptionsForDepartment = (department: string): OptionItem[] => {
  if (department === "delivery") return deliveryPositionOptions
  if (department === "operational") return operationalPositionOptions
  return []
}

// Kalau departemen yang dipilih cuma punya 1 kemungkinan posisi, posisi itu
// otomatis dipilihkan (Pengiriman -> driver).
const getAutoPosition = (department: string): string | null => {
  if (department === "delivery") return "driver"
  return null
}

// Menambahkan value existing ke daftar opsi kalau value itu tidak ada di daftar
// baru (misalnya staf lama dengan department "marketing" atau position
// "admin_operational"), supaya form edit tetap menampilkan data yang benar
// alih-alih kosong/berubah diam-diam.
const withLegacyOption = (options: OptionItem[], currentValue: string | undefined) => {
  if (currentValue && !options.some((option) => option.value === currentValue)) {
    return [...options, { value: currentValue, label: currentValue }]
  }
  return options
}

const onlyDigits = (value: string) => value.replace(/\D/g, "")

const isPhoneFormatValid = (value: string) => /^\d+$/.test(value.trim())
const isPhoneLengthValid = (value: string) => {
  const length = value.trim().length
  return length >= 10 && length <= 15
}

const isKtpFormatValid = (value: string) => /^\d+$/.test(value.trim())
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

export default function StaffForm({ mode, initialStaff }: StaffFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [values, setValues] = React.useState<StaffFormPayload>(() => ({
    ...emptyValues,
    username: initialStaff?.user_id && initialStaff.user_id !== "-" ? initialStaff.user_id : "",
    email: initialStaff?.email && initialStaff.email !== "-" ? initialStaff.email : "",
    name: initialStaff?.name && initialStaff.name !== "-" ? initialStaff.name : "",
    department: initialStaff?.department && initialStaff.department !== "-" ? initialStaff.department : "",
    position: initialStaff?.position && initialStaff.position !== "-" ? initialStaff.position : "",
    ktp_no: initialStaff?.ktp_no && initialStaff.ktp_no !== "-" ? initialStaff.ktp_no : "",
    staff_status: normalizeStaffStatus(initialStaff?.staff_status),
    phone_no: initialStaff?.phone_no && initialStaff.phone_no !== "-" ? initialStaff.phone_no : "",
  }))

  const updateField = <K extends keyof StaffFormPayload>(field: K, value: StaffFormPayload[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  // Dipanggil hanya saat user MEMILIH departemen secara aktif dari dropdown,
  // bukan saat form pertama kali dimuat dengan data staf lama -- supaya data
  // staf existing (department/position lama) tidak ikut berubah diam-diam
  // hanya karena form dibuka untuk diedit.
  const handleDepartmentChange = (newDepartment: string) => {
    setValues((prev) => {
      const autoPosition = getAutoPosition(newDepartment)
      if (autoPosition) {
        return { ...prev, department: newDepartment, position: autoPosition }
      }

      if (newDepartment === "operational") {
        const validPositions = operationalPositionOptions.map((option) => option.value)
        const position = validPositions.includes(prev.position) ? prev.position : ""
        return { ...prev, department: newDepartment, position }
      }

      return { ...prev, department: newDepartment, position: "" }
    })
  }

  const isPositionLocked = values.department === "manager" || values.department === "delivery"
  const departmentSelectOptions = withLegacyOption(departmentOptions, initialStaff?.department ?? undefined)
  const positionSelectOptions = withLegacyOption(
    getPositionOptionsForDepartment(values.department),
    initialStaff?.position ?? undefined
  )

  const handleSubmit = async () => {
    if (isSubmitting) return

    const required: Array<[keyof StaffFormPayload, string]> = [["username", "Nama Pengguna"]]
    if (mode === "add") required.push(["password", "Kata Sandi"])
    required.push(
      ["name", "Nama Staf"],
      ["department", "Departemen"],
      ["position", "Posisi"],
      ["staff_status", "Status"],
    )

    const missing = required.filter(([key]) => !String(values[key] ?? "").trim()).map(([, label]) => label)
    if (missing.length > 0) {
      toast.error(`Lengkapi data: ${missing.join(", ")}`)
      return
    }

    if (values.username && !isUsernameLengthValid(values.username)) {
      toast.error("Nama pengguna minimal 3 karakter")
      return
    }

    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) {
      toast.error("Email tidak valid")
      return
    }

    if (values.phone_no && !isPhoneFormatValid(values.phone_no)) {
      toast.error("Nomor Telepon hanya boleh berisi angka")
      return
    }

    if (values.phone_no && !isPhoneLengthValid(values.phone_no)) {
      toast.error("Nomor Telepon minimal 10 digit dan maksimal 15 digit")
      return
    }

    if (values.ktp_no && !isKtpFormatValid(values.ktp_no)) {
      toast.error("Nomor KTP hanya boleh berisi angka")
      return
    }

    if (values.ktp_no && !isKtpLengthValid(values.ktp_no)) {
      toast.error("Nomor KTP harus tepat 16 digit")
      return
    }

    if (values.password && !isPasswordStrong(values.password)) {
      toast.error("Kata sandi minimal 8 karakter dan harus mengandung huruf besar, huruf kecil, angka, serta karakter spesial")
      return
    }

    // Cek duplikat No. Telepon & No. KTP dilakukan di server (manage-staff.ts) karena
    // datanya harus paling update dan tersebar di dua collection (users & staffs).
    setIsSubmitting(true)
    try {
      const result =
        mode === "add"
          ? await createStaffWithUser(values)
          : await updateStaffWithUser(initialStaff?.documentId ?? "", initialStaff?.user_numeric_id ?? null, values)

      if (!result.success) {
        throw new Error(result.error || "Gagal menyimpan staf")
      }

      toast.success(mode === "add" ? "Staf berhasil dibuat" : "Staf berhasil diperbarui")
      // Cache-busting marker: memastikan halaman list (client component) memicu
      // refetch data staf, karena router.refresh() saja tidak cukup untuk
      // me-refresh state yang di-fetch lewat useEffect di client component.
      router.push(`/admin/user?refreshedAt=${Date.now()}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan staf")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full bg-[#F5F5F5]">
      <Toaster position="top-right" richColors />
      <div className="border-b border-black px-4 py-4">
        <h1 className="text-xl font-bold">{mode === "add" ? "Tambah Staf" : "Ubah Staf"}</h1>
      </div>
      <div className="container mx-auto px-4 py-4">
        <div className="grid gap-5 rounded-lg bg-white p-4 md:p-8">
          <div className="grid gap-1.5">
            <Label htmlFor="username">Nama Akun Pengguna <span className="text-red-500">*</span>
            </Label>
            <Input
              id="username"
              value={values.username}
              onChange={(event) => updateField("username", event.target.value)}
              placeholder="Masukkan nama akun pengguna"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password">Kata Sandi{mode === "edit" ? " Baru" : ""} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={values.password ?? ""}
                onChange={(event) => updateField("password", event.target.value)}
                placeholder={
                  mode === "edit"
                    ? "Kosongkan jika tidak diganti, min. 8 karakter (besar, kecil, angka, simbol)"
                    : "Minimal 8 karakter, kombinasi huruf besar, kecil, angka, dan simbol"
                }
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="name">Nama Staf <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={values.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Masukkan nama staf"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Departemen <span className="text-red-500">*</span>
            </Label>
            <Select value={values.department} onValueChange={handleDepartmentChange}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Pilih departemen" /></SelectTrigger>
              <SelectContent>
                {departmentSelectOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Posisi <span className="text-red-500">*</span>
            </Label>
            <Select
              value={values.position}
              onValueChange={(value) => updateField("position", value)}
              disabled={isPositionLocked || !values.department}
            >
              <SelectTrigger className="w-full"><SelectValue placeholder="Pilih posisi" /></SelectTrigger>
              <SelectContent>
                {positionSelectOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={values.email} onChange={(event) => updateField("email", event.target.value)} placeholder="Masukkan email staf" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="phone_no">Nomor Telepon</Label>
            <Input
              id="phone_no"
              inputMode="numeric"
              value={values.phone_no}
              onChange={(event) => updateField("phone_no", onlyDigits(event.target.value))}
              placeholder="Masukkan nomor telepon staf"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ktp_no">Nomor KTP</Label>
            <Input
              id="ktp_no"
              inputMode="numeric"
              value={values.ktp_no}
              onChange={(event) => updateField("ktp_no", onlyDigits(event.target.value))}
              placeholder="Masukkan 16 digit nomor KTP staf"
            />
          </div>
          {/* <div className="grid gap-1.5">
            <Label>Status</Label>
            <Select value={values.staff_status} onValueChange={(value) => updateField("staff_status", value)}>
              <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Aktif</SelectItem>
                <SelectItem value="Non_active">Tidak Aktif</SelectItem>
                <SelectItem value="Blocked">Diblokir</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
            <Button variant="outline" onClick={() => router.push("/admin/user")} disabled={isSubmitting}>Batal</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
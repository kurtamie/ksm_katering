"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
  name: "",
  department: "",
  position: "",
  ktp_no: "",
  staff_status: "active",
  phone_no: "",
}

const departments = ["operational", "marketing", "finance", "delivery", "manager", "developer"]
const positions = ["admin_operational", "admin_finance", "supervisor", "prasmanan", "kitchen", "sales", "driver", "manager", "developer"]

export default function StaffForm({ mode, initialStaff }: StaffFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [values, setValues] = React.useState<StaffFormPayload>(() => ({
    ...emptyValues,
    username: initialStaff?.user_id && initialStaff.user_id !== "-" ? initialStaff.user_id : "",
    name: initialStaff?.name && initialStaff.name !== "-" ? initialStaff.name : "",
    department: initialStaff?.department && initialStaff.department !== "-" ? initialStaff.department : "",
    position: initialStaff?.position && initialStaff.position !== "-" ? initialStaff.position : "",
    ktp_no: initialStaff?.ktp_no && initialStaff.ktp_no !== "-" ? initialStaff.ktp_no : "",
    staff_status: initialStaff?.staff_status && initialStaff.staff_status !== "-" ? initialStaff.staff_status : "active",
    phone_no: initialStaff?.phone_no && initialStaff.phone_no !== "-" ? initialStaff.phone_no : "",
  }))

  const updateField = <K extends keyof StaffFormPayload>(field: K, value: StaffFormPayload[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    const required: Array<[keyof StaffFormPayload, string]> = [
      ["username", "Username"],
      ["name", "Nama"],
      ["department", "Department"],
      ["position", "Position"],
      ["staff_status", "Status"],
    ]
    if (mode === "add") required.push(["password", "Password"])

    const missing = required.filter(([key]) => !String(values[key] ?? "").trim()).map(([, label]) => label)
    if (missing.length > 0) {
      toast.error(`Lengkapi field: ${missing.join(", ")}`)
      return
    }

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
      router.push("/admin/user")
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
        <h1 className="text-xl font-bold">{mode === "add" ? "Tambah Staf" : "Edit Staf"}</h1>
      </div>
      <div className="container mx-auto px-4 py-4">
        <div className="grid gap-5 rounded-lg bg-white p-4 md:p-8">
          <div className="grid gap-1.5">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={values.username} onChange={(event) => updateField("username", event.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password">Password{mode === "edit" ? " Baru" : ""}</Label>
            <Input id="password" type="password" value={values.password ?? ""} onChange={(event) => updateField("password", event.target.value)} placeholder={mode === "edit" ? "Kosongkan jika tidak diganti" : ""} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="name">Nama Staf</Label>
            <Input id="name" value={values.name} onChange={(event) => updateField("name", event.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Department</Label>
            <Select value={values.department} onValueChange={(value) => updateField("department", value)}>
              <SelectTrigger><SelectValue placeholder="Pilih department" /></SelectTrigger>
              <SelectContent>{departments.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Position</Label>
            <Select value={values.position} onValueChange={(value) => updateField("position", value)}>
              <SelectTrigger><SelectValue placeholder="Pilih position" /></SelectTrigger>
              <SelectContent>{positions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="phone_no">No. HP</Label>
            <Input id="phone_no" value={values.phone_no} onChange={(event) => updateField("phone_no", event.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ktp_no">No. KTP</Label>
            <Input id="ktp_no" value={values.ktp_no} onChange={(event) => updateField("ktp_no", event.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Status</Label>
            <Select value={values.staff_status} onValueChange={(value) => updateField("staff_status", value)}>
              <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
                <SelectItem value="blocked">Diblokir</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
            <Button variant="outline" onClick={() => router.push("/admin/user")} disabled={isSubmitting}>Batal</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

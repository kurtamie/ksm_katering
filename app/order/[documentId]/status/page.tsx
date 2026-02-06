"use client"

import React from "react"
import { useUser } from "@/components/providers/user-provider"
import { fetchOrderByDocumentId, type Order } from "@/features/admin/get-order"
import { updateOrderStep } from "@/features/admin/update-order-step"

const STEP_DISPLAY: Record<string, string> = {
  packing: "Pesanan Selesai di Packing",
  send: "Dalam Pengiriman",
  success: "Pesanan Diterima",
}

const STEP_SEQUENCE = ["packing", "send", "success"]

type PageProps = {
  params: Promise<{
    documentId: string
  }>
}

const normalizeStepValue = (value: string) => {
  if (!value || value === "-") return ""
  // If value is display text, convert to step key
  const entry = Object.entries(STEP_DISPLAY).find(([_, display]) => display === value)
  return entry ? entry[0] : value
}

const getNextStep = (currentStep: string): string | null => {
  const normalized = normalizeStepValue(currentStep)
  const currentIndex = STEP_SEQUENCE.indexOf(normalized)
  if (currentIndex === -1 || currentIndex === STEP_SEQUENCE.length - 1) {
    return null
  }
  return STEP_SEQUENCE[currentIndex + 1]
}

export default function Page({ params }: PageProps) {
  const { documentId } = React.use(params)
  const { user } = useUser()
  const [order, setOrder] = React.useState<Order | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)

  const loadOrder = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const data = await fetchOrderByDocumentId(documentId)
      setOrder(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data pesanan")
    } finally {
      setLoading(false)
    }
  }, [documentId])

  const hasAccess = React.useMemo(() => {
    if (!user?.position || !user?.department) return false
    const allowedDepartments = new Set(["operational", "delivery", "developer"])
    const allowedPositions = new Set(["supervisor", "driver", "developer"])
    return (
      allowedDepartments.has(user.department) &&
      allowedPositions.has(user.position)
    )
  }, [user])

  React.useEffect(() => {
    if (!hasAccess) return
    loadOrder()
  }, [loadOrder, hasAccess])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!order) return

    const currentStep = normalizeStepValue(order.delivery_status)
    const nextStep = getNextStep(currentStep)

    if (!nextStep) {
      setError("Pesanan sudah dalam status akhir")
      return
    }

    // Validate image upload for send -> success transition
    if (currentStep === "send" && nextStep === "success" && !selectedImage) {
      setError("Upload foto penerimaan pesanan terlebih dahulu")
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await updateOrderStep(documentId, nextStep, selectedImage || undefined)
      if (!result.success) {
        throw new Error(result.error || "Gagal memperbarui status pesanan")
      }
      setSuccess("Status pesanan berhasil diperbarui")
      setSelectedImage(null)
      setImagePreview(null)
      await loadOrder()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui status pesanan")
    } finally {
      setSaving(false)
    }
  }

  const currentStep = order ? normalizeStepValue(order.delivery_status) : ""
  const nextStep = currentStep ? getNextStep(currentStep) : null
  const showImageUpload = currentStep === "send" && nextStep === "success"

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 text-gray-800">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="text-center text-2xl font-bold">QR Valid</h1>
          <div className="mt-6 text-center text-sm text-gray-600">
            {user
              ? "anda bukan staff yang terkait di perubahan status order"
              : "Memuat data pengguna..."}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 text-gray-800">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-center text-2xl font-bold">QR Valid</h1>

        {loading && (
          <div className="mt-6 text-center text-sm text-gray-600">Memuat data pesanan...</div>
        )}

        {!loading && !order && (
          <div className="mt-6 text-center text-sm text-red-600">
            Data pesanan tidak ditemukan.
          </div>
        )}

        {!loading && order && (
          <div className="mt-8 space-y-6">
            <div className="rounded-lg border border-gray-300 bg-white">
              <div className="border-b border-gray-300 bg-gray-50 px-6 py-3">
                <h2 className="font-semibold text-gray-800">DATA PESANAN</h2>
              </div>
              <div className="p-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField label="ID PESANAN" value={order.order_no} />
                  <FormField label="NO SURAT JALAN" value={order.travel_letter_no.split('ORD')[1] || order.travel_letter_no} />
                  <FormField label="PEMESAN" value={order.customer} />
                  <FormField label="NAMA PENERIMA" value={order.customer} />
                </div>
                <div className="mt-6">
                  <FormField label="STATUS SAAT INI" value={STEP_DISPLAY[currentStep] || currentStep} readonly />
                </div>
              </div>
            </div>

            {nextStep && (
              <div className="space-y-4">
                {showImageUpload && (
                  <div className="rounded-lg border border-gray-300 bg-white p-6">
                    <label className="block text-sm font-medium text-gray-700">
                      Upload Foto Penerimaan Pesanan
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mt-2 w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
                    />
                    {imagePreview && (
                      <div className="mt-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-48 w-full rounded-md object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="text-center">
                  <button
                    type="button"
                    className="rounded-md bg-red-800 px-8 py-3 text-sm font-medium text-white hover:bg-red-900 disabled:opacity-50"
                    onClick={handleSubmit}
                    disabled={saving || (showImageUpload && !selectedImage)}
                  >
                    {saving ? "Menyimpan..." : STEP_DISPLAY[nextStep]}
                  </button>
                </div>

                {error && <div className="text-center text-sm text-red-600">{error}</div>}
                {success && <div className="text-center text-sm text-green-600">{success}</div>}

                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Aksi ini hanya bisa dilakukan oleh <strong>Admin Operasional.</strong></span>
                </div>
              </div>
            )}

            {!nextStep && (
              <div className="text-center text-sm text-gray-600">
                Pesanan sudah dalam status akhir.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function FormField({ 
  label, 
  value, 
  readonly = true 
}: { 
  label: string
  value: string
  readonly?: boolean 
}) {
  return (
    <div>
      <label className="block text-sm font-medium uppercase text-gray-500">{label}</label>
      <input
        type="text"
        value={value}
        readOnly={readonly}
        className="mt-2 w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-800"
      />
    </div>
  )
}

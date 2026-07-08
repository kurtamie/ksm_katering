"use client"

import React from "react"
import { useUser } from "@/components/providers/user-provider"
import { fetchOrderByDocumentId, type Order } from "@/features/admin/get-order"
import { updateOrderStep } from "@/features/admin/update-order-step"
import { getPermissions } from "@/const/permissions"
import {
  getNextOrderStep,
  getNextOrderStepLabel,
  getOrderStatusLabel,
  getStoredOrderStep,
  isOrderPaid,
} from "@/const/admin/order"

type PageProps = {
  params: Promise<{
    documentId: string
  }>
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
    return getPermissions(user.position, user.department).orders.canUpdateOrderStatus
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

    if (!isOrderPaid(order)) {
      setError("Pesanan belum dibayar. Status hanya dapat diperbarui setelah pembayaran lunas.")
      return
    }

    const currentStep = getStoredOrderStep(order)
    const nextStep = getNextOrderStep(order)

    if (!nextStep) {
      setError("Pesanan sudah dalam status akhir")
      return
    }

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

  const storedStep = order ? getStoredOrderStep(order) : ""
  const nextStep = order ? getNextOrderStep(order) : null
  const nextStepLabel = order ? getNextOrderStepLabel(order) : null
  const showImageUpload = storedStep === "send" && nextStep === "success"
  const isWaitingPayment = order ? !isOrderPaid(order) : false

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 text-gray-800">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="text-center text-2xl font-bold">QR Valid</h1>
          <div className="mt-6 text-center text-sm text-gray-600">
            {user
              ? "Anda tidak memiliki izin untuk memperbarui status pesanan ini"
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
                  {/* <FormField label="NO SURAT JALAN" value={order.travel_letter_no.split('ORD')[1] || order.travel_letter_no} /> */}
                  <FormField label="PEMESAN" value={order.customer} />
                  <FormField label="NAMA PENERIMA" value={order.customer} />
                </div>
                <div className="mt-6">
                  <FormField
                    label="STATUS SAAT INI"
                    value={getOrderStatusLabel(order)}
                    readonly
                  />
                </div>
              </div>
            </div>

            {isWaitingPayment && (
              <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-center text-sm text-yellow-800">
                Pesanan menunggu pembayaran. Status pengiriman baru dapat diproses setelah pembayaran lunas.
              </div>
            )}

            {nextStep && nextStepLabel && (
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
                    {saving ? "Menyimpan..." : nextStepLabel}
                  </button>
                </div>

                {error && <div className="text-center text-sm text-red-600">{error}</div>}
                {success && <div className="text-center text-sm text-green-600">{success}</div>}

                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Aksi ini hanya dapat dilakukan oleh staf Sales atau Kurir.</span>
                </div>
              </div>
            )}

            {!nextStep && !isWaitingPayment && (
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

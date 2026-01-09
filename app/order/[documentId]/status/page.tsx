"use client"

import React from "react"
import { fetchOrderByDocumentId, type Order } from "@/features/admin/get-order"
import { updateOrderStep } from "@/features/admin/update-order-step"

const STATUS_OPTIONS = [
  "Menunggu",
  "Diproses",
  "Dikirim",
  "Selesai",
  "Dibatalkan",
]

type PageProps = {
  params: {
    documentId: string
  }
}

const normalizeStatusValue = (value: string) => {
  if (!value || value === "-") return ""
  return value
}

export default function Page({ params }: PageProps) {
  const documentId = params.documentId
  const [order, setOrder] = React.useState<Order | null>(null)
  const [status, setStatus] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  const loadOrder = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const data = await fetchOrderByDocumentId(documentId)
      setOrder(data)
      setStatus(normalizeStatusValue(data?.delivery_status ?? ""))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data pesanan")
    } finally {
      setLoading(false)
    }
  }, [documentId])

  React.useEffect(() => {
    loadOrder()
  }, [loadOrder])

  const handleUpdateStatus = async () => {
    if (!order) return
    if (!status) {
      setError("Pilih status pengiriman terlebih dahulu")
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const result = await updateOrderStep(documentId, status)
      if (!result.success) {
        throw new Error(result.error || "Gagal memperbarui status pesanan")
      }
      setSuccess("Status pesanan berhasil diperbarui")
      await loadOrder()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui status pesanan")
    } finally {
      setSaving(false)
    }
  }

  const statusOptions = React.useMemo(() => {
    const options = new Set(STATUS_OPTIONS)
    if (status && !options.has(status)) {
      options.add(status)
    }
    return Array.from(options)
  }, [status])

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 text-gray-800">
      <div className="mx-auto w-full max-w-2xl rounded-lg bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">Status Pesanan</h1>
        <p className="mt-1 text-sm text-gray-600">Scan QR ini menampilkan detail pesanan sesuai document ID.</p>

        {loading && (
          <div className="mt-6 text-sm text-gray-600">Memuat data pesanan...</div>
        )}

        {!loading && !order && (
          <div className="mt-6 text-sm text-red-600">
            Data pesanan tidak ditemukan.
          </div>
        )}

        {!loading && order && (
          <div className="mt-6 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="Nomor Order" value={order.order_no} />
              <Detail label="Customer" value={order.customer} />
              <Detail label="No. Telepon" value={order.phone} />
              <Detail label="Alamat" value={order.address} />
              <Detail label="Tanggal Order" value={order.order_date} />
              <Detail label="Jam Sampai" value={order.delivery_time} />
            </div>

            <div className="rounded-md border border-gray-200 p-4">
              <label className="block text-sm font-medium text-gray-700">
                Ubah Status Pengiriman
              </label>
              <select
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">Pilih status</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="mt-3 w-full rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50"
                onClick={handleUpdateStatus}
                disabled={saving}
              >
                {saving ? "Menyimpan..." : "Update Status"}
              </button>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}
            {success && <div className="text-sm text-green-600">{success}</div>}
          </div>
        )}
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase text-gray-500">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}

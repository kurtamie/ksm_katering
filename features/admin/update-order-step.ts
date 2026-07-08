import { getStrapiURL } from '@/lib/utils'
import { fetchOrderByDocumentId } from '@/features/admin/get-order'
import { isOrderPaid } from '@/const/admin/order'

type UpdateOrderStepResult = {
  success: boolean
  error?: string
}

const apiBaseUrl = getStrapiURL()

const uploadImage = async (file: File): Promise<number | null> => {
  try {
    const formData = new FormData()
    formData.append('files', file)

    const url = new URL('/api/upload', apiBaseUrl)
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`)
    }

    const result = await response.json()
    const uploadedFile = Array.isArray(result) ? result[0] : result
    return uploadedFile?.id ?? null
  } catch (error) {
    console.error('Image upload error:', error)
    return null
  }
}

export async function updateOrderStep(
  documentId: string, 
  step: string,
  imageFile?: File
): Promise<UpdateOrderStepResult> {
  const identifier = documentId?.trim()

  if (!identifier) {
    return { success: false, error: 'Document ID pesanan tidak valid' }
  }

  try {
    const order = await fetchOrderByDocumentId(identifier)
    if (!order) {
      return { success: false, error: 'Data pesanan tidak ditemukan' }
    }

    if (!isOrderPaid(order)) {
      return {
        success: false,
        error: 'Pesanan belum dibayar. Status hanya dapat diperbarui setelah pembayaran lunas.',
      }
    }

    let imageId: number | null = null
    if (imageFile && step === 'success') {
      imageId = await uploadImage(imageFile)
      if (!imageId) {
        return { success: false, error: 'Gagal mengupload gambar' }
      }
    }

    const url = new URL(`/api/orders/${identifier}`, apiBaseUrl)
    const payload: any = {
      data: {
        step,
      },
    }

    if (imageId) {
      payload.data.image_receive = imageId
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message =
        errorData?.error?.message ??
        errorData?.message ??
        'Gagal memperbarui status pesanan'
      return { success: false, error: message }
    }

    return { success: true }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Gagal memperbarui status pesanan'
    return { success: false, error: message }
  }
}

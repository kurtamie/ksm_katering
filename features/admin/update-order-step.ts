import { getStrapiURL } from '@/lib/utils'

type UpdateOrderStepResult = {
  success: boolean
  error?: string
}

const apiBaseUrl = getStrapiURL()

const getRelationIds = (relation: any): number[] => {
  if (!relation) return []

  const data = relation?.data ?? relation

  if (Array.isArray(data)) {
    return data
      .map((item) => Number(item?.id ?? item))
      .filter((value) => Number.isFinite(value)) as number[]
  }

  const single = Number(data?.id ?? data)
  return Number.isFinite(single) ? [single] : []
}

const fetchOrderRelations = async (documentId: string) => {
  const url = new URL(`/api/orders/${documentId}`, apiBaseUrl)
  url.searchParams.set('populate[order_details][populate]', '*')
  url.searchParams.set('populate[order_menus][populate]', '*')
  url.searchParams.set('populate[package_id][populate]', '*')
  url.searchParams.set('populate[customer_id][populate]', '*')
  url.searchParams.set('populate[staff_id][populate]', '*')

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result = await response.json()
  const data = result?.data ?? result
  const attributes = data?.attributes ?? data ?? {}

  return {
    order_details: getRelationIds(attributes.order_details),
    order_menus: getRelationIds(attributes.order_menus),
    package_id: getRelationIds(attributes.package_id),
    customer_id: getRelationIds(attributes.customer_id),
    staff_id: getRelationIds(attributes.staff_id),
  }
}

const buildRelationPayload = (relations: Record<string, number[]>) => {
  const payload: Record<string, number[]> = {}

  Object.entries(relations).forEach(([key, ids]) => {
    if (Array.isArray(ids) && ids.length > 0) {
      payload[key] = ids
    }
  })

  return payload
}

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
    const relations = await fetchOrderRelations(identifier)
    const relationPayload = buildRelationPayload(relations)

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
        ...relationPayload,
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